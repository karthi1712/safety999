class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(value, priority) {
    const item = { value, priority };
    let added = false;

    for (let index = 0; index < this.items.length; index += 1) {
      if (this.items[index].priority > priority) {
        this.items.splice(index, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0] || null;
  }

  size() {
    return this.items.length;
  }
}

module.exports = PriorityQueue;
