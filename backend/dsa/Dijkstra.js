const Graph = require('./Graph');

function dijkstra(graph, startNode) {
  const distances = new Map();
  const visited = new Set();
  const previous = new Map();

  graph.getVertices().forEach((vertex) => distances.set(vertex, Infinity));
  distances.set(startNode, 0);

  while (visited.size < graph.getVertices().length) {
    let currentNode = null;
    let smallestDistance = Infinity;

    distances.forEach((distance, vertex) => {
      if (!visited.has(vertex) && distance < smallestDistance) {
        currentNode = vertex;
        smallestDistance = distance;
      }
    });

    if (currentNode === null || smallestDistance === Infinity) {
      break;
    }

    visited.add(currentNode);

    for (const neighbor of graph.getNeighbors(currentNode)) {
      const candidateDistance = smallestDistance + neighbor.weight;
      if (candidateDistance < (distances.get(neighbor.node) || Infinity)) {
        distances.set(neighbor.node, candidateDistance);
        previous.set(neighbor.node, currentNode);
      }
    }
  }

  return { distances, previous };
}

module.exports = dijkstra;
