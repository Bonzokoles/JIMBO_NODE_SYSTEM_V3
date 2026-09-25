export interface JimboSearchResult {
  category: string
  name: string
  description?: string
  tags?: string[]
  fileType?: string
}

export interface JimboSearchResponse {
  total: number
  results: JimboSearchResult[]
}

export interface JimboSearchOptions {
  category?: string
  fileType?: string
  tags?: string[]
}

export class JimboLibraryService {
  private apiUrl: string

  constructor(apiUrl: string = '/api/jimbo') {
    this.apiUrl = apiUrl
  }

  async search(
    query: string,
    options: JimboSearchOptions = {}
  ): Promise<JimboSearchResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...options })
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('JIMBO Library search error:', error)
      throw error
    }
  }

  async getFileContent(category: string, fileName: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, fileName })
      })

      if (!response.ok) {
        throw new Error(`Failed to get file content: ${response.statusText}`)
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error('JIMBO Library file content error:', error)
      throw error
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET'
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const jimboLibrary = new JimboLibraryService()
