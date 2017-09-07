module.exports = {
    cdn: '',

    sso: {
        inner: {
            "host": "10.20.32.61",
            "port": 10086
        }
    },

    captcha: {
        public: {
            origin: "//uat.bridgeplus.cn:10001"
        },
        inner: {
            "host": "uat.bridgeplus.cn",
            "port": "10001"
        }
    },

    sms: {
        inner: {
            "host": "10.20.32.61",
            "port": "10002",
            "code": "BUZZ_S1_cn"
        }
    },

    buzz: {
        inner: {
            host: '10.20.32.61',
            //host: 'localhost',
            port: 16160
        }
    },

    wechat: {
        inner: {
            host: '10.20.32.61',
            port: 10101,
            app_id: 'buzz'
        },
        returnHost: 'http://localhost:16000'
    },

    wechatSign: {
        inner: {
            host: '10.20.32.61',
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
        // host: 'uat.hcd.com',
        host: 'localhost',
        port: 10126
    },

    applicationId: "4f6b3929-38c3-4828-88a7-11da836cae34",

    logger: {
        appName: 'buzz'
    },

    mock: false,

    tracking: "//10.20.32.51:14444/js/t.min.js?write-key=HjYKeEnEV7QiyFXCKxZXrPmqgsjkaQpb",

    admins: ['6c003a7a-08cf-4f02-8f5b-4d23ee70f8a0'],

    debug: true,
    port: 80,
};