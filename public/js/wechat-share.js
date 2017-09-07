angular.module('wechatShareModule', ['clientConfigModule', 'buzzHeaderModule'])
    .run(['$rootScope', '$http', 'clientConfig', 'weixin', function ($rootScope, $http, clientConfig, weixin) {
        var index = location.href.indexOf('#');
        if (index < 0) {
            index = undefined;
        }

        function getDesc(who) {
            return who + ' 邀请您一起看今日Buzzbuzz青少年英语新闻';
        }

        var who = '你的朋友';
        $rootScope.$watch('profile', function (newValue) {
            if (newValue) {
                who = newValue.displayName;
                sharable.desc = getDesc(who);
                if (sharable.link.indexOf('trk_tag=') < 0) {
                    if (sharable.link.indexOf('?') < 0) {
                        sharable.link = sharable.link + '?trk_tag=' + newValue.invite_code;
                    } else {
                        sharable.link = sharable.link + '&trk_tag=' + newValue.invite_code;
                    }
                }
            }
        });

        var sharable = {
            title: '用一杯咖啡价格，让孩子看懂英语新闻',
            desc: '每天更新的，青少年英语新闻分级阅读！精彩内容，不容错过...',
            link: location.href,
            imgUrl: 'https://resource.buzzbuzzenglish.com/new_buzz_logo1.png'
        };

        $rootScope.wechatSharable = sharable;

        $http.get(clientConfig.serviceUrls.wechat.sign.frontEnd, {
            params: {
                url: encodeURIComponent(location.href.substr(0, index))
            }
        }).then(function (result) {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: result.data.appId, // 必填，公众号的唯一标识
                timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
                signature: result.data.signature, // 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            })

            window.wechatSigned = true;

            function shareToTimelineSuccess(result) {
                if (result.errMsg === 'shareTimeline:ok') {

                } else {

                }
            }

            function shareToTimelineCancel(result) {
                if (result.errMsg === 'shareTimeline:cancel') {

                } else {

                }
            }

            function shareToFriendSuccess(result) {
                if (result.errMsg === 'sendAppMessage:ok') {

                } else {

                }
            }

            function shareToFriendCancel(result) {
                if (result.errMsg === 'sendAppMessage:cancel') {

                } else {}
            }

            weixin.ready().then(function () {
                wx.onMenuShareTimeline(angular.extend({}, sharable, {
                    success: shareToTimelineSuccess,
                    cancel: shareToTimelineCancel,
                    title: sharable.title + ' ' + sharable.desc
                }));

                wx.onMenuShareAppMessage(angular.extend({}, sharable, {
                    success: shareToFriendSuccess,
                    cancel: shareToFriendCancel
                }));
            });
        });
    }])
    .factory('weixin', ['$q', function ($q) {
        return {
            ready: function () {
                var dfd = $q.defer();

                if (navigator.userAgent.indexOf('wechat') < 0) {
                    dfd.reject();
                    return dfd.promise;
                }

                if (typeof wx === 'undefined') {
                    dfd.reject();
                    return dfd.promise;
                }

                if (wx.errorHappened) {
                    dfd.reject();
                    return dfd.promise;
                }

                wx.error(function () {
                    wx.errorHappened = true;
                    dfd.reject();
                });

                wx.ready(function () {
                    if (wx.errorHappened) {
                        dfd.reject();
                    } else {
                        dfd.resolve();
                    }
                });
                
                return dfd.promise;
            }
        };
    }]);