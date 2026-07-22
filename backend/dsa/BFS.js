function bfs(graph, startNode) {
  const visited = new Set([startNode]);
  const queue = [startNode];
  const order = [];

  while (queue.length) {
    const current = queue.shift();
    order.push(current);

    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        queue.push(neighbor.node);
      }
    }
  }

  return { visited, order };
}

module.exports = bfs;
