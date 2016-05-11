'use strict';

const Jwt = require('jsonwebtoken');
const Bluebird = require('bluebird');
const _ = require('lodash');
const Assert = require('assert-plus');
const Cookie = require('cookie');

class JwtSessionManager {
    constructor(opts) {
        Assert.object(opts, 'opts');
        if (!opts || !opts.secret) throw new Error('secret should be set');
        opts.header = opts.header || 'SessionId';
        this.opts = opts;
    }

    createSession(value, maxAge) {
        let me = this;

        let jwtOpts = _.assign({}, me.opts);
        if (maxAge !== undefined) {
            if (Number.isInteger(maxAge))
                maxAge = maxAge * 1000; // max age in second;
            jwtOpts.expiresIn = maxAge;
        }

        return new Bluebird((resolve, reject) => {
            Jwt.sign(value, jwtOpts.secret, jwtOpts, (err, token) => {
                if (err) reject(err);
                else resolve(token);
            });
        });
    }

    verify(token) {
        let me = this;
        return new Bluebird((resolve, reject) => {
            Jwt.verify(token, me.secret, me.opts, (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
            });
        });
    }


    middleware() {
        let me = this;
        return (req, res, next) => {
            // tim session id trong http header
            let token = req.headers[me.opts.header];
            if (token === undefined) {
                // thu tim session id trong cookie
                let cookieHeader = req.headers.cookie;
                if (cookieHeader) {
                    req.cookies = Cookie.parse(cookieHeader);
                    token = req.cookies[me.opts.header];
                }
            }

            if (!token)
                return next();
            me.verify(token).then(sessionData => {
                req.session = sessionData;
                next();
            }).catch(err => {
                next.ifError(err);
            });
        };
    }
}

module.exports = JwtSessionManager;
