import re

with open(r"Z:\jimbo-node-system-v2\src\components\ConfigurationBar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add useEffect to keep imageUrl in sync
replacement = """  const [imageUrl, setImageUrl] = useState(backgroundImage || '')
  
  useEffect(() => {
    setImageUrl(backgroundImage || '')
  }, [backgroundImage])"""

content = content.replace("  const [imageUrl, setImageUrl] = useState(backgroundImage || '')", replacement)

with open(r"Z:\jimbo-node-system-v2\src\components\ConfigurationBar.tsx", "w", encoding="utf-8") as f:
    f.write(content)
