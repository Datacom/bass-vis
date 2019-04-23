import React, { Component, Fragment } from 'react';
import { ButtonGroup, Button } from 'reactstrap';
import { format, interpolateSpectral, scaleOrdinal, color } from 'd3';
import orgData from '../../data/orgData.json';
import { metricColors, subcostColors } from './SubcostCharts';

const percentFormat = format('%');

const nestedReduce = (fields, subtract = false) => (p, v) => {
  fields.reduce((obj, field, i) => {
    const key = v[field];
    if(!obj[key]) obj[key] = (fields.length - 1 === i) ? 0 : {};

    if(fields.length - 1 === i) {
      obj[key] += subtract ? -v.value : v.value;
    }
    return obj[key];
  }, p);
  return p;
};

const mediumColors = Array.apply(null, {length: 12}).map(Number.call, Number).map(d => d/11).map(interpolateSpectral);
const nineColors = Array.apply(null, {length: 9}).map(Number.call, Number).map(d => d/8).map(interpolateSpectral);
const smallColors = nineColors.map(color).map(c => c.brighter(0.75).toString()).reverse();
const largeColors = nineColors.map(color).map(c => c.darker(2).toString()).reverse();

const orgByCohortColors = {
  Small: scaleOrdinal(smallColors),
  Medium: scaleOrdinal(mediumColors),
  Large: scaleOrdinal(largeColors),
}

export const orgColor = (org) => orgByCohortColors[orgData[org].cohort](org);

const accessors = ['org', 'type', 'metric'];

export default class AgencyTitle extends Component {
  constructor(props) {
    super(props);

    this.state = { selected: 0 }
    this.groupAll = this.props.dimension.groupAll().reduce(
      nestedReduce(accessors),
      nestedReduce(accessors, true),
      () => ({}),
    );
    this.generateStops = this.generateStops.bind(this);
  }

  generateStops() {
    const output = {};

    const data = this.groupAll.value();
    Object.entries(data).forEach(([org, obj]) => {
      const stops = [];
      if(this.state.selected === 0) {
        const color = orgColor(org);
        stops.push({ color, start: 0, stop: 1 });
      } else {
        let total = 0;
        const vals = [];
        Object.entries(obj).forEach(([ metric, obj ]) => {
          if(this.state.selected === 1) {
            const val = Object.values(obj).reduce((prev, cur) => prev + cur, 0);
            vals.push({ metric, val });
            total += val;
          } else {
            Object.entries(obj).forEach(([ subcost, val ]) => {
              vals.push({ metric, subcost, val });
              total += val;
            });
          }
        });

        let start = 0;
        vals.forEach(({ metric, subcost, val }) => {
          const stop = start + val / total;
          const color = (!subcost) ? metricColors[metric] : subcostColors[metric](subcost);
          stops.push({ color, start, stop });
          start = stop;
        });
      }
      output[org] = stops;
    })

    return output;
  }

  render() {
    const orgStops = this.generateStops();
    return <>
      Agencies (Total cost of A&S functions)
      <ButtonGroup size='sm'>
        {['Agency', 'Metric', 'Subcosts'].map((text, idx) => (
          <Button key={text} active={this.state.selected === idx} onClick={() => this.setState({ selected: idx })}>{text}</Button>
        ))}
      </ButtonGroup>
      <svg height={0} width={0}>
        <defs>
          {Object.entries(orgStops).map(([ org, stops ]) => (
            <linearGradient id={org.replace(/ /g, '_')} key={org}>
              {stops.map(({ color, start, stop }, idx) => (
                <Fragment key={idx}>
                  <stop offset={percentFormat(start)} stopColor={color} stopOpacity={1} />
                  <stop offset={percentFormat(stop)} stopColor={color} stopOpacity={1} />
                </Fragment>
              ))}
            </linearGradient>
          ))}
        </defs>
      </svg>
    </>;
  }
}
