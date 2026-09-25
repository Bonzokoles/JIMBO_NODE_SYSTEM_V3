import re

with open(r'Z:\jimbo-node-system-v2\src\lib\executionEngine.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'  private async executeLocalFileWrite.*?throw new Error.*?\}\n    \}\n'
replacement = r'''  private async executeLocalFileWrite(node: WorkflowNode, inputs: any[], context: ExecutionContext) {
    try {
      const content = this.extractTextFromInputs(inputs);
      const filename = node.data.config?.filename || 'output.txt';
      
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7072';
      const response = await fetch(${BACKEND_URL}/api/fs/write, {
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
        value: File saved automatically to: ,
        filename: data.filepath,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Local file write error:', error);
      throw new Error(Local File Write: );
    }
  }
'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(r'Z:\jimbo-node-system-v2\src\lib\executionEngine.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
