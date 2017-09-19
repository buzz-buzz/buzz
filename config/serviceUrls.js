module.exports = {
    sso: {
        profile: {
            load: {
                frontEnd: '/service-proxy/sso/profile/load',
                upstream: '/profile/load/:member_id'
            },

            update: {
                frontEnd: '/service-proxy/sso/profile/update',
                upstream: '/profile/update'
            },

            changePassword: {
                frontEnd: '/service-proxy/sso/password/change',
                upstream: '/profile/changepassword'
            },

            changeMobile: {
                frontEnd: '/service-proxy/sso/mobile'
            }
        },
        signIn: {
            frontEnd: '/service-proxy/sso/sign-in',
            upstream: '/logon/authentication'
        },
        signUp: {
            frontEnd: '/service-proxy/sso/sign-up',
            upstream: '/member/register'
        },
        resetPassword: {
            frontEnd: '/service-proxy/sso/password/reset',
            upstream: '/member/resetPassword'
        }
    },
    sms: {
        sendWithCaptcha: {
            frontEnd: '/service-proxy/sms/send',
            upstream: '/service/sms/send'
        },
        validate: {
            upstream: '/service/sms/validate'
        }
    },
    buzz: {
        profile: {
            education: {
                frontEnd: '/service-proxy/buzz/profile/education',
                upstream: '/users/:member_id/educations'
            },
            latestEducation: {
                frontEnd: '/service-proxy/buzz/profile/education',
                upstream: '/users/:member_id/educations/latest'
            },
            latestAllEducation: {
                frontEnd: '/service-proxy/buzz/profile/education-all',
                upstream: '/users/:member_id/educations/latest-all'
            },
            currentLevel: {
                frontEnd: '/service-proxy/buzz/profile/current-level',
                upstream: '/users/:member_id/educations/current-level'
            },
            memberTag: {
                frontEnd: '/service-proxy/buzz/member-tags',
                upstream: '/user-tags/:member_id'
            },
            memberVocabularies: {
                frontEnd: '/service-proxy/buzz/member-vocabularies',
                upstream: '/member-vocabularies/:member_id/:answer/:word'
            },
            getMemberVocabularyList: {
                frontEnd: '/service-proxy/buzz/member-vocabulary-list',
                upstream: '/member-vocabularies/:member_id'
            },
            memberVocabulary: {
                correct: {
                    frontEnd: '/service-proxy/buzz/profile/member-vocabularies/correct/count',
                    upstream: '/member-vocabularies/correct/count/:member_id'
                }
            }
        },

        courses: {
            find: {
                frontEnd: '/service-proxy/buzz/courses/:category/:level',
                upstream: '/courses/:category/:level/true'
            },
            findByLevel: {
                frontEnd: '/service-proxy/buzz/courses/:level',
                upstream: '/courses/:level/true'
            },
            findByDate: {
                frontEnd: '/service-proxy/buzz/courses/:category/:level/dates/:date/:lesson_id?',
                upstream: '/courses/:category/:level/dates/:date/:lesson_id?'
            },
            latest: {
                frontEnd: '/service-proxy/buzz/courses/:level/latest',
                upstream: '/courses/:level/latest'
            },
            latestFor: {
                frontEnd: '/service-proxy/buzz/courses/:level/:member_id/latest',
                upstream: '/courses/:level/latestFor/:member_id'
            },
            search: {
                frontEnd: '/service-proxy/buzz/search-courses',
                upstream: '/courses'
            },
            searchFor: {
                frontEnd: '/service-proxy/buzz/search-courses-for',
                upstream: '/member-courses/:member_id'
            }
        },

        categories: {
            list: {
                frontEnd: '/service-proxy/buzz/categories',
                upstream: '/courses/categories'
            }
        },

        courseViews: {
            frontEnd: '/service-proxy/buzz/course-views/:category/:level/:lesson_id',
            upstream: '/course-views/:category/:level/:lesson_id'
        },

        quiz: {
            result: {
                frontEnd: '/service-proxy/buzz/quiz/result',
                upstream: {
                    save: '/quiz/save_result',
                    get: '/quiz/get_result'
                }
            },
            resultGroup: {
                frontEnd: '/service-proxy/buzz/quiz/result-group',
                upstream: {
                    save: '/quiz/save_result_group'
                }
            },
            vocabularyPerformance: {
                frontEnd: '/service-proxy/buzz/quiz/vocabulary',
                upstream: '/quiz/vocabulary/:member_id/:lesson_id'
            },
            quizPerformance: {
                frontEnd: '/service-proxy/buzz/quiz/daily-exercise',
                upstream: '/quiz/perf/:quiz_result_group_id'
            },
            lessonCount: {
                frontEnd: '/service-proxy/buzz/quiz/lesson-count',
                upstream: '/quiz-group/lesson-count'
            },
            limit: '/service-proxy/exercise/limit'
        },
        share: {
            myLink: '/service-proxy/share/my-link',
            Link: '/service-proxy/share/link'
        },
        progress: {
            statistics: {
                frontEnd: '/service-proxy/progress/data',
                upstream: '/v1/buzz/report/weekly_stat'
            }
        },
        weekly: {
            getScore: {
                frontEnd: '/service-proxy/weekly/score',
                upstream: '/weekly-quiz'
            }
        },
        picture: {
            upload: {
                frontEnd: '/service-proxy/picture/qiniu',
                bucket: '/buzz-resource'
            }
        },
        memberCourse: {
            count: {
                frontEnd: '/service-proxy/member-courses/count',
                upstream: '/member-lessons/count/:member_id'
            },
            save: {
                frontEnd: '/service-proxy/member-courses',
                upstream: '/member-lessons'
            }
        },
        memberPaidCourse: {
            get: {
                frontEnd: '/service-proxy/member-paid-courses',
                upstream: '/user-paid/course/:member_id'
            }
        },
        lessonVisited: {
            count: {
                frontEnd: '/service-proxy/lesson-members/count',
                upstream: '/lesson-members/:lesson_id'
            },
            save: {
                frontEnd: '/service-proxy/lesson-members',
                upstream: '/lesson-members/:lesson_id/:member_id'
            }
        },
        lessonGetTags: {
            get: {
                frontEnd: '/service-proxy/lesson-tags',
                upstream: '/lesson-tags/:lesson_id'
            }
        },
        userAccount: {
            get: {
                frontEnd: '/service-proxy/user-account',
                upstream: '/user-account/:member_id'
            }
        },
        survey: {
            get: {
                frontEnd: '/service-proxy/surveys',
                upstream: '/surveys/latest'
            },
            latest: {
                frontEnd: '/service-proxy/surveys/latest',
                upstream: '/surveys/latest'
            },
            answer: {
                frontEnd: '/service-proxy/survey/answer/callback',
                upstream: '/surveys/answers'
            },
            answerInBuzz: {
                frontEnd: '/service-proxy/survey/answer/in/buzz',
                upstream: '/surveys/answers/:short_id/:member_id'
            }
        }
    },
    wechat: {
        sign: { frontEnd: '/service-proxy/wechat/sign', upstream: '/sign/buzz' },

        surveyApi: {
            get: {
                frontEnd: '/service-proxy/member/survey-api',
                upstream: '/survey/url/:member_id/:short_id/:user/:test'
            }
        },

        surveyApiCallback: {
            get: {
                frontEnd: '/service-proxy/member/callback-api',
                upstream: '/survey/callback/url/:member_id/:short_id/:user/:callback/:redirect/:test'
            }
        },

        answerApi: {
            get: {
                frontEnd: '/service-proxy/member/answer-api',
                upstream: '/survey/answer/:member_id/:short_id/:user/:data_type'
            }
        }
    }
};