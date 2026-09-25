import { create } from 'zustand'
import { useKV } from '@github/spark/hooks'

export interface EnvConfig {
  [key: string]: string
}

export interface ConfigState {
  envConfig: EnvConfig
  setEnvConfig: (config: EnvConfig) => void
  updateEnvKey: (key: string, value: string) => void
  getApiKey: (keyName: string) => string | undefined
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  envConfig: {},
  
  setEnvConfig: (config) => set({ envConfig: config }),
  
  updateEnvKey: (key, value) => set((state) => ({
    envConfig: { ...state.envConfig, [key]: value }
  })),
  
  getApiKey: (keyName) => get().envConfig[keyName]
}))

export function useEnvConfig() {
  const [config, setConfig] = useKV<EnvConfig>('env-config', {})
  
  return {
    config: config || {},
    setConfig,
    updateKey: (key: string, value: string) => {
      setConfig((current) => ({ ...current, [key]: value }))
    },
    getKey: (key: string) => config?.[key] || ''
  }
}
