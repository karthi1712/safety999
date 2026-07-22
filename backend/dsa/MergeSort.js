function mergeSort(items, key = "createdAt") {
  if (items.length <= 1) {
    return items;
  }

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), key);
  const right = mergeSort(items.slice(middle), key);

  return merge(left, right, key);
}

function merge(left, right, key) {
  const merged = [];

  while (left.length && right.length) {
    const leftValue = getValue(left[0], key);
    const rightValue = getValue(right[0], key);

    if (leftValue <= rightValue) {
      merged.push(left.shift());
    } else {
      merged.push(right.shift());
    }
  }

  return merged.concat(left, right);
}

function getValue(item, key) {
  if (!item) {
    return Number.MAX_SAFE_INTEGER;
  }

  if (key === "severity") {
    const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityRank[item[key]] || 0;
  }

  if (key === "priority") {
    const priorityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityRank[item[key]] || 0;
  }

  if (key === "date") {
    return new Date(item.createdAt || 0).getTime();
  }

  return item[key] || 0;
}

module.exports = mergeSort;
