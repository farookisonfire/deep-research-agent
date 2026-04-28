import logging

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI

from agent.state import AgentState
from agent.tools.web_search import web_search
from agent.tools.wikipedia import wikipedia_search
from settings import settings

logger = logging.getLogger(__name__)

_TOOLS = [web_search, wikipedia_search]
_TOOL_MAP = {t.name: t for t in _TOOLS}

_llm = ChatOpenAI(model=settings.model, api_key=settings.openai_api_key).bind_tools(_TOOLS)

_SYSTEM = (
    "You are a research assistant. For the given question, use the available tools to "
    "find relevant, accurate information. Call tools as needed, then stop when you have "
    "enough to give a thorough answer."
)


def _research_one(sub_question: str) -> dict:
    logger.info("Researcher | sub-question: %s", sub_question)
    messages = [SystemMessage(content=_SYSTEM), HumanMessage(content=sub_question)]
    iteration = 0

    while True:
        iteration += 1
        response = _llm.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            logger.info("Researcher | no tool calls on iteration %d — done with sub-question", iteration)
            return {
                "sub_question": sub_question,
                "answer": response.content if isinstance(response.content, str) else str(response.content),
            }

        for tc in response.tool_calls:
            logger.info("Researcher | tool call: %s(%s)", tc["name"], tc["args"])
            result = _TOOL_MAP[tc["name"]].invoke(tc["args"])
            snippet = str(result)[:200]
            logger.info("Researcher | tool result snippet: %s…", snippet)
            messages.append(ToolMessage(content=str(result), tool_call_id=tc["id"]))


def researcher_node(state: AgentState) -> AgentState:
    logger.info("Researcher | starting %d sub-questions", len(state["sub_questions"]))
    findings = [_research_one(q) for q in state["sub_questions"]]
    logger.info("Researcher | all sub-questions complete")
    return {**state, "findings": findings}
