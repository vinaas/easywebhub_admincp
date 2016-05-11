'use strict';

module.exports = function(options){
    options = options || {};
    if ('FrameDeny' in options == false || typeof options['FrameDeny'] !== 'boolean')
        options.FrameDeny = true;

    if ('ContentTypeNosniff' in options == false || typeof options['ContentTypeNosniff'] !== 'boolean')
        options.ContentTypeNosniff = true;

    if ('BrowserXssFilter' in options == false || typeof options['BrowserXssFilter'] !== 'boolean')
        options.BrowserXssFilter = true;

    return function (req, res, next) {
        if (options.FrameDeny) res.header('X-Frame-Options', 'DENY');
        if (options.ContentTypeNosniff) res.header('X-Content-Type-Options', 'nosniff');
        if (options.BrowserXssFilter) res.header('X-XSS-Protection', '1; mode=block');
        return next();
    };
};
