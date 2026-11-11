"""
Terracotta QnA - Query Processing Pipeline
Query Transformation → Index Lookup (Skip Pointers) → BM25 Ranking (DAAT) → Output
"""

import heapq
import re
from typing import List, Dict, Tuple, Set
from collections import defaultdict
import math
from indexing import TextTransformer, InvertedIndex


# ============================================================================
# QUERY TRANSFORMATION WITH EDIT DISTANCE
# ============================================================================

class QueryTransformer:
    """Query preprocessing and spell correction using edit distance"""
    
    def __init__(self, index: InvertedIndex):
        self.transformer = TextTransformer()
        self.index = index
        self.vocabulary = set(index.index.keys())
    
    def edit_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein edit distance"""
        m, n = len(s1), len(s2)
        
        # Create DP table
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        # Initialize base cases
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        # Fill DP table
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i-1] == s2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(
                        dp[i-1][j],    # deletion
                        dp[i][j-1],    # insertion
                        dp[i-1][j-1]   # substitution
                    )
        
        return dp[m][n]
    
    def spell_correct(self, term: str, max_distance: int = 2) -> str:
        """Find closest term in vocabulary using edit distance"""
        if term in self.vocabulary:
            return term
        
        # Find candidates within edit distance
        candidates = []
        for vocab_term in self.vocabulary:
            # Quick filter: length difference
            if abs(len(vocab_term) - len(term)) > max_distance:
                continue
            
            distance = self.edit_distance(term, vocab_term)
            if distance <= max_distance:
                candidates.append((distance, vocab_term))
        
        if not candidates:
            return term
        
        # Return closest match
        candidates.sort(key=lambda x: x[0])
        return candidates[0][1]
    
    def expand_query(self, terms: List[str]) -> List[str]:
        """Expand query with spell corrections"""
        expanded = []
        corrections = {}
        
        for term in terms:
            corrected = self.spell_correct(term)
            if corrected != term:
                corrections[term] = corrected
            expanded.append(corrected)
        
        return expanded, corrections
    
    def transform(self, query: str) -> Tuple[List[str], Dict[str, str]]:
        """Complete query transformation pipeline"""
        # Tokenize and normalize
        tokens = self.transformer.transform(query)
        
        # Spell correction
        corrected_tokens, corrections = self.expand_query(tokens)
        
        return corrected_tokens, corrections


# ============================================================================
# SKIP POINTERS FOR CANDIDATE RETRIEVAL
# ============================================================================

class SkipPointerList:
    """Postings list with skip pointers for fast intersection"""
    
    def __init__(self, postings: List[Tuple[int, List[int]]], skip_distance: int = None):
        self.postings = sorted(postings, key=lambda x: x[0])  # Sort by doc_id
        self.skip_distance = skip_distance or int(math.sqrt(len(postings)))
        self.skip_pointers = self._build_skip_pointers()
    
    def _build_skip_pointers(self) -> Dict[int, int]:
        """Build skip pointers (every sqrt(n) elements)"""
        skip_pointers = {}
        n = len(self.postings)
        
        for i in range(0, n, self.skip_distance):
            if i + self.skip_distance < n:
                skip_pointers[i] = i + self.skip_distance
        
        return skip_pointers
    
    def get_doc_ids(self) -> List[int]:
        """Get all document IDs"""
        return [doc_id for doc_id, _ in self.postings]
    
    def intersect(self, other: 'SkipPointerList') -> List[int]:
        """Intersect two postings lists using skip pointers"""
        result = []
        i, j = 0, 0
        postings1 = self.postings
        postings2 = other.postings
        
        while i < len(postings1) and j < len(postings2):
            doc1 = postings1[i][0]
            doc2 = postings2[j][0]
            
            if doc1 == doc2:
                result.append(doc1)
                i += 1
                j += 1
            elif doc1 < doc2:
                # Try skip pointer
                if i in self.skip_pointers and postings1[self.skip_pointers[i]][0] <= doc2:
                    i = self.skip_pointers[i]
                else:
                    i += 1
            else:
                # Try skip pointer
                if j in other.skip_pointers and postings2[other.skip_pointers[j]][0] <= doc1:
                    j = other.skip_pointers[j]
                else:
                    j += 1
        
        return result


def get_candidate_documents(index: InvertedIndex, query_terms: List[str]) -> Set[int]:
    """Retrieve candidate documents using skip pointers"""
    if not query_terms:
        return set()
    
    # Get postings for each term
    postings_lists = []
    for term in query_terms:
        postings = index.get_term_postings(term)
        if postings:
            postings_lists.append(SkipPointerList(postings))
    
    if not postings_lists:
        return set()
    
    # Start with shortest list
    postings_lists.sort(key=lambda x: len(x.postings))
    
    # Get union of all candidates (OR query)
    candidates = set()
    for plist in postings_lists:
        candidates.update(plist.get_doc_ids())
    
    return candidates


# ============================================================================
# BM25 RANKING WITH DAAT (Document-At-A-Time)
# ============================================================================

class BM25Ranker:
    """BM25 ranking with Document-At-A-Time processing"""
    
    def __init__(self, index: InvertedIndex, k1: float = 1.5, b: float = 0.75):
        self.index = index
        self.k1 = k1
        self.b = b
    
    def get_term_frequency(self, doc_id: int, term: str) -> int:
        """Get term frequency in document"""
        postings = self.index.get_term_postings(term)
        for did, positions in postings:
            if did == doc_id:
                return len(positions)
        return 0
    
    def calculate_bm25_score(self, doc_id: int, query_terms: List[str]) -> float:
        """Calculate BM25 score for a document"""
        score = 0.0
        doc_length = self.index.doc_lengths.get(doc_id, 0)
        
        if doc_length == 0:
            return 0.0
        
        avg_length = self.index.avg_doc_length
        
        for term in query_terms:
            # Term frequency in document
            tf = self.get_term_frequency(doc_id, term)
            
            if tf == 0:
                continue
            
            # IDF
            idf = self.index.get_idf(term)
            
            # BM25 formula
            numerator = tf * (self.k1 + 1)
            denominator = tf + self.k1 * (1 - self.b + self.b * (doc_length / avg_length))
            
            term_score = idf * (numerator / denominator)
            score += term_score
        
        return score
    
    def rank_documents_daat(self, query_terms: List[str], top_k: int = 20) -> List[Tuple[int, float]]:
        """
        Rank documents using Document-At-A-Time (DAAT) with priority queue
        Process one document at a time and maintain top-k heap
        """
        # Get candidate documents
        candidates = get_candidate_documents(self.index, query_terms)
        
        if not candidates:
            return []
        
        # Min heap to maintain top-k (we want max scores, so negate)
        heap = []
        
        # Process each candidate document
        for doc_id in candidates:
            score = self.calculate_bm25_score(doc_id, query_terms)
            
            if len(heap) < top_k:
                # Heap not full, just add
                heapq.heappush(heap, (score, doc_id))
            elif score > heap[0][0]:
                # Better than worst in heap, replace
                heapq.heapreplace(heap, (score, doc_id))
        
        # Extract results and sort by score (descending)
        results = sorted(heap, key=lambda x: x[0], reverse=True)
        
        return [(doc_id, score) for score, doc_id in results]


# ============================================================================
# SNIPPET GENERATION
# ============================================================================

class SnippetGenerator:
    """Generate query-focused snippets from documents"""
    
    def __init__(self, index: InvertedIndex):
        self.index = index
        self.transformer = TextTransformer()
    
    def generate_snippet(self, doc_id: int, query_terms: List[str], max_length: int = 200) -> str:
        """Generate snippet highlighting query terms"""
        doc_content = self.index.doc_content.get(doc_id, {})
        content = doc_content.get('content', '')
        
        if not content:
            return doc_content.get('summary', '')[:max_length]
        
        # Find best window containing most query terms
        words = content.split()
        best_window_start = 0
        best_window_score = 0
        window_size = 30
        
        # Normalize query terms for matching
        normalized_query = set(self.transformer.transform(' '.join(query_terms)))
        
        for i in range(len(words) - window_size + 1):
            window = words[i:i + window_size]
            window_text = ' '.join(window).lower()
            window_tokens = set(self.transformer.transform(window_text))
            
            # Score window by number of query terms
            score = len(normalized_query & window_tokens)
            
            if score > best_window_score:
                best_window_score = score
                best_window_start = i
        
        # Extract snippet
        snippet_words = words[best_window_start:best_window_start + window_size]
        snippet = ' '.join(snippet_words)
        
        # Truncate to max length
        if len(snippet) > max_length:
            snippet = snippet[:max_length].rsplit(' ', 1)[0] + '...'
        
        # Highlight query terms
        for term in query_terms:
            # Case-insensitive highlighting
            snippet = re.sub(
                f'({re.escape(term)})',
                r'<mark>\1</mark>',
                snippet,
                flags=re.IGNORECASE
            )
        
        return snippet


# ============================================================================
# COMPLETE SEARCH PIPELINE
# ============================================================================

class SearchEngine:
    """Complete search engine with all components"""
    
    def __init__(self, index: InvertedIndex):
        self.index = index
        self.query_transformer = QueryTransformer(index)
        self.ranker = BM25Ranker(index)
        self.snippet_generator = SnippetGenerator(index)
        self.query_cache = {}  # Simple cache
    
    def search(self, query: str, top_k: int = 20) -> Dict:
        """Execute complete search pipeline"""
        # Check cache
        cache_key = f"{query}:{top_k}"
        if cache_key in self.query_cache:
            return self.query_cache[cache_key]
        
        # 1. Query Transformation (with edit distance)
        query_terms, corrections = self.query_transformer.transform(query)
        
        if not query_terms:
            return {
                'query': query,
                'corrected_query': None,
                'corrections': {},
                'results': [],
                'total_results': 0
            }
        
        # 2. Ranking (BM25 with DAAT)
        ranked_docs = self.ranker.rank_documents_daat(query_terms, top_k)
        
        # 3. Generate snippets
        results = []
        for doc_id, score in ranked_docs:
            doc_content = self.index.doc_content.get(doc_id, {})
            snippet = self.snippet_generator.generate_snippet(doc_id, query_terms)
            
            results.append({
                'doc_id': doc_id,
                'title': doc_content.get('title', ''),
                'snippet': snippet,
                'score': round(score, 4)
            })
        
        response = {
            'query': query,
            'query_terms': query_terms,
            'corrected_query': ' '.join(query_terms) if corrections else None,
            'corrections': corrections,
            'results': results,
            'total_results': len(results)
        }
        
        # Cache result
        self.query_cache[cache_key] = response
        
        return response


# ============================================================================
# TESTING
# ============================================================================

if __name__ == "__main__":
    import re
    
    # Test edit distance
    qt = QueryTransformer(InvertedIndex())
    print("Edit Distance Tests:")
    print(f"  'kitten' vs 'sitting': {qt.edit_distance('kitten', 'sitting')}")
    print(f"  'algorithm' vs 'algorithim': {qt.edit_distance('algorithm', 'algorithim')}")
    print(f"  'bm25' vs 'bm52': {qt.edit_distance('bm25', 'bm52')}")
    
    print("\n[SUCCESS] Query processing pipeline ready!")
