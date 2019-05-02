import React, { Component, createRef } from 'react';
import dc from 'dc';
import { Button } from 'reactstrap';
import { useCrossfilter } from './Crossfilter';
import { roundedMoneyFormat } from '../pages/shared';

export class Chart extends Component {
  constructor(props) {
    super(props);

    this.ele = createRef();
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    const { dimension, group, dimFunc, reduceSum, reduceFns, ndx, i, type, on, ...options } = this.props;
    this.chart = dc[`${type}Chart`](this.ele.current);

    this.dimension = dimension || ndx.dimension(dimFunc);
    this.group = group || this.dimension.group();

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
      width: (ele) => ele.offsetWidth - 35,
      ...options,
    })

    Object.entries(on || {}).forEach(([key, func]) => this.chart.on(key, func));

    if(this.props.type === 'row') {
      this.chart.margins({ ...this.chart.margins(), left: 10, right: 10, top: 0 })
      this.chart.xAxis().ticks(4).tickFormat(roundedMoneyFormat);
    }
    this.chart.render();
    this.chart.turnOffControls();
    // TODO: add props/options
    // TODO: load data async, maybe data/crossfilter loader utilising suspense.
  }

  reset() {
    this.chart.filterAll().redrawGroup();
  }

  componentDidUpdate() {
    // update options
    // TODO: change chart type
    // this.chart.redraw();
  }

  componentWillUnmount() {
    dc.chartRegistry.deregister(this.chart);
    // TODO: derigster dim maybe
  }

  render() {
    return <div ref={this.ele} className={this.props.className}>
      <legend>{this.props.chartTitle || 'Title'} {this.props.reset !== false && <Button size='sm' onClick={this.reset} className='reset'>Reset</Button>}</legend>
    </div>;
  }
}

const CrossfilterChart = (props) => {
  const context = useCrossfilter();
  return <Chart {...context} {...props} />
}

export default new Proxy(CrossfilterChart, {
  get: function(Component, type) {
    return (props) => <Component {...{ type }} {...props} />
  }
});
