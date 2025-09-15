# src/ai/dev.py
import subprocess
import sys

if __name__ == "__main__":
    # Start the MCP server (for demo, just run server.py)
    subprocess.Popen([sys.executable, "../mcp/server.py"])
    print("[dev] MCP server spawned")
