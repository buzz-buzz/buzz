'use strict';

const serveStatic = require('koa-static');
const koaMount = require('koa-mount');
const proxy = require('../service-proxy/proxy');
const fs = require('fs');
const path = require('path');

const staticSetting = {
    etag: true,
    maxage: 1000 * 3600 * 24 * 30,
    gzip: true,
    hidden: true
};
let getStaticSetting = function () {
    return Object.assign({}, staticSetting);
};


module.exports = function (app, router) {
    router.get('/buzz2.appcache', function () {
        this.set('Content-type', 'text/cache-manifest');
        let appCache = fs.readFileSync(__dirname + '/../public/buzz2.appcache', 'utf-8');

        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') {
            this.body = appCache
                .replace(/CACHE:[\r\n]+#Generated:[\s\S]*#Other:/g, 'CACHE:\n#Generated:\n' + '' + '\n#Other:\n');
        } else {
            this.body = appCache;
        }
    });

    app.use(require('koa-cors')({
        origin: '*'
    }));
    app.use(serveStatic('public', getStaticSetting()));
    app.use(koaMount('/public', serveStatic('public', getStaticSetting())));
    app.use(koaMount('/mock', serveStatic('mock', getStaticSetting())));
    app.use(koaMount('/node_modules', serveStatic('node_modules', getStaticSetting())));
    if (process.env.NODE_ENV !== 'prd') {
        app.use(koaMount('/resources', function* (next) {
            this.body = yield proxy({
                host: 'www.buzzbuzzenglish.com',
                port: 80,
                path: '/resources' + this.request.url,
                method: 'GET'
            });
        }));
    }
};