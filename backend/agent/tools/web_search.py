from langchain_core.tools import tool
from tavily import TavilyClient

from settings import settings

_client = TavilyClient(api_key=settings.tavily_api_key)


@tool
def web_search(query: str) -> str:
    """Search the web for current information about a topic."""
    response = _client.search(query=query, max_results=3)
    results = response.get("results", [])
    return "\n\n".join(
        f"**{r['title']}**\n{r['content']}" for r in results
    ) or "No results found."
