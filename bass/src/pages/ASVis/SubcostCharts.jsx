import React from 'react';
import { scaleOrdinal } from 'd3';
import SplitChart from '../../components/SplitChart';
import SubcostTitle from './SubcostTitle';
import { disableElasticOnPreRedraw, reduceSum, title } from '../shared';

export const metricColors = { HR: "#2ca02c", FIN: "#ff7f0e", PR: "#9467bd", ICT: "#d62728", CES: "#1f77b4" };

export const subcostColors = {
  HR: scaleOrdinal(["#78c679", "#41ab5d", "#238443", "#006837"]),
  FIN: scaleOrdinal(["#fec44f", "#fe9929", "#ec7014", "#cc4c02"]),
  PR: scaleOrdinal(["#9e9ac8", "#807dba", "#6a51a3", "#54278f"]),
  ICT: scaleOrdinal(["#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]),
  CES: scaleOrdinal(["#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"])
};

const Subcosts = () => (
  <SplitChart
    {...{
      chartTitle: <SubcostTitle />,
      dimFunc: d => [d.type, d.metric],
      reduceSum,
      splitFn: d => d.key[0],
      groups: ['HR', 'FIN', 'PR', 'ICT', 'CES'],
      className: 'col',
      classNames: ['col-4', 'col-4', 'col-4', 'col-6', 'col-6'],
      type: 'row',
      chartTitles: [ 'HR', 'Finance', 'Procurement', 'ICT', 'CES' ].map(prefix => `${prefix} Subcosts`),
      label: d => d.key[1],
      title,
      heights: [ 170, 170, 170, 210, 210 ],
      colorCalculator: (d) => `url(#${d.key[0]}_${d.key[1].replace(/[ (),]/g, '_')})`,
      on: {
        'preRedraw.disableElastic': disableElasticOnPreRedraw,
      }
    }}
  />
);
export default Subcosts;
