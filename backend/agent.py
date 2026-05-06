import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph
from langchain_core.tools import tool
from typing import TypedDict, List
from file import SessionLocal, Interaction
from datetime import datetime

load_dotenv()

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile"
)

# ── 5 LangGraph Tools ──────────────────────────────────────

@tool
def log_interaction(hcp_name: str, interaction_type: str, notes: str) -> str:
    """Log a new HCP interaction to the database."""
    db = SessionLocal()
    try:
        summary_response = llm.invoke(f"Summarize this HCP interaction in 1-2 sentences: {notes}")
        summary = summary_response.content
        interaction = Interaction(
            hcp_name=hcp_name,
            interaction_type=interaction_type,
            notes=notes,
            summary=summary
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        return f"Interaction logged successfully with ID {interaction.id}. Summary: {summary}"
    finally:
        db.close()

@tool
def edit_interaction(interaction_id: int, hcp_name: str = None, interaction_type: str = None, notes: str = None) -> str:
    """Edit an existing HCP interaction."""
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"Interaction with ID {interaction_id} not found."
        if hcp_name:
            interaction.hcp_name = hcp_name
        if interaction_type:
            interaction.interaction_type = interaction_type
        if notes:
            interaction.notes = notes
            summary_response = llm.invoke(f"Summarize this HCP interaction in 1-2 sentences: {notes}")
            interaction.summary = summary_response.content
        interaction.updated_at = datetime.utcnow()
        db.commit()
        return f"Interaction {interaction_id} updated successfully."
    finally:
        db.close()

@tool
def get_interactions(hcp_name: str = None) -> str:
    """Get all HCP interactions, optionally filtered by HCP name."""
    db = SessionLocal()
    try:
        query = db.query(Interaction)
        if hcp_name:
            query = query.filter(Interaction.hcp_name.ilike(f"%{hcp_name}%"))
        interactions = query.all()
        if not interactions:
            return "No interactions found."
        result = []
        for i in interactions:
            result.append(f"ID:{i.id} | {i.hcp_name} | {i.interaction_type} | {i.created_at.strftime('%Y-%m-%d')} | {i.summary}")
        return "\n".join(result)
    finally:
        db.close()

@tool
def summarize_interaction(interaction_id: int) -> str:
    """Generate an AI summary for a specific interaction."""
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"Interaction with ID {interaction_id} not found."
        summary_response = llm.invoke(f"Provide a detailed summary of this HCP interaction: {interaction.notes}")
        interaction.summary = summary_response.content
        db.commit()
        return f"Summary for interaction {interaction_id}: {interaction.summary}"
    finally:
        db.close()

@tool
def delete_interaction(interaction_id: int) -> str:
    """Delete an HCP interaction from the database."""
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"Interaction with ID {interaction_id} not found."
        db.delete(interaction)
        db.commit()
        return f"Interaction {interaction_id} deleted successfully."
    finally:
        db.close()

# ── LangGraph Agent ────────────────────────────────────────

tools = [log_interaction, edit_interaction, get_interactions, summarize_interaction, delete_interaction]
llm_with_tools = llm.bind_tools(tools)

class AgentState(TypedDict):
    messages: List

def agent_node(state: AgentState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": state["messages"] + [response]}

def tool_node(state: AgentState):
    last_message = state["messages"][-1]
    tool_results = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_map = {t.name: t for t in tools}
        if tool_name in tool_map:
            result = tool_map[tool_name].invoke(tool_args)
            tool_results.append({"role": "tool", "content": str(result), "tool_call_id": tool_call["id"]})
    return {"messages": state["messages"] + tool_results}

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"

graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": "__end__"})
graph.add_edge("tools", "agent")
app_graph = graph.compile()

def run_agent(user_message: str):
    result = app_graph.invoke({"messages": [{"role": "user", "content": user_message}]})
    last = result["messages"][-1]
    return last.content if hasattr(last, "content") else str(last)