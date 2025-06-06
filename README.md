# AI-Augmented Federated Learning Compliance Monitoring

## Overview
This repository contains the prototype implementation for Task 1: AI-Augmented Federated Learning for Dynamic Continuous Compliance Monitoring. It includes:
- Federated Learning backend using Flower
- NLP rule extraction and scoring
- Dynamic regulatory feed ingestion
- Flask API for orchestration
- React dashboard for audit logs and metrics

## Structure
- `api_server.py` - Flask API
- `feed_sync.py` - Syncs regulatory feed
- `real_flower_backend/` - Flower FL clients and server
- `regulatory_feed/` - Simulated regulatory rules
- `audit_logs/` - Compliance audit log
- `federated-ui/` - React frontend dashboard

## How to Run
1. Start the backend:
```bash
python api_server.py
```

2. Start Flower FL server and clients:
```bash
cd real_flower_backend
python server.py
python client1.py
python client2.py
```

3. Start frontend:
```bash
cd federated-ui
npm install
npm run dev
```

## Author
Sourabh, June 2025
