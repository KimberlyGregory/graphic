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
    d3.select('#dailyViz').append('tr')
      .selectAll('tr')
        .data(dates)
      .enter().append('td')
        .text(function(d){ return d3.time.format("%m-%d")(new Date(d)); }).
        attr('class', 'mark');


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
