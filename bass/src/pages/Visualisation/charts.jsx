import React from 'react';
import { legend } from 'dc';
import Chart from '../../components/Chart';
import SplitChart from '../../components/SplitChart';
import orgData from '../../data/orgData.json';

export const Agencies = () => (
  <SplitChart
    chartTitle='Agencies (Total cost of A&S functions)'
    type='row'
    dimFunc={d => d.org}
    reduceSum={d => d.value}
    label={d => orgData[d.key].full_name}
    splitFn={d => orgData[d.key].cohort}
    groups={['Small', 'Medium', 'Large']}
    className='col'
    height={290}
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
  <Chart.pie chartTitle='Metric' dimFunc={d => d.type} reduceSum={d => d.value} legend={legend().x(400).y(10).itemHeight(13).gap(5)} height={180} {...props} />
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
