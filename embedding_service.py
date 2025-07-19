#!/usr/bin/env python3
"""
Embedding service using sentence-transformers all-mpnet-base-v2 model
This script can be called from Node.js to generate embeddings
"""

import sys
import json
from sentence_transformers import SentenceTransformer

def create_embedding(text):
    """
    Create embedding using all-mpnet-base-v2 model
    Returns a 768-dimensional embedding vector
    """
    try:
        # Load the model (will cache after first use)
        model = SentenceTransformer('all-mpnet-base-v2')
        
        # Generate embedding
        embedding = model.encode(text)
        
        # Convert to list for JSON serialization
        embedding_list = embedding.tolist()
        
        return {
            "success": True,
            "embedding": embedding_list,
            "dimensions": len(embedding_list)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    """
    Main function to handle command line input
    Expects text input as command line argument
    """
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python embedding_service.py <text>"
        }))
        sys.exit(1)
    
    text = sys.argv[1]
    result = create_embedding(text)
    print(json.dumps(result))

if __name__ == "__main__":
    main()