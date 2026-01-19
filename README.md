# LabChain Sentinel - Autonomous Laboratory Procurement

LabChain Sentinel is a clinical-grade autonomous procurement system designed to ensure absolute stability in laboratory supply chains. It continuously monitors inventory, evaluates risks, and executes procurement autonomously with full audit compliance.

## 🚀 The Demo Narrative
> “LabChain Sentinel continuously monitors lab inventory and computes stock-out risk. When an item becomes clinically critical, the agent reasons over supplier speed, reliability, and cost using Gemini. It autonomously executes procurement, updates inventory, and logs every step for audit compliance. This is not a dashboard — it’s an autonomous procurement system.”

## 🧠 System Architecture
- **Sentinel Agent (Brain)**: Gemini-powered reasoning loop (Observe ➔ Filter ➔ Context ➔ Reason ➔ Validate ➔ Respond).
- **Audit Log (Memory)**: Clinical-grade, append-only trail for NABL/ISO 15189 compliance.
- **Inventory Service (State)**: Real-time stock tracking with server-side risk metrics.
- **Action Layer (Execution)**: Autonomous PO generation and inventory state synchronization.

## ✅ Key Features
- **Closed-loop Autonomy**: Moves from detection to execution without human intervention.
- **Schema Guardrails**: Pydantic-enforced AI responses to ensure 100% UI stability.
- **Explainable AI**: Every decision includes a detailed reasoning trace for human audit.
- **Indian Supplier Network**: Real-world supplier trade-offs (Mumbai, Bengaluru, Delhi).

## 🛠 Run Locally

**Prerequisites:** Python 3.9+, Node.js 18+

### 1. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set your GEMINI_API_KEY in .env
uvicorn main:app --reload
```

### 2. Setup Frontend
```bash
npm install
npm run dev
```

### 3. API Endpoints
- `GET /inventory`: View real-time stock and risk metrics.
- `GET /agent/run`: Trigger a Sentinel analysis and execution cycle.
- `GET /agent/logs`: View the clinical audit trail.

