/**
 * Folder Integration Workflow Template
 * Demonstrates mounting a local folder, reading files, processing with AI, and writing results
 */

import { WorkflowTemplate } from '@/lib/workflowTemplates'

export const folderIntegrationTemplate: WorkflowTemplate = {
  id: 'folder-integration',
  name: '📁 Local Folder Integration',
  description: 'Mount a folder, read files, process with AI, and write results back',
  category: 'integration',
  tags: ['filesystem', 'files', 'ai', 'automation'],
  difficulty: 'intermediate',
  estimatedTime: '10-15 minutes',
  useCases: [
    'Batch process text files with AI',
    'Automated file analysis and reporting',
    'Local document processing workflows',
    'File transformation pipelines',
  ],
  nodes: [
    {
      id: 'folder-mount-1',
      type: 'custom',
      position: { x: 50, y: 100 },
      data: {
        label: 'Mount Folder',
        type: 'folder-mount',
        status: 'idle',
        config: {
          folderPath: '/path/to/your/folder',
          readOnly: false,
          watchChanges: false,
          includeHidden: false,
          filePattern: '*.txt',
        },
      },
    },
    {
      id: 'folder-list-1',
      type: 'custom',
      position: { x: 350, y: 100 },
      data: {
        label: 'List Files',
        type: 'folder-list-files',
        status: 'idle',
        config: {
          sortBy: 'name',
          filterPattern: '*.txt',
          recursive: false,
          maxResults: 100,
        },
      },
    },
    {
      id: 'folder-read-1',
      type: 'custom',
      position: { x: 650, y: 100 },
      data: {
        label: 'Read File',
        type: 'folder-file-reader',
        status: 'idle',
        config: {
          encoding: 'utf-8',
          readMode: 'full',
          maxSize: 10,
        },
      },
    },
    {
      id: 'ai-process-1',
      type: 'custom',
      position: { x: 950, y: 100 },
      data: {
        label: 'Process with AI',
        type: 'openai',
        status: 'idle',
        config: {
          model: 'gpt-4o-mini',
          prompt: 'Summarize and analyze this document:',
          temperature: 0.7,
        },
      },
    },
    {
      id: 'folder-write-1',
      type: 'custom',
      position: { x: 1250, y: 100 },
      data: {
        label: 'Write Result',
        type: 'folder-file-writer',
        status: 'idle',
        config: {
          mode: 'overwrite',
          createDirs: true,
          backup: true,
        },
      },
    },
    {
      id: 'console-1',
      type: 'custom',
      position: { x: 1550, y: 100 },
      data: {
        label: 'Console Output',
        type: 'console',
        status: 'idle',
        config: {},
      },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'folder-mount-1',
      target: 'folder-list-1',
      sourceHandle: 'connection',
      targetHandle: 'connection',
    },
    {
      id: 'e2',
      source: 'folder-list-1',
      target: 'folder-read-1',
      sourceHandle: 'files',
      targetHandle: 'filename',
    },
    {
      id: 'e3',
      source: 'folder-mount-1',
      target: 'folder-read-1',
      sourceHandle: 'connection',
      targetHandle: 'connection',
    },
    {
      id: 'e4',
      source: 'folder-read-1',
      target: 'ai-process-1',
      sourceHandle: 'content',
      targetHandle: 'prompt',
    },
    {
      id: 'e5',
      source: 'ai-process-1',
      target: 'folder-write-1',
      sourceHandle: 'response',
      targetHandle: 'content',
    },
    {
      id: 'e6',
      source: 'folder-mount-1',
      target: 'folder-write-1',
      sourceHandle: 'connection',
      targetHandle: 'connection',
    },
    {
      id: 'e7',
      source: 'folder-write-1',
      target: 'console-1',
      sourceHandle: 'result',
      targetHandle: 'input',
    },
  ],
}
