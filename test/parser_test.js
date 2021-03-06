/*
Sync volebo.net with ekbvolley.com

Copyright (C) 2016  Volebo <volebo.net@gmail.com>
Copyright (C) 2016  Koryukov Maksim <maxkoryukov@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the MIT License, attached to this software package.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

You should have received a copy of the MIT License along with this
program. If not, see <https://opensource.org/licenses/MIT>.

http://spdx.org/licenses/MIT
*/

'use strict';

const expect = require('chai').expect
const $      = require('cheerio')
const chai   = require('chai')

chai.use(require('chai-datetime'));

describe('parser', function() {

	describe('.parseLineWithResult', function () {

		const tests = [
			//04.12.2015. 20:00. УКС-ГРУПП — ИВРОМ ТРЕЙД  3:0  [УГМУ] СУДЬЯ: █ САУЛЯК А.В.
			{
				html : '<p class="font_8"><span style="font-size:14px;"><span style="font-size:14px;"><span style="text-decoration:underline;"><a dataquery="#textLink_ihyoear8"><span style="font-size:14px;"><span style="font-size:14px;"><span style="font-family: helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif;">04.12.2015. 20:00.&nbsp;</span><span style="font-family: helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif; font-weight: bold;">УКС-ГРУПП — <span style="font-weight:bold"><span style="font-weight:bold">ИВРОМ ТРЕЙД &nbsp;3:0</span></span></span><span style="font-family: helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif;"><span style="font-weight:bold;">&nbsp;&nbsp;</span>[</span><span style="font-family: helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif; font-weight: bold;"><span class="color_34">УГМУ</span></span><span style="font-family: helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif;">] СУДЬЯ: <span class="color_28">█&nbsp;</span>САУЛЯК А.В.</span></span></span></a></span></span></span></p>',
				dt : new Date(Date.UTC(2015, 11, 4, 15, 0, 0)),
				teamA : 'УКС-ГРУПП',
				teamB : 'ИВРОМ ТРЕЙД',
				referee : 'САУЛЯК А.В.',
				referee_note_exists : true,
				link_id : 'textLink_ihyoear8',
			},

			// 10.10.2015. 18:00. ЛОКОМОТИВ ИЗУМРУД - ЛИЦЕЙ № 180 — К ТЕЛЕКОМ  1:3  [ГАГАРИНА, 30] СУДЬЯ: САУЛЯК А.В.
			{
				html : '<p class="font_8"><span style="text-decoration:underline;"><a dataquery="#textLink_ih5tbxew"><span style="font-family: helvetica-w01-roman,helvetica-w02-roman,helvetica-lt-w10-roman,sans-serif; font-size: 14px;">10.10.2015. 18:00.&nbsp;</span><span style="font-weight:bold;">ЛОКОМОТИВ ИЗУМРУД&nbsp;-&nbsp;ЛИЦЕЙ № 180</span><span style="font-family: helvetica-w01-roman,helvetica-w02-roman,helvetica-lt-w10-roman,sans-serif; font-size: 14px; font-weight: bold;"> — </span><span style="font-weight:bold;">К ТЕЛЕКОМ &nbsp;1:3</span><span style="font-family: helvetica-w01-roman,helvetica-w02-roman,helvetica-lt-w10-roman,sans-serif; font-size: 14px;">&nbsp; [</span><span style="font-family: helvetica-w01-roman,helvetica-w02-roman,helvetica-lt-w10-roman,sans-serif; font-size: 14px; font-weight: bold;"><span class="color_34">ГАГАРИНА, 30</span></span><span style="font-family: helvetica-w01-roman,helvetica-w02-roman,helvetica-lt-w10-roman,sans-serif; font-size: 14px;">] СУДЬЯ: </span>САУЛЯК А.В.</a></span></p>',
				dt : new Date(Date.UTC(2015, 9, 10, 13, 0, 0)),
				teamA : 'ЛОКОМОТИВ ИЗУМРУД - ЛИЦЕЙ № 180',
				teamB : 'К ТЕЛЕКОМ',
				referee : 'САУЛЯК А.В.',
				referee_note_exists : false,
				link_id : 'textLink_ih5tbxew'
			},

			//
			// 21.12.2015. 20:00. УРГУПС-1 [F] — ЕТТУ-1 [F]  3:0  [УРГУПС] СУДЬЯ: БОВДУЙ А.В.
			{
				html : '<p class="font_8">21.12.2015. 20:00. <span style="font-weight:bold;">УРГУПС-1<span style="font-weight:bold">&nbsp;[F] </span>— <span style="font-weight:bold"><span style="font-weight:bold"><span style="font-weight:bold"><span style="font-weight:bold"><span style="font-weight:bold">ЕТТУ-1&nbsp;<span style="font-weight:bold">[F] &nbsp;3:0</span></span></span></span></span></span>&nbsp;&nbsp;</span>[<span style="font-weight:bold;"><span class="color_34">УРГУПС</span></span>] СУДЬЯ: БОВДУЙ А.В.</p>',
				dt : new Date(Date.UTC(2015, 11, 21, 15, 0, 0)),
				teamA : 'УРГУПС-1 [F]',
				teamB : 'ЕТТУ-1 [F]',
				referee : 'БОВДУЙ А.В.',
				referee_note_exists : false,
				link_id : null
			},
		];

		tests.forEach( function(data){

			const state = { mode : 'played', played : [] };
			const parser = require('../parser.js');

			const html = $('<p/>').html(data.html);

			const x = parser.parseLineWithResult(state, html);

			it('should not be an error', function () {
				expect(x).to.not.have.property('error');
			});
			it('should has teamA', function () {
				expect(x).to.have.property('teamA').to.equal(data.teamA);
			});
			it('should has teamB', function () {
				expect(x).to.have.property('teamB').to.equal(data.teamB);
			});
			it('should gather date', function () {
				expect(x).to.have.property('dt').to.equalDate(data.dt).to.equalTime(data.dt);
			});
			it('should contain referee', function () {
				expect(x).to.have.property('referee').to.equal(data.referee);
			});
			it('should contain referee_note_exists', function () {
				expect(x).to.have.property('referee_note_exists').to.equal(data.referee_note_exists);
			});
			it('should contain data link', function () {
				expect(x).to.have.property('links').to.be.a('array');
				expect(x.links).to.have.length.above(0);
				expect(x.links[0]).to.have.property('id', data.link_id);
			});

		});

	});


	describe('.parseLineWithCancel', function () {

		const tests = [
			// 11.11.2015. 19:30. УРГЮУ — ЕТТУ-1 [F]  [ГИМНАЗИЯ № 47] СУДЬЯ: КОПЕЛЕВ Б.И. (ОТМЕНЕНА)
			{
				html : '<p class="font_8"><span class="color_17">11.11.2015. 19:30. <span style="font-weight:bold;">УРГЮУ — <span style="font-weight:bold"><span style="font-weight:bold"><span style="font-weight:bold">ЕТТУ-1&nbsp;<span style="font-weight:bold">[F]</span></span></span></span></span>&nbsp; [<span style="font-weight:bold;">ГИМНАЗИЯ № 47</span>] СУДЬЯ: КОПЕЛЕВ Б.И. (ОТМЕНЕНА)</span></p>',
				dt : new Date(Date.UTC(2015, 10, 11, 14, 30, 0)),
				teamA : 'УРГЮУ',
			},
		];

		tests.forEach( function(data){

			const state = { mode : 'cancelled', cancelled : [] };
			const parser = require('../parser.js');

			const html = $('<p/>').html(data.html);

			const x = parser.parseLineWithCancel(state, html);

			it('should not be an error', function () {
				expect(x).to.not.have.property('error');
			});
			it('should has teamA', function () {
				expect(x).to.have.property('teamA').to.equal(data.teamA);
			});
			it('should gather date', function () {
				expect(x).to.have.property('dt').to.equalDate(data.dt).to.equalTime(data.dt);
			});

		});

	});


	describe('.parseScore', function () {

		const parser = require('../parser.js');

		[null, '', 'a:b', '5:'].forEach( function(data){
			const x = parser.parseScore(data);

			it('shoud return null (format mismatch)', function () {
				expect(x).to.be.null;
			});
		});

		const tests = [
			{
				str : '1  : 0',
				s : [1, 0]
			},
			{
				str : '5:2',
				s : [5, 2]
			},
			{
				str : '3:1',
				s : [3, 1]
			},
			{
				str : '2:3',
				s : [2, 3]
			},
		];

		tests.forEach( function(data){
			const x = parser.parseScore(data.str);

			it('should not be an error', function () {
				expect(x).to.not.have.property('error');
			});
			it('should has teamA', function () {
				expect(x).to.be.a('array');
			});

			it('is of two elements', function() {
				expect(x).to.have.length(2);
			});

			it('correct score', function() {
				expect(x).to.eql(data.s);
			});
		});

	});
});
