import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from agent.state import AgentState
from settings import settings

logger = logging.getLogger(__name__)

_llm = ChatOpenAI(model=settings.model, api_key=settings.openai_api_key)

_SYSTEM = (
    "You are a research synthesizer. Given research findings for several sub-questions, "
    "produce a coherent, well-organized draft report. Integrate the findings naturally, "
    "avoid repetition, and maintain a logical flow. Do not add headings yet."
)


def synthesizer_node(state: AgentState) -> AgentState:
    logger.info("Synthesizer | merging %d findings", len(state["findings"]))
    findings_text = "\n\n".join(
        f"Q: {f['sub_question']}\nA: {f['answer']}" for f in state["findings"]
    )
    prompt = f"Original query: {state['query']}\n\nResearch findings:\n{findings_text}"

    response = _llm.invoke([SystemMessage(content=_SYSTEM), HumanMessage(content=prompt)])
    logger.info("Synthesizer | draft length: %d chars", len(response.content))
    return {**state, "draft_report": response.content}
