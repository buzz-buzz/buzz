'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');
const fs = require('fs');
const asyncProxy = require('../service-proxy/async-proxy');

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
    return `${parsed.dir}${path.sep}c-${parsed.name}.mp4`;
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

    Object.keys(pathObj).map(key => {
        if (fs.existsSync(pathObj[key])) {
            ret[key] = getURIAddress(pathObj[key]);
        }
    });

    return ret;
}

module.exports = {
    playable: function* () {
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

        let r = Math.random().toString();
        r = r.substr(r.length - 5);
        let videoStoredPath = path.join(base, `${r}${fileName}`);
        let vttStoredPath = getVttStoredPath(videoStoredPath);
        let expectedVttPath = getExpectedVttStoredPath(videoStoredPath);

        return {
            raw: videoStoredPath,
            vtt: vttStoredPath,
            expVtt: expectedVttPath
        };
    },

    generateVtt: function (vttPath, dialog) {
        dialog = dialog || 'I like drawing, and walking in nature';
        let vtt = `WEBVTT FILE

1
00:00:00.000 --> 00:00:10.375
${dialog}

`;
        fs.writeFile(vttPath, 'WEBVTT FILE\n\n' + vtt, function () {});
    },

    getStatusInfo: function (videoStoredPath) {
        let expVttPath = getExpectedVttStoredPath(videoStoredPath);
        let vttPath = getVttStoredPath(videoStoredPath);
        let scorePath = getScorePath(videoStoredPath);
        let cartoonizedPath = getCartoonizedPath(videoStoredPath);

        let result = {
            status: 'done',
            raw: getURIAddress(videoStoredPath),
            vtt: getURIAddress(expVttPath),
            actualVtt: getURIAddress(vttPath)
        };

        if (fs.existsSync(cartoonizedPath)) {
            result.cartoonized = getURIAddress(cartoonizedPath);
        }

        if (!fs.existsSync(expVttPath)) {
            result.status = 'nosub';
            delete result.vtt;
            return result;
        }

        if (!fs.existsSync(vttPath)) {
            this.asyncGenerateVtt(videoStoredPath);
            result.status = 'recognizing';
            return result;
        }

        if (fs.existsSync(scorePath)) {
            result.score = fs.readFileSync(scorePath, 'utf-8');
        }

        if (!fs.existsSync(videoStoredPath)) {
            result.status = 'novideo';
            delete result.raw;
            return result;
        }

        return result;
    },

    asyncGenerateVtt: function (videoPath) {
        asyncProxy({
            host: config.hongda.host,
            port: config.hongda.port,
            path: '/recognize',
            method: 'POST',
            data: {
                videoPath: videoPath
            }
        });
    },

    asyncApplyProcess: function (videoStoredPath, srtStoredPath, finalPath) {
        srtStoredPath = srtStoredPath || getSubtitleStoredPath(videoStoredPath);
        finalPath = finalPath || getSubtitledVideoPath(videoStoredPath)._;
        asyncProxy({
            host: config.hongda.host,
            port: config.hongda.port,
            path: '/burn_subtitle',
            method: 'POST',
            data: {
                srtPath: srtStoredPath,
                videoPath: videoStoredPath,
                outputPath: finalPath
            }
        });
    }
};