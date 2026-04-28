import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from agent.state import AgentState
from settings import settings

logger = logging.getLogger(__name__)

_llm = ChatOpenAI(model=settings.model, api_key=settings.openai_api_key)


class _PlannerOutput(BaseModel):
    sub_questions: list[str]


_structured_llm = _llm.with_structured_output(_PlannerOutput)

_SYSTEM = (
    "You are a research planning assistant. Given a research query, decompose it into "
    "3-5 specific, focused sub-questions that together provide comprehensive coverage. "
    "Return only the sub-questions, no preamble."
)


def planner_node(state: AgentState) -> AgentState:
    logger.info("Planner | query: %s", state["query"])
    result: _PlannerOutput = _structured_llm.invoke(
        [SystemMessage(content=_SYSTEM), HumanMessage(content=state["query"])]
    )
    logger.info("Planner | sub-questions:\n%s", "\n".join(f"  - {q}" for q in result.sub_questions))
    return {**state, "sub_questions": result.sub_questions}
