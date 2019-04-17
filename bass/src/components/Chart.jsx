import React, { Component, createRef } from 'react';
import dc from 'dc';
import { format } from 'd3';
import { useCrossfilter } from './Crossfilter';

class Chart extends Component {
  constructor(props) {
    super(props);

    this.ele = createRef();
  }

  componentDidMount() {
    const { dimFunc, reduceSum, reduceFns, ndx, i, type, ...options } = this.props;
    this.chart = dc[`${type}Chart`](this.ele.current);

    this.dimension = ndx.dimension(dimFunc);
    this.group = this.dimension.group();

    if(reduceSum) {
      this.group = this.group.reduceSum(reduceSum);
    }
    if(reduceFns) {
      this.group = this.group.reduce.apply(null, reduceFns);
    }

    this.chart.options({
      dimension: this.dimension,
      group: this.group,
      elasticX: true,
      elasticY: true,
      ...options,
    })

    if(this.props.type === 'row') {
      this.chart.margins({ ...this.chart.margins(), left: 10, right: 10, top: 0 })
      this.chart.xAxis().ticks(4).tickFormat(d => format('$.2s')(d).replace(/G/, 'B'));
    }
    this.chart.render();
    // TODO: add props/options
    // TODO: load data async, maybe data/crossfilter loader utilising suspense.
  }

  componentDidUpdate() {
    // update options
    // TODO: change chart type
    // this.chart.redraw();
  }

  componentWillUnmount() {
    // dc.chartRegistry.deregister(this.chart);
  }

  render() {
    return <div ref={this.ele} />;
  }
}

const ConnectedChart = (props) => {
  const context = useCrossfilter();
  return <Chart {...context} {...props} />
}

export default new Proxy(ConnectedChart, {
  get: function(Component, type) {
    return (props) => <Component {...{ type }} {...props} />
  }
});
