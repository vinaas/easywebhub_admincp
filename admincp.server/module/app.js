'use strict';

if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');

const conf = require('nconf');
const restify = require('restify');
const _ = require('lodash');
const bunyan = require('bunyan');

const JwtSessionManager = require(__dirname + '/jwt-session-manager');
const Acl = require(__dirname + '/acl');

// LOAD CONFIG FILE
conf.file(`config-${process.env.NODE_ENV}.json`);

// LOG
const logRingBuffer = new bunyan.RingBuffer({
    limit: conf.get('log:ringBufferLimit')
});

// create log dir if not exits
if (!fs.existsSync(conf.get('log:dir')))
    fs.mkdirSync(conf.get('log:dir'));

let logStreams = [
    {
        type:   'rotating-file',
        level:  conf.get('log:level'),
        path:   path.join(conf.get('log:dir'), `log.txt`),
        period: conf.get('log:period'), // time to rotation
        count:  conf.get('log:count')   // keep n back copies
    },
    {
        level:  conf.get('log:level'),
        type:   'raw',
        stream: logRingBuffer
    },
    {
        level:  conf.get('log:level'),
        stream: process.stdout
    }
];

let log = bunyan.createLogger({
    name:    conf.get('app:name'),
    streams: logStreams
});

// ADMIN SERVER
let server = restify.createServer({
    name: conf.get('app:name')
});
server.server.setTimeout(15000);
server.use(require(__dirname + '/secure-header')());
server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.use(restify.bodyParser({
    maxBodySize: 8192,
    mapParams:   true,
    mapFiles:    false
}));

function loadPublicRoute() {
    let routeDir = path.join(__dirname, '..', 'api', 'public');
    _.forEach(fs.readdirSync(routeDir), fileName => {
        let routeFilePath = path.join(routeDir, fileName);
        if (fs.statSync(routeFilePath).isDirectory()) return;
        let routeModule = require(routeFilePath);
        _.forOwn(routeModule, (handler, routePath) => {
            let parts = routePath.split('/');
            var method = parts.splice(0, 1);
            parts.unshift('api');
            var url = parts.join('/');
            server[method](url, handler);
        });
    });
}

function loadPrivateRoute() {
    let routeDir = path.join(__dirname, '..', 'api', 'private');
    _.forEach(fs.readdirSync(routeDir), fileName => {
        let routeFilePath = path.join(routeDir, fileName);
        if (fs.statSync(routeFilePath).isDirectory()) return;
        let routeModule = require(routeFilePath);
        _.forOwn(routeModule, (handler, routePath) => {
            let parts = routePath.split('/');
            var method = parts.splice(0, 1);
            parts.unshift('api');
            var url = parts.join('/');
            server[method](url, acl.middleware(), handler);
        });
    });
}

// SESSION MANAGER
let sessionManager = new JwtSessionManager(conf.get('sessionManager'));
// ACL
let acl = new Acl();

let app = {
    server:         server,
    acl:            acl,
    sessionManager: sessionManager,
    log:            log
};
app.start = function () {
    server.use(sessionManager.middleware());
    loadPublicRoute();
    loadPrivateRoute();
    // static web
    server.get(/.*/, restify.serveStatic({
        directory: conf.get('app:webDir'),
        default:   'index.html',
        charSet:   'utf-8'
    }));
    // start admin server
    server.listen(conf.get('app:port'), conf.get('app:host'), function (error) {
        if (error) {
            log.fatal(error.message);
            process.exit(0);
        }
        log.info('%s listening at %s', server.name, server.url);
    });
};

module.exports = app;
