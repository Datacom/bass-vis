$(function() {
  $('#theme-toggle input').change(function() {
    var checked = $(this).prop('checked');
    localStorage.setItem('theme', checked? 'light':'dark');
    setTheme(checked);
  });

  theme = localStorage.getItem('theme');
  if(theme==="dark") {
    $('#theme-toggle input').bootstrapToggle('off');
  }

  function setTheme(lightTheme) {
    $('body').attr('id',lightTheme?'':'dark');
    $('.navbar').addClass(lightTheme? 'navbar-default':'navbar-inverse')
                .removeClass(lightTheme? 'navbar-inverse':'navbar-default');
  }
});

(function() {
  // Change D3's SI prefix to more business friendly units
  //      K = thousands
  //      M = millions
  //      B = billions
  //      T = trillion
  //      P = quadrillion
  //      E = quintillion
  // small decimals are handled with e-n formatting.
  var d3_formatPrefixes = ["e-24","e-21","e-18","e-15","e-12","e-9","e-6","e-3","","K","M","B","T","P","E","Z","Y"].map(d3_formatPrefix);

  // Override d3's formatPrefix function
  d3.formatPrefix = function(value, precision) {
      var i = 0;
      if (value) {
          if (value < 0) {
              value *= -1;
          }
          if (precision) {
              value = d3.round(value, d3_format_precision(value, precision));
          }
          i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
          i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
      }
      return d3_formatPrefixes[8 + i / 3];
  };

  function d3_formatPrefix(d, i) {
      var k = Math.pow(10, Math.abs(8 - i) * 3);
      return {
          scale: i > 8 ? function(d) { return d / k; } : function(d) { return d * k; },
          symbol: d
      };
  }

  function d3_format_precision(x, p) {
      return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
})();

queue()
  .defer(d3.json, "data/main_data.json")
  .defer(d3.json, "data/fte_expenditure_data.json")
  .await(showCharts);

function generateGradiantId(data_key) {
  return data_key.replace(/ /g, '_');
}

function addOrUpdateGradiant(chart, gradId, stops) {
  var defs = chart.svg().select('defs');
  if (defs.size() === 0) {
    defs = chart.svg().append('defs');
  }

  var linearGradient = document.getElementById(gradId);
  if (linearGradient === null) {
    linearGradient = defs.append('linearGradient').attr({
      id: gradId
    });
  } else {
    linearGradient = d3.select(linearGradient);
  }
  var stop_eles = linearGradient.selectAll('stop').data(stops);
  stop_eles.enter().append('stop').attr({
    "offset": dc.pluck("offset"),
    "stop-color": dc.pluck("stop-color"),
    "stop-opacity": 1
  });

  stop_eles.transition().duration(chart.transitionDuration()).attr({
    "offset": dc.pluck("offset"),
    "stop-color": dc.pluck("stop-color"),
    "stop-opacity": 1
  });

  stop_eles.exit().transition().duration(chart.transitionDuration()).attr({
    "offset": function(d) {
      return (Number(d.offset.slice(0, -1)) < 50) ? "0%" : "100%";
    }
  }).remove();
}

function populateStopsFromData(data, colors) {
  var total = 0;
  var percents = data.filter(function(d) {
    return d.value !== 0;
  }).map(function(d) {
    var prev_total = total;
    total += d.value;
    return {
      key: d.key,
      start: function() {
        return prev_total / total;
      },
      end: function() {
        return (prev_total + d.value) / total;
      }
    };
  });

  var stops = [];
  percents.forEach(function(d) {
    stops.push({
      "stop-color": colors(d.key),
      offset: d3.format("%")(d.start())
    });
    stops.push({
      "stop-color": colors(d.key),
      offset: d3.format("%")(d.end())
    });
  });
  return stops;
}

function generateSubcostId(key) {
  return (key.split(' ')[0].slice(1, -1) + "_" + key.split('] ')[1].replace(
    /[\(\),]/g, '').replace(/ /g, '_')).toLowerCase();
}

function nestedReduceDataCount(data) {
  return Object.keys(data).reduce(function(prev, key) {
    if(typeof data[key]==="function") {
      return prev + data[key]();
    } else return prev + data[key];
  }, 0);
}
function nestedReduceInitial() {
  return function() {
    return nestedReduceDataCount(this.value);
  };
}
function nestedReduceAdd() {
  var nested_key_depth = arguments.length;
  var nested_keys = [];
  for(var i=0; i<nested_key_depth; i++) {
    nested_keys.push(arguments[i]);
  }
  return function(p,v) {
    nested_keys.reduce(function(p, key, i) {
      if(i==nested_key_depth-1) {
        p[v[key]] = (p[v[key]] || 0)+v.val;
      } else {
        if(typeof p[v[key]] !== "function") {
          p[v[key]] = function() {
            return nestedReduceDataCount(typeof this === "function"? p[v[key]] : this.value);
          };
        }
      }
      return p[v[key]];
    }, p);
    return p;
  };
}
function nestedReduceSubtract() {
  var nested_key_depth = arguments.length;
  var nested_keys = [];
  for(var i=0; i<nested_key_depth; i++) {
    nested_keys.push(arguments[i]);
  }
  return function(p,v) {
    nested_keys.reduce(function(p, key, i) {
      if(i==nested_key_depth-1) {
        p[v[key]] -= v.val;
      }
      return p[v[key]];
    }, p);
    return p;
  };
}

function showCharts(error, main_data, fte_expenditure_data) {
  console.log(error);

  var metric_key = {
    '37': 'HR',
    '126': 'Finance',
    '212': 'ICT',
    '687': 'Procurement',
    '765': 'CES'
  };
  var cohorts = _.chain(main_data).groupBy('agency_name').mapObject(
    function(d) {
      var cohorts = _.chain(d).pluck('cohort').uniq().value();
      if (cohort.length > 1) throw 'this agency has multiple cohorts';
      return cohorts[0];
    }
  ).value();
  var cohortToIndex = {
    small: 0,
    medium: 1,
    large: 2
  };

  ndx = new crossfilter(main_data);

  dc.dataCount('#resetAll').options({
    dimension: ndx,
    group: ndx.groupAll(),
    html: {
      some: '<a href=\'javascript:dc.filterAll(); dc.redrawAll();\'\'>Reset All</a>',
      all: ' '
    }
  });

  var agency_colors = d3.scale.ordinal().range([
    "#ff00ff", /*"#00ffff",*/ "#b3ff00", "#ff6420", "#56adff", "#ff77d0",
    "#1cff2a", "#3cffff", "#ff77ff", "#ffff00", "#3366cc", "#dc3912",
    "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00",
    "#b82e2e", "#316395", "#994499", "#22aa99", "#156a60", "#600060",
    "#8a240b", "#8a2b4a", "#1f3e5d", "#00607c", "#9f6000", "#0a5e0f",
    "#602b60"
  ]);

  agency_dimension = ndx.dimension(dc.pluck('agency_name'));
  agency_group = agency_dimension.group()
                                 .reduce(nestedReduceAdd('subcost_type','metric'),
                                         nestedReduceSubtract('subcost_type','metric'),
                                         nestedReduceInitial);

  $('#agency input:radio').on('change', function() {
    agency_charts.apply(function(chart) {
      chart.redraw();
    });
  });
  agency_charts = splitRowChart([
    '#smallAgencies',
    '#mediumAgencies',
    '#largeAgencies'
  ], function(d) {
    return cohortToIndex[cohorts[d.key]];
  }, '#agencyReset').options({
    dimension: agency_dimension,
    group: agency_group,
    height: 315,
    elasticX: true,
    title: function(d) {
      var output = d.key + ": " + d3.format("$,")(d.value());
      var selected = $('#agency input:radio:checked').val();
      if(selected !== 'Agency') {
        var initial_length = output.length;
        output += "\n";
        var total = d.value();
        var data;
        if(selected === 'Metrics') {
          data = d3.entries(d.value).sort(function(a,b) {
            return d3.descending(a.value(), b.value());
          }).forEach(function(d) {
            if(d.value()>0) {
              var info = d.key+": "+d3.format("%")(d.value()/total);
              output += "\n"+info+" ("+d3.format("$s.g")(d.value())+")";
            }
          });
        } else if(selected === 'Subcosts') {
          var other = 0;
          data = d3.entries(d.value).map(function(d) {
            var subcost = d.key;
            return d3.entries(d.value).map(function(d) {
              d.key = "["+subcost+"] "+d.key;
              return d;
            });
          }).reduce(function(prev,cur) {return prev.concat(cur);}).sort(function(a,b) {
            return d3.descending(a.value, b.value);
          }).forEach(function(d, i) {
            if(d.value>0) {
              var info = d.key+": "+d3.format("%")(d.value/total);
              info = info.replace(/ \([a-zA-Z 0-9\/]*\)/g,'');
              if(i<5) output += "\n"+info+" ("+d3.format("$s.g")(d.value)+")";
              else other += d.value;
            }
          });
          if(other > 0) {
            output += "\n\nOther: "+d3.format("%")(other/total)+" ("+d3.format("$s.g")(other)+")";
          }
        }
      }
      return output;
    },
    colorCalculator: function(d) {
      return 'url(#' + generateGradiantId(d.key) + ')';
    },
    valueAccessor: function(d) {return d.value();}
  }).apply(function(chart, i) {
    chart.xAxis().tickFormat(d3.format("$s"));
    chart.colors(agency_colors);
    chart.on('pretransition', function(chart) {
      var selected = $('#agency input:radio:checked').val();

      chart.svg().selectAll('g.row').each(function(d) {
        if (d !== undefined) {
          chart.svg().selectAll('g.row text').attr({
            style: function(d) {
              var c = agency_colors(d.key);
              return "text-shadow: 0 0 1px black, 0 0 2px " + c + ", 0 0 3px black, 0 0 4px " + c + ";";
            }
          });

          var stops;
          if (selected == "Agency") {
            stops = [{
              "stop-color": agency_colors(d.key),
              offset: '0%'
            }, {
              "stop-color": agency_colors(d.key),
              offset: '100%'
            }];
          } else {
            var data;
            var colors;
            if (selected == "Metrics") {
              data = d3.entries(d.value).map(function(d) {
                d.value = d.value();
                return d;
              }).sort(function(a, b) {
                return subcostTypeToIndex["["+a.key+"]"] - subcostTypeToIndex["["+b.key+"]"];
              });
              colors = metric_colors;

            } else if (selected == "Subcosts") {
              data = d3.entries(d.value).sort(function(a, b) {
                return subcostTypeToIndex["["+a.key+"]"] - subcostTypeToIndex["["+b.key+"]"];
              }).map(function(d) {
                var subcost = d.key;
                return d3.entries(d.value).sort(function(a, b) {
                  return d3.ascending(a.key, b.key);
                }).map(function(d) {
                  d.key = "["+subcost+"] "+d.key;
                  return d;
                });
              }).reduce(function(prev,cur) {return prev.concat(cur);});
              colors = function(d) {
                var idx = subcostTypeToIndex[d.split(' ')[0]];
                return subcost_colors[idx](d);
              };
            }
            stops = populateStopsFromData(data, colors);
          }
          addOrUpdateGradiant(chart, generateGradiantId(d.key), stops);
        }
      });
    });
  });

  cohort_dim = ndx.dimension(dc.pluck('cohort'));
  cohort_group = cohort_dim.group().reduce(
    function(p, v) {
      p[v.agency_name] = (p[v.agency_name] || 0) + 1;
      return p;
    },
    function(p, v) {
      p[v.agency_name] = p[v.agency_name] - 1;
      if (p[v.agency_name] === 0) delete p[v.agency_name];
      return p;
    },
    function() {
      return {};
    }
  );
  cohort_chart = dc.pieChart("#cohort").options({
    dimension: cohort_dim,
    group: cohort_group,
    height: 150,
    colors: d3.scale.ordinal().range([
      '#777', '#aaa', '#ddd'
    ]),
    valueAccessor: function(d) {
      return Object.keys(d.value).length;
    }
  });

  year_dim = ndx.dimension(dc.pluck("year"));
  year_group = year_dim.group().reduceSum(dc.pluck('val'));
  year_chart = dc.pieChart("#year").options({
    dimension: year_dim,
    group: year_group,
    height: 150,
    title: function(d) {
      return d.key + ": " + d3.format("$,")(d.value);
    }
  });

  metric_colors = d3.scale.ordinal().range(
    ["#2ca02c", "#ff7f0e", "#9467bd", "#d62728", "#1f77b4"]
  );
  metric_dim = ndx.dimension(dc.pluck("subcost_type"));
  metric_group = metric_dim.group().reduceSum(dc.pluck('val'));
  metric_chart = dc.pieChart("#metric").options({
    dimension: metric_dim,
    group: metric_group,
    height: 200,
    title: function(d) { return d.key + ": " + d3.format("$,")(d.value); },
    legend: dc.legend().x(400).y(10).itemHeight(13).gap(5),
    cx: 215,
    colors: metric_colors,
    ordering: function(d) { return subcostTypeToIndex["["+d.key+"]"]; }
  }).on('pretransition', function(chart) {
    chart.svg().selectAll('.dc-legend-item').classed('disabled', function(d) {return d.data===0;});
  });

  var subcost_colors = [
    d3.scale.ordinal().range(["#78c679", "#41ab5d", "#238443", "#006837"]),
    d3.scale.ordinal().range(["#fec44f", "#fe9929", "#ec7014", "#cc4c02"]),
    d3.scale.ordinal().range(["#9e9ac8", "#807dba", "#6a51a3", "#54278f"]),
    d3.scale.ordinal().range(["#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]),
    d3.scale.ordinal().range(["#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"])
  ];
  $('#subcosts input:radio').on('change', function() {
    subcost_charts.apply(function(chart) {
      chart.redraw();
    });
  });

  var subcost_dim = ndx.dimension(function(d) {
    return "[" + d.subcost_type + "] " + d.metric;
  });
  var subcost_group = subcost_dim.group()
                                 .reduce(nestedReduceAdd('agency_name'),
                                         nestedReduceSubtract('agency_name'),
                                         nestedReduceInitial);
  var subcostTypeToIndex = {
    "[HR]": 0,
    "[Finance]": 1,
    "[Procurement]": 2,
    "[ICT]": 3,
    "[CES]": 4
  };
  var subcost_charts = splitRowChart(['#hr_subcosts', '#finance_subcosts', '#procurement_subcosts', '#ict_subcosts', '#ces_subcosts'],
      function(d) {
        return subcostTypeToIndex[d.key.split(" ")[0]];
      },
      '#subcostReset').options({
      dimension: subcost_dim,
      group: subcost_group,
      elasticX: true,
      valueAccessor: function(d) {return d.value();},
      label: function(d) {
        return d.key.split(" ").slice(1).join(" ");
      },
      title: function(d) {
        var output = d.key + ": " + d3.format("$,")(d.value());
        var selected = $('#subcosts input:radio:checked').val();
        if(selected === "Agencies") {
          output += "\n";
          var other = 0;
          var total = d.value();
          d3.entries(d.value).sort(function(a,b) {
            return d3.descending(a.value, b.value);
          }).forEach(function(d,i) {
            if(d.value > 0) {
              var info = d.key+": "+d3.format("%")(d.value/total);
              if(i<5) output += "\n"+info+" ("+d3.format("$s.g")(d.value)+")";
              else other += d.value;
            }
          });
          if(other > 0) {
            output += "\n\nOther: "+d3.format("%")(other/total)+" ("+d3.format("$s.g")(other)+")";
          }
        }
        return output;
      },
      colorCalculator: function(d) {
        return 'url(#' + generateSubcostId(d.key) + ')';
      }
    })
    .apply(function(chart, i) {
      chart.xAxis().tickFormat(d3.format("$s"));
      chart.height(i < 3 ? 170 : 210);
      if (i < 3) chart.xAxis().ticks(5);
      chart.colors(subcost_colors[i]);

      chart.on('pretransition', function(chart) {
        var selected = $('#subcosts input:radio:checked').val();
        chart.svg().selectAll('g.row').each(function(d) {
          if (d !== undefined) {
            chart.svg().selectAll('g.row text').attr({
              style: function(d) {
                var c = subcost_colors[i](d.key);
                return "text-shadow: 0 0 1px black, 0 0 2px " + c + ", 0 0 3px black, 0 0 4px " + c + ";";
              }
            });
            var stops;
            if (selected == "Subcost") {
              stops = [{
                "stop-color": subcost_colors[i](d.key),
                offset: '0%'
              }, {
                "stop-color": subcost_colors[i](d.key),
                offset: '100%'
              }];
            } else if (selected == "Agencies") {
              stops = populateStopsFromData(
                d3.entries(d.value).sort(function(a,b) {
                  var cohortIdxA = cohortToIndex[cohorts[a.key]];
                  var cohortIdxB = cohortToIndex[cohorts[b.key]];
                  if(cohortIdxA==cohortIdxB) {
                    //they're in the same cohort so sort alphbettically
                    return d3.ascending(a.key, b.key);
                  } else return d3.ascending(cohortIdxA, cohortIdxB);
                }),
                agency_colors
              );
            }
            addOrUpdateGradiant(chart,generateSubcostId(d.key),stops);
          }
        });
      });
    });

  ndx2 = new crossfilter(fte_expenditure_data);

  scatter_dim = ndx2.dimension(dc.pluck('agency_name'));
  scatter_group = scatter_dim.group().reduce(
    function(p,v) {
      p.fte += v.fte;
      p.expenditure += v.expenditure;
      return p;
    },
    function(p,v) {
      p.fte -= v.fte;
      p.expenditure -= v.expenditure;
      return p;
    },
    function() {
      return {
        fte: 0,
        expenditure: 0
      };
    }
  );
  scatter_group.all();
  scatter_charts = splitChart(dc.bubbleChart,
    [
      '#smallAgenciesScatter',
      '#mediumAgenciesScatter',
      '#largeAgenciesScatter'
    ], function(d) {
      return cohortToIndex[cohorts[d.key]];
    }, '#scatterReset').options({
      dimension: scatter_dim,
      group: scatter_group,
      x: d3.scale.linear(),
      elasticX: true,
      y: d3.scale.linear(),
      elasticY: true,
      keyAccessor: function(d) {return d.value.expenditure;},
      valueAccessor: function(d) {return Number(d.value.fte.toFixed(2));},
      colorAccessor: function(d) {return d.key;},
      radiusValueAccessor: function(d) { return 2.5; },
      margins: {top: 10, right: 50, bottom: 30, left: 50},
      colors: agency_colors,
      height: 250,
      clipPadding: 10,
      symbolSize: 8,
      title: function(d) {
        return d.key+"\n\n"+
                "Total Organisational FTE: "+d3.format('.2f')(d.value.fte)+"\n"+
                "Total Expenditure: "+d3.format('$,')(d.value.expenditure);
      },
      label: function() {return undefined;}
    }).apply(function(chart) {
      chart.MIN_RADIUS = 2.5;
      chart.xAxis().tickFormat(d3.format("$s"));
      chart.xAxis().ticks(8);
      chart.on('pretransition', function(chart) {
        var nodes = chart.svg().selectAll('.node').filter(function(d) {
          return d.value.expenditure===0 && Number(d.value.fte.toFixed(2))===0;
        });
        nodes.remove();
      });
    });


  agency_dim = ndx.dimension(dc.pluck('agency_name'));
  var filtering_agency = false;
  [
    {chart: year_chart, dim: ndx2.dimension(dc.pluck('year'))},
    {chart: cohort_chart, dim: ndx2.dimension(
      function(d) {return cohorts[d.agency_name];}
    )},
    {chart: agency_charts, dim: scatter_charts},
    {chart: scatter_charts, dim: agency_charts}
  ].forEach(function(obj) {
    function onFiltered(chart) {
      var filters = chart.filters();
      obj.dim.filterAll();
      if(filters.length>0) {
        obj.dim.filterFunction(function(d) {
          return filters.indexOf(d) !== -1;
        });
      }
    }
    if(obj.chart.__dcFlag__ !== undefined) {
      obj.chart.on('filtered', onFiltered);
    } else if(Array.isArray(obj.chart) && Array.isArray(obj.dim)) {
      obj.chart[0].on('filtered', function(chart) {
        if(!filtering_agency) {
          filtering_agency = !filtering_agency;
          var other_chart = obj.dim[0];
          _(other_chart.filters()).difference(chart.filters()).concat(
            _(chart.filters()).difference(other_chart.filters())
          ).forEach(function(filter) {
            other_chart.filter(filter);
          });
          filtering_agency = !filtering_agency;
        }
      });
    } else throw 'Unexpected Execution Path';
  });

  dc.disableTransitions = true;
  dc.renderAll();
  agency_charts.setOnFiltered(true);
  subcost_charts.setOnFiltered(true);
  scatter_charts.setOnFiltered(true);

  dc.override(dc, 'filterAll', function() {
    agency_charts.setOnFiltered(false);
    subcost_charts.setOnFiltered(false);
    scatter_charts.setOnFiltered(false);
    this._filterAll();
    agency_charts.setOnFiltered(true);
    subcost_charts.setOnFiltered(true);
    scatter_charts.setOnFiltered(true);
  });
  dc.disableTransitions = false;
}
