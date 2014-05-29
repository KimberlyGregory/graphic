var Graphic;

Graphic = (function ($, d3, undefined) {
	var entries 	= [],
		categories 	= [], // Coding, reading, exercising


	drawGraph = function(data){
		var width = 1000,
    		barHeight = 20;

    	var x = d3.scale.linear()
    			.domain([0, d3.max(data, function(d) {
						if (d.data === 'No entries'){ return 0; }
						return d3.sum(d.data.map(function(e){ return e.valueInMinutes; }));
					})])
    			.range([0,width]);

    	var chart = d3.select("#bar-chart")
    	    .attr("width", width)
    	    .attr("height", barHeight * data.length);

    	var bar = chart.selectAll("g")
    	    .data(data)
    	  .enter().append("g")
    	    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

			bar.selectAll("rect")
      	.data(function(d) { return d.data; })
    	.enter().append("rect")
				.attr('width', function(d){ console.log(d); return d.valueInMinutes; })
				.attr('height', barHeight - 1)
				.style('fill', function(d, index){ console.log(index); return '#'+ index +'aa'; });

			bar.append("text")
    	      .attr("x", 5)
    	      .attr("y", barHeight / 2)
    	      .attr("dy", ".35em")
    	      .text(function(d) {
							var time;
							if (d.data === 'No entries'){
								time = 0;
							} else {
									time = d3.sum(d.data.map(function(e){ return e.valueInMinutes; }));
							}
							return time + " min on "  + d.date;
						});
	},

	init = function(){
		$.getJSON('/database.json', function(json){

			entries = json.groupedByDay;
			categories = json.stats.subjects;
			drawGraph(entries);
		});
	};

	init();

})(window.jQuery, window.d3);
