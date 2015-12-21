queue()
  .defer(d3.json, "data/main_data.json")
  .defer(d3.json, "data/fte_expenditure_data.json")
  .await(showCharts);

function showCharts(error, main_data, fte_expenditure_data) {
  console.log(error);

  data = d3.nest()
    .key(function(d) {return [d.agency_name, d.year];})
    .rollup(function(values) {
      ict = d3.nest().key(function(d) {
        return d.metric;
      }).rollup(function(d) {
        return d[0].val;
      }).map(values);
      fte_exp = fte_expenditure_data.filter(function(d) {return d.agency_name===values[0].agency_name && d.year===values[0].year;})[0];
      return {
        ict: ict,
        fte: fte_exp.fte,
        expenditure: fte_exp.expenditure
      };
    })
    .map(main_data.filter(function(d) {
      return d.subcost_type === "ICT";
    }));

  ndx = new crossfilter(d3.entries(data));


  yearDim = ndx.dimension(function(d) {return d.key.split(',')[1];});
  year_chart = dc.barChart('#year')
    .dimension(yearDim)
    .group(yearDim.group())
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .transitionDuration(200)
    .height(250)
    .elasticX(false)
    .elasticY(true)
    .centerBar(false)
    .brushOn(false);
  year_chart.on('postRender.year', function(chart){
      chart.filter(2014);
      quartile_scale.calcData();
      dc.redrawAll();
      chart.selectAll('rect.bar').on('click.singleFiler', function(d,i){
        year_chart.filterAll();
        year_chart.filter(d.data.key);
        quartile_scale.calcData();
        quartile_scale.calcData();
        dc.redrawAll();
      });
  });
  agencyColors = d3.scale.ordinal().range(["#ff00ff", "#b3ff00", "#ff6420", "#56adff", "#ff77d0", "#1cff2a", "#3cffff", "#ff77ff", "#ffff00", "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#156a60", "#600060", "#8a240b", "#8a2b4a", "#1f3e5d", "#00607c", "#9f6000", "#0a5e0f", "#602b60"]).domain(["Department of Building and Housing", "Ministry for Culture and Heritage", "Ministry for the Environment", "Ministry of Fisheries", "Ministry of Transport", "New Zealand Tourism Board", "State Services Commission", "Te Puni Kokiri", "The Treasury", "Department of Conservation", "Department of Internal Affairs", "Department of Labour", "Land Information New Zealand", "Ministry for Primary Industries", "Ministry of Economic Development", "Ministry of Foreign Affairs and Trade", "Ministry of Health", "New Zealand Customs Service", "New Zealand Trade and Enterprise", "New Zealand Transport Agency", "Statistics New Zealand", "Department of Corrections", "Inland Revenue", "Ministry of Business Innovation and Employment", "Ministry of Education", "Ministry of Justice", "Ministry of Social Development", "New Zealand Defence Force", "New Zealand Fire Service Commission", "New Zealand Police"]);
  agency_scale = d3.scale.ordinal().range([0,1,2]);
  agency_dimension = ndx.dimension(function(d) {return d.key.split(',')[0];});
  agency_group = agency_dimension.group();
  agency_group.oldAll = agency_group.all;
  agency_group.all = function() {
    return this.oldAll().filter(function(d) {return d.value>0;});
  };
  function sortBy(func) {
    return function(a,b) {
      return d3.ascending(func(a), func(b));
    };
  }
  quartile_sorting_functions = d3.scale.ordinal().range([
    function(d) {
      return d3.entries(d.value[0].ict).reduce(function(prev,cur) {return prev+cur.value;},0);
    },
    function(d) {
      return d.value[0].ict["Outsourced costs"];
    }
  ]).domain(['total_ict', 'outsourcing']);
  quartile_scale = (function() {
    var scale = function(agency) {
      var idx = scale.data.indexOf(agency);
      return idx===-1? -1:scale.quartile_scale(idx);
    };
    scale.quartile_scale = d3.scale.linear().range([0,0,1,1,2,2]).domain([0,100]);
    scale.data = [];
    scale.calcData = function() {
      scale.data = super_scatter.data().sort(
        sortBy(quartile_sorting_functions($('#agency input:radio:checked').val()))
      ).map(dc.pluck('key'));
      var lq = scale.data.length/4;
      var uq = 3*scale.data.length/4;
      // console.log(0,lq,lq,uq,scale.data.length);
      scale.quartile_scale = scale.quartile_scale.domain([0,lq,lq,uq,uq,scale.data.length]);
    };
    return scale;
  })();
  $('#agency input:radio').on('change', function() {
    quartile_scale.calcData();
    agency_charts.apply(function(chart) {
      chart.redraw();
    });
  });
  agency_charts = splitRowChart([
    '#smallAgencies',
    '#mediumAgencies',
    '#largeAgencies'
  ], function(d) {
    if(d.value===1) {
      return quartile_scale(d.key);
    } else return agency_scale(d.key);
  }, '#agencyReset').options({
    dimension: agency_dimension,
    group: agency_group,
    colors: agencyColors,
    height: 250,
    elasticX: true,
    title: function(d) {return d.key;},
    ordering: function(d) {return quartile_scale.data.indexOf(d.key);}
  }).apply(function(chart, idx) {
    chart.xAxis().ticks(0);
  });


  super_scatter = (function(eleId,labels,variables,formats,initialElements) {
      var chart = dc.bubbleChart(eleId);
      var dim = ndx.dimension(function(d) {return d.key.split(',')[0];});
      var group = dim.group().reduce(
        function(p,v) {
          p.push(v.value);
          return p;
        },
        function(p,v) {
          return p.filter(function(ele) {return ele!==v.value;});
        },
        function() {
          return [];
        }
      );
      var selectedElements = initialElements; //currently selected options from the dropDowns;
      var selects = chart.root().selectAll('select');

      selects.selectAll('option')
        .data(labels)
        .enter()
        .append('option')
        .html(function(d) {return d;})
        .attr('selected',function(_,optionI,selectI) {return optionI==selectI || null;});

      selects.on('change',function(){
        selectedElements[selects[0].indexOf(this)] = this.selectedIndex;
        chart.x(d3.scale.linear());
        chart.y(d3.scale.linear());
        chart.redraw();
        chart._brushing();
        chart.redrawGroup();
      });

      chart
        .dimension(dim)
        .group(group)
        .data(function(group) {return group.all().filter(function(d) {return d.value.length!==0;});})
        .x(d3.scale.linear())
        .y(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .height(500)
        .xAxisLabel(function() {return labels[selectedElements[0]];})
        .keyAccessor(function(d) {return variables[selectedElements[0]](d);})
        .yAxisLabel(function() {return labels[selectedElements[1]];})
        .valueAccessor(function(d) {return variables[selectedElements[1]](d);})
        .minRadius(2.5)
        .radiusValueAccessor(function(d) { return 1; })
        .colors(agencyColors)
        .colorAccessor(function(d) {return d.key.split(',')[0];})
        .label(function() {return undefined;})
        .title(function(d) {
          return d.key.split(',')[0]+
          "\n\n"+chart.xAxisLabel()()+": "+chart.xAxis().tickFormat()(chart.keyAccessor()(d))+
          "\n"+chart.yAxisLabel()()+": "+chart.yAxis().tickFormat()(chart.valueAccessor()(d));
        })
        .margins({top: 10, right: 50, bottom: 50, left: 70})
        .on('pretransition', function(chart) {
          chart.svg().select('.chart-body').attr('clip-path', null);
        });

      chart.xAxis().tickFormat(function(d) {return d3.format(formats[selectedElements[0]])(d);});
      chart.yAxis().tickFormat(function(d) {return d3.format(formats[selectedElements[1]])(d);});

      return chart;
    })("#super_scatterplot",
      ["Total ICT Costs","Outsourced ICT","FTE","Total Agency Expenditure"],
      [
        function(d) {return d3.entries(d.value[0].ict).reduce(function(prev,cur) {return prev+cur.value;},0);},
        function(d) {return d.value[0].ict["Outsourced costs"];},
        function(d) {return d.value[0].fte;},
        function(d) {return d.value[0].expenditure;},
      ],
      ['s','$s','$s','$s'],
      [0,1]
    );
  dc.disableTransitions = true;
  dc.renderAll();
  dc.disableTransitions = false;
}
