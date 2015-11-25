function splitChart(chartType, anchors, dataInWhichChart, reset_id) {
  function filter_other_charts(chart) {
    var filters = chart.filters();
    charts.forEach(function(chart) {
      chart.on('filtered.filter_other_charts');
      chart.filterAll();
      filters.forEach(function(filter) {
        chart.filter(filter);
      });
    });
    hasFilters = filters.length !== 0;
    d3.selectAll(reset_id).classed("hidden", !hasFilters);
    dim.filter(function(d) { return !hasFilters || filters.indexOf(d)!=-1;});
    dc.redrawAll();
    charts.forEach(function(chart) {
      chart.on('filtered.filter_other_charts', filter_other_charts);
    });
  }
  var filter = true;
  var charts = anchors.map(function(anchor, index) {
    var chart = chartType(anchor)
    .data(function(group) {
      var data = group.all();
      return data.filter(function(d) {
        return dataInWhichChart(d)==index;
      });
    });
    return chart;
  });

  d3.selectAll(reset_id).on('click',function() {charts[0].filterAll();});

  var dim;
  charts.options = function(options) {
    dim = options.dimension;
    this.forEach(function(chart) {
      chart.options(options);
    });
    return this;
  };
  charts.apply = function(chartFunc) {
    this.forEach(chartFunc);
    return this;
  };
  charts.setOnFiltered = function(bool) {
    this.forEach(function(chart) {
      chart.on('filtered.filter_other_charts', bool? filter_other_charts : undefined);
    });
    hasFilters = charts[0].filters().length !== 0;
    d3.selectAll(reset_id).classed("hidden", !hasFilters);
  };
  return charts;
}

function splitRowChart(anchors, dataInWhichChart, reset_id) {
  return splitChart(dc.rowChart, anchors, dataInWhichChart, reset_id);
}
