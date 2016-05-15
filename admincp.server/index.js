'use strict';

const path = require('path');

// cho phep load node module tu` root path hien tai
process.env.NODE_PATH = path.join(__dirname);
require('module').Module._initPaths();

const app = require('app');

// fail safe code chong crash
process.on('uncaughtException', function (err) {
    console.log('FATAL error', err);
});

app.start();
