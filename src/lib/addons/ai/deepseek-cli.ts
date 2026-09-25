import { Addon } from '@/lib/addons'

export const deepseekCliAgentAddon: Addon = {
  metadata: {
    id: 'deepseek-cli-agent',
    name: 'DeepSeek CLI Agent',
    description: 'Agent AI generujący surowe komendy PowerShell na podstawie intencji. Idealny do podpięcia pod Terminal Executor.',
    version: '1.0.0',
    author: 'JIMBO',
    category: 'ai',
    enabled: true,
    tags: ['ai', 'deepseek', 'cli', 'powershell', 'agent'],
  },
  nodes: [
    {
      type: 'deepseek-cli-node',
      label: 'DeepSeek CLI Agent',
      category: 'ai',
      iconName: 'Terminal',
      description: 'Zmienia intencję użytkownika na czystą komendę PowerShell. Podłącz wyjście do kodu w Terminal Executorze.',
      inputs: [
        { id: 'intent', label: 'Intencja (Co zrobić?)', type: 'text', required: false }
      ],
      outputs: [
        { id: 'command', label: 'Komenda PowerShell', type: 'text' }
      ],
      config: [
        {
          id: 'apiKey',
          label: 'Klucz API',
          type: 'text',
          defaultValue: ''
        },
        {
          id: 'model',
          label: 'Model',
          type: 'text',
          defaultValue: 'deepseek-chat'
        },
        {
          id: 'intentPrompt',
          label: 'Ręczna intencja (wpisz komendę tutaj)',
          type: 'text',
          defaultValue: 'wylistuj pliki w obecnym katalogu'
        },
        {
          id: 'systemPrompt',
          label: 'System Prompt (Role)',
          type: 'text',
          defaultValue: 'Jesteś ekspertem Windows PowerShell. Zwracasz TYLKO I WYŁĄCZNIE surową komendę PowerShell gotową do wykonania. Żadnego formatowania Markdown (żadnych backticków ```), żadnych wyjaśnień. Tylko kod.'
        }
      ],
      executor: async (inputs, config) => {
        const apiKey = config.apiKey
        if (!apiKey) {
          throw new Error('Brak klucza API DeepSeek w konfiguracji węzła!')
        }

        const intent = inputs.intent || (inputs.dynamic && inputs.dynamic.length > 0 ? inputs.dynamic.join('\n') : '') || config.intentPrompt || ''

        if (!intent) {
          throw new Error('Brak intencji! Podłącz tekst do wejścia "intent" albo wpisz go w konfiguracji węzła.')
        }

        try {
          const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: config.model || 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: 'Jesteś ekspertem Windows PowerShell. Zwracasz TYLKO I WYŁĄCZNIE surową komendę PowerShell gotową do wykonania. Żadnego formatowania Markdown (żadnych backticków ```), żadnych wyjaśnień. Tylko kod.'
                },
                {
                  role: 'user',
                  content: intent
                }
              ],
              temperature: 0.1,
              max_tokens: 150
            })
          })

          if (!response.ok) {
            const err = await response.text()
            throw new Error(`Błąd DeepSeek API: ${response.status} - ${err}`)
          }

          const data = await response.json()
          const command = data.choices[0].message.content.trim()

          return {
            command: command,
            _ui_display: `Wygenerowano polecenie:\n${command}`
          }
        } catch (error) {
          throw new Error(`CLI Agent Error: ${error}`)
        }
      }
    }
  ]
}
