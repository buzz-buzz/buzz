'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const videoBll = require('../bll/video');

module.exports = function (app, route) {
    route
        .get('/api/index', function*(next) {
            this.body = 'hello';
        })
        .get('/api/videos/:video_id', function*() {
            let status = yield videoBll.getStatusInfo(this.params.video_id);

            this.body = status;
        })
        ;
};