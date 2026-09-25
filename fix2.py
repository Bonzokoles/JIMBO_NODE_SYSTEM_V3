with open(r"Z:\jimbo-node-system-v2\src\components\WorkflowCanvas.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = "backgroundImage: `url(${backgroundImage})`"
replacement = "backgroundImage: `url(${backgroundImage && !backgroundImage.includes('/') && !backgroundImage.startswith('http') ? '/backgrounds/' + backgroundImage : backgroundImage})`"

content = content.replace(target, replacement)

with open(r"Z:\jimbo-node-system-v2\src\components\WorkflowCanvas.tsx", "w", encoding="utf-8") as f:
    f.write(content)
