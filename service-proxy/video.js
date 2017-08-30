'use strict';

const config = require('../config');
const membership = require('../membership');
const proxy = require('./proxy');
const video = require('../bll/video');

const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get('/service-proxy/video/playable', membership.setHcdUserIfSignedIn, video.playable)
        .get('/service-proxy/buzz/video/subtitle-list', membership.setHcdUserIfSignedIn, function*() {
            this.body = yield proxy(Object.assign({
                path: '/video/subtitle-list',
                method: 'GET'
            }, proxyOption));
        })
        .get('/service-proxy/buzz/video/path/:page_size/:pageState?', membership.setHcdUserIfSignedIn, function *() {
            let member_id = '00000000-0000-0000-0000-000000000000';
            let pageState = '';
            if(this.params.pageState){
                pageState = this.params.pageState;
            }
            if (this.state.hcd_user && this.state.hcd_user.member_id) {
                member_id = this.state.hcd_user.member_id;
            }

            this.body = yield proxy(Object.assign({
                path: '/video/path/:member_id/:page_size/:pageState?'.replace(':member_id', member_id)
                    .replace(':page_size', this.params.page_size).replace(':pageState?', pageState),
                method: 'GET'
            }, proxyOption));
        })
        .get('/service-proxy/buzz/video/save/path/:path/:calc?', membership.setHcdUserIfSignedIn, function *() {
            ///video/path/:member_id/:path/:calc?
            let path = this.params.path;
            if (this.params.calc && this.params.calc === 'delete' && path.length >= 38) {
                this.body = yield proxy(Object.assign({
                    path: '/video/path/:member_id/:path/:calc'.replace(':member_id', this.state.hcd_user.member_id).replace(':path', path).replace(':calc?', 'delete'),
                    method: 'POST'
                }, proxyOption));
            } else if (!this.params.calc) {
                let member_id = '00000000-0000-0000-0000-000000000000';
                if (this.state.hcd_user && this.state.hcd_user.member_id) {
                    member_id = this.state.hcd_user.member_id;
                }
                this.body = yield proxy(Object.assign({
                    path: '/video/path/:member_id/:path'.replace(':member_id', member_id).replace(':path', path),
                    method: 'POST'
                }, proxyOption));
            }
        })
    ;
};