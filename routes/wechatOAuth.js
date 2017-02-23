'use strict';

const wechat = require('../service-proxy-for-server/wechat');

module.exports = function * wechatOAuth(next) {
    if (!/MicroMessenger/i.test(this.state.userAgent.source)) {
        return yield next;
    }

    if (this.path !== '/m/sign-in') {
        return yield next;
    }

    if (this.query.token && this.query.is_registed) {
        return yield next;
    }

    let res = yield wechat.getOAuthLink(this.query.return_url || '/');

    if (!res.isSuccess) {
        return yield next;
    }

    this.redirect(res.result);
};