"""
Terracotta QnA - Indexing Pipeline
Text Acquisition → Text Transformation → Inverted Index → Index Compression
"""

import re
import json
import pickle
from collections import defaultdict
from typing import Dict, List, Tuple, Set
import math
from datetime import datetime

# ============================================================================
# TEXT TRANSFORMATION
# ============================================================================

class TextTransformer:
    """Text preprocessing and transformation"""
    
    # Stop words for English
    STOP_WORDS = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
        'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how'
    }
    
    def __init__(self):
        self.stemming_cache = {}
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Lowercase and extract alphanumeric tokens
        text = text.lower()
        tokens = re.findall(r'\b\w+\b', text)
        return tokens
    
    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """Remove common stop words"""
        return [t for t in tokens if t not in self.STOP_WORDS]
    
    def stem(self, word: str) -> str:
        """Simple Porter-like stemming"""
        if word in self.stemming_cache:
            return self.stemming_cache[word]
        
        original = word
        
        # Remove common suffixes
        suffixes = ['ing', 'ed', 'es', 's', 'ly', 'tion', 'ation', 'er', 'est']
        for suffix in suffixes:
            if word.endswith(suffix) and len(word) > len(suffix) + 2:
                word = word[:-len(suffix)]
                break
        
        self.stemming_cache[original] = word
        return word
    
    def transform(self, text: str) -> List[str]:
        """Complete transformation pipeline"""
        tokens = self.tokenize(text)
        tokens = self.remove_stopwords(tokens)
        tokens = [self.stem(t) for t in tokens]
        return tokens


# ============================================================================
# INVERTED INDEX WITH COMPRESSION
# ============================================================================

class InvertedIndex:
    """Inverted index with delta encoding compression"""
    
    def __init__(self):
        self.index = defaultdict(list)  # term -> [(doc_id, positions)]
        self.doc_lengths = {}  # doc_id -> length
        self.doc_content = {}  # doc_id -> {title, content, summary}
        self.term_doc_freq = defaultdict(int)  # term -> document frequency
        self.total_docs = 0
        self.avg_doc_length = 0
        self.transformer = TextTransformer()
    
    def add_document(self, doc_id: int, title: str, content: str, summary: str = ""):
        """Add a document to the index"""
        # Combine all text
        full_text = f"{title} {title} {title} {summary} {summary} {content}"  # Title/summary weighted higher
        
        # Transform text
        tokens = self.transformer.transform(full_text)
        
        # Store document length
        self.doc_lengths[doc_id] = len(tokens)
        
        # Store original content for snippets
        self.doc_content[doc_id] = {
            'title': title,
            'content': content,
            'summary': summary
        }
        
        # Build positional index
        term_positions = defaultdict(list)
        for position, term in enumerate(tokens):
            term_positions[term].append(position)
        
        # Add to inverted index
        for term, positions in term_positions.items():
            self.index[term].append((doc_id, positions))
            self.term_doc_freq[term] += 1
        
        self.total_docs += 1
        self._update_avg_length()
    
    def _update_avg_length(self):
        """Update average document length"""
        if self.doc_lengths:
            self.avg_doc_length = sum(self.doc_lengths.values()) / len(self.doc_lengths)
    
    def compress_postings(self, postings: List[Tuple[int, List[int]]]) -> bytes:
        """Compress postings list using delta encoding"""
        if not postings:
            return b''
        
        compressed = []
        
        # Sort by doc_id
        postings.sort(key=lambda x: x[0])
        
        # Delta encode document IDs
        prev_doc_id = 0
        for doc_id, positions in postings:
            delta_doc_id = doc_id - prev_doc_id
            compressed.append(delta_doc_id)
            compressed.append(len(positions))  # Number of positions
            
            # Delta encode positions
            prev_pos = 0
            for pos in sorted(positions):
                delta_pos = pos - prev_pos
                compressed.append(delta_pos)
                prev_pos = pos
            
            prev_doc_id = doc_id
        
        return pickle.dumps(compressed)
    
    def decompress_postings(self, compressed: bytes) -> List[Tuple[int, List[int]]]:
        """Decompress postings list"""
        if not compressed:
            return []
        
        compressed_data = pickle.loads(compressed)
        postings = []
        
        i = 0
        current_doc_id = 0
        
        while i < len(compressed_data):
            # Decode document ID
            delta_doc_id = compressed_data[i]
            current_doc_id += delta_doc_id
            i += 1
            
            # Get number of positions
            num_positions = compressed_data[i]
            i += 1
            
            # Decode positions
            positions = []
            current_pos = 0
            for _ in range(num_positions):
                delta_pos = compressed_data[i]
                current_pos += delta_pos
                positions.append(current_pos)
                i += 1
            
            postings.append((current_doc_id, positions))
        
        return postings
    
    def get_term_postings(self, term: str) -> List[Tuple[int, List[int]]]:
        """Get postings list for a term with skip pointers support"""
        term = self.transformer.stem(term.lower())
        return self.index.get(term, [])
    
    def get_idf(self, term: str) -> float:
        """Calculate IDF for a term"""
        term = self.transformer.stem(term.lower())
        df = self.term_doc_freq.get(term, 0)
        if df == 0:
            return 0.0
        
        # BM25 IDF formula
        N = self.total_docs
        idf = math.log((N - df + 0.5) / (df + 0.5) + 1.0)
        return idf
    
    def save(self, filepath: str):
        """Save index to disk"""
        data = {
            'index': dict(self.index),
            'doc_lengths': self.doc_lengths,
            'doc_content': self.doc_content,
            'term_doc_freq': dict(self.term_doc_freq),
            'total_docs': self.total_docs,
            'avg_doc_length': self.avg_doc_length
        }
        with open(filepath, 'wb') as f:
            pickle.dump(data, f)
        print(f"[SUCCESS] Index saved to {filepath}")
    
    def load(self, filepath: str):
        """Load index from disk"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        
        self.index = defaultdict(list, data['index'])
        self.doc_lengths = data['doc_lengths']
        self.doc_content = data['doc_content']
        self.term_doc_freq = defaultdict(int, data['term_doc_freq'])
        self.total_docs = data['total_docs']
        self.avg_doc_length = data['avg_doc_length']
        print(f"[SUCCESS] Index loaded from {filepath}")


# ============================================================================
# INDEX BUILDER
# ============================================================================

def build_index_from_database(db_connection) -> InvertedIndex:
    """Build inverted index from database"""
    index = InvertedIndex()
    
    cursor = db_connection.cursor()
    cursor.execute("""
        SELECT id, title, content, summary 
        FROM documents 
        WHERE status = 'published'
    """)
    
    documents = cursor.fetchall()
    print(f"Building index for {len(documents)} documents...")
    
    for doc in documents:
        doc_id = doc['id']
        title = doc['title']
        content = doc['content']
        summary = doc['summary'] or ""
        
        index.add_document(doc_id, title, content, summary)
        
        if doc_id % 100 == 0:
            print(f"  Indexed {doc_id} documents...")
    
    cursor.close()
    
    print(f"\n[SUCCESS] Index built successfully!")
    print(f"   Total documents: {index.total_docs}")
    print(f"   Total terms: {len(index.index)}")
    print(f"   Average doc length: {index.avg_doc_length:.2f} tokens")
    
    return index


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Test the text transformer
    transformer = TextTransformer()
    
    text = "BM25 is a ranking algorithm used in information retrieval systems"
    tokens = transformer.transform(text)
    print(f"Original: {text}")
    print(f"Tokens: {tokens}")
    
    # Test index
    index = InvertedIndex()
    index.add_document(1, "BM25 Algorithm", "BM25 is a ranking function used by search engines", "BM25 ranking")
    index.add_document(2, "TF-IDF", "TF-IDF is another ranking algorithm", "Term frequency")
    
    print(f"\nPostings for 'rank': {index.get_term_postings('rank')}")
    print(f"IDF for 'rank': {index.get_idf('rank'):.4f}")
    print(f"IDF for 'algorithm': {index.get_idf('algorithm'):.4f}")
