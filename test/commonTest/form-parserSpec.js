'use strict';

require('co-mocha');
let assert = require('assert');
let formParser = require('../../common/form-parser');
let config = require('../../config');

describe('url wrapper', function () {
    it('parses a key-value pair', function () {
        let o = ['dialoug', 'I like it!'];
        let r = {};
        formParser.parse(r, o);
        assert.equal(r.dialoug, 'I like it!');
    });

    it('parses an array data', function () {
        let o = ['recipes[0]', 'nose'];
        let r = {};

        formParser.parse(r, o);
        assert.equal(r.recipes.length, 1);
        assert.equal(r.recipes[0], 'nose');

        o = ['recipes[1]', 'sun_glasses'];
        formParser.parse(r, o);
        assert.equal(r.recipes.length, 2);
        assert.equal(r.recipes[1], 'sun_glasses');
    })
});