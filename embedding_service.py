#!/usr/bin/env python3

import sys
import json
from sentence_transformers import SentenceTransformer

def create_embedding(text):
    try:
        model = SentenceTransformer('all-mpnet-base-v2')
        
        embedding = model.encode(text)
        
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