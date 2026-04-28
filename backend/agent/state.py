from typing import TypedDict


class AgentState(TypedDict):
    query: str
    sub_questions: list[str]
    findings: list[dict]
    draft_report: str
    final_report: str
    evaluation: dict  # {"relevance": int, "completeness": int, "confidence": int, "notes": str}
