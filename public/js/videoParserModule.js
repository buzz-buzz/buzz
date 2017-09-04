angular.module('videoParserModule', [])
    .factory('timeHelper', function () {
        function convertSecondsToHHMMSS(seconds) {
            var t = new Date(1970, 0, 1);
            t.setMilliseconds(seconds * 1000);
            var h = t.getHours();
            var m = t.getMinutes();
            if (m < 10) {
                m = '0' + m;
            }
            var s = t.getSeconds();
            if (s < 10) {
                s = '0' + s;
            }

            var ms = t.getMilliseconds();
            if (ms < 10) {
                ms = '0' + ms;
            }

            return h + ':' + m + ':' + s + '.' + ms;
        }

        function convertHHMMSSToSeconds(time) {
            var parts = time.split(':');
            var s = parts[parts.length - 1];
            var m = parts[parts.length - 2];
            var h = parts[parts.length - 3];

            return Number(h) * 3600 + Number(m) * 60 + Number(s);
        }

        function convertHHMMSSToMilliSeconds(time) {
            return convertHHMMSSToSeconds(time) * 1000;
        }

        return {
            convertSecondsToHHMMSS: convertSecondsToHHMMSS,
            convertHHMMSSToSeconds: convertHHMMSSToSeconds,
            convertHHMMSSToMilliSeconds: convertHHMMSSToMilliSeconds
        };
    })
    .value('generateParse', function (parser) {
        return function (json) {
            if (!json.version) {
                return parser.parseV1(json);
            }

            if (json.version[0] === '2') {
                return parser.parseV2(json);
            }

            throw new Error('unsupported ' + json.type + ' version "' + json.version + '" for now!');
        };
    })
    .factory('subTitleParser', ['generateParse', 'timeHelper', function (generateParse, timeHelper) {
        var parser = {
            parseV1: function (subtitles) {
                var events = subtitles.split('[Events]');
                if (events.length < 2) {
                    throw new Error('subtitle not found from source!\n' + subtitles);
                }

                var dialogues = events[1].split(/[\r\n]/).filter(function (d) {
                    return d && d.indexOf('Format') < 0 && d.trim() !== '';
                });

                var res = [];
                for (var i = 0; i < dialogues.length; i++) {
                    var dialogue = dialogues[i];
                    var structure = dialogue.replace(/^Dialogue:\s*/, '').split(',');
                    res.push({
                        layer: structure[0],
                        startTime: structure[1],
                        endTime: structure[2],
                        style: structure[3],
                        name: structure[4],
                        marginL: structure[5],
                        marginR: structure[6],
                        marginV: structure[7],
                        effect: structure[8],
                        text: structure.slice(9).join(', '),
                        startTimeStamp: timeHelper.convertHHMMSSToMilliSeconds(structure[1]),
                        endTimeStamp: timeHelper.convertHHMMSSToMilliSeconds(structure[2]),
                        startSecond: timeHelper.convertHHMMSSToSeconds(structure[1]),
                        endSecond: timeHelper.convertHHMMSSToSeconds(structure[2])
                    });
                }

                return res;
            },

            parseV2: function () {
                return '';
            },

            findSubtitleBySecond: function (subtitles, second) {
                if (!subtitles) {
                    return null;
                }

                for (var i = 0; i < subtitles.length; i++) {
                    var s = subtitles[i];

                    if (second >= s.startSecond && second <= s.endSecond) {
                        return s;
                    }
                }

                return null;
            }
        };

        parser.parse = generateParse(parser);

        return parser;
    }]);