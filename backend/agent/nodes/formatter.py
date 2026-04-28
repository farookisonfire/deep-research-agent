import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from agent.state import AgentState
from settings import settings

logger = logging.getLogger(__name__)

_llm = ChatOpenAI(model=settings.model, api_key=settings.openai_api_key)

_SYSTEM = (
    "You are a report formatter. Convert the draft research report into a clean markdown document with:\n"
    "- An H1 title based on the query\n"
    "- A short executive summary\n"
    "- Organized sections with H2 headings\n"
    "- A brief methodology/sources note at the end\n"
    "Return only the markdown, no preamble."
)


def formatter_node(state: AgentState) -> AgentState:
    logger.info("Formatter | formatting draft into markdown report")
    prompt = f"Query: {state['query']}\n\nDraft:\n{state['draft_report']}"
    response = _llm.invoke([SystemMessage(content=_SYSTEM), HumanMessage(content=prompt)])
    logger.info("Formatter | final report length: %d chars", len(response.content))
    return {**state, "final_report": response.content}
