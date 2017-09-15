module.exports = {
    cdn: '//blob.buzzbuzzenglish.com',
    date: '{{now}}',

    sso: {
        inner: {
            "host": "service.bridgeplus.cn",
            "port": 10086
        }
    },

    captcha: {
        public: {
            "origin": ""
        },
        inner: {
            "host": "service.bridgeplus.cn",
            "port": "10001"
        }
    },

    sms: {
        inner: {
            "host": "service.bridgeplus.cn",
            "port": "10002",
            "code": "BUZZ_S1_cn"
        }
    },

    buzz: {
        inner: {
            host: 'service.bridgeplus.cn',
            port: 16160
        }
    },

    wechat: {
        inner: {
            host: 'service.bridgeplus.cn',
            port: 10101,
            app_id: 'buzz'
        },
        returnHost: 'http://www.buzzbuzzenglish.com'
    },
    wechatSign: {
        inner: {
            host: 'service.bridgeplus.cn',
            port: 10123
        }
    },

    applicationId: "4f6b3929-38c3-4828-88a7-11da836cae34",

    progress: {
        inner: {
            host: 'service.hcdlearning.com',
            port: 15000
        }
    },

    upload_qiniu: {
        inner: {
            host: "service.hcdlearning.com",
            port: 10003
        }
    },

    hongda: {
        host: '100.115.145.179',
        port: 10126
    },

    logger: {
        appName: 'buzz'
    },

    tracking: "//tracking.buzzbuzzenglish.com/js/t.js?write-key=BeUYw5s9DgGdga4XX02V0DuBYsDDxNE" +
            "8",

    admins: [
        '484f357e-a6ff-4651-bfc0-8dbe610496d7', '5b2b6697-0189-4dba-965a-e705cd6615c5'
    ],

    rootDomain: ".buzzbuzzenglish.com",

    ugcVideoFolder: '/mnt/br-nas/content-buzz-ugc-video/'
};