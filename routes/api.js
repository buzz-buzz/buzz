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
        .get('/api/videos/:encodedRawPath', function*() {
            let rawPath = new Buffer(this.params.encodedRawPath, 'base64').toString();
            rawPath = rawPath.replace('subtitled-', '');
            console.log('rawPath = ', rawPath);
            if (!fs.existsSync(rawPath)) {
                let parsed = path.parse(rawPath);
                rawPath = `${parsed.dir}${path.sep}${parsed.name}.mp4`;
                console.log('try rawPath = ', rawPath);
            }
            if (!fs.existsSync(rawPath)) {
                let parsed = path.parse(rawPath);
                rawPath = `${parsed.dir}${path.sep}${parsed.name}.MOV`;
                console.log('try rawPath = ', rawPath);
            }
            let status = videoBll.getStatusInfo(rawPath);

            this.body = status;
        })
        .get('/api/videos/:num/:index?', function*(next) {
            let dir = videoBll.ugcPath();
            let files = fs.readdirSync(dir);
            let videoList = files.filter(f => (f.toLowerCase().endsWith('.mp4') || f.toLowerCase().endsWith('.mov'))).map(f => {
                let fullPath = path.join(dir, f);
                let encodedPath = new Buffer(fullPath).toString('base64');
                let stat = fs.statSync(fullPath);
                return {
                    videoName: f,
                    url: new Buffer(encodeURIComponent(`/videos/${encodedPath}`)).toString('base64'),
                    mtime: stat.mtime
                };
            });

            //排序
            for (let i = 0; i < videoList.length - 1; i++) {
                for (let j = i + 1; j <= videoList.length - 1; j++) {
                    let cur = videoList[i];
                    if (cur.mtime < videoList[j].mtime) {
                        let index = videoList[j];
                        videoList[j] = cur;
                        videoList[i] = index;
                    }
                }
            }

            let index = this.params.index ? parseInt(this.params.index) : 1;

            if (videoList.length > parseInt(this.params.num) * index) {
                this.body = videoList.splice(0, parseInt(this.params.num) * index);
            } else {
                this.body = videoList.splice(0, videoList.length);
            }

        });
};