'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const membership = require('../membership');
const proxy = require('./proxy');
const Router = require('koa-router');
const qs = require('querystring');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.profile.memberVocabulary.correct.frontEnd, membership.ensureAuthenticated, function* () {
            this.body = yield proxy(Object.assign({
                path: Router.url(serviceUrls.buzz.profile.memberVocabulary.correct.upstream, {
                    member_id: this.state.hcd_user.member_id
                }),
                method: 'GET'
            }, proxyOption))
        })
        ;
};