var Graphic;

Graphic = (function ($, d3, undefined) {
	var entries 	= [],
		categories 	= [], // Coding, reading, exercising

	drawContribGraph = function(data){
		var width = 700,
				squareSize = 40;

		var yAxis = d3.scale.ordinal()
			.domain(['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'])
			.range([0,6]);


		var chart = d3.select('#contrib-chart')
			.attr('width', width)
			.attr('height', function(){ return (squareSize * 7) + 6; });

		var legend = chart
			.append("g")
			.attr("class", "legend")
			.selectAll('text')
			.data(yAxis.domain().slice())
					.enter()
					.append("text")
					.text(function(d){ return d; })
					.attr("transform", function(d, i) { return "translate(0," + ((i+1) * squareSize + 20) + ")"; });

		/**
		Need to nest the data into weeks (0-6)
			d3.nest()
				.key(function(d) { return d.status; })
				.entries(csv_data);
		**/



		var bar = chart.selectAll("g")
			.data(yAxis.domain())
				.enter().append("g")
				.attr("transform", function(d, i) { return "translate(25," + i * squareSize + ")"; });

		bar.selectAll("rect")
				.data(function(d){ return data; })
			.enter().append("rect")
				.attr('x', function(d, i){ return i * squareSize })
				.attr('width', squareSize)
				.attr('height', squareSize)
				.style('fill', '#aaa')
				.style('stroke', '#fff')
				.style('stroke-width', '1');

	},

	drawBarGraph = function(data){
		var width = 1000,
    		barHeight = 20;

    var x = d3.scale.linear()
    			.domain([0, d3.max(data, function(d) {
						if (d.data === 'No entries'){ return 0; }
						return d3.sum(d.data.map(function(e){ return e.valueInMinutes; }));
					})])
    			.range([0,width - 300]);

		var color = d3.scale.ordinal()
			.domain(categories)
		    .range(["#556270", "#4ECDC4", "#C7F464", "#FF6B6B", "#C44D58", "#d0743c", "#ff8c00"]);

    var chart = d3.select("#bar-chart")
    	    .attr("width", width)
    	    .attr("height", barHeight * data.length);

    	data.forEach(function(date){
    		if (date.data.length < 1) { return; }

    		// Iterate throught each day adding the total minutes to each entry
    		var baseMin = 0;
    		date.data.forEach(function(entry){
    			entry.xVal = baseMin += entry.valueInMinutes;
    		});

    	});

    var bar = chart.selectAll("g")
    	    .data(data)
    	  .enter().append("g")
    	    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

		bar.selectAll("rect")
      	.data(function(d) { return d.data; })
    	.enter().append("rect")
				.attr('x', function(d){ return 60 + x(d.xVal - d.valueInMinutes); })
				.attr('width', function(d){ return x(d.valueInMinutes); })
				.attr('height', barHeight - 1)
				.style('fill', function(d, index){ return color(d.subject); })

		bar.append("text")
    	      .attr("x", 0)
    	      .attr("y", barHeight / 2)
    	      .attr("dy", ".35em")
    	      .text(function(d) { return d.date; });

		bar.append("text")
					.attr("x", 800)
					.attr("y", barHeight / 2)
					.attr("dy", ".35em")
					.text(function(d) {
						var time;
						if (d.data === 'No entries'){
							time = 0;
						} else {
								time = d3.sum(d.data.map(function(e){ return e.valueInMinutes; }));
						}
						return time + " min";
					});

    var legend = chart.selectAll(".legend")
    	      .data(color.domain().slice().reverse())
    	    .enter().append("g")
    	      .attr("class", "legend")
    	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
    	      .attr("x", width - 18)
    	      .attr("width", 18)
    	      .attr("height", 18)
    	      .style("fill", color);

    legend.append("text")
    	      .attr("x", width - 24)
    	      .attr("y", 9)
    	      .attr("dy", ".35em")
    	      .style("text-anchor", "end")
    	      .text(function(d) { return d; });
	},

	init = function(){
		$.getJSON('/database.json', function(json){

			entries = json.groupedByDay;
			categories = json.stats.subjects;
			drawBarGraph(entries);
			drawContribGraph(entries);
		});
	};

	init();

})(window.jQuery, window.d3);
