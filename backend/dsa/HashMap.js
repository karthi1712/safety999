class HashMap {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(String(key), value);
  }

  get(key) {
    return this.store.get(String(key));
  }

  has(key) {
    return this.store.has(String(key));
  }

  remove(key) {
    return this.store.delete(String(key));
  }

  values() {
    return Array.from(this.store.values());
  }

  entries() {
    return Array.from(this.store.entries());
  }
}

module.exports = HashMap;
