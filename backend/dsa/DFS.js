function dfs(graph, startNode) {
  const visited = new Set();
  const order = [];

  const visit = (node) => {
    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    order.push(node);

    for (const neighbor of graph.getNeighbors(node)) {
      visit(neighbor.node);
    }
  };

  visit(startNode);
  return { visited, order };
}

module.exports = dfs;
