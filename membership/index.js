'use strict';

const util = require('util');
const config = require('../config');
const request = require('co-request');
const url = require('url');
const cookie = require('../helpers/cookie');
const saas = require('../bll/saas.js');

function setHcdUser(context, data) {
    context.state.hcd_user = {
        member_id: data.member_id,
        token: data.token,

        isAdmin: config.admins.indexOf(data.member_id) >= 0
    };
}

function* parseTokenAndSetHcdUser(context, token) {
    let result = {
        result: {}
    };

    if (config.mock) {
        result = {
            isSuccess: true,
            result: {
                member_id: 'fake member'
            }
        };
    } else {
        result = yield request({
            uri: 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + '/token/parse',
            json: { token: token },
            method: 'POST'
        });

        result = result.body;
    }

    if (result.isSuccess) {
        setHcdUser(context, {
            member_id: result.result.member_id,
            token: token
        });

        cookie.deleteMID.call(context);
        cookie.setMID.call(context, result.result.member_id);

        return result.result;
    } else {
        delete context.state.hcd_user;
        return {};
    }
}
function* setHcdUserFromCookie(context) {
    if (!context.cookies) { return; }

    let token = context.cookies.get('token');

    if (token) {
        yield parseTokenAndSetHcdUser(context, token);
    } else {
        delete context.state.hcd_user;
    }
}
function* setHcdUserFromQueryString(context) {
    let token = context.query.token;

    if (token) {
        let result = yield parseTokenAndSetHcdUser(context, token);
        cookie.resetSignOnCookies.call(context, Object.assign({}, result, { token: token }));
    }

    return token;
}
function* setHcdUserFromQSOrCookie(context) {
    (yield setHcdUserFromQueryString(context))
        || (yield setHcdUserFromCookie(context));
}
let membership = {
    parseTokenAndSetHcdUser: parseTokenAndSetHcdUser,
    setHcdUserFromCookie: setHcdUserFromCookie,

    setHcdUser: setHcdUser,

    parseToken: parseTokenAndSetHcdUser
};

membership.setHcdUserIfSignedIn = function* (next) {
    let context = this;

    yield setHcdUserFromQSOrCookie(context);

    yield next;
};

membership.ensureAuthenticated = function* (next) {
    let context = this;

    yield setHcdUserFromQSOrCookie(context);

    if (!context.state.hcd_user) {
        if (this.request.get('X-Request-With') === 'XMLHttpRequest') {
            let returnUrl = this.headers.referer;
            let result = {};
            result.isSuccess = false;
            result.code = 302;
            result.message = returnUrl || '/';

            return this.body = result;
        } else {
            let url = saas.generateUrl(this, '/sign-in?return_url=' + encodeURIComponent(context.request.originalUrl));

            return context.redirect(url);
        }
    }

    yield next;
};

membership.ensureAdmin = function* (next) {
    yield setHcdUserFromQSOrCookie(this);

    if (!this.state.hcd_user || !this.state.hcd_user.isAdmin) {
        require('../helpers/cookie').deleteToken.apply(this);
        return this.redirect(saas.generateUrl(this, '/sign-in?return_url=' + encodeURIComponent(this.request.originalUrl)));
    }

    yield next;
};

membership.signOut = function* (next) {
    yield request({
        uri: 'http://' + config.sso.inner.host + ':' + config.sso.inner.port + '/logon/logout',
        json: { token: this.query.token || this.cookies.get('token') },
        method: 'POST'
    });

    yield next;
};

module.exports = membership;