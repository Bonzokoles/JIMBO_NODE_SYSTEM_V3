import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Code, X } from '@phosphor-icons/react'

export function CodeInputWindow() {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState('')

  const handleExecute = () => {
    try {
      const func = new Function(code)
      func()
      toast.success('Code executed successfully')
    } catch (error) {
      toast.error('Error executing code')
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          className="rounded-full"
        >
          <Code />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-card border border-border rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Code Input</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsOpen(false)}
        >
          <X />
        </Button>
      </div>

      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter JavaScript code..."
        className="mb-4 font-mono"
        rows={8}
      />

      <Button onClick={handleExecute} className="w-full">
        Execute
      </Button>
    </div>
  )
}
