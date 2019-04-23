import React from 'react';
import SplitChart from '../../components/SplitChart';
import orgData from '../../data/orgData.json';
import AgencyTitle from './AgencyTitle';

const Agencies = () => (
  <SplitChart
    chartTitle={<AgencyTitle />}
    type='row'
    dimFunc={d => d.org}
    reduceSum={d => d.value}
    label={d => orgData[d.key].full_name}
    splitFn={d => orgData[d.key].cohort}
    groups={['Small', 'Medium', 'Large']}
    className='col'
    height={270}
    colorCalculator={(d) => `url(#${d.key.replace(/ /g, '_')})`}
    on={{
      'preRedraw.disableElastic': chart => {
        const total = chart.data().map(d => d.value).reduce((prev, cur) => prev + cur, 0);
        // Disable elastic x if chart is empty, to prevent centering of graph
        chart.elasticX(total !== 0);
      }
    }}
  />
);
export default Agencies;
