import React from 'react';
import { legend } from 'dc';
import Chart from '../components/Chart';
import orgData from '../data/orgData.json';
import { metricColors } from './ASVis/SubcostCharts';

export const Year = (props) => (
  <Chart.row chartTitle='Year' dimFunc={d => d.year} reduceSum={d => d.value} ordering={d => d.key} {...props} height={200} />
);

export const Cohort = (props) => (<Chart.pie
  chartTitle='Cohort'
  height={180}
  dimFunc={d => orgData[d.org].cohort}
  reduceFns={[
    (p, v) => {
      p[v.org] = (p[v.org] || 0) + 1;
      return p;
    },
    (p, v) => {
      p[v.org] = (p[v.org] || 0) - 1;
      if(p[v.org] === 0) delete p[v.org];
      return p;
    },
    () => ({}),
  ]}
  valueAccessor={d => Object.keys(d.value).length}
   {...props}
/>);

export const Metric = (props) => (
  <Chart.pie colorCalculator={d => metricColors[d.key]} chartTitle='Metric' dimFunc={d => d.type} reduceSum={d => d.value} legend={legend().x(400).y(10).itemHeight(13).gap(5)} height={180} {...props} />
);
