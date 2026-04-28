import json
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent.graph import build_graph

logging.basicConfig(
    level=logging.INFO,
    format="%(name)s | %(message)s",
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

graph = build_graph()


class ResearchRequest(BaseModel):
    query: str


def sse(event_type: str, data: dict) -> str:
    payload = json.dumps({"type": event_type, **data})
    return f"data: {payload}\n\n"


async def run_research_stream(query: str):
    state = {
        "query": query,
        "sub_questions": [],
        "findings": [],
        "draft_report": "",
        "final_report": "",
        "evaluation": {},
    }

    async for event in graph.astream_events(state, version="v2"):
        kind = event["event"]
        name = event["name"]

        if kind == "on_chain_start":
            if name == "planner":
                yield sse("planning", {"message": "Breaking query into sub-questions…"})
            elif name == "researcher":
                yield sse("researching", {"message": "Researching sub-questions…"})
            elif name == "synthesizer":
                yield sse("synthesizing", {"message": "Synthesizing findings…"})

        elif kind == "on_chain_end":
            if name == "planner":
                sub_questions = event["data"].get("output", {}).get("sub_questions", [])
                yield sse("planning", {"sub_questions": sub_questions})
            elif name == "formatter":
                final_report = event["data"].get("output", {}).get("final_report", "")
                yield sse("complete", {"report": final_report})
            elif name == "evaluator":
                evaluation = event["data"].get("output", {}).get("evaluation", {})
                yield sse("evaluated", evaluation)

        elif kind == "on_tool_start" and name in ("web_search", "wikipedia_search"):
            input_data = event["data"].get("input", {})
            query_str = input_data.get("query") or input_data.get("topic", "")
            yield sse("researching", {"tool": name, "query": query_str})


@app.post("/research/stream")
async def research_stream(request: ResearchRequest):
    return StreamingResponse(
        run_research_stream(request.query),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
