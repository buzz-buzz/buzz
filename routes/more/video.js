'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const saas = require('../../bll/saas');
const fs = require('fs');
const request = require('request');
const os = require('os');
const path = require('path');
const parse = require('co-busboy');
const exec = require('child_process').exec;
const stream = require('koa-stream');
const greenSharedLogger = require('../../common/logger')('/routes/more/video.js');
const videoBll = require('../../bll/video');
const membership = require('../../membership');

function yieldableExec(command) {
    return function (cb) {
        exec(command, cb);
    }
}

function pipeRequest(from, bucket) {
    return function (cb) {
        from.pipe(request.put(
            composeUrl(config.upload_qiniu.inner.host, config.upload_qiniu.inner.port, '/upload' + bucket), {},
            function (err, response, body) {
                cb(err, body);
            }));
    };
}

function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}

module.exports = function (app, router, render, server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('test', function (msg) {
            console.log('message: ' + msg);
        });

        socket.on('video', function (stream) {
            console.log('video', stream);
        });
    });

    // app.use(koaBody({ multipart: true }));

    function* renderVideoSPA() {
        let view = '/video';
        if (true || this.state.userAgent.isMobile) {
            view = '/m' + view;
        }

        console.log(view);

        this.body = yield render.call(this, view, {
            config: config,
            base: saas.getBaseFor(this, '/'),
            title: 'BuzzBuzz 自拍坊'
        });
    }

    router
        .get('/video', saas.checkSaasReferer, membership.ensureAuthenticated, renderVideoSPA)
        .get('/video-player/:video_id', saas.checkSaasReferer, renderVideoSPA)
        .get('/video-preview/:video_id', saas.checkSaasReferer, renderVideoSPA)
        .get('/video-share/:video_id/:member_id?', saas.checkSaasReferer, renderVideoSPA)
        .get('/video-list', saas.checkSaasReferer, renderVideoSPA)
        .put('/videos', function* (next) {
            try {
                if (!this.request.is('multipart/*')) return yield next;

                this.body = yield pipeRequest(this.req, '/buzz-video');
            } catch (ex) {
                this.throw(ex);
            }
        })
        // .post('/videos', function* (next) {
        //     const file = this.request.body.files.file;
        //     const reader = fs.createReadStream(file.path);
        //     const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
        //     reader.pipe(stream);
        //     console.log('uploading %s ---> %s', file.name, stream.path);

        //     this.body = stream.path;
        // })
        .post('/videos', function* (next) {
            let parts = parse(this);
            let part;

            let ugcPaths;
            let videoStoredPath = '';
            let srtStoredPath = '';
            let vttStoredPath = '';
            while ((part = yield parts)) {
                if (part && part.filename) {
                    ugcPaths = videoBll.ugcPaths(part.filename);
                    videoStoredPath = ugcPaths.raw;
                    vttStoredPath = ugcPaths.expVtt;

                    let stream = fs.createWriteStream(videoStoredPath);
                    part.pipe(stream);
                    console.log('uploading %s --> %s', part.filename, stream.path);
                } else {
                    console.log('generating vtt: %s.', vttStoredPath);
                    videoBll.generateVtt(vttStoredPath, part[1]);
                }
            }

            if (!vttStoredPath || !fs.existsSync(vttStoredPath)) {
                greenSharedLogger.error(`上传时没有生成期待的字幕文件！${vttStoredPath}`)
            }

            let encodedPath = new Buffer(videoStoredPath).toString('base64');
            this.body = `/videos/${encodedPath}`;
        })
        .get('/videos/:path', function* (next) {
            let fpath = new Buffer(this.params.path.replace('.mp4', '').replace('.vtt', ''), 'base64').toString();

            if (fpath.endsWith('.mp4') && !fs.existsSync(fpath)) {
                fpath = fpath.replace('.mp4', '.MOV');
            }

            if (fpath.endsWith('.MOV') && !fs.existsSync(fpath)) {
                fpath = fpath.replace('.MOV', '.mp4');
            }

            try {
                let fstat = fs.statSync(fpath);

                if (fstat.isFile()) {
                    // this.set('Content-disposition', `inline; filename=${path.basename(fpath)}`);
                    // this.set('Content-Transfer-Encoding', 'binary');
                    // this.type = extname(fpath);
                    // this.body = fs.createReadStream(fpath);
                    yield stream.file(this, path.basename(fpath), {
                        root: path.dirname(fpath),
                        allowDownload: true
                    });
                } else {
                    this.body = `${fpath} is not a file or is deleted`;
                }
            } catch (ex) {
                greenSharedLogger.error(`Couldn't handle this file: ${fpath}`);
                this.throw(ex);
            }
        });
};