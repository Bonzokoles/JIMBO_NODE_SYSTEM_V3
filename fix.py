import re

with open(r"Z:\jimbo-node-system-v2\src\components\WorkflowCanvas.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r"backgroundImage:\s*`url\(\\\\\\\$\\\\\\{.*?\\\\\\}\\)`",
    "backgroundImage: `url(${backgroundImage})`", 
    content
)
# also try to fix my broken string
content = re.sub(
    r"backgroundImage:\s*`url\\\(\\\\\$\\\{.*?\\\}\\\)`",
    "backgroundImage: `url(${backgroundImage && !backgroundImage.includes('/') && !backgroundImage.startswith('http') ? '/backgrounds/' + backgroundImage : backgroundImage})`",
    content
)

with open(r"Z:\jimbo-node-system-v2\src\components\WorkflowCanvas.tsx", "w", encoding="utf-8") as f:
    f.write(content)
