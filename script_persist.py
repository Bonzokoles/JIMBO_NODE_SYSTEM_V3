import re

with open(r'Z:\jimbo-node-system-v2\src\store\workflowStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add persist import
if 'import { persist }' not in content:
    content = content.replace("import { immer } from 'zustand/middleware/immer'", "import { immer } from 'zustand/middleware/immer'\nimport { persist } from 'zustand/middleware'")

# Wrap with persist
pattern = r"export const useWorkflowStore = create<WorkflowState>\(\)\(\s*immer\(\(set, get\) => \(\{"
replacement = r"""export const useWorkflowStore = create<WorkflowState>()(
  persist(
    immer((set, get) => ({"""

content = re.sub(pattern, replacement, content)

# Add persist configuration at the end
pattern_end = r"    \}\)\)\s*\)"
replacement_end = r"""    })),
    {
      name: 'jimbo-workspace-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        workflowName: state.workflowName,
      }),
    }
  )
)"""

# Because the end might be matched differently depending on file endings, I'll search for the last     }))\n  ) or similar.
# A safer way to replace the end of the create block:
import sys

# Find the last closing of the store
last_idx = content.rfind("}))\n)")
if last_idx == -1:
    last_idx = content.rfind("}))\n)")
if last_idx == -1:
    last_idx = content.rfind("}))\r\n)")
if last_idx == -1:
    # Let's just use regex from end
    content = re.sub(r'\}\)\)\n\)', replacement_end, content)
    content = re.sub(r'\}\)\)\r\n\)', replacement_end, content)

with open(r'Z:\jimbo-node-system-v2\src\store\workflowStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
