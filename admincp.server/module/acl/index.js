'use strict';

const UUID = require('node-uuid');
const Cookie = require('cookie');

const MemoryStore = require(__dirname + '/memory-store.js');
const RedisStore = require(__dirname + '/redis-store.js');

/**
 * @return {string}
 */
function CreateSessionId() {
    let buffer = new Buffer(16);
    UUID.v4(null, buffer, 0);
    return buffer.toString('hex');
}

class SessionMiddleware {
    /*
     * @param {Object} opts an options object
     * header httpHeader or cookie header
     * maxAge session TTL in seconds
     * {Object} memory options for memory store
     * {Object} redis options for redis store
     * */
    constructor(opts) {
        this.config = {};
        this.config.header = opts.header || 'SessionId';

        this.logger = opts.logger || console;

        if (opts.maxAge !== undefined)
            this.config.maxAge = opts.maxAge * 1000;
        else
            this.config.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (!opts.memory && !opts.redis) {
            throw new Error('session module need config option "memory" or "redis"');
        }

        if (opts.memory)
            this.store = new MemoryStore(opts.memory);

        if (opts.redis) {
            this.store = new RedisStore(opts.redis);
            // TODO optimize add a lru memory cache store
        }
    }

    createSession(data) {
        let me = this;
        let session = {};
        session.data = data || {};
        session.manager = this;
        session.id = CreateSessionId();
        session.save = function () {
            me.store.set(session.id, session.data, me.config.maxAge);
        };

        session.destroy = function () {
            me.store.del(session.id);
        };
        return session;
    }

    middleware() {
        const me = this;
        return function (req, res, next) {
            // tim session id trong http header
            let sid = req.headers[me.config.header];
            if (sid === undefined) {
                // thu tim session id trong cookie
                let cookieHeader = req.headers.cookie;
                if (cookieHeader) {
                    req.cookies = Cookie.parse(cookieHeader);
                    sid = req.cookies[me.config.header];
                }
            }

            // neu co sid thi load session data, set cho req
            if (!sid)
                return next();

            me.store.get(sid).then(data => {
                req.session = me.createSession(data);
            next();
        }).catch(err => {
                next(err);
        });
        }
    }

    has(id) {
        return this.store.has(id);
    }

    get(id) {
        return this.store.get(id);
    }

    reset() {
        return this.store.reset();
    }
}

module.exports = SessionMiddleware;
