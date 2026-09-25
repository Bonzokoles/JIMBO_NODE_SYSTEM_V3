import { addonRegistry } from '@/lib/addons'
import { WorkflowNode } from '@/store/workflowStore'
import { Edge } from '@xyflow/react'
import { caydenGatewayService } from '@/services/caydenGatewayService'

export interface ExecutionContext {
  nodeResults: Map<string, any>
  startTime: number
  abortController?: AbortController
}

export interface NodeExecutor {
  (
    node: WorkflowNode,
    inputs: any[],
    context: ExecutionContext
  ): Promise<any>
}

export class WorkflowExecutionEngine {
  private executors: Map<string, NodeExecutor> = new Map()
  
  constructor() {
    this.registerDefaultExecutors()
  }
  
  registerExecutor(nodeType: string, executor: NodeExecutor) {
    this.executors.set(nodeType, executor)
  }
  
  private registerDefaultExecutors() {
    this.registerExecutor('textInput', this.executeTextInput.bind(this))
    this.registerExecutor('fileUpload', this.executeFileUpload.bind(this))
    this.registerExecutor('apiRequest', this.executeApiRequest.bind(this))
    this.registerExecutor('webScraper', this.executeWebScraper.bind(this))
    this.registerExecutor('jimboLibrarySearch', this.executeJimboLibrary.bind(this))
    this.registerExecutor('localFileRead', this.executeLocalFileRead.bind(this))
    
    this.registerExecutor('openai', this.executeOpenAI.bind(this))
    this.registerExecutor('anthropicClaude', this.executeClaude.bind(this))
    this.registerExecutor('googleGemini', this.executeGemini.bind(this))
    this.registerExecutor('dalle', this.executeDALLE.bind(this))
    this.registerExecutor('whisper', this.executeWhisper.bind(this))
    this.registerExecutor('elevenlabs', this.executeElevenLabs.bind(this))
    this.registerExecutor('embeddings', this.executeEmbeddings.bind(this))
    this.registerExecutor('moa', this.executeMOA.bind(this))
    
    this.registerExecutor('textChunker', this.executeTextChunker.bind(this))
    this.registerExecutor('textTransform', this.executeTextTransform.bind(this))
    this.registerExecutor('filter', this.executeFilter.bind(this))
    this.registerExecutor('merge', this.executeMerge.bind(this))
    this.registerExecutor('split', this.executeSplit.bind(this))
    this.registerExecutor('conditional', this.executeConditional.bind(this))
    this.registerExecutor('delay', this.executeDelay.bind(this))
    this.registerExecutor('summarize', this.executeSummarize.bind(this))
    this.registerExecutor('translate', this.executeTranslate.bind(this))
    this.registerExecutor('sentimentAnalysis', this.executeSentimentAnalysis.bind(this))
    
    this.registerExecutor('webhook', this.executeWebhook.bind(this))
    this.registerExecutor('slack', this.executeSlack.bind(this))
    this.registerExecutor('email', this.executeEmail.bind(this))
    this.registerExecutor('console', this.executeConsole.bind(this))
    this.registerExecutor('logger', this.executeLogger.bind(this))
    this.registerExecutor('localFileWrite', this.executeLocalFileWrite.bind(this))
    this.registerExecutor('fileWrite', this.executeLocalFileWrite.bind(this))
    
    // CAY_DEN AI Nodes
    this.registerExecutor('caydenGeminiChat', this.executeCaydenGeminiChat.bind(this))
    this.registerExecutor('caydenGeminiVision', this.executeCaydenGeminiVision.bind(this))
    this.registerExecutor('caydenReactAgent', this.executeCaydenReactAgent.bind(this))
    this.registerExecutor('caydenDeepSearch', this.executeCaydenDeepSearch.bind(this))
    this.registerExecutor('caydenRAGQuery', this.executeCaydenRAGQuery.bind(this))
    
    // LIBRARIES Nodes
    this.registerExecutor('librariesMoneyMachine', this.executeLibrariesMoneyMachine.bind(this))
    this.registerExecutor('librariesBucketOfBlood', this.executeLibrariesBucketOfBlood.bind(this))
    this.registerExecutor('librariesShadowBoxing', this.executeLibrariesShadowBoxing.bind(this))
    this.registerExecutor('librariesTheNow', this.executeLibrariesTheNow.bind(this))
    this.registerExecutor('librariesSearch', this.executeLibrariesSearch.bind(this))
    
    // Knowledge Base Nodes
    this.registerExecutor('knowledgeBaseCategory', this.executeKnowledgeBaseCategory.bind(this))
    this.registerExecutor('knowledgeBaseSearch', this.executeKnowledgeBaseSearch.bind(this))
  }
  
  async executeNode(
    node: WorkflowNode,
    inputs: any[],
    context: ExecutionContext
  ): Promise<any> {
    const executor = this.executors.get(node.data.type)
    
    if (executor) {
      return await executor(node, inputs, context)
    }

    const addonNodes = addonRegistry.getAllNodes()
    console.log('[DEBUG] addonNodes', addonNodes.map(n => n.type))
    console.log('[DEBUG] node.data.type', node.data.type)
    const addonNode = addonNodes.find(n => n.type === node.data.type)
    const runFunc = addonNode?.execute || (addonNode as any)?.executor
    if (addonNode && runFunc) {
      const namedInputs: Record<string, any> = {}
        const dynamicInputs: any[] = []
        
        inputs.forEach((inputObj, idx) => {
          // Backward compatibility check
          const handle = inputObj?.handle || 'target'
          const rawVal = inputObj?.value !== undefined ? inputObj.value : inputObj
          const val = rawVal?.value !== undefined ? rawVal.value : rawVal

          if (handle === 'target' || !handle.startsWith('target-')) {
            if (addonNode.inputs && addonNode.inputs[idx]) {
              namedInputs[addonNode.inputs[idx].id] = val
            } else if (addonNode.inputs && addonNode.inputs.length === 1) {
               // Fallback: if there's only 1 defined input but it was plugged into a weird handle
               namedInputs[addonNode.inputs[0].id] = val
            }
          } else {
            dynamicInputs.push(val)
          }
        })
        
        namedInputs.dynamic = dynamicInputs
      return await runFunc(namedInputs, node.data.config || {})
    }
    
    return await this.executeGeneric(node, inputs, context)
  }
  
  private async executeTextInput(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    return {
      type: 'text',
      value: node.data.config?.textContent || node.data.config?.text || node.data.config?.value || 'Sample text input',
      timestamp: Date.now(),
    }
  }
  
  private async executeFileUpload(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    return {
      type: 'file',
      fileName: node.data.config?.fileName || 'sample.txt',
      content: node.data.config?.content || 'File content here',
      timestamp: Date.now(),
    }
  }
  
  private async executeApiRequest(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const url = node.data.config?.url || 'https://api.example.com/data'
    const method = node.data.config?.method || 'GET'
    
    return {
      type: 'api',
      url,
      method,
      status: 200,
      data: { message: 'Simulated API response', timestamp: Date.now() },
    }
  }
  
  private async executeWebScraper(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const url = node.data.config?.url || 'https://example.com'
    
    return {
      type: 'scrape',
      url,
      content: `Scraped content from ${url}`,
      timestamp: Date.now(),
    }
  }
  
  private async executeOpenAI(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs)
    const promptText = node.data.config?.prompt || inputText || 'Generate a creative response'
    const model = node.data.config?.model || 'gpt-4o-mini'
    
    try {
        let apiKey = ''
        if (typeof window !== 'undefined' && (window as any).spark?.kv) {
          const envConfig = await (window as any).spark.kv.get('env-config')
          if (envConfig) apiKey = envConfig['OPENAI_API_KEY'] || ''
        }
        
        if (!apiKey) {
          // Fallback to window.spark.llm if no API key is provided
          const response = await (window as any).spark.llm(promptText, model as 'gpt-4o' | 'gpt-4o-mini')
          return {
            type: 'ai',
            model: 'OpenAI',
            modelName: model,
            prompt: promptText,
            response,
            timestamp: Date.now(),
          }
        }
        
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: promptText }]
          })
        })
        
        if (!res.ok) {
           const errText = await res.text()
           throw new Error(`API Error ${res.status}: ${errText}`)
        }
        
        const data = await res.json()
        const response = data.choices[0].message.content
        
        return {
          type: 'ai',
          model: 'OpenAI',
          modelName: model,
          prompt: promptText,
          response,
          timestamp: Date.now(),
        }
      } catch (error) {
        throw new Error(`OpenAI execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
  }
  
  private async executeClaude(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs)
    const promptText = node.data.config?.prompt || inputText || 'Analyze and provide insights'
    
    try {
      const response = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      return {
        type: 'ai',
        model: 'Claude',
        prompt: promptText,
        response,
        timestamp: Date.now(),
      }
    } catch (error) {
      throw new Error(`Claude execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  private async executeGemini(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs)
    const promptText = node.data.config?.prompt || inputText || 'Process this content'
    
    try {
      const response = await window.spark.llm(promptText, 'gpt-4o')
      
      return {
        type: 'ai',
        model: 'Gemini',
        prompt: promptText,
        response,
        timestamp: Date.now(),
      }
    } catch (error) {
      throw new Error(`Gemini execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  private async executeDALLE(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const prompt = node.data.config?.prompt || this.extractTextFromInputs(inputs) || 'A beautiful landscape'
    
    return {
      type: 'image',
      model: 'DALL-E',
      prompt,
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HZW5lcmF0ZWQgSW1hZ2U8L3RleHQ+PC9zdmc+',
      timestamp: Date.now(),
    }
  }
  
  private async executeWhisper(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const audioInput = inputs.find(i => i?.type === 'audio')
    
    return {
      type: 'transcription',
      model: 'Whisper',
      text: 'Transcribed audio content goes here',
      language: 'en',
      timestamp: Date.now(),
    }
  }
  
  private async executeElevenLabs(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    
    return {
      type: 'audio',
      model: 'ElevenLabs',
      text,
      audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      voice: node.data.config?.voice || 'default',
      timestamp: Date.now(),
    }
  }
  
  private async executeEmbeddings(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    const dimensions = node.data.config?.dimensions || 1536
    
    const embedding: number[] = []
    for (let i = 0; i < dimensions; i++) {
      embedding.push(Math.random() * 2 - 1)
    }
    
    return {
      type: 'embedding',
      text,
      embedding,
      dimensions,
      timestamp: Date.now(),
    }
  }

  private async executeMOA(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs)
    const agents = node.data.config?.agents || []
    const strategy = node.data.config?.aggregationStrategy || 'weighted_consensus'
    
    if (agents.length === 0) {
      throw new Error('MOA node requires at least one agent to be configured')
    }

    const agentResponses: Array<{
      role: string
      provider: string
      model: string
      response: string
    }> = []
    
    for (const agent of agents) {
      const agentPrompt = agent.prompt 
        ? `${agent.prompt}\n\nInput: ${inputText}`
        : inputText
      
      try {
        const response = await window.spark.llm(agentPrompt, 'gpt-4o-mini')
        agentResponses.push({
          role: agent.role,
          provider: agent.provider,
          model: agent.model,
          response,
        })
      } catch (error) {
        console.error(`Agent ${agent.role} failed:`, error)
        agentResponses.push({
          role: agent.role,
          provider: agent.provider,
          model: agent.model,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }

    let finalResponse = ''
    
    switch (strategy) {
      case 'concatenate':
        finalResponse = agentResponses.map(r => `[${r.role}]: ${r.response}`).join('\n\n')
        break
      case 'best_response':
        finalResponse = agentResponses.sort((a, b) => b.response.length - a.response.length)[0].response
        break
      case 'majority_vote':
      case 'weighted_consensus':
      default:
        const agentSummaries = agentResponses.map(r => `**${r.role} (${r.model}):**\n${r.response}`).join('\n\n---\n\n')
        const synthesisPrompt = `You are a synthesis AI. Below are responses from multiple AI agents analyzing the same input. Synthesize their responses into a single, coherent, and comprehensive answer.

${agentSummaries}

Provide a synthesized response that incorporates the best insights from all agents:`
        
        finalResponse = await window.spark.llm(synthesisPrompt, 'gpt-4o')
        break
    }
    
    return {
      type: 'moa',
      strategy,
      agentCount: agents.length,
      agentResponses,
      finalResponse,
      timestamp: Date.now(),
    }
  }
  
  private async executeTextChunker(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    const chunkSize = node.data.config?.chunkSize || 500
    const overlap = node.data.config?.overlap || 50
    
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize))
    }
    
    return {
      type: 'chunks',
      chunks,
      chunkCount: chunks.length,
      chunkSize,
      timestamp: Date.now(),
    }
  }
  
  private async executeTextTransform(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    const operation = node.data.config?.operation || 'uppercase'
    
    let result = text
    switch (operation) {
      case 'uppercase':
        result = text.toUpperCase()
        break
      case 'lowercase':
        result = text.toLowerCase()
        break
      case 'trim':
        result = text.trim()
        break
      case 'reverse':
        result = text.split('').reverse().join('')
        break
    }
    
    return {
      type: 'text',
      value: result,
      operation,
      timestamp: Date.now(),
    }
  }
  
  private async executeFilter(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const condition = node.data.config?.condition || 'all'
    
    return {
      type: 'filtered',
      filtered: inputs.filter(() => Math.random() > 0.3),
      originalCount: inputs.length,
      timestamp: Date.now(),
    }
  }
  
  private async executeMerge(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    return {
      type: 'merged',
      merged: inputs,
      count: inputs.length,
      timestamp: Date.now(),
    }
  }
  
  private async executeSplit(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const splitCount = node.data.config?.splitCount || 2
    
    return {
      type: 'split',
      outputs: Array.from({ length: splitCount }, (_, i) => ({
        index: i,
        data: inputs,
      })),
      timestamp: Date.now(),
    }
  }
  
  private async executeConditional(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const condition = node.data.config?.condition || 'true'
    const conditionMet = Math.random() > 0.5
    
    return {
      type: 'conditional',
      conditionMet,
      condition,
      output: conditionMet ? inputs : null,
      timestamp: Date.now(),
    }
  }
  
  private async executeDelay(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const duration = node.data.config?.duration || 1000
    await new Promise(resolve => setTimeout(resolve, duration))
    
    return {
      type: 'delayed',
      delay: duration,
      data: inputs,
      timestamp: Date.now(),
    }
  }
  
  private async executeSummarize(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    const maxLength = node.data.config?.maxLength || 100
    
    try {
      const promptText = `Summarize the following text in no more than ${maxLength} words:\n\n${text}`
      const summary = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      return {
        type: 'summary',
        summary,
        originalLength: text.length,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        type: 'summary',
        summary: text.slice(0, maxLength) + '...',
        originalLength: text.length,
        timestamp: Date.now(),
      }
    }
  }
  
  private async executeTranslate(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    const targetLang = node.data.config?.targetLanguage || 'Spanish'
    
    try {
      const promptText = `Translate the following text to ${targetLang}:\n\n${text}`
      const translation = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      return {
        type: 'translation',
        translation,
        targetLanguage: targetLang,
        timestamp: Date.now(),
      }
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  private async executeSentimentAnalysis(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const text = this.extractTextFromInputs(inputs)
    
    try {
      const promptText = `Analyze the sentiment of the following text. Respond with ONLY a JSON object containing "sentiment" (positive/negative/neutral) and "score" (0-1):\n\n${text}`
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const result = JSON.parse(response)
      
      return {
        type: 'sentiment',
        sentiment: result.sentiment || 'neutral',
        score: result.score || 0.5,
        text,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        type: 'sentiment',
        sentiment: 'neutral',
        score: 0.5,
        text,
        timestamp: Date.now(),
      }
    }
  }
  
  private async executeWebhook(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const url = node.data.config?.url || 'https://webhook.site/test'
    
    return {
      type: 'webhook',
      url,
      status: 'sent',
      payload: inputs,
      timestamp: Date.now(),
    }
  }
  
  private async executeSlack(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const message = node.data.config?.message || this.extractTextFromInputs(inputs)
    const channel = node.data.config?.channel || '#general'
    
    return {
      type: 'slack',
      channel,
      message,
      status: 'sent',
      timestamp: Date.now(),
    }
  }
  
  private async executeEmail(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const to = node.data.config?.to || 'user@example.com'
    const subject = node.data.config?.subject || 'Workflow Result'
    const body = node.data.config?.body || this.extractTextFromInputs(inputs)
    
    return {
      type: 'email',
      to,
      subject,
      body,
      status: 'sent',
      timestamp: Date.now(),
    }
  }
  
  private async executeConsole(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    console.log('Node Output:', inputs)
    
    return {
      type: 'console',
      logged: true,
      data: inputs,
      timestamp: Date.now(),
    }
  }
  
  private async executeLogger(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const level = node.data.config?.level || 'info'
    
    return {
      type: 'log',
      level,
      message: JSON.stringify(inputs),
      timestamp: Date.now(),
    }
  }
  
  private async executeJimboLibrary(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const { jimboLibrary } = await import('@/services/jimboLibraryService');
    
    const query = inputs[0]?.value || 
                  inputs[0]?.text || 
                  node.data.config?.query || 
                  '';
    
    if (!query) {
      throw new Error('JIMBO Library: No search query provided');
    }

    const config = node.data.config || {};
    const maxResults = config.maxResults || 5;
    const includeContent = config.includeContent ?? true;

    try {
      const results = await jimboLibrary.search(query, { 
        category: config.category,
        fileType: config.fileType,
        tags: config.tags
      })

      if (includeContent && results.results.length > 0) {
        const firstResult = results.results[0]
        const content = await jimboLibrary.getFileContent(
          firstResult.category,
          firstResult.name
        )
        
        return {
          type: 'library_context',
          value: content,
          metadata: {
            query,
            total: results.total,
            results: results.results
          },
          timestamp: Date.now()
        };
      }

      return {
        type: 'library_results',
        value: JSON.stringify(results, null, 2),
        metadata: {
          query,
          total: results.total,
          results: results.results
        },
        timestamp: Date.now()
      };

    } catch (error: any) {
      console.error('JIMBO Library execution error:', error);
      throw new Error(`JIMBO Library: ${error.message}`);
    }
  }
  
  private async executeLocalFileRead(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const { localFileService } = await import('@/services/localFileService');
    
    try {
      const content = await localFileService.readTextFile();
      
      return {
        type: 'file_content',
        value: content,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Local file read error:', error);
      throw new Error(`Local File Read: ${error.message}`);
    }
  }
  
  private async executeLocalFileWrite(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    try {
      const content = this.extractTextFromInputs(inputs);
      const filename = node.data.config?.fileName || node.data.config?.filename || node.data.config?.filepath || 'output.txt';
      
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7072';
      const response = await fetch(`${BACKEND_URL}/api/fs/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filepath: filename,
          content: content
        }),
      });
      
      if (!response.ok) {
        throw new Error('Backend responded with status ' + response.status);
      }
      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to save file');
      }
      
      return {
        type: 'file_written',
        value: `File saved automatically to: ${data.filepath}`,
        filename: data.filepath,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Local file write error:', error);
      throw new Error(`Local File Write: ${error.message}`);
    }
  }
  
  // ========== CAY_DEN AI NODES ==========
  
  private async executeCaydenGeminiChat(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const promptText = node.data.config?.prompt || inputText || 'Assist the user';
    const model = node.data.config?.model || 'gemini-1.5-flash';
    const temperature = node.data.config?.temperature || 0.7;
    
    try {
      const messages = [
        { role: 'user' as const, content: promptText }
      ];
      
      const response = await caydenGatewayService.geminiChat({
        messages,
        model,
        temperature
      });
      
      return {
        type: 'cayden_gemini_chat',
        model,
        prompt: promptText,
        response: response.response,
        usage: response.usage,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`CAY_DEN Gemini Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeCaydenGeminiVision(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const imageData = node.data.config?.imageData || inputs.find(i => i?.type === 'image')?.imageUrl || '';
    const prompt = node.data.config?.prompt || 'Describe this image';
    
    if (!imageData) {
      throw new Error('CAY_DEN Gemini Vision: No image data provided');
    }
    
    try {
      const response = await caydenGatewayService.geminiVision(imageData, prompt);
      
      return {
        type: 'cayden_gemini_vision',
        prompt,
        response: response.response,
        usage: response.usage,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`CAY_DEN Gemini Vision failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeCaydenReactAgent(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const task = node.data.config?.task || inputText || 'Solve the problem step by step';
    
    try {
      // ReAct agent używa Gemini w trybie reasoning + acting
      const messages = [
        { 
          role: 'user' as const, 
          content: `You are a ReAct (Reasoning + Acting) agent. Think step by step and solve this task:\n\n${task}\n\nProvide your reasoning, actions, and final answer.`
        }
      ];
      
      const response = await caydenGatewayService.geminiChat({
        messages,
        temperature: 0.2,
        model: 'gemini-1.5-pro'
      });
      
      return {
        type: 'cayden_react_agent',
        task,
        response: response.response,
        reasoning: response.response,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`CAY_DEN ReAct Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeCaydenDeepSearch(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || '';
    const sources = node.data.config?.sources || ['google', 'tavily'];
    const maxResults = node.data.config?.maxResults || 10;
    
    if (!query) {
      throw new Error('CAY_DEN Deep Search: No search query provided');
    }
    
    try {
      const response = await caydenGatewayService.deepSearch({
        query,
        sources: sources as any,
        maxResults
      });
      
      return {
        type: 'cayden_deep_search',
        query,
        results: response.results,
        totalResults: response.totalResults,
        sources,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`CAY_DEN Deep Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeCaydenRAGQuery(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || '';
    const collectionName = node.data.config?.collectionName;
    const limit = node.data.config?.limit || 5;
    
    if (!query) {
      throw new Error('CAY_DEN RAG Query: No query provided');
    }
    
    try {
      const response = await caydenGatewayService.ragQuery({
        query,
        collectionName,
        limit
      });
      
      return {
        type: 'cayden_rag_query',
        query,
        context: response.context,
        results: response.results,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`CAY_DEN RAG Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // ========== LIBRARIES NODES ==========
  
  private async executeLibrariesMoneyMachine(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || 'monetization strategies';
    const limit = node.data.config?.limit || 5;
    
    try {
      const response = await caydenGatewayService.libraryRAGQuery('money-machine', {
        query,
        limit
      });
      
      return {
        type: 'library_money_machine',
        query,
        context: response.context,
        library: 'money-machine',
        numDocuments: response.num_documents,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`LIBRARIES Money Machine failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeLibrariesBucketOfBlood(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || 'customer retention';
    const limit = node.data.config?.limit || 5;
    
    try {
      const response = await caydenGatewayService.libraryRAGQuery('bucket-of-blood', {
        query,
        limit
      });
      
      return {
        type: 'library_bucket_of_blood',
        query,
        context: response.context,
        library: 'bucket-of-blood',
        numDocuments: response.num_documents,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`LIBRARIES Bucket of Blood failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeLibrariesShadowBoxing(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || 'competitive analysis';
    const limit = node.data.config?.limit || 5;
    
    try {
      const response = await caydenGatewayService.libraryRAGQuery('shadow-boxing', {
        query,
        limit
      });
      
      return {
        type: 'library_shadow_boxing',
        query,
        context: response.context,
        library: 'shadow-boxing',
        numDocuments: response.num_documents,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`LIBRARIES Shadow Boxing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeLibrariesTheNow(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || 'current operations';
    const limit = node.data.config?.limit || 5;
    
    try {
      const response = await caydenGatewayService.libraryRAGQuery('the-now', {
        query,
        limit
      });
      
      return {
        type: 'library_the_now',
        query,
        context: response.context,
        library: 'the-now',
        numDocuments: response.num_documents,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`LIBRARIES The Now failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeLibrariesSearch(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || '';
    const limit = node.data.config?.limit || 10;
    
    if (!query) {
      throw new Error('LIBRARIES Search: No query provided');
    }
    
    try {
      const response = await caydenGatewayService.searchAllLibraries({
        query,
        limit
      });
      
      return {
        type: 'libraries_search',
        query,
        results: response.results,
        totalDocuments: response.total_documents,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`LIBRARIES Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // ========== KNOWLEDGE BASE NODES ==========
  
  private async executeKnowledgeBaseCategory(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || '';
    const categoryId = node.data.config?.categoryId || 'ai_agents';
    const limit = node.data.config?.limit || 5;
    
    if (!query) {
      throw new Error('KB Category: No query provided');
    }
    
    try {
      const response = await caydenGatewayService.searchKBCategory(categoryId, {
        query,
        limit
      });
      
      return {
        type: 'kb_category',
        query,
        category: categoryId,
        results: response.results || response,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`KB Category failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeKnowledgeBaseSearch(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    const inputText = this.extractTextFromInputs(inputs);
    const query = node.data.config?.query || inputText || '';
    const limit = node.data.config?.limit || 10;
    
    if (!query) {
      throw new Error('KB Search: No query provided');
    }
    
    try {
      const response = await caydenGatewayService.searchAllKB({
        query,
        limit
      });
      
      return {
        type: 'kb_search',
        query,
        results: response.results || response,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`KB Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeGeneric(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    return {
      type: 'generic',
      nodeType: node.data.type,
      inputs,
      processed: true,
      timestamp: Date.now(),
    }
  }
  
  private extractTextFromInputs(inputs: any[]): string {
    if (!inputs || inputs.length === 0) return ''
    
    return inputs
      .map(wrappedInput => {
        // Unwrap handle wrapper if present
        const input = (wrappedInput && typeof wrappedInput === 'object' && 'handle' in wrappedInput && 'value' in wrappedInput) 
          ? wrappedInput.value 
          : wrappedInput;
          
        if (!input) return ''
        if (typeof input === 'string') return input
        if (input.text) return String(input.text)
        if (input.response) return String(input.response)
        if (input.content) return String(input.content)
        if (input.summary) return String(input.summary)
        if (input.logs && Array.isArray(input.logs)) return input.logs.join('\n')
        if (input.translation) return String(input.translation)
        return JSON.stringify(input)
      })
      .filter(text => text.trim().length > 0)
      .join('\n\n')
  }
}

export function topologicalSort(nodes: WorkflowNode[], edges: Edge[]): string[] {
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()
  
  nodes.forEach(node => {
    inDegree.set(node.id, 0)
    adjList.set(node.id, [])
  })
  
  edges.forEach(edge => {
    adjList.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })
  
  const queue: string[] = []
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId)
  })
  
  const result: string[] = []
  
  while (queue.length > 0) {
    const current = queue.shift()!
    result.push(current)
    
    adjList.get(current)?.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) queue.push(neighbor)
    })
  }
  
  if (result.length !== nodes.length) {
    throw new Error('Workflow contains circular dependencies')
  }
  
  return result
}

export function detectCycles(nodes: WorkflowNode[], edges: Edge[]): boolean {
  try {
    topologicalSort(nodes, edges)
    return false
  } catch {
    return true
  }
}







