import React, { Component } from 'react';
import { Row } from 'reactstrap';
import { Chart } from './Chart';
import { useCrossfilter } from './Crossfilter';

// TODO: Show filters on each chart
class SplitChart extends Component {
  constructor(props) {
    super(props);

    const { dimFunc, reduceSum, reduceFns, ndx } = this.props;

    this.dimension = ndx.dimension(dimFunc);
    window.dimension = this.dimension;
    this.group = this.dimension.group();
    this.charts = [];

    if(reduceSum) {
      this.group = this.group.reduceSum(reduceSum);
    }
    if(reduceFns) {
      this.group = this.group.reduce.apply(null, reduceFns);
    }

    this.filterOtherCharts = this.filterOtherCharts.bind(this);
    this.filteringOtherCharts = false;
  }

  filterOtherCharts(chart, i) {
    if(this.filteringOtherCharts) return;
    this.filteringOtherCharts = true;

    const filters = chart.filters();
    const otherCharts = this.charts.filter((d, idx) => idx !== i);

    otherCharts.forEach(chart => {
      const chartFilters = chart.filters();

      const toApply = filters.filter(filter => chartFilters.indexOf(filter) === -1);
      const toRemove = chartFilters.filter(filter => filters.indexOf(filter) === -1);

      [...toApply, ...toRemove].forEach(val => chart.filter(val));
    });
    this.filteringOtherCharts = false;
  }

  static defaultProps = {
    classNames: [],
    heights: [],
    chartTitles: [],
  };

  render() {
    const { chartTitle, className, dimFunc, reduceSum, reduceFns, ndx, groups, splitFn, classNames, height, heights, chartTitles, ...props } = this.props;
    return <div className={className}>
      <legend>{chartTitle}</legend>
      <Row>
        {groups.map((key, i) => (
          <Chart
            key={key}
            chartTitle={chartTitles[i] || key}
            dimension={this.dimension}
            group={this.group}
            ref={d => {
              if(!this.charts[i]) {
                this.charts[i] = d.chart;
              }
            }}
            on={{
              'filtered.test': (chart) => this.filterOtherCharts(chart, i),
            }}
            data={group => {
              return group.all().filter(d => splitFn(d) === key);
            }}
            {...props}
            className={classNames[i] || className}
            height={heights[i] || height}
          />
        ))}
      </Row>
    </div>;
  }
}

const CrossfilterSplitChart = (props) => {
  const context = useCrossfilter();
  return <SplitChart {...context} {...props} />
}

export default CrossfilterSplitChart;
