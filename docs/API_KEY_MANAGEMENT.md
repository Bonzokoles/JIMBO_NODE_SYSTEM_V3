# API Key Management Guide

Secure storage and management of API keys with AES-256 encryption.

## Overview

The API Key Manager addon provides 4 nodes for secure API key operations with support for 10+ AI providers.

## Quick Start

### 1. Start Backend
```bash
cd pc_utility_backend
./setup.sh
python app.py
```

### 2. Store a Key
```typescript
// Use Store API Key node
{
  provider: 'openai',
  apiKey: 'sk-...',
  alias: 'my-openai-key',
  encryptionEnabled: true
}
```

### 3. Retrieve and Use
Store API Key → Retrieve API Key → AI Request → Console

## Nodes

### 🔐 Store API Key
Securely store encrypted API key
- **Inputs**: provider, apiKey
- **Outputs**: keyId, status
- **Config**: provider, alias, encryption, auto-rotation
- **Providers**: OpenAI, Anthropic, Google, Cohere, HuggingFace, Azure, AWS, Groq, Mistral, Custom

### 🔓 Retrieve API Key
Decrypt and retrieve stored key
- **Inputs**: keyId
- **Outputs**: apiKey, provider
- **Config**: keyId, auto-refresh

### 🔧 Manage API Keys
Perform key management operations
- **Inputs**: action
- **Outputs**: result
- **Config**: action (list/delete/rotate/validate), keyId, new key, provider filter

### 🌐 Multi-Provider Request
Send requests to multiple providers
- **Inputs**: prompt, providers
- **Outputs**: responses array, fastest response
- **Config**: providers list, fallback order, timeout, load balancing

## Security Features

### Encryption
- AES-256 encryption using Fernet
- Master key from environment or keyring
- Keys encrypted at rest
- Secure key derivation

### Master Key Setup
```env
# In .env file
PC_UTILITY_MASTER_KEY=your-secure-key-here
```

Or use system keyring:
```python
import keyring
keyring.set_password("pc_utility", "master_key", "your-key")
```

### Best Practices
1. Never commit keys to version control
2. Use strong master key (32+ characters)
3. Rotate keys regularly
4. Enable encryption always
5. Use keyring in production
6. Monitor key usage via audit log

## Supported Providers

| Provider | Value | Use Case |
|----------|-------|----------|
| OpenAI | `openai` | GPT-4, GPT-3.5, DALL-E |
| Anthropic | `anthropic` | Claude |
| Google | `google` | Gemini, PaLM |
| Cohere | `cohere` | Command, Embed |
| HuggingFace | `huggingface` | Custom models |
| Azure OpenAI | `azure_openai` | Enterprise |
| AWS Bedrock | `aws_bedrock` | AWS integration |
| Groq | `groq` | Fast inference |
| Mistral AI | `mistral` | Mistral models |
| Custom | `custom` | Self-hosted |

## Example Workflows

### Multi-Provider Failover
```
Input → Retrieve Keys (OpenAI, Anthropic) → Multi-Provider Request → Console
```

### Key Rotation
```
Retrieve Old Key → Generate New Key → Store New Key → Rotate → Delete Old Key
```

### Key Audit
```
Manage Keys (action: list) → Console → Save to File
```

## Troubleshooting

### Decryption Failed
- Check master key is correct
- Verify key was encrypted with same master key
- Regenerate master key if lost (will invalidate all keys)

### Key Not Found
- Verify keyId is correct
- List all keys to find correct ID
- Check key wasn't deleted

### Provider Not Supported
- Use 'custom' provider for unlisted services
- Check provider name spelling
- Request new provider support

## API Endpoints

- `POST /api/keys/store` - Store key
- `GET /api/keys/retrieve/{key_id}` - Retrieve key
- `GET /api/keys/list` - List all keys
- `DELETE /api/keys/delete/{key_id}` - Delete key
- `POST /api/keys/rotate` - Rotate key
- `POST /api/keys/validate` - Validate key
- `GET /api/keys/providers` - List providers

See `http://localhost:8765/docs` for full API documentation.
