var Graphic = (function($, d3, undefined){

  var days = ['day1', 'day2', 'day3'],
      data,



  init = function () {
    window.data = getData();
    graph();
  },


  graph = function(){
    d3.select('#dailyViz')
      .style('background-color','#eee');
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
