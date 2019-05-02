import React from 'react';
import SplitChart from '../../components/SplitChart';
import orgData from '../../data/orgData.json';
import AgencyTitle from './AgencyTitle';
import { disableElasticOnPreRedraw, reduceSum, title } from '../shared';

const Agencies = () => (
  <SplitChart
    {...{
      chartTitle: <AgencyTitle />,
      dimFunc: d => d.org,
      reduceSum,
      splitFn: d => orgData[d.key].cohort,
      groups: ['Small', 'Medium', 'Large'],
      className: 'col',
      type: 'row',
      label: d => orgData[d.key].full_name,
      title,
      height: 270,
      colorCalculator: (d) => `url(#${d.key.replace(/ /g, '_')})`,
      on: {
        'preRedraw.disableElastic': disableElasticOnPreRedraw,
      }
    }}
  />
);
export default Agencies;
