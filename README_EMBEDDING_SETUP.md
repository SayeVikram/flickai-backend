# Sentence-Transformers Embedding Integration

This project has been updated to use the **all-mpnet-base-v2** model from sentence-transformers instead of OpenAI's ada-002 embedding model.

## Setup

### 1. Python Environment
A Python virtual environment has been set up with the required dependencies:

```bash
# Virtual environment is already created in ./venv
# Dependencies are listed in requirements.txt
```

### 2. Files Added/Modified

- **`embedding_service.py`**: Python script that uses sentence-transformers to generate embeddings
- **`createEmbedding.js`**: Modified to call the Python script instead of OpenAI API
- **`requirements.txt`**: Python dependencies for sentence-transformers
- **`venv/`**: Python virtual environment with all dependencies installed

## Usage

The `createEmbedding.js` module exports a function that works exactly like before, but now uses the sentence-transformers model:

```javascript
const createEmbedding = require('./createEmbedding');

async function example() {
  try {
    const embedding = await createEmbedding("Your text here");
    console.log(`Generated ${embedding.length}-dimensional embedding`);
    // embedding is an array of 768 floating-point numbers
  } catch (error) {
    console.error('Error generating embedding:', error);
  }
}
```

## Model Details

- **Model**: `all-mpnet-base-v2`
- **Dimensions**: 768
- **Performance**: High-quality sentence embeddings, often outperforming larger models
- **Speed**: First run downloads the model (~438MB), subsequent runs are faster as the model is cached

## Advantages

1. **Cost**: No API costs, runs locally
2. **Privacy**: Data doesn't leave your server
3. **Performance**: Competitive quality with faster inference after initial setup
4. **Reliability**: No rate limits or API dependencies

## Performance Notes

- **First embedding**: ~4-5 seconds (includes model download and loading)
- **Subsequent embeddings**: ~4-5 seconds (model stays loaded in memory during session)
- **Model size**: ~438MB download on first use
- **Memory usage**: Model loaded in Python process memory

## Troubleshooting

If you encounter issues:

1. **Python version**: Ensure Python 3.8+ is available
2. **Virtual environment**: Make sure `venv/bin/python` exists and has sentence-transformers installed
3. **Model download**: First run requires internet connection to download the model
4. **Memory**: Ensure sufficient RAM (model requires ~1GB when loaded)

## Alternative Models

To use a different sentence-transformers model, modify the model name in `embedding_service.py`:

```python
# Change this line:
model = SentenceTransformer('all-mpnet-base-v2')

# To any other sentence-transformers model, e.g.:
model = SentenceTransformer('all-MiniLM-L6-v2')  # Faster, smaller
model = SentenceTransformer('all-distilroberta-v1')  # Alternative option
```

Note: Different models may have different embedding dimensions.