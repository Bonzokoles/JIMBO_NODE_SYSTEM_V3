# Custom Models Deployment Guide

Deploy and manage custom ML models with inference, A/B testing, and GPU support.

## Overview

The Custom Model Deployer addon provides 5 nodes for deploying and running custom ML models.

## Quick Start

### 1. Start Backend
```bash
cd pc_utility_backend
./setup.sh
python app.py
```

### 2. Upload Model
Use the backend API directly for file uploads:
```bash
curl -X POST http://localhost:8765/api/models/upload \
  -F "name=My Model" \
  -F "model_type=pytorch" \
  -F "version=1.0.0" \
  -F "file=@model.pt"
```

### 3. Run Inference
Upload Model → Model Inference → Console

## Nodes

### 📤 Upload Model
Deploy custom model (use API for file uploads)
- **Inputs**: modelFile, config
- **Outputs**: modelId, status
- **Config**: name, model type, version, GPU, description

### 🤖 Model Inference
Run inference on deployed model
- **Inputs**: modelId, input data
- **Outputs**: prediction, confidence, latency
- **Config**: batch size, temperature, max tokens, GPU

### 🔧 Manage Models
Model management operations
- **Inputs**: action
- **Outputs**: result
- **Config**: action (list/delete/metrics/types), modelId, type filter

### 🎓 Fine-tune Model
Fine-tune existing model (placeholder)
- **Inputs**: baseModel, trainingData
- **Outputs**: newModelId, metrics
- **Config**: learning rate, epochs, batch size, validation split

### ⚖️ A/B Test Models
Compare two models
- **Inputs**: modelA, modelB, input
- **Outputs**: resultA, resultB, comparison
- **Config**: metrics, sample size

## Supported Model Types

| Type | Format | Framework |
|------|--------|-----------|
| PyTorch | .pt, .pth | PyTorch |
| TensorFlow | .h5, SavedModel | TensorFlow |
| ONNX | .onnx | ONNX Runtime |
| Scikit-learn | .pkl | scikit-learn |
| HuggingFace | transformers | HuggingFace |
| LightGBM | .pkl | LightGBM |
| XGBoost | .pkl | XGBoost |
| Custom | .bin | Custom Python |

## GPU Configuration

### Check GPU Availability
```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU count: {torch.cuda.device_count()}")
```

### Enable GPU
Set `useGpu: true` in inference config.

### Requirements
- NVIDIA GPU with CUDA support
- CUDA toolkit installed
- PyTorch with CUDA or ONNX Runtime GPU

## Model Deployment

### PyTorch Model
```python
import torch

# Save model
torch.save(model, 'model.pt')

# Or save state dict
torch.save(model.state_dict(), 'model_state.pt')
```

### ONNX Model
```python
import torch.onnx

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    'model.onnx',
    input_names=['input'],
    output_names=['output']
)
```

### Scikit-learn Model
```python
import pickle

# Save model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
```

## Example Workflows

### Basic Inference
```
Input Data → Model Inference → Console (prediction) → Console (latency)
```

### A/B Testing
```
Input → A/B Test (modelA, modelB) → Compare Results → Console
```

### Model Evaluation
```
Test Data → Model Inference → Calculate Metrics → Save Results
```

### Batch Processing
```
Load Dataset → For Each → Model Inference → Aggregate → Report
```

## Performance Optimization

### GPU Acceleration
- Enable GPU for large models
- Use batch inference for multiple samples
- Monitor GPU memory usage

### Model Caching
- Models cached in memory after first load
- Reduces subsequent inference latency
- Restart backend to clear cache

### Batch Processing
- Use batch_size > 1 for multiple inputs
- Reduces per-sample overhead
- Optimal batch size depends on GPU memory

## Monitoring

### Metrics Tracked
- Inference count
- Average latency
- Model version
- Last used timestamp

### Get Metrics
```
Model Manager (action: metrics, modelId: xxx) → Console
```

## Troubleshooting

### Model Load Failed
- Verify model file format matches type
- Check model file is not corrupted
- Ensure dependencies installed (PyTorch, TF, etc.)
- Check model size vs available memory

### Inference Failed
- Verify input shape matches model expectations
- Check input data type (float32, etc.)
- Validate model loaded successfully
- Review error logs

### GPU Not Available
- Check CUDA installation: `nvidia-smi`
- Install GPU version of framework
- Verify CUDA compatibility
- Fall back to CPU if needed

### Out of Memory
- Reduce batch size
- Use CPU instead of GPU
- Quantize model
- Use smaller model variant

## Security Considerations

1. **Validate Models**: Check model files before loading
2. **Resource Limits**: Set memory and CPU limits
3. **Sandboxing**: Run in isolated environment
4. **No Arbitrary Code**: Models should not execute custom code
5. **Access Control**: Restrict model upload/delete permissions

## API Endpoints

- `POST /api/models/upload` - Upload model
- `POST /api/models/inference` - Run inference
- `GET /api/models/list` - List models
- `DELETE /api/models/delete/{model_id}` - Delete model
- `POST /api/models/ab-test` - A/B test
- `GET /api/models/metrics/{model_id}` - Get metrics
- `GET /api/models/types` - List supported types

See `http://localhost:8765/docs` for full API documentation.

## Advanced Features

### Custom Model Loaders
Extend `model_deployment.py` to support additional formats.

### Model Versioning
Deploy multiple versions of same model, manage with version tags.

### Fine-tuning
Implement custom fine-tuning logic for your model type.

### Model Registry
Track all models in SQLite database with metadata.

## Best Practices

1. Test models locally before deployment
2. Version your models semantically
3. Monitor inference latency
4. Use GPU for large models
5. Implement model validation
6. Track model performance metrics
7. Set up model backup/restore
8. Document model requirements
9. Use A/B testing for comparisons
10. Clean up unused models regularly
