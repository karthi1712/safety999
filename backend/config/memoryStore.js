const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const clone = (value) => {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(clone);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clone(entry)]));
  }
  return value;
};

const getPath = (source, path) => {
  if (!path) return source;
  const parts = String(path).replace(/^\$\.?/, "").split(".");
  let current = source;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
};

const compareValues = (a, b) => {
  if (a === b) return 0;
  return a > b ? 1 : -1;
};

const matchesQuery = (doc, query) => {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return true;
  }

  return Object.entries(query).every(([key, value]) => {
    if (key === "$or") {
      return Array.isArray(value) && value.some((subQuery) => matchesQuery(doc, subQuery));
    }

    if (value && typeof value === "object" && !Array.isArray(value) && ("$regex" in value || "$ne" in value || "$in" in value || "$exists" in value || "$gt" in value || "$gte" in value || "$lt" in value || "$lte" in value)) {
      const actual = getPath(doc, key);
      if ("$regex" in value) {
        return new RegExp(value.$regex, value.$options || "").test(actual == null ? "" : String(actual));
      }
      if ("$ne" in value) {
        return actual !== value.$ne;
      }
      if ("$in" in value) {
        return value.$in.includes(actual);
      }
      if ("$exists" in value) {
        return (actual !== undefined) === value.$exists;
      }
      if ("$gt" in value) {
        return actual > value.$gt;
      }
      if ("$gte" in value) {
        return actual >= value.$gte;
      }
      if ("$lt" in value) {
        return actual < value.$lt;
      }
      if ("$lte" in value) {
        return actual <= value.$lte;
      }
    }

    return getPath(doc, key) === value;
  });
};

const selectFields = (doc, fields) => {
  if (!fields) {
    return clone(doc);
  }

  if (typeof fields === "string") {
    const raw = fields.trim();
    if (!raw) return clone(doc);
    const include = raw.split(/\s+/).filter(Boolean).filter((entry) => !entry.startsWith("-"));
    const exclude = raw.split(/\s+/).filter(Boolean).filter((entry) => entry.startsWith("-")).map((entry) => entry.slice(1));
    const selected = {};
    Object.entries(doc).forEach(([key, value]) => {
      if (exclude.includes(key)) {
        return;
      }
      if (include.length === 0 || include.includes(key)) {
        selected[key] = clone(value);
      }
    });
    return selected;
  }

  return clone(doc);
};

const sortItems = (items, sortSpec) => {
  if (!sortSpec) {
    return items;
  }

  const entries = Object.entries(sortSpec);
  const sorted = [...items];
  sorted.sort((left, right) => {
    for (const [field, direction] of entries) {
      const valueA = getPath(left, field);
      const valueB = getPath(right, field);
      const compared = compareValues(valueA, valueB);
      if (compared !== 0) {
        return direction === -1 ? -compared : compared;
      }
    }
    return 0;
  });
  return sorted;
};

const buildQuery = (items, { single = false } = {}) => {
  let selectSpec = null;
  let sortSpec = null;
  let leanMode = false;
  let limitCount = null;
  let skipCount = null;

  const run = () => {
    let resultItems = sortItems(items, sortSpec);
    if (skipCount != null) {
      resultItems = resultItems.slice(skipCount);
    }
    if (limitCount != null) {
      resultItems = resultItems.slice(0, limitCount);
    }

    if (single) {
      const found = resultItems[0] ? clone(resultItems[0]) : null;
      if (!found) return null;
      return selectSpec ? selectFields(found, selectSpec) : leanMode ? found : found;
    }

    return resultItems.map((item) => {
      const copied = clone(item);
      return selectSpec ? selectFields(copied, selectSpec) : copied;
    });
  };

  return {
    select(fields) {
      selectSpec = fields;
      return this;
    },
    populate() {
      return this;
    },
    sort(spec) {
      sortSpec = spec;
      return this;
    },
    limit(count) {
      limitCount = count;
      return this;
    },
    skip(count) {
      skipCount = count;
      return this;
    },
    lean() {
      leanMode = true;
      return this;
    },
    exec() {
      return Promise.resolve(run());
    },
    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    },
    catch(reject) {
      return this.exec().catch(reject);
    }
  };
};

const createCollectionModel = (collectionName, prefix) => {
  const store = [];

  const createDoc = (data) => {
    const doc = {
      _id: data._id || createId(prefix),
      ...clone(data),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      toObject() {
        return clone(this);
      },
      toJSON() {
        return this.toObject();
      },
      async save() {
        const index = store.findIndex((entry) => entry._id === this._id);
        const snapshot = clone(this);
        if (index >= 0) {
          store[index] = snapshot;
        } else {
          store.push(snapshot);
        }
        return snapshot;
      }
    };
    store.push(doc);
    return doc;
  };

  const list = (query = {}) => store.filter((entry) => matchesQuery(entry, query));

  return {
    create(data) {
      return Promise.resolve(createDoc(data));
    },
    find(query) {
      return buildQuery(list(query));
    },
    findOne(query) {
      return buildQuery(list(query), { single: true });
    },
    async countDocuments(query = {}) {
      return list(query).length;
    },
    async findOneAndUpdate(query, update, options = {}) {
      const existing = list(query)[0];
      if (existing) {
        const next = clone(existing);
        if (update && update.$set) {
          Object.assign(next, update.$set);
        }
        if (update && update.$setOnInsert) {
          Object.assign(next, update.$setOnInsert);
        }
        next.updatedAt = new Date();
        const index = store.findIndex((entry) => entry._id === next._id);
        if (index >= 0) {
          store[index] = next;
        }
        return next;
      }
      if (options.upsert) {
        const seeded = clone({ ...query, ...update?.$setOnInsert, ...update?.$set });
        return createDoc(seeded);
      }
      return null;
    },
    async findByIdAndUpdate(id, update, options = {}) {
      const existing = store.find((entry) => entry._id === id);
      if (!existing) {
        if (options.upsert) {
          return createDoc({ _id: id, ...update.$set });
        }
        return null;
      }
      const next = clone(existing);
      Object.assign(next, update);
      next.updatedAt = new Date();
      const index = store.findIndex((entry) => entry._id === id);
      if (index >= 0) {
        store[index] = next;
      }
      return next;
    },
    async findByIdAndDelete(id) {
      const index = store.findIndex((entry) => entry._id === id);
      if (index >= 0) {
        store.splice(index, 1);
      }
      return true;
    },
    async aggregate(pipeline = []) {
      const docs = clone(store);
      const groupStage = pipeline.find((stage) => stage.$group);
      if (!groupStage) {
        return docs;
      }
      const groups = new Map();
      docs.forEach((doc) => {
        const groupValue = (() => {
          const groupId = groupStage.$group._id;
          if (groupId && typeof groupId === "object" && groupId.$dateToString) {
            const value = getPath(doc, groupId.$dateToString.date);
            return new Date(value).toISOString().slice(0, 10);
          }
          if (typeof groupId === "string" && groupId.startsWith("$")) {
            return getPath(doc, groupId.slice(1));
          }
          return groupId;
        })();

        const entry = groups.get(groupValue) || { _id: groupValue, count: 0 };
        entry.count += 1;
        groups.set(groupValue, entry);
      });

      let result = Array.from(groups.values());
      const sortStage = pipeline.find((stage) => stage.$sort);
      if (sortStage) {
        result = sortItems(result, sortStage.$sort);
      }
      return result;
    },
    __store: store
  };
};

module.exports = { createCollectionModel };
