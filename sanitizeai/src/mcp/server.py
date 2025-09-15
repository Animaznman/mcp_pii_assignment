# src/mcp/server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
PORT = int(os.environ.get('MCP_PORT', 9003))

# Dummy tool registry
TOOLS = {
    'anonymize_pii': {
        'description': 'Anonymises names, emails, phone numbers, addresses, dates of birth, etc.',
        'system_prompt': 'You are a PII anonymiser. Return only the anonymised text.'
    },
    'redact_financial': {
        'description': 'Redacts IBAN, credit-card numbers, crypto wallets, sort codes, etc.',
        'system_prompt': 'You are a financial-data redactor. Return only the redacted text.'
    }
}

def run_tool(tool_name, text):
    # Placeholder for actual AI call
    return f"[{tool_name}] {text} (sanitized)"

@app.route('/mcp', methods=['POST'])
def mcp_endpoint():
    data = request.get_json()
    tool = data.get('tool')
    text = data.get('text')
    if tool not in TOOLS:
        return jsonify({'error': 'Tool not found'}), 400
    sanitized = run_tool(tool, text)
    return jsonify({'sanitizedText': sanitized})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
