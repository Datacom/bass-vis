import React from 'react';
import { legend } from 'dc';
import { scaleOrdinal } from 'd3';
import Chart from '../../components/Chart';
import SplitChart from '../../components/SplitChart';
import orgData from '../../data/orgData.json';
import AgencyTitle from './AgencyTitle';

export const metricColors = { HR: "#2ca02c", FIN: "#ff7f0e", PR: "#9467bd", ICT: "#d62728", CES: "#1f77b4" };

export const subcostColors = {
  HR: scaleOrdinal(["#78c679", "#41ab5d", "#238443", "#006837"]),
  FIN: scaleOrdinal(["#fec44f", "#fe9929", "#ec7014", "#cc4c02"]),
  PR: scaleOrdinal(["#9e9ac8", "#807dba", "#6a51a3", "#54278f"]),
  ICT: scaleOrdinal(["#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]),
  CES: scaleOrdinal(["#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"])
};

export const Agencies = () => (
  <SplitChart
    chartTitle={<AgencyTitle />}
    type='row'
    dimFunc={d => d.org}
    reduceSum={d => d.value}
    label={d => orgData[d.key].full_name}
    splitFn={d => orgData[d.key].cohort}
    groups={['Small', 'Medium', 'Large']}
    className='col'
    height={290}
    colorCalculator={(d) => `url(#${d.key.replace(/ /g, '_')})`}
  />
);

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

export const Subcosts = () => (
  <SplitChart
    chartTitle='Subcosts'
    type='row'
    dimFunc={d => [d.type, d.metric]}
    reduceSum={d => d.value}
    splitFn={d => d.key[0]}
    label={d => d.key[1]}
    className='col'
    groups={['HR', 'FIN', 'PR', 'ICT', 'CES']}
    classNames={['col-4', 'col-4', 'col-4', 'col-6', 'col-6']}
    heights={[ 170, 170, 170, 210, 210 ]}
    chartTitles={[ 'HR', 'Finance', 'Procurement', 'ICT', 'CES' ].map(prefix => `${prefix} Subcosts`)}
  />
);
