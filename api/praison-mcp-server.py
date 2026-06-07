import os
import sys

# Reconfigure stdout/stderr to use UTF-8 to prevent encoding errors on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# 1. Load environment variables from the workspace .env file
env_path = r"c:\finscheme\.env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

# Align Gemini API Key variables to ensure either sets both
gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if gemini_key:
    os.environ["GEMINI_API_KEY"] = gemini_key
    os.environ["GOOGLE_API_KEY"] = gemini_key

# Set fallback for OpenAI API key to AI Gateway API Key if not explicitly defined
if "OPENAI_API_KEY" not in os.environ and "AI_GATEWAY_API_KEY" in os.environ:
    os.environ["OPENAI_API_KEY"] = os.environ["AI_GATEWAY_API_KEY"]

# 2. Configure Python imports search paths dynamically
sys.path.extend([
    r"c:\finscheme\PraisonAI\src\praisonai",
    r"c:\finscheme\PraisonAI\src\praisonai-agents"
])

# 3. Import and execute the PraisonAI MCP server
try:
    from praisonai.mcp_server.cli import MCPServerCLI
    sys.exit(MCPServerCLI().handle(["serve", "--transport", "stdio"]))
except Exception as e:
    print(f"Error starting PraisonAI MCP Server: {e}", file=sys.stderr)
    sys.exit(1)
