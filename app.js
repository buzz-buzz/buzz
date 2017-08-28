'use strict';

const koa = require('koa');
const app = module.exports = koa();
const config = require('./config');
const path = require('path');
const fs = require('fs');
const router = require('koa-router')();
const logger = require('koa-logger');
const views = require('co-views');
const userAgent = require('koa-useragent');
const greenSharedLogger = require('./common/logger')('app.js');
const cookies = require('./helpers/cookie.js');
const membership = require('./membership/index.js');
const renders = require('./common/enhanced-render');
const render = renders.render;
const enhancedRender = renders.enhancedRender;
const trackingInfo = require('./bll/tracking-info');

const server = require('http').createServer(app.callback());

app.use(userAgent());
app.use(logger());
app.use(trackingInfo.rememberSource);

app.on('error', function (err, ctx) {
    greenSharedLogger.error('error occurred from referer: ' + ctx.req.headers.referer);
    greenSharedLogger.error(err);
});

app.use(function* (next) {
    yield next;
    if (this.response.status === 404) {
        this.body = yield render.call(this, '404', {
            config: config
        });
        this.response.status = 404;
    }
});

require('./routes')(app, router, enhancedRender, server);

if (!module.parent) {
    var port = process.env.PORT || config.port || 16000;
    server.listen(port);
    console.log('Running %s site at: http://localhost:%d', config.mode, port);
}