import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig(({ mode }) => {
  const customEnvPrefixes = [
    'VITE_', 'OPENAI_', 'ANTHROPIC_', 'GEMINI_', 'GROQ_', 'DEEPSEEK_', 
    'OPENROUTER_', 'EDEN_', 'XAI_', 'FAL_', 'REPLICATE_', 'ELEVENLABS_',
    'TOGETHER_', 'MISTRAL_', 'COHERE_', 'PERPLEXITY_', 'HUGGINGFACE_'
  ];
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || '4120');
  const jimboUrl = env.VITE_JIMBO_URL || 'http://localhost:6031';

  return {
    envPrefix: customEnvPrefixes,
    plugins: [
      react(),
      tailwindcss(),
      createIconImportProxy() as PluginOption,
      sparkPlugin({ port }) as PluginOption,
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    server: {
      port,
      proxy: {
        '/jimbo-api': {
          target: jimboUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jimbo-api/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('JIMBO Library proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('JIMBO Library request:', req.method, req.url);
            });
          }
        },
        // CAY_DEN Gateway (AI operations)
        '/cayden-gateway': {
          target: env.VITE_CAYDEN_GATEWAY_URL || 'http://localhost:3885',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cayden-gateway/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('CAY_DEN Gateway proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('CAY_DEN Gateway request:', req.method, req.url);
            });
          }
        },
        // LIBRARIES Knowledge Base (Business Intelligence)
        '/api/libraries': {
          target: env.VITE_LIBRARIES_URL || 'http://localhost:7070',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('LIBRARIES API proxy error:', err);
            });
          }
        },
        // Knowledge Base (Thematic KB)
        '/api/kb': {
          target: env.VITE_KB_URL || 'http://localhost:7071',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Knowledge Base API proxy error:', err);
            });
          }
        }
      }
    }
  };
});
