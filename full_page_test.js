"use strict";

var
	_ = require('lodash'),
	casper = require('casper').create(
		{ verbose: true, logLevel : "info" }
	),
	utils = require('utils'),
	fs = require('fs'),
	$ = require('jquery')
;


var str = JSON.stringify;

var url = "http://www.ekbvolley.com";
// url = "http://www.ekbvolley.com/#!-2015-2016--/cwov";
var crawl = _([
	{ id: 'cwov', name : '', suf:'#!-2015-2016--/cwov', tour : 11 },
	//{ id: 'pnis6', name : '' },
]);
/*
casper.start(url, function() {
	
	var data = this.getGlobal('publicModel');
	var ld = _(data.pageList.pages);

	crawl = crawl
		.map(function (pgd){
			var f = ld.find('pageId', pgd.id);
			if (f){
				pgd.url = f.urls[0];
				return pgd;
			} else {
				console.debug('INITIAL LOAD: not found:', pgd.id, _(pgd.name));
				return null;
			}
		})
		.compact();
});
*/

casper.start(url);

crawl.forEach( function crawlEach( c ){
	casper.thenOpen( url + c.suf , function crawEachThenOpen(re){
		var html = this.getPageContent();
		var b = $('<body/>').html(html).contents();

		console.log(str(b.find('span')));
	});
}).value();

casper.run(function(){
	casper.die('it is all!');
});

/*
casper.then( function x (){
	crawl.forEach(function forEachCrawl(x){
		casper.thenOpen( x.url, function openData(){
			var raw = this.getPageContent();
			var json = JSON.parse(raw);

			var textNodeId = _.get(json, 'structure.components[0].dataQuery');
			textNodeId = _.trimLeft(textNodeId, '#');

			console.log(textNodeId);
			if (! json) console.log('json');
			if (! json.data) console.log('json.data');
			if (! json.data[textNodeId]) console.log('json.data[textNodeId]');

			var text = json.data.document_data[textNodeId].text; // _.get(json, 'data.' + textNodeId + '.text')
			console.log('textnode id:', textNodeId);
			console.log('text:', text);

			//fs.write('text.log', text, 'w+');
			//this.log( text );
			//console.debug('json.data', utils.dump(json.data));

		});
	}).value();
});

casper.run();
*/