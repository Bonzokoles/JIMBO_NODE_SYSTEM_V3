import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      workflow: {
        title: 'JIMBO Node System V2',
        untitled: 'Untitled Workflow',
        execute: 'Run Workflow',
        reset: 'Reset',
        stop: 'Stop',
        executing: 'Executing...',
        clear: 'Clear',
      },
      nodes: {
        trigger: 'Trigger',
        transform: 'Transform',
        ai: 'AI Process',
        output: 'Output',
        logic: 'Logic',
        condition: 'Condition',
      },
      palette: {
        title: 'Node Palette',
        search: 'Search nodes...',
        input: 'Inputs',
        ai: 'AI Models',
        process: 'Processing',
        output: 'Outputs',
        custom: 'Custom Nodes',
      },
      properties: {
        title: 'Node Properties',
        label: 'Label',
        type: 'Type',
        status: 'Status',
        configuration: 'Configuration',
        result: 'Result',
        error: 'Error',
        exportConfig: 'Export Config',
        importConfig: 'Import Config',
      },
      status: {
        idle: 'Idle',
        running: 'Running',
        complete: 'Complete',
        error: 'Error',
      },
      templates: {
        button: 'Templates',
        title: 'Workflow Templates',
        description: 'Choose a pre-configured workflow template to get started quickly',
        nodes: 'nodes',
        connections: 'connections',
        categories: {
          all: 'All Templates',
          starter: 'Starter',
          data: 'Data',
          advanced: 'Advanced',
          automation: 'Automation',
          media: 'Media',
          rag: 'RAG',
          integration: 'Integration',
        },
      },
    },
  },
  pl: {
    translation: {
      workflow: {
        title: 'JIMBO System Węzłów V2',
        untitled: 'Nienazwany Workflow',
        execute: 'Uruchom Workflow',
        reset: 'Resetuj',
        stop: 'Zatrzymaj',
        executing: 'Wykonywanie...',
        clear: 'Wyczyść',
      },
      nodes: {
        trigger: 'Wyzwalacz',
        transform: 'Transformacja',
        ai: 'Przetwarzanie AI',
        output: 'Wyjście',
        logic: 'Logika',
        condition: 'Warunek',
      },
      palette: {
        title: 'Paleta Węzłów',
        search: 'Szukaj węzłów...',
        input: 'Wejścia',
        ai: 'Modele AI',
        process: 'Przetwarzanie',
        output: 'Wyjścia',
        custom: 'Węzły Niestandardowe',
      },
      properties: {
        title: 'Właściwości Węzła',
        label: 'Etykieta',
        type: 'Typ',
        status: 'Status',
        configuration: 'Konfiguracja',
        result: 'Wynik',
        error: 'Błąd',
        exportConfig: 'Eksportuj Konfigurację',
        importConfig: 'Importuj Konfigurację',
      },
      status: {
        idle: 'Bezczynny',
        running: 'Uruchomiony',
        complete: 'Zakończony',
        error: 'Błąd',
      },
      templates: {
        button: 'Szablony',
        title: 'Szablony Workflow',
        description: 'Wybierz wstępnie skonfigurowany szablon workflow, aby szybko zacząć',
        nodes: 'węzły',
        connections: 'połączenia',
        categories: {
          all: 'Wszystkie Szablony',
          starter: 'Początkujący',
          data: 'Dane',
          advanced: 'Zaawansowane',
          automation: 'Automatyzacja',
          media: 'Media',
          rag: 'RAG',
          integration: 'Integracja',
        },
      },
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
