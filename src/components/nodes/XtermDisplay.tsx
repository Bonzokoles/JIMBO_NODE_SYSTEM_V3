import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

interface XtermDisplayProps {
  logs: string[]
  isRunning: boolean
}

export function XtermDisplay({ logs, isRunning }: XtermDisplayProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      theme: {
        background: '#05070a',
        foreground: '#00E6A8',
        cursor: '#d4a574',
        selectionBackground: '#1a202c'
      },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      rows: 10,
      cursorBlink: isRunning,
      disableStdin: true
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    
    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Initial greeting
    term.writeln('\x1b[1;33m[SYS]\x1b[0m AI Terminal Orchestrator initialized...')

    return () => {
      term.dispose()
    }
  }, [])

  // Watch logs and write them
  useEffect(() => {
    if (!xtermRef.current) return
    const term = xtermRef.current
    
    // Clear and re-write to stay synced (or just append diffs)
    term.clear()
    term.writeln('\x1b[1;33m[SYS]\x1b[0m AI Terminal Orchestrator initialized...')
    logs.forEach(log => {
      term.writeln(log.replace(/\n/g, '\r\n'))
    })
    
    // Auto scroll to bottom
    term.scrollToBottom()
  }, [logs])

  // Update cursor blink state based on running state
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.cursorBlink = isRunning;
    }
  }, [isRunning])

  return (
    <div className="w-full h-40 bg-[#05070a] border border-[#1a202c] p-1 relative group">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  )
}
