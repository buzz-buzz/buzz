'use strict';

describe('video parser module', function () {
    var subTitleParser;
    var timeHelper;

    beforeEach(angular.mock.module('videoParserModule'));
    beforeEach(inject(function (_subTitleParser_, _timeHelper_) {
        subTitleParser = _subTitleParser_;
        timeHelper = _timeHelper_;
    }));

    it('converts time', function () {
        expect(timeHelper.convertHHMMSSToMilliSeconds('00:00:00')).toBe(0);
        expect(timeHelper.convertHHMMSSToMilliSeconds('00:00:01')).toBe(1000);
    });

    it('parses subtitle', function () {
        var gaokaoAss = '[Script Info]\r\n\
;SrtEdit 6.3.2012.1001\r\n\
;Copyright(C) 2005-2012 Yuan Weiguo\r\n\
\r\n\
Title: \r\n\
Original Script: \r\n\
Original Translation: \r\n\
Original Timing: \r\n\
Original Editing: \r\n\
Script Updated By: \r\n\
Update Details: \r\n\
ScriptType: v4.00+\r\n\
Collisions: Reverse\r\n\
PlayResX: 384\r\n\
PlayResY: 288\r\n\
Timer: 100.0000\r\n\
Synch Point: 1\r\n\
WrapStyle: 0\r\n\
ScaledBorderAndShadow: no\r\n\
\r\n\
[V4+ Styles]\r\n\
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\r\n\
Style: Default,微软雅黑,21,&H00FFFFFF,&HF0000000,&H006C3300,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,5,5,5,134\r\n\
\r\n\
[Events]\r\n\
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\r\n\
Dialogue: 0,0:00:13.00,0:00:15.00,Default,,0000,0000,0000,,Today’s news is about Gao Kao. \r\n\
Dialogue: 0,0:00:17.00,0:00:21.00,Default,,0000,0000,0000,,Nowadays Chinese students have a lot of stress.\r\n\
Dialogue: 0,0:00:22.00,0:00:34.00,Default,,0000,0000,0000,,Piles of homework, never-ending weekend classes, competitive exams, and no doubt the gaokao leads to enormous pressure for Chinese students to succeed.\r\n\
Dialogue: 0,0:00:35.00,0:00:39.00,Default,,0000,0000,0000,,What do you suggest to relieve all of that stress?\r\n\
Dialogue: 0,0:00:40.00,0:00:43.00,Default,,0000,0000,0000,,I personally like drawing, and walking in nature.\r\n\
Dialogue: 0,0:00:44.00,0:00:47.00,Default,,0000,0000,0000,,But there are also other ways to relieve stress. \r\n\
Dialogue: 0,0:00:48.00,0:00:54.00,Default,,0000,0000,0000,,This year, Chinese students are again getting creative with their stress relief methods.\r\n\
Dialogue: 0,0:01:21.00,0:01:27.00,Default,,0000,0000,0000,,I already heard from the news how Chinese students are taking creative graduation photos. \r\n\
Dialogue: 0,0:01:29.00,0:01:33.00,Default,,0000,0000,0000,,How are students being creative with stress relief? \r\n\
Dialogue: 0,0:01:35.00,0:01:38.00,Default,,0000,0000,0000,,Well, my favorite way is balloon-stomping.\r\n\
Dialogue: 0,0:01:39.00,0:01:44.00,Default,,0000,0000,0000,,Students in Hefei, Anhui stomped balloons before taking the gaokao. \r\n\
Dialogue: 0,0:01:45.00,0:01:50.00,Default,,0000,0000,0000,,The excitement surely made them forget about the difficulty of the exam.\r\n\
Dialogue: 0,0:01:57.00,0:02:03.00,Default,,0000,0000,0000,,That’s a great way! Were they allowed to stomp the balloons at school?\r\n\
Dialogue: 0,0:02:04.00,0:02:10.00,Default,,0000,0000,0000,,Yes. As a matter of fact, most of these stress-relief methods require the school’s support. \r\n\
Dialogue: 0,0:02:12.00,0:02:22.00,Default,,0000,0000,0000,,For example, students sitting the gaokao at a school in Hengshui, Hebei all received ten yuan before taking each test. \r\n\
Dialogue: 0,0:02:23.00,0:02:24.00,Default,,0000,0000,0000,,That’s very generous!\r\n\
Dialogue: 0,0:02:25.00,0:02:34.00,Default,,0000,0000,0000,,There are also other ways, such as massages at school, and student-teacher activities on the sports field.\r\n\
Dialogue: 0,0:02:35.00,0:02:37.00,Default,,0000,0000,0000,,It all sounds like a lot of fun!\r\n\
   \r\n\
\r\n\
';

        var subtitles = subTitleParser.parse(gaokaoAss);
        expect(subtitles instanceof Array).toBeTruthy();
        expect(subtitles.length > 0).toBeTruthy();
    });
});