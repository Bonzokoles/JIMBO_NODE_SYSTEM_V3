import { Addon } from '@/lib/addons'

export const devzKbMonitorAddon: Addon = {
  metadata: {
    id: 'devz-kb-monitor-v2',
    name: '36 Chambers RAG Monitor',
    description: 'Łączy się lokalnie z bazą ChromaDB (V:\\) by śledzić statystyki wektorów na żywo.',
    version: '1.0.0',
    author: 'JIMBO',
    category: 'custom',
    enabled: true,
    tags: ['database', 'rag', 'monitor', 'chromadb'],
  },
  nodes: [
    {
      type: 'devz-kb-monitor-node',
      label: 'ChromaDB Status',
      category: 'databases',
      iconName: 'Database',
      description: 'Pobiera na żywo statystyki (ilość wektorów, kolekcji) z lokalnej bazy 36 Chambers.',
      inputs: [
        { id: 'trigger', label: 'Trigger', type: 'any' }
      ],
      outputs: [
        { id: 'stats', label: 'Stats JSON', type: 'object' },
        { id: 'count', label: 'Embeddings Count', type: 'number' }
      ],
      config: [
        {
          id: 'interval',
          label: 'Interwał Odświeżania (s)',
          type: 'number',
          defaultValue: 5
        }
      ],
      executor: async (inputs, config) => {
        try {
          const response = await fetch('http://localhost:7072/api/stats')
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
          }
          const data = await response.json()
          
          return {
            stats: data,
            count: data.embeddings,
            _ui_display: `Status: ${data.status.toUpperCase()}\nWektory: ${data.embeddings}\nKolekcje: ${data.collections}\nRozmiar: ${data.db_size_mb} MB`
          }
        } catch (error) {
          throw new Error(`Błąd połączenia z backendem (port 7072): ${error}`)
        }
      }
    }
  ]
}




