const NodeCache = require('node-cache');

// Standard TTL of 60 seconds as mandated by Practical 9
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

// Hit / Miss tracking for supplementary debug endpoint
let cacheHits = 0;
let cacheMisses = 0;

cache.on('hit', (key) => {
  cacheHits++;
  console.log(`[Cache HIT] Key: "${key}" (Total Hits: ${cacheHits})`);
});

cache.on('miss', (key) => {
  cacheMisses++;
  console.log(`[Cache MISS] Key: "${key}" (Total Misses: ${cacheMisses})`);
});

cache.on('set', (key) => {
  console.log(`[Cache SET] Key: "${key}" (TTL: 60s)`);
});

cache.on('del', (key) => {
  console.log(`[Cache DEL] Invalidation Key: "${key}"`);
});

const getCacheStats = () => {
  const nodeStats = cache.getStats();
  return {
    hits: cacheHits,
    misses: cacheMisses,
    keys: cache.keys().length,
    ksize: nodeStats.ksize,
    vsize: nodeStats.vsize,
    cachedKeys: cache.keys(),
    hitRatio: cacheHits + cacheMisses > 0
      ? `${((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)}%`
      : '0%',
  };
};

module.exports = {
  cache,
  getCacheStats,
};
