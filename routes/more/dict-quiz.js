'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const saas = require('../../bll/saas');

module.exports = function (app, router, render) {
    if (process.env.NODE_ENV !== 'prd') {
        app
            .use(mount('/dict-quiz', function* () {
                this.redirect(saas.generateUrl(this, '/mock/dict-quiz/discover-quiz/index.html'));
            }))
            .use(mount('/buzz-quiz', function* () {
                this.redirect(saas.generateUrl(this, '/mock/buzz-quiz/20170222-spider-B-5/index.html'));
            }))
            ;
    }
};