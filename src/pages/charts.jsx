import React from 'react';
import { legend } from 'dc';
import Chart from '../components/Chart';
import orgData from '../data/orgData.json';
import { metricColors } from './ASVis/SubcostCharts';
import { title, reduceSum } from './shared';

export const Year = (props) => (
  <Chart.row {...{
    chartTitle: 'Year',
    dimFunc: d => d.year,
    reduceSum,
    ordering: d => d.key,
    height: 200,
    title,
    ...props,
  }} />
);

export const Cohort = (props) => (
  <Chart.pie {...{
    chartTitle: 'Cohort',
    dimFunc: d => orgData[d.org].cohort,
    reduceFns: [
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
    ],
    height: 180,
    valueAccessor: d => Object.keys(d.value).length,
    ...props,
  }} />
);

export const Metric = (props) => (
  <Chart.row {...{
    chartTitle: 'Metric',
    dimFunc: d => d.type,
    reduceSum,
    height: 180,
    legend: legend().x(400).y(10).itemHeight(13).gap(5),
    colorCalculator: d => metricColors[d.key],
    title,
    ...props,
  }} />
);
