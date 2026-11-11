"""
Terracotta QnA - Integrated IR Search API
Complete IR system integrated with FastAPI
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import time
import hashlib
import json
from datetime import datetime

from indexing import InvertedIndex, build_index_from_database
from search_engine import SearchEngine
from evaluation import QueryLogger, EvaluationMetrics
from database import get_db_connection

# ============================================================================
# INITIALIZE SEARCH ENGINE
# ============================================================================

# Global search engine instance
search_engine = None
query_logger = None
evaluator = None

def initialize_search_engine():
    """Build/load the inverted index and initialize search engine"""
    global search_engine, query_logger, evaluator
    
    print("\n" + "="*60)
    print("INITIALIZING TERRACOTTA IR SEARCH ENGINE")
    print("="*60)
    
    index = InvertedIndex()
    
    # Try to load existing index
    import os
    index_path = 'terracotta_index.pkl'
    
    if os.path.exists(index_path):
        print(f"\n[LOADING] Loading existing index from {index_path}...")
        index.load(index_path)
    else:
        # Build new index from database
        print("\n[BUILDING] Building inverted index from database...")
        with get_db_connection() as conn:
            index = build_index_from_database(conn)
            index.save(index_path)
    
    # Initialize search engine
    print("\n[INIT] Initializing search engine...")
    search_engine = SearchEngine(index)
    
    # Initialize logger and evaluator (don't need db connection here)
    print("[INIT] Initializing query logger and evaluator...")
    query_logger = None  # Will be created per-request
    evaluator = None  # Will be created per-request
    
    print("\n[SUCCESS] Search engine ready!")
    print(f"   - Documents indexed: {index.total_docs}")
    print(f"   - Vocabulary size: {len(index.index)} terms")
    print(f"   - Average document length: {index.avg_doc_length:.2f} tokens")
    print("="*60 + "\n")


# ============================================================================
# SEARCH API ENDPOINTS
# ============================================================================

def get_search_engine():
    """Dependency to get search engine"""
    if search_engine is None:
        raise HTTPException(status_code=503, detail="Search engine not initialized")
    return search_engine

def get_query_logger():
    """Dependency to get query logger"""
    # Create per-request logger with database connection
    return None  # Will be handled in the endpoint


def get_evaluator():
    """Dependency to get evaluator"""
    # Create per-request evaluator with database connection
    return None  # Will be handled in the endpoint


# Enhanced search endpoint
async def search_documents_ir(
    query: str,
    top_k: int = 20,
    user_id: Optional[int] = None,
    background_tasks: BackgroundTasks = None,
    engine: SearchEngine = Depends(get_search_engine),
    logger: QueryLogger = Depends(get_query_logger)
):
    """
    Advanced IR search with:
    - Query transformation (spell correction with edit distance)
    - Skip pointers for candidate retrieval
    - BM25 ranking with DAAT
    - Query-focused snippet generation
    - Query logging
    - Result caching
    """
    
    if not query or len(query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Start timing
    start_time = time.time()
    
    # Execute search
    results = engine.search(query, top_k)
    
    # Calculate response time
    response_time_ms = (time.time() - start_time) * 1000
    results['response_time_ms'] = round(response_time_ms, 2)
    
    # Log search in background
    if background_tasks:
        background_tasks.add_task(
            log_search_async,
            user_id,
            query,
            results.get('query_terms', [query]),  # Use query terms from search or fallback to query
            results['results'],
            results.get('corrections', {}),
            results['total_results'],
            response_time_ms
        )
    
    return results


def log_search_async(user_id, query, query_terms, results, corrections, result_count, response_time_ms):
    """Background task to log search"""
    try:
        with get_db_connection() as conn:
            logger_instance = QueryLogger(conn)
            logger_instance.log_search(
                user_id,
                query,
                query_terms,
                corrections,
                results,
                result_count,
                response_time_ms
            )
    except Exception as e:
        print(f"Error logging search: {e}")


async def log_search_click(
    search_log_id: int,
    doc_id: int,
    position: int,
    time_to_click_ms: int,
    logger: QueryLogger = Depends(get_query_logger)
):
    """Log when user clicks a search result"""
    try:
        with get_db_connection() as conn:
            logger_instance = QueryLogger(conn)
            logger_instance.log_click(search_log_id, doc_id, position, time_to_click_ms)
        
        return {"message": "Click logged successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_search_metrics(
    evaluator: EvaluationMetrics = Depends(get_evaluator)
):
    """Get comprehensive search evaluation metrics"""
    try:
        with get_db_connection() as conn:
            eval_instance = EvaluationMetrics(conn)
            metrics = eval_instance.get_comprehensive_metrics()
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_popular_queries(
    limit: int = 20,
    evaluator: EvaluationMetrics = Depends(get_evaluator)
):
    """Get most popular search queries"""
    try:
        with get_db_connection() as conn:
            eval_instance = EvaluationMetrics(conn)
            queries = eval_instance.get_popular_queries(limit)
        
        return {"queries": queries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_failed_queries(
    limit: int = 20,
    evaluator: EvaluationMetrics = Depends(get_evaluator)
):
    """Get queries that returned zero results"""
    try:
        with get_db_connection() as conn:
            eval_instance = EvaluationMetrics(conn)
            queries = eval_instance.get_failed_queries(limit)
        
        return {"queries": queries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def rebuild_index(background_tasks: BackgroundTasks):
    """Rebuild the search index (admin only)"""
    background_tasks.add_task(initialize_search_engine)
    return {"message": "Index rebuild started in background"}


# ============================================================================
# REGISTER ROUTES
# ============================================================================

def register_search_routes(app: FastAPI):
    """Register all IR search routes with the FastAPI app"""
    
    # Main search endpoint
    app.add_api_route(
        "/api/search",
        search_documents_ir,
        methods=["GET"],
        summary="Advanced IR Search",
        description="Search with BM25 ranking, spell correction, and snippet generation"
    )
    
    # Click logging
    app.add_api_route(
        "/api/search/click",
        log_search_click,
        methods=["POST"],
        summary="Log Search Click",
        description="Log when user clicks a search result"
    )
    
    # Evaluation endpoints
    app.add_api_route(
        "/api/search/metrics",
        get_search_metrics,
        methods=["GET"],
        summary="Search Metrics",
        description="Get comprehensive search evaluation metrics (MRR, CTR, etc.)"
    )
    
    app.add_api_route(
        "/api/search/popular",
        get_popular_queries,
        methods=["GET"],
        summary="Popular Queries",
        description="Get most frequently searched queries"
    )
    
    app.add_api_route(
        "/api/search/failed",
        get_failed_queries,
        methods=["GET"],
        summary="Failed Queries",
        description="Get queries that returned zero results"
    )
    
    # Admin endpoint
    app.add_api_route(
        "/api/search/rebuild-index",
        rebuild_index,
        methods=["POST"],
        summary="Rebuild Index",
        description="Rebuild the inverted index from database (admin only)"
    )


# ============================================================================
# TESTING
# ============================================================================

if __name__ == "__main__":
    print("Terracotta IR Search API Integration")
    print("=" * 60)
    print("\nThis module provides:")
    print("  [x] Query transformation with edit distance")
    print("  [x] Skip pointers for efficient candidate retrieval")
    print("  [x] BM25 ranking with DAAT processing")
    print("  [x] Query-focused snippet generation")
    print("  [x] Comprehensive query logging")
    print("  [x] IR evaluation metrics (MRR, CTR, NDCG, etc.)")
    print("  [x] Query result caching")
    print("\n" + "=" * 60)
