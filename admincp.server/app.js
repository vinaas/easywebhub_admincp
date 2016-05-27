'use strict';

if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');

const conf = require('nconf');
const restify = require('restify');
const _ = require('lodash');
const bunyan = require('bunyan');
const couchbase = require('couchbase');
const assert = require('assert-plus');
const changeCase = require('change-case');

const JwtSessionManager = require('module/jwt-session-manager');
const Acl = require('module/acl');
const Mailer = require('module/mailer');

// LOAD CONFIG FILE
conf.file({
    file:             `config-${process.env.NODE_ENV}.json`,
    logicalSeparator: '.'
});

// LOG
const logRingBuffer = new bunyan.RingBuffer({
    limit: conf.get('log.ringBufferLimit')
});

// create log dir if not exits
if (!fs.existsSync(conf.get('log.dir')))
    fs.mkdirSync(conf.get('log.dir'));

let logStreams = [
    {
        type:   'rotating-file',
        level:  conf.get('log.level'),
        path:   path.join(conf.get('log.dir'), `log.txt`),
        period: conf.get('log.period'), // time to rotation
        count:  conf.get('log.count')   // keep n back copies
    },
    {
        level:  conf.get('log.level'),
        type:   'raw',
        stream: logRingBuffer
    },
    {
        level:  conf.get('log.level'),
        stream: process.stdout
    }
];

let log = bunyan.createLogger({
    name:    conf.get('app.name'),
    streams: logStreams
});

// ADMIN SERVER
let server = restify.createServer({
    name: conf.get('app.name')
});

server.server.setTimeout(15000);

// add middleware vo server
server.use(require('module/secure-header')());

// COR
let corOptions = conf.get('app.cor');
if (corOptions)
    server.use(restify.CORS(corOptions));

server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.use(restify.bodyParser({
    maxBodySize: 65536,
    mapParams:   true,
    mapFiles:    false
}));

// SESSION MANAGER
let sessionManager = new JwtSessionManager(conf.get('sessionManager'));

// ACL
let acl = new Acl();

// MAILER
let mailerType = conf.get('mailer.type');
let mailerConf = conf.get(`mailer.${mailerType}`);
let mailer = new Mailer(mailerType, mailerConf);

// DB
let cluster = new couchbase.Cluster(conf.get('couchbase.connectionString'));
let app = {
    server:         server,
    acl:            acl,
    sessionManager: sessionManager,
    log:            log,
    conf:           conf,
    mailer:         mailer,
    cluster:        cluster,
    userBucket:     cluster.openBucket(conf.get('couchbase.userBucket'), conf.get('database.password')),
    orderBucket:    cluster.openBucket(conf.get('couchbase.orderBucket'), conf.get('database.password'))
};

function loadRouteInDir(dir, middlewareArray) {
    middlewareArray = middlewareArray || [];
    // loop cac file trong thu muc input
    _.forEach(fs.readdirSync(dir), fileName => {
        let routeFilePath = path.join(dir, fileName);
        // loc bo? sub folder
        if (fs.statSync(routeFilePath).isDirectory()) return;
        let routeModule = require(routeFilePath)(app); // load file nhu 1 module
        // loop cac service path trong module
        _.forOwn(routeModule, (handler, routePath) => {
            let parts = routePath.split('/');
            // get rest method
            let method = parts.splice(0, 1)[0];
            // add file name
            parts.unshift(changeCase.param(path.basename(fileName, path.extname(fileName))));
            // add service name vo dau` url
            parts.unshift(conf.get('app.servicePath'));
            let url = parts.join('/');
            // tao. rest handler + middleware
            let params = [url];
            params.push.apply(params, middlewareArray);
            params.push(handler);
            log.info(`register service ${method}:${url}`);
            // dang ky rest service vo restify
            server[method].apply(server, params);
        });
    });
}

function loadPublicRoute() {
    let routeDir = path.join(__dirname, conf.get('app.servicePath'), 'public');
    return loadRouteInDir(routeDir);
}

function loadPrivateRoute() {
    let routeDir = path.join(__dirname, conf.get('app.servicePath'), 'private');
    return loadRouteInDir(routeDir, [acl.middleware()]);
}

app.start = function () {
    server.use(sessionManager.middleware());
    loadPublicRoute();
    loadPrivateRoute();
    // static web
    server.get(/.*/, restify.serveStatic({
        directory: conf.get('app.webPath'),
        default:   'index.html',
        charSet:   'utf-8'
    }));
    // start admin server
    server.listen(conf.get('app.port'), conf.get('app.host'), function (error) {
        if (error) {
            log.fatal(error.message);
            process.exit(0);
        }
        log.info('%s listening at %s', server.name, server.url);
    });

    // require('model/account');
};

module.exports = app;
