import wikipediaapi
from langchain_core.tools import tool

_wiki = wikipediaapi.Wikipedia(
    user_agent="DeepResearchAgent/1.0",
    language="en",
)


@tool
def wikipedia_search(topic: str) -> str:
    """Look up factual background information about a topic on Wikipedia."""
    page = _wiki.page(topic)
    if not page.exists():
        return f"No Wikipedia article found for '{topic}'."
    return page.summary[:2000]
