var Graphic;

Graphic = (function ($, d3, undefined) {
	var entries 	= [],
		categories 	= [], // Coding, reading, exercising


	init = function(){
		$.getJSON('/database.json', function(json){
			entries = json.entries;
			categories = json.stats.subjects;

		});
	};

	init();

	return {
		init: init
	};


})(window.jQuery, window.d3);