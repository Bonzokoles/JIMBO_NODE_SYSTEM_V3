import re

with open(r"Z:\jimbo-node-system-v2\src\App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove useKV imports and uses for canvas properties
content = re.sub(
    r"const \[minimapEnabled.*?useKV.*?;\n\s*const \[minimapOpacity.*?useKV.*?;\n\s*const \[backgroundImage.*?useKV.*?;\n\s*const \[backgroundOpacity.*?useKV.*?;",
    "const { canvasConfig, updateCanvasConfig } = useWorkflowStore()",
    content,
    flags=re.DOTALL
)

# Replace variables in the JSX
content = content.replace("minimapEnabled={minimapEnabled || true}", "minimapEnabled={canvasConfig?.minimapEnabled ?? true}")
content = content.replace("minimapOpacity={minimapOpacity || 1}", "minimapOpacity={canvasConfig?.minimapOpacity ?? 1}")
content = content.replace("backgroundImage={backgroundImage || null}", "backgroundImage={canvasConfig?.backgroundImage ?? null}")
content = content.replace("backgroundOpacity={backgroundOpacity || 0.3}", "backgroundOpacity={canvasConfig?.backgroundOpacity ?? 0.3}")
content = content.replace("backgroundOpacity={(backgroundOpacity || 0.3) * 100}", "backgroundOpacity={(canvasConfig?.backgroundOpacity ?? 0.3) * 100}")

content = content.replace(
    "onMinimapToggle={() => setMinimapEnabled((current) => !current)}",
    "onMinimapToggle={() => updateCanvasConfig({ minimapEnabled: !canvasConfig?.minimapEnabled })}"
)
content = content.replace(
    "onMinimapOpacityChange={(opacity) => setMinimapOpacity(() => opacity)}",
    "onMinimapOpacityChange={(opacity) => updateCanvasConfig({ minimapOpacity: opacity })}"
)
content = content.replace(
    "onBackgroundImageChange={(url) => setBackgroundImage(() => url)}",
    "onBackgroundImageChange={(url) => updateCanvasConfig({ backgroundImage: url })}"
)
content = content.replace(
    "onBackgroundOpacityChange={(opacity) => setBackgroundOpacity(() => opacity / 100)}",
    "onBackgroundOpacityChange={(opacity) => updateCanvasConfig({ backgroundOpacity: opacity / 100 })}"
)

with open(r"Z:\jimbo-node-system-v2\src\App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
