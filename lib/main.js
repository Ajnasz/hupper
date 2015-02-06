/*jshint moz:true*/
/*global require*/
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
	include: '*.hup.lh',
	onAttach: function (worker) {
		'use strict';
		console.log('on attach');

		worker.port.emit('getComments');
		worker.port.on('gotComments', function (comments) {
			console.log('comments', comments);

			worker.port.emit('setNew', comments.filter(function (comment) {
				return comment.isNew;
			}));
		});
	},
	contentScriptFile: [
		self.data.url('jquery-2.1.3.min.js'),
		self.data.url('rq.js'),
		self.data.url('comments.js'),
		self.data.url('hupper.js')
	]
});
