'use strict';

const redis = require('redis');
const bluebird = require('bluebird');

// TODO test this store
class RedisStore {
    constructor(opts) {
        this.conn = redis.createClient(opts);
        this.conn.on('error', err => {
            if (opts.log)
                opts.log.error('session redis connection error', err);
            else
                console.log('session redis connection error', err);
        });
    }

    reset() {
        let me = this;
        return new bluebird((resolve, reject) => {
            me.conn.flushall(id, (err, obj) => {
                if (err) reject(err);
                else resolve(obj);
            });
        });
    }

    has(id) {
        let me = this;
        return new bluebird((resolve, reject) => {
            me.conn.exists(id, (err, exists) => {
                if (err) reject(err);
                else resolve(exists);
            });
        });
    }

    get(id) {
        let me = this;
        return new bluebird((resolve, reject) => {
            me.conn.hgetall(id, (err, obj) => {
                if (err) reject(err);
                else resolve(obj);
            });
        });
    }

    /**
     * Add key value pair to redis store
     * @param {string} key
     * @param {Object} value
     * @param {number} maxAge Expire time in second
     */
    set(key, value, maxAge) {
        let me = this;
        return new bluebird((resolve, reject) => {
            me.conn.hmset(key, value, err => {
                if (err) return reject(err);
                if (maxAge === undefined)
                    return resolve();

                me.conn.expire(key, maxAge, err => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    del(id) {
        let me = this;
        return new bluebird((resolve, reject) => {
            me.conn.del(id, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = RedisStore;
