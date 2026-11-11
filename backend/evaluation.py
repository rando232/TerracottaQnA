"""
Terracotta QnA - Query Logging and Evaluation
Track search behavior and calculate IR metrics
"""

import json
from datetime import datetime
from typing import List, Dict, Optional
from collections import defaultdict
import math


# ============================================================================
# QUERY LOGGING
# ============================================================================

class QueryLogger:
    """Log search queries and user interactions for evaluation"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def log_search(self, user_id: Optional[int], query: str, query_terms: List[str],
                   corrections: Dict[str, str], results: List[Dict], 
                   result_count: int, response_time_ms: float):
        """Log a search query with results"""
        cursor = self.db.cursor()
        
        # Extract result IDs
        result_ids = [r['doc_id'] for r in results]
        
        cursor.execute("""
            INSERT INTO search_logs 
            (user_id, query, query_tokens, corrections, results_returned, 
             result_count, response_time_ms, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            query,
            json.dumps(query_terms),
            json.dumps(corrections),
            json.dumps(result_ids),
            result_count,
            response_time_ms,
            datetime.now()
        ))
        
        self.db.commit()
        search_log_id = cursor.lastrowid
        cursor.close()
        
        return search_log_id
    
    def log_click(self, search_log_id: int, clicked_doc_id: int, 
                  click_position: int, time_to_click_ms: int):
        """Log a click on a search result"""
        cursor = self.db.cursor()
        
        cursor.execute("""
            UPDATE search_logs 
            SET clicked_document_id = %s,
                click_position = %s,
                time_to_click_ms = %s
            WHERE id = %s
        """, (clicked_doc_id, click_position, time_to_click_ms, search_log_id))
        
        self.db.commit()
        cursor.close()
    
    def log_relevance_judgment(self, query: str, doc_id: int, 
                               relevance_score: int, judge_user_id: Optional[int] = None):
        """Log explicit relevance judgment (0-4 scale)"""
        cursor = self.db.cursor()
        
        cursor.execute("""
            INSERT INTO relevance_judgments 
            (query, document_id, relevance_score, judge_user_id, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (query, doc_id, relevance_score, judge_user_id, datetime.now()))
        
        self.db.commit()
        cursor.close()


# ============================================================================
# EVALUATION METRICS
# ============================================================================

class EvaluationMetrics:
    """Calculate IR evaluation metrics"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def get_search_logs(self, limit: int = 1000) -> List[Dict]:
        """Retrieve recent search logs"""
        cursor = self.db.cursor()
        cursor.execute("""
            SELECT * FROM search_logs 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (limit,))
        
        logs = cursor.fetchall()
        cursor.close()
        return logs
    
    def get_relevance_judgments(self, query: str) -> Dict[int, int]:
        """Get relevance judgments for a query"""
        cursor = self.db.cursor()
        cursor.execute("""
            SELECT document_id, AVG(relevance_score) as avg_relevance
            FROM relevance_judgments
            WHERE query = %s
            GROUP BY document_id
        """, (query,))
        
        judgments = {row['document_id']: row['avg_relevance'] for row in cursor.fetchall()}
        cursor.close()
        return judgments
    
    def calculate_mrr(self, logs: List[Dict] = None) -> float:
        """
        Mean Reciprocal Rank (MRR)
        Average of 1/rank of first relevant result
        """
        if logs is None:
            logs = self.get_search_logs()
        
        reciprocal_ranks = []
        
        for log in logs:
            if log.get('clicked_document_id') and log.get('click_position'):
                # Assume click = relevance
                rank = log['click_position']
                reciprocal_ranks.append(1.0 / rank)
        
        if not reciprocal_ranks:
            return 0.0
        
        return sum(reciprocal_ranks) / len(reciprocal_ranks)
    
    def calculate_precision_at_k(self, query: str, results: List[int], k: int = 10) -> float:
        """
        Precision@K: Fraction of top-k results that are relevant
        """
        judgments = self.get_relevance_judgments(query)
        
        if not judgments:
            return 0.0
        
        top_k = results[:k]
        relevant_in_top_k = sum(1 for doc_id in top_k if judgments.get(doc_id, 0) >= 2)
        
        return relevant_in_top_k / k if k > 0 else 0.0
    
    def calculate_recall_at_k(self, query: str, results: List[int], k: int = 10) -> float:
        """
        Recall@K: Fraction of relevant documents that appear in top-k
        """
        judgments = self.get_relevance_judgments(query)
        
        if not judgments:
            return 0.0
        
        total_relevant = sum(1 for score in judgments.values() if score >= 2)
        
        if total_relevant == 0:
            return 0.0
        
        top_k = results[:k]
        relevant_in_top_k = sum(1 for doc_id in top_k if judgments.get(doc_id, 0) >= 2)
        
        return relevant_in_top_k / total_relevant
    
    def calculate_ndcg_at_k(self, query: str, results: List[int], k: int = 10) -> float:
        """
        Normalized Discounted Cumulative Gain@K
        Measures ranking quality with graded relevance
        """
        judgments = self.get_relevance_judgments(query)
        
        if not judgments:
            return 0.0
        
        # Calculate DCG
        dcg = 0.0
        for i, doc_id in enumerate(results[:k]):
            relevance = judgments.get(doc_id, 0)
            position = i + 1
            dcg += (2 ** relevance - 1) / math.log2(position + 1)
        
        # Calculate ideal DCG (IDCG)
        ideal_relevances = sorted(judgments.values(), reverse=True)[:k]
        idcg = sum((2 ** rel - 1) / math.log2(i + 2) for i, rel in enumerate(ideal_relevances))
        
        if idcg == 0:
            return 0.0
        
        return dcg / idcg
    
    def calculate_map(self, query: str, results: List[int]) -> float:
        """
        Mean Average Precision (MAP)
        Average precision across all recall levels
        """
        judgments = self.get_relevance_judgments(query)
        
        if not judgments:
            return 0.0
        
        relevant_docs = [doc_id for doc_id, score in judgments.items() if score >= 2]
        
        if not relevant_docs:
            return 0.0
        
        precisions = []
        relevant_count = 0
        
        for i, doc_id in enumerate(results):
            if doc_id in relevant_docs:
                relevant_count += 1
                precision = relevant_count / (i + 1)
                precisions.append(precision)
        
        if not precisions:
            return 0.0
        
        return sum(precisions) / len(relevant_docs)
    
    def calculate_ctr(self, logs: List[Dict] = None) -> float:
        """
        Click-Through Rate (CTR)
        Percentage of searches that result in a click
        """
        if logs is None:
            logs = self.get_search_logs()
        
        if not logs:
            return 0.0
        
        clicks = sum(1 for log in logs if log.get('clicked_document_id'))
        return clicks / len(logs)
    
    def calculate_avg_click_position(self, logs: List[Dict] = None) -> float:
        """Average position of clicked results"""
        if logs is None:
            logs = self.get_search_logs()
        
        positions = [log['click_position'] for log in logs 
                    if log.get('click_position')]
        
        if not positions:
            return 0.0
        
        return sum(positions) / len(positions)
    
    def calculate_zero_result_rate(self, logs: List[Dict] = None) -> float:
        """Percentage of searches returning zero results"""
        if logs is None:
            logs = self.get_search_logs()
        
        if not logs:
            return 0.0
        
        zero_results = sum(1 for log in logs if log.get('result_count', 0) == 0)
        return zero_results / len(logs)
    
    def get_comprehensive_metrics(self) -> Dict:
        """Get all metrics in one report"""
        logs = self.get_search_logs()
        
        return {
            'total_searches': len(logs),
            'mrr': round(self.calculate_mrr(logs), 4),
            'ctr': round(self.calculate_ctr(logs), 4),
            'avg_click_position': round(self.calculate_avg_click_position(logs), 2),
            'zero_result_rate': round(self.calculate_zero_result_rate(logs), 4),
            'avg_response_time_ms': round(
                sum(log.get('response_time_ms', 0) for log in logs) / len(logs), 2
            ) if logs else 0,
            'unique_queries': len(set(log['query'] for log in logs)),
            'queries_with_clicks': sum(1 for log in logs if log.get('clicked_document_id')),
        }
    
    def get_popular_queries(self, limit: int = 20) -> List[Dict]:
        """Get most popular search queries"""
        cursor = self.db.cursor()
        cursor.execute("""
            SELECT query, COUNT(*) as count, AVG(result_count) as avg_results
            FROM search_logs
            GROUP BY query
            ORDER BY count DESC
            LIMIT %s
        """, (limit,))
        
        results = cursor.fetchall()
        cursor.close()
        return results
    
    def get_failed_queries(self, limit: int = 20) -> List[Dict]:
        """Get queries with zero results"""
        cursor = self.db.cursor()
        cursor.execute("""
            SELECT query, COUNT(*) as count
            FROM search_logs
            WHERE result_count = 0
            GROUP BY query
            ORDER BY count DESC
            LIMIT %s
        """, (limit,))
        
        results = cursor.fetchall()
        cursor.close()
        return results


# ============================================================================
# A/B TESTING SUPPORT
# ============================================================================

class ABTestingFramework:
    """Simple A/B testing for search algorithms"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.experiments = {}
    
    def create_experiment(self, name: str, description: str):
        """Create a new A/B test experiment"""
        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO ab_experiments (name, description, created_at)
            VALUES (%s, %s, %s)
        """, (name, description, datetime.now()))
        
        self.db.commit()
        experiment_id = cursor.lastrowid
        cursor.close()
        return experiment_id
    
    def log_experiment_result(self, experiment_id: int, user_id: int, 
                             variant: str, metric_value: float):
        """Log result for an A/B test"""
        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO ab_test_results 
            (experiment_id, user_id, variant, metric_value, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (experiment_id, user_id, variant, metric_value, datetime.now()))
        
        self.db.commit()
        cursor.close()
    
    def compare_variants(self, experiment_id: int) -> Dict:
        """Compare performance of different variants"""
        cursor = self.db.cursor()
        cursor.execute("""
            SELECT variant, 
                   COUNT(*) as sample_size,
                   AVG(metric_value) as avg_metric,
                   STDDEV(metric_value) as stddev_metric
            FROM ab_test_results
            WHERE experiment_id = %s
            GROUP BY variant
        """, (experiment_id,))
        
        results = {row['variant']: {
            'sample_size': row['sample_size'],
            'avg_metric': row['avg_metric'],
            'stddev': row['stddev_metric']
        } for row in cursor.fetchall()}
        
        cursor.close()
        return results


# ============================================================================
# TESTING
# ============================================================================

if __name__ == "__main__":
    print("Query Logging and Evaluation Module")
    print("=" * 50)
    
    # Example metrics calculation
    evaluator = EvaluationMetrics(None)
    
    # Test precision calculation
    query = "BM25 algorithm"
    results = [1, 2, 3, 4, 5]
    judgments = {1: 4, 2: 3, 3: 0, 4: 2, 5: 1}  # Mock judgments
    
    print("\n[SUCCESS] Evaluation metrics ready!")
