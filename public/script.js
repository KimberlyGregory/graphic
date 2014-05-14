var Graphic;

Graphic = (function ($, d3, undefined) {
	var entries 	= [],
		categories 	= [], // Coding, reading, exercising


	drawGraph = function(data){
		var width = 1000,
    		barHeight = 20;
		
    		console.log(data);


    	var x = d3.scale.linear()
    			.domain([0, d3.max(data, function(d) { return d.valueInMinutes; })])
    			.range([0,width]);

    	var chart = d3.select("#bar-chart")
    	    .attr("width", width)
    	    .attr("height", barHeight * data.length);

    	var bar = chart.selectAll("g")
    	    .data(data)
    	  .enter().append("g")
    	    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });


    	bar.append("rect")
    	    .attr("width", function(d){ return x(d.valueInMinutes) ; })
    	    .attr("height", barHeight - 1)
    	    .style({fill: '#aaa'});

    	bar.append("text")
    	      .attr("x", 5)
    	      .attr("y", barHeight / 2)
    	      .attr("dy", ".35em")
    	      .text(function(d) { return d.valueInMinutes + " min on "  + d.cleanDate; });
	},

	init = function(){
		$.getJSON('/database.json', function(json){
			entries = json.entries;
			categories = json.stats.subjects;
			drawGraph(entries);
		});

		
	};

	init();

	return {
		init: init
	};


})(window.jQuery, window.d3);
