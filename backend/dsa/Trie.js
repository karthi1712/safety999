class TrieNode {
  constructor() {
    this.children = Object.create(null);
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let current = this.root;
    const normalized = word.toLowerCase();

    for (const char of normalized) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }

    current.isEndOfWord = true;
  }

  search(word) {
    let current = this.root;
    const normalized = word.toLowerCase();

    for (const char of normalized) {
      if (!current.children[char]) {
        return false;
      }
      current = current.children[char];
    }

    return current.isEndOfWord;
  }

  startsWith(prefix) {
    let current = this.root;
    const normalized = prefix.toLowerCase();

    for (const char of normalized) {
      if (!current.children[char]) {
        return false;
      }
      current = current.children[char];
    }

    return true;
  }

  autocomplete(prefix) {
    let current = this.root;
    const normalized = prefix.toLowerCase();

    for (const char of normalized) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }

    const results = [];
    const collect = (node, suffix) => {
      if (node.isEndOfWord) {
        results.push(suffix);
      }

      for (const [char, child] of Object.entries(node.children)) {
        collect(child, suffix + char);
      }
    };

    collect(current, normalized);
    return results.slice(0, 8);
  }
}

module.exports = Trie;
