with open(r"Z:\jimbo-node-system-v2\src\components\WorkflowCanvas.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(".startswith(", ".startsWith(")

with open(r"Z:\jimbo-node-system-v2\src\components\WorkflowCanvas.tsx", "w", encoding="utf-8") as f:
    f.write(content)
