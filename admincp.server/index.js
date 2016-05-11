'use strict';

const path = require('path');

process.env.NODE_PATH = path.join(__dirname);
require('module').Module._initPaths();

const app = require('module/app');

// fail safe code
process.on('uncaughtException', function (err) {
    console.log('FATAL error', err);
});

app.start();
