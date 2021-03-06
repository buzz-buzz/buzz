module.exports = {
    cdn: '//10.20.32.51:16000',

    sso: {
        inner: {
            "host": "uat.service.hcd.com",
            "port": 10086
        }
    },

    captcha: {
        public: {
            origin: "//uat.bridgeplus.cn:10001"
        },
        inner: {
            "host": "10.20.32.51",
            "port": "10001"
        }
    },

    sms: {
        inner: {
            "host": "uat.service.hcd.com",
            "port": "10002",
            "code": "BUZZ_S1_cn"
        }
    },

    buzz: {
        inner: {
            host: 'uat.service.hcd.com',
            port: 16160
        }
    },

    wechat: {
        inner: {
            host: 'uat.service.hcd.com',
            port: 10101,
            app_id: 'buzz'
        },
        returnHost: 'http://10.20.32.51:16000'
    },
    wechatSign: {
        inner: {
            host: 'uat.service.hcd.com',
            port: 10123
        }
    },

    progress: {
        inner: {
            host: '10.20.32.61',
            port: 15000
        }
    },

    upload_qiniu: {
        inner: {
            host: "uat.hcd.com",
            port: 10003
        }
    },

    hongda: {
        host: '10.20.32.51',
        port: 10126
    },

    applicationId: "4f6b3929-38c3-4828-88a7-11da836cae34",

    logger: {
        appName: 'buzz'
    },

    tracking: "//10.20.32.51:14444/js/t.min.js?write-key=HjYKeEnEV7QiyFXCKxZXrPmqgsjkaQpb",

    admins: ['6c003a7a-08cf-4f02-8f5b-4d23ee70f8a0']
};