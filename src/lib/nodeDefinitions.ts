export interface NodeDefinition {
  type: string
  label: string
  iconName: string
  category: 'input' | 'ai' | 'process' | 'output'
  description: string
  color?: string
}

export const nodeDefinitions: NodeDefinition[] = [
  // INPUT NODES (17)
  { type: 'textInput', label: 'Text Input', iconName: 'FileText', category: 'input', description: 'Manual text input field', color: 'oklch(0.6 0.15 220)' },
  { type: 'fileUpload', label: 'File Upload', iconName: 'CloudArrowUp', category: 'input', description: 'Upload files from local system', color: 'oklch(0.6 0.15 220)' },
  { type: 'jimboLibrarySearch', label: 'JIMBO Library', iconName: 'Books', category: 'input', description: 'Search THE_DEvz_HUB JIMBO Libraries', color: 'oklch(0.6 0.15 280)' },
  { type: 'localFileRead', label: 'Local File Read', iconName: 'FileText', category: 'input', description: 'Read local files from your system', color: 'oklch(0.6 0.15 200)' },
  { type: 'webScraper', label: 'Web Scraper', iconName: 'Globe', category: 'input', description: 'Scrape content from websites', color: 'oklch(0.6 0.15 220)' },
  { type: 'apiRequest', label: 'API Request', iconName: 'ShareNetwork', category: 'input', description: 'Make HTTP API requests', color: 'oklch(0.6 0.15 220)' },
  { type: 'databaseQuery', label: 'Database Query', iconName: 'Database', category: 'input', description: 'Query database for data', color: 'oklch(0.6 0.15 220)' },
  { type: 'rssReader', label: 'RSS Reader', iconName: 'MagnifyingGlass', category: 'input', description: 'Read and parse RSS feeds', color: 'oklch(0.6 0.15 220)' },
  { type: 'csvReader', label: 'CSV Reader', iconName: 'Table', category: 'input', description: 'Parse CSV files', color: 'oklch(0.6 0.15 220)' },
  { type: 'jsonParser', label: 'JSON Parser', iconName: 'Code', category: 'input', description: 'Parse JSON data', color: 'oklch(0.6 0.15 220)' },
  { type: 'voiceInput', label: 'Voice Input', iconName: 'Microphone', category: 'input', description: 'Record voice input', color: 'oklch(0.6 0.15 220)' },
  { type: 'imageInput', label: 'Image Input', iconName: 'Image', category: 'input', description: 'Upload or capture images', color: 'oklch(0.6 0.15 220)' },
  { type: 'videoInput', label: 'Video Input', iconName: 'VideoCamera', category: 'input', description: 'Upload video files', color: 'oklch(0.6 0.15 220)' },
  { type: 'cameraCapture', label: 'Camera Capture', iconName: 'Camera', category: 'input', description: 'Capture from camera', color: 'oklch(0.6 0.15 220)' },
  { type: 'githubRepo', label: 'GitHub Repo', iconName: 'GithubLogo', category: 'input', description: 'Read from GitHub repositories', color: 'oklch(0.6 0.15 220)' },
  { type: 'googleDrive', label: 'Google Drive', iconName: 'GoogleDriveLogo', category: 'input', description: 'Access Google Drive files', color: 'oklch(0.6 0.15 220)' },
  { type: 'clipboardInput', label: 'Clipboard', iconName: 'Clipboard', category: 'input', description: 'Read from clipboard', color: 'oklch(0.6 0.15 220)' },

  // AI NODES (20)
  { type: 'openai', label: 'OpenAI', iconName: 'ChatCentered', category: 'ai', description: 'OpenAI GPT models', color: 'oklch(0.65 0.2 145)' },
  { type: 'anthropicClaude', label: 'Anthropic Claude', iconName: 'Brain', category: 'ai', description: 'Claude AI models', color: 'oklch(0.65 0.2 145)' },
  { type: 'googleGemini', label: 'Google Gemini', iconName: 'Cube', category: 'ai', description: 'Google Gemini AI', color: 'oklch(0.65 0.2 145)' },
  { type: 'mistral', label: 'Mistral', iconName: 'ChatCentered', category: 'ai', description: 'Mistral AI models', color: 'oklch(0.65 0.2 145)' },
  { type: 'cohere', label: 'Cohere', iconName: 'Brain', category: 'ai', description: 'Cohere AI platform', color: 'oklch(0.65 0.2 145)' },
  { type: 'perplexity', label: 'Perplexity', iconName: 'MagnifyingGlass', category: 'ai', description: 'Perplexity AI search', color: 'oklch(0.65 0.2 145)' },
  { type: 'huggingface', label: 'HuggingFace', iconName: 'Cube', category: 'ai', description: 'HuggingFace models', color: 'oklch(0.65 0.2 145)' },
  { type: 'ollama', label: 'Ollama', iconName: 'Brain', category: 'ai', description: 'Local Ollama models', color: 'oklch(0.65 0.2 145)' },
  { type: 'groq', label: 'Groq', iconName: 'Lightning', category: 'ai', description: 'Groq fast inference', color: 'oklch(0.65 0.2 145)' },
  { type: 'togetherAI', label: 'Together AI', iconName: 'ChatCentered', category: 'ai', description: 'Together AI platform', color: 'oklch(0.65 0.2 145)' },
  { type: 'replicate', label: 'Replicate', iconName: 'ArrowsClockwise', category: 'ai', description: 'Replicate model hosting', color: 'oklch(0.65 0.2 145)' },
  { type: 'dalle', label: 'DALL-E', iconName: 'Image', category: 'ai', description: 'OpenAI image generation', color: 'oklch(0.65 0.2 145)' },
  { type: 'midjourney', label: 'Midjourney', iconName: 'Image', category: 'ai', description: 'Midjourney image generation', color: 'oklch(0.65 0.2 145)' },
  { type: 'stableDiffusion', label: 'Stable Diffusion', iconName: 'Image', category: 'ai', description: 'Stable Diffusion models', color: 'oklch(0.65 0.2 145)' },
  { type: 'whisper', label: 'Whisper', iconName: 'Microphone', category: 'ai', description: 'OpenAI speech-to-text', color: 'oklch(0.65 0.2 145)' },
  { type: 'elevenlabs', label: 'ElevenLabs', iconName: 'Microphone', category: 'ai', description: 'ElevenLabs text-to-speech', color: 'oklch(0.65 0.2 145)' },
  { type: 'gpt4Vision', label: 'GPT-4 Vision', iconName: 'Image', category: 'ai', description: 'GPT-4 with vision capabilities', color: 'oklch(0.65 0.2 145)' },
  { type: 'claudeVision', label: 'Claude Vision', iconName: 'Image', category: 'ai', description: 'Claude with vision capabilities', color: 'oklch(0.65 0.2 145)' },
  { type: 'embeddings', label: 'Embeddings', iconName: 'HardDrives', category: 'ai', description: 'Generate text embeddings', color: 'oklch(0.65 0.2 145)' },
  { type: 'agentExecutor', label: 'Agent Executor', iconName: 'FlowArrow', category: 'ai', description: 'AI agent with tools', color: 'oklch(0.65 0.2 145)' },
  { type: 'moa', label: 'MOA (Mixture of Agents)', iconName: 'UsersThree', category: 'ai', description: 'Multi-model aggregation system for complex tasks', color: 'oklch(0.68 0.22 145)' },

  // PROCESS NODES (30)
  { type: 'textChunker', label: 'Text Chunker', iconName: 'ArrowsLeftRight', category: 'process', description: 'Split text into chunks', color: 'oklch(0.7 0.18 265)' },
  { type: 'chromadb', label: 'ChromaDB', iconName: 'Database', category: 'process', description: 'ChromaDB vector database', color: 'oklch(0.7 0.18 265)' },
  { type: 'pinecone', label: 'Pinecone', iconName: 'Database', category: 'process', description: 'Pinecone vector database', color: 'oklch(0.7 0.18 265)' },
  { type: 'weaviate', label: 'Weaviate', iconName: 'Database', category: 'process', description: 'Weaviate vector database', color: 'oklch(0.7 0.18 265)' },
  { type: 'qdrant', label: 'Qdrant', iconName: 'Database', category: 'process', description: 'Qdrant vector database', color: 'oklch(0.7 0.18 265)' },
  { type: 'sqlite', label: 'SQLite', iconName: 'Database', category: 'process', description: 'SQLite database', color: 'oklch(0.7 0.18 265)' },
  { type: 'postgresql', label: 'PostgreSQL', iconName: 'Database', category: 'process', description: 'PostgreSQL database', color: 'oklch(0.7 0.18 265)' },
  { type: 'mongodb', label: 'MongoDB', iconName: 'Database', category: 'process', description: 'MongoDB NoSQL database', color: 'oklch(0.7 0.18 265)' },
  { type: 'redis', label: 'Redis', iconName: 'Database', category: 'process', description: 'Redis cache/database', color: 'oklch(0.7 0.18 265)' },
  { type: 'textTransform', label: 'Text Transform', iconName: 'ArrowsClockwise', category: 'process', description: 'Transform text data', color: 'oklch(0.7 0.18 265)' },
  { type: 'regexExtract', label: 'Regex Extract', iconName: 'Hash', category: 'process', description: 'Extract data using regex', color: 'oklch(0.7 0.18 265)' },
  { type: 'jsonTransform', label: 'JSON Transform', iconName: 'Code', category: 'process', description: 'Transform JSON data', color: 'oklch(0.7 0.18 265)' },
  { type: 'filter', label: 'Filter', iconName: 'Funnel', category: 'process', description: 'Filter data by criteria', color: 'oklch(0.7 0.18 265)' },
  { type: 'sort', label: 'Sort', iconName: 'SortAscending', category: 'process', description: 'Sort data', color: 'oklch(0.7 0.18 265)' },
  { type: 'merge', label: 'Merge', iconName: 'GitMerge', category: 'process', description: 'Merge multiple inputs', color: 'oklch(0.7 0.18 265)' },
  { type: 'split', label: 'Split', iconName: 'GitBranch', category: 'process', description: 'Split data stream', color: 'oklch(0.7 0.18 265)' },
  { type: 'conditional', label: 'Conditional', iconName: 'GitBranch', category: 'process', description: 'Conditional branching', color: 'oklch(0.7 0.18 265)' },
  { type: 'loop', label: 'Loop', iconName: 'ArrowsClockwise', category: 'process', description: 'Loop over data', color: 'oklch(0.7 0.18 265)' },
  { type: 'delay', label: 'Delay', iconName: 'ClockCounterClockwise', category: 'process', description: 'Add time delay', color: 'oklch(0.7 0.18 265)' },
  { type: 'cache', label: 'Cache', iconName: 'Database', category: 'process', description: 'Cache data temporarily', color: 'oklch(0.7 0.18 265)' },
  { type: 'retry', label: 'Retry', iconName: 'ArrowsClockwise', category: 'process', description: 'Retry on failure', color: 'oklch(0.7 0.18 265)' },
  { type: 'errorHandler', label: 'Error Handler', iconName: 'ListChecks', category: 'process', description: 'Handle errors gracefully', color: 'oklch(0.7 0.18 265)' },
  { type: 'validator', label: 'Validator', iconName: 'ListChecks', category: 'process', description: 'Validate data structure', color: 'oklch(0.7 0.18 265)' },
  { type: 'template', label: 'Template', iconName: 'FileText', category: 'process', description: 'Apply text template', color: 'oklch(0.7 0.18 265)' },
  { type: 'summarize', label: 'Summarize', iconName: 'Note', category: 'process', description: 'Summarize text content', color: 'oklch(0.7 0.18 265)' },
  { type: 'translate', label: 'Translate', iconName: 'Translate', category: 'process', description: 'Translate languages', color: 'oklch(0.7 0.18 265)' },
  { type: 'sentimentAnalysis', label: 'Sentiment Analysis', iconName: 'ChartBar', category: 'process', description: 'Analyze sentiment', color: 'oklch(0.7 0.18 265)' },
  { type: 'entityExtraction', label: 'Entity Extraction', iconName: 'Hash', category: 'process', description: 'Extract named entities', color: 'oklch(0.7 0.18 265)' },
  { type: 'imageResize', label: 'Image Resize', iconName: 'Image', category: 'process', description: 'Resize images', color: 'oklch(0.7 0.18 265)' },
  { type: 'pdfExtract', label: 'PDF Extract', iconName: 'FileCode', category: 'process', description: 'Extract text from PDFs', color: 'oklch(0.7 0.18 265)' },

  // OUTPUT NODES (21)
  { type: 'webhook', label: 'Webhook', iconName: 'ShareNetwork', category: 'output', description: 'Send HTTP webhook', color: 'oklch(0.65 0.2 30)' },
  { type: 'slack', label: 'Slack', iconName: 'ChatCircle', category: 'output', description: 'Send to Slack', color: 'oklch(0.65 0.2 30)' },
  { type: 'discord', label: 'Discord', iconName: 'ChatCircle', category: 'output', description: 'Send to Discord', color: 'oklch(0.65 0.2 30)' },
  { type: 'telegram', label: 'Telegram', iconName: 'ChatCircle', category: 'output', description: 'Send to Telegram', color: 'oklch(0.65 0.2 30)' },
  { type: 'email', label: 'Email', iconName: 'EnvelopeSimple', category: 'output', description: 'Send email', color: 'oklch(0.65 0.2 30)' },
  { type: 'sms', label: 'SMS', iconName: 'DeviceMobile', category: 'output', description: 'Send SMS message', color: 'oklch(0.65 0.2 30)' },
  { type: 'whatsapp', label: 'WhatsApp', iconName: 'WhatsappLogo', category: 'output', description: 'Send to WhatsApp', color: 'oklch(0.65 0.2 30)' },
  { type: 'twitter', label: 'Twitter/X', iconName: 'TwitterLogo', category: 'output', description: 'Post to Twitter/X', color: 'oklch(0.65 0.2 30)' },
  { type: 'notion', label: 'Notion', iconName: 'FileText', category: 'output', description: 'Save to Notion', color: 'oklch(0.65 0.2 30)' },
  { type: 'airtable', label: 'Airtable', iconName: 'Table', category: 'output', description: 'Save to Airtable', color: 'oklch(0.65 0.2 30)' },
  { type: 'googleSheets', label: 'Google Sheets', iconName: 'GoogleSheetsLogo', category: 'output', description: 'Save to Google Sheets', color: 'oklch(0.65 0.2 30)' },
  { type: 'fileWrite', label: 'File Write', iconName: 'FileCode', category: 'output', description: 'Write to file', color: 'oklch(0.65 0.2 30)' },
  { type: 'localFileWrite', label: 'Local File Write', iconName: 'FloppyDisk', category: 'output', description: 'Save to local file system', color: 'oklch(0.65 0.2 30)' },
  { type: 's3Upload', label: 'S3 Upload', iconName: 'CloudArrowUp', category: 'output', description: 'Upload to AWS S3', color: 'oklch(0.65 0.2 30)' },
  { type: 'ftpUpload', label: 'FTP Upload', iconName: 'CloudArrowUp', category: 'output', description: 'Upload via FTP', color: 'oklch(0.65 0.2 30)' },
  { type: 'console', label: 'Console', iconName: 'Code', category: 'output', description: 'Output to console', color: 'oklch(0.65 0.2 30)' },
  { type: 'desktopNotification', label: 'Desktop Notification', iconName: 'BellRinging', category: 'output', description: 'Show desktop notification', color: 'oklch(0.65 0.2 30)' },
  { type: 'logger', label: 'Logger', iconName: 'FileText', category: 'output', description: 'Log to system', color: 'oklch(0.65 0.2 30)' },
  { type: 'printer', label: 'Printer', iconName: 'Printer', category: 'output', description: 'Print document', color: 'oklch(0.65 0.2 30)' },
  { type: 'clipboardOutput', label: 'Clipboard', iconName: 'Clipboard', category: 'output', description: 'Copy to clipboard', color: 'oklch(0.65 0.2 30)' },
  { type: 'qrCode', label: 'QR Code', iconName: 'QrCode', category: 'output', description: 'Generate QR code', color: 'oklch(0.65 0.2 30)' },

  // CAY_DEN AI NODES
  { type: 'caydenGeminiChat', label: 'CAY_DEN Gemini Chat', iconName: 'Cube', category: 'ai', description: 'Google Gemini conversational AI via CAY_DEN Gateway', color: 'oklch(0.65 0.2 145)' },
  { type: 'caydenGeminiVision', label: 'CAY_DEN Gemini Vision', iconName: 'Image', category: 'ai', description: 'Gemini multimodal (text + images) via CAY_DEN', color: 'oklch(0.65 0.2 145)' },
  { type: 'caydenReactAgent', label: 'CAY_DEN ReAct Agent', iconName: 'FlowArrow', category: 'ai', description: 'Reasoning + Acting agent from CAY_DEN', color: 'oklch(0.65 0.2 145)' },

  // CAY_DEN PROCESS NODES
  { type: 'caydenDeepSearch', label: 'CAY_DEN Deep Search', iconName: 'MagnifyingGlass', category: 'process', description: 'Google, Tavily, Exa, Brave search aggregation', color: 'oklch(0.7 0.18 265)' },
  { type: 'caydenRAGQuery', label: 'CAY_DEN RAG Query', iconName: 'Database', category: 'process', description: 'Query local knowledge base with RAG', color: 'oklch(0.7 0.18 265)' },

  // LIBRARIES KNOWLEDGE BASE NODES (Input - data sources)
  { type: 'librariesMoneyMachine', label: '💰 MONEY MACHINE', iconName: 'CurrencyDollar', category: 'input', description: 'AI monetization, e-commerce, payment systems', color: 'oklch(0.6 0.15 60)' },
  { type: 'librariesBucketOfBlood', label: '🩸 BUCKET OF BLOOD', iconName: 'Users', category: 'input', description: 'Customer retention, LTV, subscription models', color: 'oklch(0.6 0.15 0)' },
  { type: 'librariesShadowBoxing', label: '🥊 SHADOW BOXING', iconName: 'ChartBar', category: 'input', description: 'Competitive intelligence, market domination', color: 'oklch(0.6 0.15 280)' },
  { type: 'librariesTheNow', label: '⚡ THE NOW', iconName: 'Lightning', category: 'input', description: 'Current operations, real-time data', color: 'oklch(0.6 0.15 180)' },
  { type: 'librariesSearch', label: 'LIBRARIES Search', iconName: 'MagnifyingGlass', category: 'input', description: 'Search across all LIBRARIES', color: 'oklch(0.6 0.15 120)' },

  // KNOWLEDGE_BASE NODES (Input - thematic categories)
  { type: 'knowledgeBaseCategory', label: 'KB Category', iconName: 'Folder', category: 'input', description: 'Query specific knowledge_base category (15 categories)', color: 'oklch(0.6 0.15 240)' },
  { type: 'knowledgeBaseSearch', label: 'KB Search', iconName: 'FileSearch', category: 'input', description: 'Search across all knowledge_base categories', color: 'oklch(0.6 0.15 200)' },
]

let customNodeDefinitions: NodeDefinition[] = []

export function registerCustomNode(node: NodeDefinition) {
  customNodeDefinitions.push(node)
}

export function unregisterCustomNode(type: string) {
  customNodeDefinitions = customNodeDefinitions.filter(n => n.type !== type)
}

export function getNodeDefinition(type: string): NodeDefinition | undefined {
  const builtIn = nodeDefinitions.find(def => def.type === type)
  if (builtIn) return builtIn
  return customNodeDefinitions.find(def => def.type === type)
}

export function getNodesByCategory(category: NodeDefinition['category']): NodeDefinition[] {
  const builtIn = nodeDefinitions.filter(def => def.category === category)
  const custom = customNodeDefinitions.filter(def => def.category === category)
  return [...builtIn, ...custom]
}

export function getAllNodeDefinitions(): NodeDefinition[] {
  return [...nodeDefinitions, ...customNodeDefinitions]
}
