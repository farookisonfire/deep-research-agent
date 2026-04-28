from langgraph.graph import END, StateGraph

from agent.nodes.evaluator import evaluator_node
from agent.nodes.formatter import formatter_node
from agent.nodes.planner import planner_node
from agent.nodes.researcher import researcher_node
from agent.nodes.synthesizer import synthesizer_node
from agent.state import AgentState


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("planner", planner_node)
    graph.add_node("researcher", researcher_node)
    graph.add_node("synthesizer", synthesizer_node)
    graph.add_node("formatter", formatter_node)
    graph.add_node("evaluator", evaluator_node)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "researcher")
    graph.add_edge("researcher", "synthesizer")
    graph.add_edge("synthesizer", "formatter")
    graph.add_edge("formatter", "evaluator")
    graph.add_edge("evaluator", END)

    return graph.compile()
