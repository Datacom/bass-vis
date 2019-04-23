import React, { Component } from 'react';
import { ButtonGroup, Button } from 'reactstrap';
import { format } from 'd3';
import orgData from '../../data/orgData.json';
import { subcostColors } from './charts';
import { orgColor } from './AgencyTitle';

const percentFormat = format('%');

const nestedReduce = (fields, subtract = false) => (p, v) => {
  fields.reduce((obj, field, i) => {
    const key = field(v);
    if(!obj[key]) obj[key] = (fields.length - 1 === i) ? 0 : {};

    if(fields.length - 1 === i) {
      obj[key] += subtract ? -v.value : v.value;
    }
    return obj[key];
  }, p);
  return p;
};

const accessors = [d => `${d.type},${d.metric}`, d => d.org];

export default class SubcostTitle extends Component {
  constructor(props) {
    super(props);

    this.state = { selected: 0 }
    this.groupAll = this.props.dimension.groupAll().reduce(
      nestedReduce(accessors),
      nestedReduce(accessors, true),
      () => ({}),
    );
    this.generateStops = this.generateStops.bind(this);
    window.groupAll = this.groupAll;
  }

  generateStops() {
    const output = {};
    const data = this.groupAll.value();

    Object.entries(data).forEach(([metric_subcost, obj]) => {
      const stops = [];
      if(this.state.selected === 0) {
        const [metric, subcost] = metric_subcost.split(',');
        const color = subcostColors[metric](subcost);
        stops.push({ color, start: 0, stop: 1 });
      } else {
        let total = 0;
        const vals = [];
        Object.entries(obj).forEach(([ org, val ]) => {
          vals.push({ org, val });
          total += val;
        });

        let start = 0;
        vals.forEach(({ org, val }) => {
          const stop = start + val / total;
          const color = orgColor(org);
          stops.push({ color, start, stop });
          start = stop;
        });
      }
      output[metric_subcost.split(',').join('_').replace(/[ (),]/g, '_')] = stops;
    })

    return output;
  }

  render() {
    const stopData = this.generateStops();
    return <>
      Subcosts
      <ButtonGroup size='sm'>
        {['Subcost', 'Agencies'].map((text, idx) => (
          <Button key={text} active={this.state.selected === idx} onClick={() => this.setState({ selected: idx })}>{text}</Button>
        ))}
      </ButtonGroup>
      <svg height={0} width={0}>
        <defs>
          {Object.entries(stopData).map(([ key, stops ]) => (
            <linearGradient id={key} key={key}>
              {stops.map(({ color, start, stop }) => (
                <>
                  <stop offset={percentFormat(start)} stopColor={color} stopOpacity={1} />
                  <stop offset={percentFormat(stop)} stopColor={color} stopOpacity={1} />
                </>
              ))}
            </linearGradient>
          ))}
        </defs>
      </svg>
    </>;
  }
}
