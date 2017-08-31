'use strict';

let config = require('../config');

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../app');

let surveyBll = require('../bll/survey');

require('co-mocha');

describe('survey', function () {
    it('gets short id from short url', function* () {
        assert.equal(surveyBll.getShortId('https://www.wenjuan.com/s/VJRBbuG/'), 'VJRBbuG')
    });

    it('gets iframe url by long id', function* () {
        assert.equal(surveyBll.getIframeUrl('abcdefg'), 'abcdefg?iframe=1&');
    });
});

describe('survey', function () {
    it.skip('gets iframe url', function* (done) {
        let iframeUrl = yield surveyBll.getIframeUrlByShortUrl('https://www.wenjuan.com/s/VJRBbuG/');

        assert.equal(iframeUrl, 'http://www.wenjuan.com/iframe/abcdefg/');
        yield done;
    });
});