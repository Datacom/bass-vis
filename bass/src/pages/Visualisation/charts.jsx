import React from 'react';
import Chart from '../../components/Chart';
import orgData from '../../data/orgData.json';

export const YearChart = () => (
  <Chart.row dimFunc={d => d.year} reduceSum={d => d.value} ordering={d => d.key} />
);

export const CohortChart = () => (<Chart.pie
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
/>);
