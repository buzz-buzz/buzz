'use strict';

const config = require('../config');
const urlParser = require('url');

module.exports = {
    wrapVersion: function (url) {
        let parsed = urlParser.parse(url);

        if (!parsed.query) {
            return `${url}?v=${config.version}`;
        } else {
            return `${parsed.pathname}?${parsed.query}&v=${config.version}`;
        }
    },

    wrapVersionAndTimestamp: function (url) {
        return `${this.wrapVersion(url)}&r=${new Date().getTime()}`;
    }
};