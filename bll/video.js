'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');
const fs = require('fs');
const asyncProxy = require('../service-proxy/async-proxy');
const Router = require('koa-router');
const proxy = require('../service-proxy/proxy');
const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

function getVttStoredPath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}${parsed.name}.vtt`;
}

function getScorePath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}${parsed.name}.score`;
}

function getCartoonizedPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}c-${parsed.base}`;
}

function getPasteredPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}p-${parsed.base}`;
}

function getPasteredNosePath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}n-${parsed.base}`;
}

function getExpectedVttStoredPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}exp-${parsed.name}.vtt`;
}

function getURIAddress(path) {
    let encodedPath = new Buffer(path).toString('base64');
    return `/videos/${encodedPath}`;
}

function getURIAddresses(pathObj) {
    let ret = {};

    Object
        .keys(pathObj)
        .map(key => {
            if (fs.existsSync(pathObj[key])) {
                ret[key] = getURIAddress(pathObj[key]);
            }
        });

    return ret;
}

module.exports = {
    playable: function * () {
        if (this.state.hcd_user) {
            this.body = {
                start: -Infinity,
                end: Infinity
            }
        } else {
            this.body = {
                start: 10,
                end: 30
            }
        }
    },

    ugcPath: function () {
        let base = config.ugcVideoFolder;

        if (!base) {
            base = os.tmpdir();
        }

        return base;
    },

    ugcPaths: function (fileName) {
        let base = this.ugcPath();

        let r = Math
            .random()
            .toString();
        r = r.substr(r.length - 5);
        let videoStoredPath = path.join(base, `${r}${fileName}`);
        let vttStoredPath = getVttStoredPath(videoStoredPath);
        let expectedVttPath = getExpectedVttStoredPath(videoStoredPath);

        return {raw: videoStoredPath, vtt: vttStoredPath, expVtt: expectedVttPath};
    },

    generateVtt: function (vttPath, dialog) {
        let vtt = `WEBVTT

00:00:00.000 --> 00:00:10.375
${dialog}

`;
        fs.writeFileSync(vttPath, vtt, 'utf-8');
    },

    getStatusInfo: function*(videoId){
        let videoData = yield this.getStatusInfoFromDb(videoId);
        if(this.checkVideoDone(videoData)){
            videoData.status = 'done';
            return videoData;
        }else{
            let data = this.getStatusInfoFromFileSystem(videoData.video_path, videoData);
            return data;
        }
    },

    getStatusInfoFromFileSystem: function (videoStoredPath, videoData) {
        console.log('get status from file system');
        let encodedVideoSrc = new Buffer(videoStoredPath, 'base64').toString();
        let decoded = decodeURIComponent(encodedVideoSrc);
        let videoSrc = encodeURIComponent(decoded.replace('/videos/', ''));

        let rawPath = new Buffer(videoSrc, 'base64').toString();
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

        videoStoredPath = rawPath;

        let expVttPath = getExpectedVttStoredPath(videoStoredPath);
        let vttPath = getVttStoredPath(videoStoredPath);
        let scorePath = getScorePath(videoStoredPath);
        let cartoonizedPath = getCartoonizedPath(videoStoredPath);
        let pasteredPath = getPasteredPath(videoStoredPath);
        let pasteredNosePath = getPasteredNosePath(videoStoredPath);

        let result = {
            status: 'done',
            raw: getURIAddress(videoStoredPath),
            vtt: getURIAddress(expVttPath),//字幕文件 vtt
            actualVtt: getURIAddress(vttPath)//识别后的 actualVtt
        };

        if (fs.existsSync(pasteredNosePath)) {
            result.pasteredNose = getURIAddress(pasteredNosePath);
        }

        if (fs.existsSync(cartoonizedPath)) {
            result.cartoonized = getURIAddress(cartoonizedPath);
        }

        if (fs.existsSync(pasteredPath)) {
            result.pastered = getURIAddress(pasteredPath);
        }

        if (!fs.existsSync(expVttPath)) {
            result.status = 'nosub';
            delete result.vtt;
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        if (!fs.existsSync(vttPath)) {
            let r = [];

            try {
                r = JSON.parse(fs.readFileSync(vttPath.replace('.vtt', '.recipes')).toString());
            } catch (ex) {
                r = ['recipe_nose'];
            }

            this.asyncGenerateVtt(videoStoredPath, r);
            result.status = 'recognizing';
            delete result.actualVtt;
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        if (fs.existsSync(scorePath)) {
            result.score = fs.readFileSync(scorePath, 'utf-8');
        }

        if (!fs.existsSync(videoStoredPath)) {
            result.status = 'novideo';
            delete result.raw;
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        //异步存DB
        this.asyncSaveVideoStatus(videoData, result);
        return result;
    },

    getStatusInfoFromDb: function*(videoId) {
        //get video data from buzz-server
        let path = Router.url('/video/path/info/:video_id', {
            video_id: videoId
        });

        let videoData = yield proxy(Object.assign({
            path: path,
            method: 'GET'
        }, proxyOption));

        if(typeof videoData == 'string'){
            videoData = JSON.parse(videoData);
        }

        return videoData;
    },

    asyncGenerateVtt: function (videoPath, recipes) {
        asyncProxy({
            host: config.hongda.host,
            port: config.hongda.port,
            path: '/recognize',
            method: 'POST',
            data: {
                videoPath: videoPath,
                recipes: recipes
            }
        });
    },

    asyncSaveVideoStatus: function (videoData, data) {
        data.actual_vtt = data.actualVtt || '';
        if(data.status === 'done'){
            data.status = 3;
        }else{
            data.status = 2;
        }

        if(data.score){
            data.score = parseInt(parseFloat(data.score) * 100);
            if(data.score > 30){
                data.status = 3;
            }else{
                data.status = 0;
                data.remark = 'low score, pronunciation';
            }
        }

        delete data.actualVtt;
        delete data.raw;

        asyncProxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: '/video/update/info/:video_id'.replace(':video_id', videoData.video_id),
            method: 'POST',
            data: data
        });
    },

    checkVideoDone: function (video) {
        if(video && video.score){
            return true;
        }else{
            return false;
        }
    }
};