# src/ai/flows/sanitize_text_with_mcp.py
import requests
import os

def sanitize_text_with_mcp(text, sanitization_request, on_progress=None):
    if on_progress:
        on_progress('mcp_connect_start')
    url = f"http://localhost:{os.environ.get('MCP_PORT', 9003)}/mcp"
    if on_progress:
        on_progress('mcp_connect_finish')
    # List available tools (hardcoded for demo)
    tool_list = ['anonymize_pii', 'redact_financial']
    if on_progress:
        on_progress('list_tools')
    # Select tool (simple logic for demo)
    if 'pii' in sanitization_request.lower():
        tool = 'anonymize_pii'
    else:
        tool = 'redact_financial'
    if on_progress:
        on_progress('select_tool')
    payload = {'tool': tool, 'text': text}
    if on_progress:
        on_progress('tool_exec_start')
    resp = requests.post(url, json=payload)
    if on_progress:
        on_progress('tool_exec_finish')
    result = resp.json()
    return {'sanitizedText': result.get('sanitizedText'), 'toolUsed': tool}
