class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
    return this;
  }

  addEdge(from, to, weight = 1) {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from).push({ node: to, weight });
    this.adjacencyList.get(to).push({ node: from, weight });
    return this;
  }

  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }

  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  toJSON() {
    return Object.fromEntries(this.adjacencyList);
  }
}

module.exports = Graph;
