class BloomFilter {
  constructor(size = 1024) {
    this.size = size;
    this.bitArray = new Array(size).fill(false);
  }

  // FNV-1a hashing function
  _hashFNV(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      // 32-bit integer multiplication
      hash = (hash * 16777619) >>> 0;
    }
    return hash % this.size;
  }

  // DJB2 hashing function
  _hashDJB2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % this.size;
  }

  add(str) {
    if (!str) return;
    const h1 = this._hashFNV(str);
    const h2 = this._hashDJB2(str);
    this.bitArray[h1] = true;
    this.bitArray[h2] = true;
  }

  test(str) {
    if (!str) return false;
    const h1 = this._hashFNV(str);
    const h2 = this._hashDJB2(str);
    return this.bitArray[h1] && this.bitArray[h2];
  }
}

module.exports = BloomFilter;
