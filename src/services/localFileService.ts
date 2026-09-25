export class LocalFileService {
  private fileSystemSupported = 'showOpenFilePicker' in window;

  async pickFile(accept?: string[]): Promise<File> {
    if (!this.fileSystemSupported) {
      return this.pickFileFallback(accept);
    }
    
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: accept ? [{
        description: 'Files',
        accept: { 'text/*': accept }
      }] : undefined
    });
    
    return await fileHandle.getFile();
  }

  private pickFileFallback(accept?: string[]): Promise<File> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept.join(',');
      
      input.onchange = () => {
        const file = input.files?.[0];
        file ? resolve(file) : reject(new Error('No file'));
      };
      
      input.click();
    });
  }

  async readTextFile(): Promise<string> {
    const file = await this.pickFile(['.txt', '.md', '.json', '.csv', '.html', '.xml']);
    return await file.text();
  }

  async writeFile(filename: string, content: string): Promise<void> {
    if (!this.fileSystemSupported) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: filename
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}

export const localFileService = new LocalFileService();
