from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from file import create_tables
from agent import run_agent

app = FastAPI(title="AI-First CRM HCP Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

class ChatMessage(BaseModel):
    message: str

class InteractionForm(BaseModel):
    hcp_name: str
    interaction_type: str
    notes: str

class EditInteraction(BaseModel):
    interaction_id: int
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    notes: Optional[str] = None

# ── Routes ──────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI-First CRM HCP Module is running!"}

@app.post("/chat")
def chat(body: ChatMessage):
    try:
        response = run_agent(body.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interactions/log")
def log(body: InteractionForm):
    try:
        result = run_agent(
            f"Log an interaction for HCP: {body.hcp_name}, "
            f"type: {body.interaction_type}, "
            f"notes: {body.notes}"
        )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))