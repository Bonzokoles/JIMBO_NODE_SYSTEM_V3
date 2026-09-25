/**
 * Folder Connector Addon
 * Provides nodes for mounting and interacting with local file system directories
 */

import { Addon } from '@/lib/addons'

const BACKEND_URL = 'http://localhost:8765'

export const folderConnectorAddon: Addon = {
  metadata: {
    id: 'folder-connector',
    name: 'Folder Connector',
    version: '1.0.0',
    author: 'PC Utility Team',
    description: 'Mount and interact with local file system directories',
    category: 'tool',
    enabled: true,
    tags: ['filesystem', 'files', 'folders', 'io'],
  },
  
  nodes: [
    // Folder Mount Node
    {
      type: 'folder-mount',
      label: 'Mount Folder',
      category: 'Folder Operations',
      inputs: [
        {
          id: 'trigger',
          label: 'Trigger',
          type: 'any',
          required: false,
        },
      ],
      outputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'folderPath',
          label: 'Folder Path',
          type: 'text',
          required: true,
          placeholder: '/path/to/folder',
          description: 'Absolute path to the folder to mount',
        },
        {
          id: 'readOnly',
          label: 'Read-Only Mode',
          type: 'boolean',
          defaultValue: false,
          description: 'Mount folder in read-only mode',
        },
        {
          id: 'watchChanges',
          label: 'Watch for Changes',
          type: 'boolean',
          defaultValue: false,
          description: 'Enable real-time file system monitoring',
        },
        {
          id: 'includeHidden',
          label: 'Include Hidden Files',
          type: 'boolean',
          defaultValue: false,
          description: 'Include hidden files (starting with .)',
        },
        {
          id: 'filePattern',
          label: 'File Pattern Filter',
          type: 'text',
          placeholder: '*.txt, *.json',
          description: 'Filter files by pattern (e.g., *.txt)',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/folder/mount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: config.folderPath,
              read_only: config.readOnly,
              watch_changes: config.watchChanges,
              include_hidden: config.includeHidden,
              file_pattern: config.filePattern || null,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to mount folder')
          }
          
          const data = await response.json()
          
          return {
            connection: {
              connection_id: data.connection_id,
              path: data.path,
            },
            metadata: data.metadata,
          }
        } catch (error) {
          throw new Error(`Folder mount failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // File Reader Node
    {
      type: 'folder-file-reader',
      label: 'Read File',
      category: 'Folder Operations',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'filename',
          label: 'Filename',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'content',
          label: 'Content',
          type: 'text',
        },
        {
          id: 'metadata',
          label: 'Metadata',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'encoding',
          label: 'Encoding',
          type: 'select',
          options: [
            { label: 'UTF-8', value: 'utf-8' },
            { label: 'ASCII', value: 'ascii' },
            { label: 'Latin-1', value: 'latin-1' },
          ],
          defaultValue: 'utf-8',
        },
        {
          id: 'readMode',
          label: 'Read Mode',
          type: 'select',
          options: [
            { label: 'Full File', value: 'full' },
            { label: 'Lines', value: 'lines' },
          ],
          defaultValue: 'full',
        },
        {
          id: 'maxSize',
          label: 'Max File Size (MB)',
          type: 'number',
          defaultValue: 10,
          description: 'Maximum file size to read in megabytes',
        },
      ],
      execute: async (inputs, config) => {
        try {
          if (!inputs.connection?.connection_id) {
            throw new Error('Connection object required')
          }
          
          const response = await fetch(`${BACKEND_URL}/api/folder/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connection_id: inputs.connection.connection_id,
              filename: inputs.filename,
              encoding: config.encoding,
              read_mode: config.readMode,
              max_size: (config.maxSize || 10) * 1024 * 1024,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to read file')
          }
          
          const data = await response.json()
          
          return {
            content: data.content,
            metadata: data.metadata,
          }
        } catch (error) {
          throw new Error(`File read failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // File Writer Node
    {
      type: 'folder-file-writer',
      label: 'Write File',
      category: 'Folder Operations',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
        {
          id: 'filename',
          label: 'Filename',
          type: 'text',
          required: true,
        },
        {
          id: 'content',
          label: 'Content',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'result',
          label: 'Result',
          type: 'object',
        },
      ],
      config: [
        {
          id: 'mode',
          label: 'Write Mode',
          type: 'select',
          options: [
            { label: 'Overwrite', value: 'overwrite' },
            { label: 'Append', value: 'append' },
            { label: 'Create New', value: 'create new' },
          ],
          defaultValue: 'overwrite',
        },
        {
          id: 'createDirs',
          label: 'Create Directories',
          type: 'boolean',
          defaultValue: true,
          description: 'Create parent directories if missing',
        },
        {
          id: 'backup',
          label: 'Backup Before Overwrite',
          type: 'boolean',
          defaultValue: false,
          description: 'Create backup with .bak extension',
        },
      ],
      execute: async (inputs, config) => {
        try {
          if (!inputs.connection?.connection_id) {
            throw new Error('Connection object required')
          }
          
          const response = await fetch(`${BACKEND_URL}/api/folder/write`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connection_id: inputs.connection.connection_id,
              filename: inputs.filename,
              content: inputs.content,
              mode: config.mode,
              create_dirs: config.createDirs,
              backup: config.backup,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to write file')
          }
          
          const data = await response.json()
          
          return {
            result: data,
          }
        } catch (error) {
          throw new Error(`File write failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Folder List Files Node
    {
      type: 'folder-list-files',
      label: 'List Files',
      category: 'Folder Operations',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'files',
          label: 'Files',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'sortBy',
          label: 'Sort By',
          type: 'select',
          options: [
            { label: 'Name', value: 'name' },
            { label: 'Date Modified', value: 'date' },
            { label: 'Size', value: 'size' },
          ],
          defaultValue: 'name',
        },
        {
          id: 'filterPattern',
          label: 'Filter Pattern',
          type: 'text',
          placeholder: '*.txt',
          description: 'Filter files by pattern',
        },
        {
          id: 'recursive',
          label: 'Recursive',
          type: 'boolean',
          defaultValue: false,
          description: 'List files in subdirectories',
        },
        {
          id: 'maxResults',
          label: 'Max Results',
          type: 'number',
          defaultValue: 1000,
          description: 'Maximum number of files to return',
        },
      ],
      execute: async (inputs, config) => {
        try {
          if (!inputs.connection?.connection_id) {
            throw new Error('Connection object required')
          }
          
          const response = await fetch(`${BACKEND_URL}/api/folder/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connection_id: inputs.connection.connection_id,
              sort_by: config.sortBy,
              filter_pattern: config.filterPattern || null,
              recursive: config.recursive,
              max_results: config.maxResults || 1000,
            }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Failed to list files')
          }
          
          const data = await response.json()
          
          return {
            files: data.files,
          }
        } catch (error) {
          throw new Error(`File list failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
    
    // Folder Watcher Node
    {
      type: 'folder-watcher',
      label: 'Watch Folder',
      category: 'Folder Operations',
      inputs: [
        {
          id: 'connection',
          label: 'Connection',
          type: 'object',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'event',
          label: 'Event',
          type: 'object',
        },
        {
          id: 'filepath',
          label: 'File Path',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'action',
          label: 'Action',
          type: 'select',
          options: [
            { label: 'Start Watching', value: 'start' },
            { label: 'Stop Watching', value: 'stop' },
          ],
          defaultValue: 'start',
        },
      ],
      execute: async (inputs, config) => {
        try {
          if (!inputs.connection?.connection_id) {
            throw new Error('Connection object required')
          }
          
          const endpoint = config.action === 'start' ? 'watch' : 'unwatch'
          const response = await fetch(`${BACKEND_URL}/api/folder/${endpoint}?connection_id=${inputs.connection.connection_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || `Failed to ${config.action} watching`)
          }
          
          const data = await response.json()
          
          return {
            event: data,
            filepath: '',
          }
        } catch (error) {
          throw new Error(`Folder watch failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    },
  ],
  
  initialize: async () => {
    console.log('📁 Folder Connector addon initialized')
    // Check if backend is available
    try {
      const response = await fetch(`${BACKEND_URL}/health`)
      if (response.ok) {
        console.log('✅ PC Utility Backend is available')
      }
    } catch {
      console.warn('⚠️ PC Utility Backend not available. Start the backend server at', BACKEND_URL)
    }
  },
  
  cleanup: async () => {
    console.log('📁 Folder Connector addon cleaned up')
  },
}
