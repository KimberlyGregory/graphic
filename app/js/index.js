var Graphic = (function($, d3, undefined){

  var days = ['day1', 'day2', 'day3'],



  init = function () {
    var data = getData();
    var dates = generateDates();
    graph(dates, data);
  },


  generateDates = function(){
    var d, dates = [];
    // var format = d3.time.format("%m-%d");
    for (var i = 20 - 1; i >= 0; i--) {
      d = new Date();

      dates.push(d.setDate(d.getDate() - i));
    };
    console.log(dates);
    return dates;
  },

  graph = function(dates){
    d3.select('#dailyViz').append('svg').attr("width", 1000).attr("height", 200)
    .selectAll('g')
    .data(d3.range(0,90)).enter()
      .append('rect')
      .attr('fill', '#eee')
      .attr('width', 20)
      .attr('height', 20)
      .attr('x', function(d, i){ return (i % 40) * 20 + 20 })
      .attr('y', function (d, i) { return Math.floor(i / 40) * 20})
      .attr('stroke', '#222').text( function(d, i){ return i; });
  },

  getData = function(){
    var collection = [];

    $.each(days, function(index, value){
      $.getJSON('/data/'+value+'.json', function(data){
        collection[index] = data;
      });
    });

    return collection;
  };

  init();


})(window.jQuery, window.d3);
