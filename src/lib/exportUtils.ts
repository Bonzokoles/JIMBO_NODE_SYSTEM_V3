import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportToPNG(elementId: string, fileName: string = 'workflow.png') {
  const element = document.querySelector(`#${elementId}`) as HTMLElement
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`)
  }

  const dataUrl = await toPng(element, {
    backgroundColor: '#0f0f23',
    filter: (node) => {
      if (node instanceof HTMLElement) {
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap')
      }
      return true
    },
  })

  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}

export async function exportToJPEG(elementId: string, fileName: string = 'workflow.jpg') {
  const element = document.querySelector(`#${elementId}`) as HTMLElement
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`)
  }

  const dataUrl = await toJpeg(element, {
    backgroundColor: '#0f0f23',
    quality: 0.95,
    filter: (node) => {
      if (node instanceof HTMLElement) {
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap')
      }
      return true
    },
  })

  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}

export async function exportToPDF(elementId: string, fileName: string = 'workflow.pdf') {
  const element = document.querySelector(`#${elementId}`) as HTMLElement
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`)
  }

  const dataUrl = await toPng(element, {
    backgroundColor: '#0f0f23',
    filter: (node) => {
      if (node instanceof HTMLElement) {
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap')
      }
      return true
    },
  })

  const img = new Image()
  img.src = dataUrl

  img.onload = () => {
    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height],
    })

    pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height)
    pdf.save(fileName)
  }
}
