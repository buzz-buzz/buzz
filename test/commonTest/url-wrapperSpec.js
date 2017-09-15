'use strict';

require('co-mocha');
let assert = require('assert');
let urlWrapper = require('../../common/url-wrapper');
let config = require('../../config');

describe('url wrapper', function () {
    it('wraps url with current version', function () {
        let url = '/test';
        assert.equal(urlWrapper.wrapVersion(url), `/test?v=${config.version}`);
    });

    it('append url with query strings an extra version', function () {
        let url = '/test?a=b&c=d';
        assert.equal(urlWrapper.wrapVersion(url), `/test?a=b&c=d&v=${config.version}`);
    })
});