"""
Terracotta QnA - Build and Initialize IR System
Run this script to set up the complete IR search engine
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from indexing import build_index_from_database
from database import get_db_connection
import time

def main():
    """Build the inverted index from database"""
    print("\n" + "="*70)
    print("TERRACOTTA QnA - IR SYSTEM INITIALIZATION")
    print("="*70)
    
    print("\nThis script will:")
    print("   1. Connect to MySQL database")
    print("   2. Extract all published documents")
    print("   3. Build inverted index with delta encoding compression")
    print("   4. Calculate IDF scores")
    print("   5. Save index to disk")
    print()
    
    try:
        # Connect to database
        print("Connecting to database...")
        with get_db_connection() as conn:
            # Build index
            print("Building inverted index...")
            start_time = time.time()
            
            index = build_index_from_database(conn)
            
            build_time = time.time() - start_time
            
            # Save index
            print("\nSaving index to disk...")
            index.save('terracotta_index.pkl')
            
            # Print statistics
            print("\n" + "="*70)
            print("IR SYSTEM BUILT SUCCESSFULLY!")
            print("="*70)
            print(f"\nStatistics:")
            print(f"   - Total documents indexed: {index.total_docs}")
            print(f"   - Vocabulary size: {len(index.index)} unique terms")
            print(f"   - Average document length: {index.avg_doc_length:.2f} tokens")
            print(f"   - Build time: {build_time:.2f} seconds")
            print(f"   - Index file: terracotta_index.pkl")
            
            # Sample terms
            print(f"\nSample vocabulary:")
            sample_terms = list(index.index.keys())[:10]
            for term in sample_terms:
                df = index.term_doc_freq[term]
                idf = index.get_idf(term)
                print(f"   - '{term}': appears in {df} docs, IDF={idf:.4f}")
            
            print("\n" + "="*70)
            print("Search engine is ready!")
            print("   Start the FastAPI server to use the IR system:")
            print("   python main.py")
            print("="*70 + "\n")
            
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
