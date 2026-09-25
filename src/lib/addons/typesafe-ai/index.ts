import { Addon } from '@/lib/addons'

export const typeSafeAiAddon: Addon = {
  metadata: {
    id: 'typesafe-ai-integration',
    name: 'TypeSafe AI',
    description: 'Węzły decyzyjne System One (Jev). Zamieniają tekst i stan aplikacji w ustrukturyzowane, pewne decyzje (Choice, Noul, Score).',
    version: '1.0.0',
    author: 'JIMBO',
    category: 'ai',
    enabled: true,
    tags: ['ai', 'typesafe', 'jev', 'decision', 'system-one'],
  },
  nodes: [
    {
      type: 'typesafe-noul-node',
      label: 'TypeSafe: Noul (P/F)',
      category: 'ai',
      iconName: 'Brain',
      description: 'Zadaje pytanie typu Tak/Nie (Noul) i zwraca prawdopodobieństwo.',
      inputs: [
        { id: 'state', label: 'State (JSON/Tekst)', type: 'any', required: true },
        { id: 'question', label: 'Pytanie (Instructions)', type: 'text', required: true }
      ],
      outputs: [
        { id: 'result', label: 'Wynik (True/False)', type: 'boolean' },
        { id: 'probability', label: 'Prawdopodobieństwo', type: 'number' },
        { id: 'raw', label: 'Raw JSON', type: 'object' }
      ],
      config: [
        {
          id: 'apiKey',
          label: 'TypeSafe API Key',
          type: 'text',
          defaultValue: ''
        },
        {
          id: 'threshold',
          label: 'Próg akceptacji (0.0 - 1.0)',
          type: 'number',
          defaultValue: 0.5
        }
      ],
      executor: async (inputs, config) => {
        const apiKey = config.apiKey
        if (!apiKey) {
          throw new Error('Brak klucza TypeSafe API Key. Wpisz go w konfiguracji węzła.')
        }

        const state = inputs.state || ''
        const question = inputs.question || ''

        try {
          const response = await fetch('https://api.typesafe.ai/v1/noul', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              state: typeof state === 'string' ? state : JSON.stringify(state),
              question: question
            })
          })

          if (!response.ok) {
            const err = await response.text()
            throw new Error(`Błąd TypeSafe API: ${response.status} - ${err}`)
          }

          const data = await response.json()
          const prob = data.probability || 0
          const threshold = config.threshold as number
          const result = prob >= threshold

          return {
            result: result,
            probability: prob,
            raw: data,
            _ui_display: `Wynik: ${result ? 'TAK' : 'NIE'}\nPewność: ${(prob * 100).toFixed(1)}%`
          }
        } catch (error) {
          throw new Error(`TypeSafe AI Node Error: ${error}`)
        }
      }
    }
  ]
}
