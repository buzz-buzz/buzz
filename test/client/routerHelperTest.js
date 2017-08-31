'use strict';

describe('video spa module', function () {
    var routerHelper;

    beforeEach(angular.mock.module('spaModule'));
    beforeEach(inject(function (_routerHelper_) {
        routerHelper = _routerHelper_;
    }));

    it('generates path', function () {
        expect(routerHelper.url('/video/:src', {
            src: 'base64'
        })).toEqual('/video/base64');

        expect(routerHelper.url('/router/:arg1/:arg2', {
            arg1: 'value1',
            arg2: 'value2'
        })).toEqual('/router/value1/value2');

        expect(routerHelper.url('/router/:param1/:param2', {
            param1: 'xxx',
            param2: 'yyy'
        })).toEqual('/router/xxx/yyy');
    });
});