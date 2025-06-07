from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import torch
import re
import json
import os
import difflib
import glob
from datetime import datetime

app = Flask(__name__)
CORS(app)

model = SentenceTransformer('nlpaueb/legal-bert-base-uncased')

def extract_obligations(text):
    obligations = []
    lower_text = text.lower()

    if re.search(r'encrypt(ed)?', lower_text) and ("data" in lower_text or "records" in lower_text):
        obligations.append("Data Encryption Required")

    if re.search(r'(store|retain).*log(s)?|(log files).*retain(ed)?', lower_text) and re.search(r'\d+\s*(months|years)', lower_text):
        obligations.append("Log Retention Requirement")

    if "gdpr" in lower_text or "data protection" in lower_text or "consent" in lower_text:
        obligations.append("Data Privacy/GDPR Compliance")

    return obligations

def compute_compliance_score(obligations, rules):
    matched = 0
    total = len(rules)

    for rule in rules:
        requirement = rule.get("requirement", "").lower()

        for ob in obligations:
            ob_keywords = ob.lower().replace("required", "").strip().split()
            match_count = sum(1 for word in ob_keywords if word in requirement)

            if match_count >= max(1, len(ob_keywords) // 2):
                matched += 1
                break

    if total == 0:
        return 1.0
    return round(matched / total, 3)

@app.route('/api/nlp', methods=['POST'])
def analyze_text():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'Text is required'}), 400

    embedding = model.encode(text).tolist()
    obligations = extract_obligations(text)

    regulatory_rules = []
    feed_path = "./regulatory_feed"
    if os.path.exists(feed_path):
        for filename in os.listdir(feed_path):
            if filename.endswith(".json"):
                with open(os.path.join(feed_path, filename), 'r') as f:
                    regulatory_rules.append(json.load(f))

    compliance_score = compute_compliance_score(obligations, regulatory_rules)

    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "input_text": text,
        "obligations": obligations,
        "compliance_score": compliance_score
    }
    with open("nlp_audit_log.jsonl", "a") as logfile:
        logfile.write(json.dumps(log_entry) + "\n")

    return jsonify({
        'entities': obligations,
        'embedding_preview': embedding[:5],
        'compliance_score': compliance_score,
        'raw_output': obligations
    })

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    if os.path.exists("metrics.json"):
        with open("metrics.json", "r") as f:
            return jsonify(json.load(f))
    else:
        return jsonify({
            "round": 0,
            "accuracy": 0.0,
            "convergence": 0.0,
            "privacy_spent": 0.0,
            "compliance_score": 0.0
        })

@app.route('/api/regulations', methods=['GET'])
def get_regulations():
    feed_path = "./regulatory_feed/*.json"
    data = []
    for file in glob.glob(feed_path):
        with open(file) as f:
            data.append(json.load(f))
    return jsonify(data)

@app.route('/api/auditlog', methods=['GET'])
def get_audit_log():
    log_path = "nlp_audit_log.jsonl"
    if not os.path.exists(log_path):
        return jsonify([])

    entries = []
    with open(log_path, "r") as logfile:
        for line in logfile:
            try:
                entries.append(json.loads(line.strip()))
            except:
                continue
    return jsonify(entries[::-1])

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
