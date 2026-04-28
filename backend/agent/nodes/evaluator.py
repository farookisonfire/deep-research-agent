import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from agent.state import AgentState
from settings import settings

logger = logging.getLogger(__name__)

_llm = ChatOpenAI(model=settings.model, api_key=settings.openai_api_key)


class _EvaluatorOutput(BaseModel):
    relevance: int = Field(ge=0, le=10, description="How well does the report address the original query?")
    completeness: int = Field(ge=0, le=10, description="How thoroughly is the topic covered?")
    confidence: int = Field(ge=0, le=10, description="How confident are you in the accuracy of the information?")
    notes: str = Field(description="One or two sentences explaining the scores.")


_structured_llm = _llm.with_structured_output(_EvaluatorOutput)

_SYSTEM = (
    "You are a research quality evaluator. Given the original query and the final report, "
    "score the report on three dimensions (0–10 each):\n"
    "- Relevance: how well the report addresses the query\n"
    "- Completeness: how thoroughly the topic is covered\n"
    "- Confidence: how accurate and credible the information appears\n"
    "Be honest and critical. 8+ means excellent, 6–7 good, below 6 needs improvement."
)


def evaluator_node(state: AgentState) -> AgentState:
    logger.info("Evaluator | scoring final report")
    prompt = f"Query: {state['query']}\n\nReport:\n{state['final_report']}"
    result: _EvaluatorOutput = _structured_llm.invoke(
        [SystemMessage(content=_SYSTEM), HumanMessage(content=prompt)]
    )
    evaluation = {
        "relevance": result.relevance,
        "completeness": result.completeness,
        "confidence": result.confidence,
        "notes": result.notes,
    }
    logger.info(
        "Evaluator | relevance=%d completeness=%d confidence=%d",
        result.relevance, result.completeness, result.confidence,
    )
    return {**state, "evaluation": evaluation}
