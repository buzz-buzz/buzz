'use strict';

const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const video = require('../bll/video');
const Router = require('koa-router');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get('/service-proxy/video/playable', membership.setHcdUserIfSignedIn, video.playable)
        .get('/service-proxy/buzz/video/subtitle-list', membership.setHcdUserIfSignedIn, function* () {
            this.body = yield proxy(Object.assign({
                path: '/video/subtitle-list',
                method: 'GET'
            }, proxyOption));
        })
        .get('/service-proxy/buzz/video/path/:page_size/:pageState?', membership.setHcdUserIfSignedIn, function* () {
            let pageState = '';
            if (this.params.pageState) {
                pageState = this.params.pageState;
            }
            let member_id = '00000000-0000-0000-0000-000000000000';
            if (this.state.hcd_user && this.state.hcd_user.member_id) {
                member_id = this.state.hcd_user.member_id;
            }

            this.body = yield proxy(Object.assign({
                path: '/video/path/:member_id/:page_size/:pageState?'.replace(':member_id', member_id)
                    .replace(':page_size', this.params.page_size).replace(':pageState?', pageState),
                method: 'GET'
            }, proxyOption));
        })
        .post('/service-proxy/buzz/video/save/path/:path', membership.setHcdUserIfSignedIn, function* () {
            //video/path/:member_id/:path  新增
            let path = this.params.path;
            let member_id = '00000000-0000-0000-0000-000000000000';
            let data = yield parse(this.request);
            if (this.state.hcd_user && this.state.hcd_user.member_id) {
                member_id = this.state.hcd_user.member_id;
            }

            this.body = yield proxy(Object.assign({
                path: '/video/path/:member_id/:path'.replace(':member_id', member_id).replace(':path', path),
                method: 'POST',
                data: {
                    dialogue: data.dialogue
                }
            }, proxyOption));
        })
        .post('/service-proxy/buzz/video/status/:upload_month/:video_id/:status/:remark?', membership.setHcdUserIfSignedIn, function* () {
            let video_id = this.params.video_id;
            let status = this.params.status;
            let upload_month = this.params.upload_month;
            let remark = this.params.remark || '';
            let data = yield parse(this.request);

            this.body = yield proxy(Object.assign({
                path: '/video/path/status/:upload_month/:video_id/:status/:remark?'.replace(':upload_month', upload_month)
                    .replace(':video_id', video_id).replace(':status', status).replace(':remark?', remark),
                method: 'POST',
                data: data
            }, proxyOption));
        })
        .get('/service-proxy/buzz/video/info/:video_id', membership.setHcdUserIfSignedIn, function* () {
            let video_id = this.params.video_id;

            let path = Router.url('/video/path/info/:video_id', {
                video_id: video_id
            });

            this.body = yield proxy(Object.assign({
                path: path,
                method: 'GET'
            }, proxyOption));
        });
};