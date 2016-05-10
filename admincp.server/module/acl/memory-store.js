'use strict';

const lru = require('lru-cache');
const bluebird = require('bluebird');

function Promisify(fn) {
    return new bluebird(resolve => {
            resolve(fn());
});
}

class MemoryStore {
    constructor(opts) {
        this.store = lru({
            max:    opts.max || 65536
        });
    }

    reset() {
        let me = this;
        return Promisify(() => {
                me.store.reset(id);
    });
    }

    has(id) {
        let me = this;
        return Promisify(() => {
                me.store.has(id);
    });
    }

    get(id) {
        let me = this;
        return Promisify(() => {
                return me.store.get(id);
    });
    }

    /**
     * Add key value pair to lru memory store
     * @param key
     * @param value
     * @param maxAge
     * @returns {*}
     */
    set(key, value, maxAge) {
        let me = this;
        return Promisify(() => {
                if (maxAge) {
                    maxAge = maxAge * 1000;
                    return me.store.set(key, value, maxAge);
                } else
                return me.store.set(key, value);
    });
    }

    del(id) {
        let me = this;
        return Promisify(() => {
                return me.store.del(id);
    });
    }
}

module.exports = MemoryStore;
