import { format } from 'd3';

export const moneyFormat = format('$,');
export const roundedMoneyFormat = d => format('$.2s')(d).replace(/G/, 'B');
export const title = (d) => `${d.key}: ${moneyFormat(d.value)}`;
export const reduceSum = d => d.value;

export const disableElasticOnPreRedraw = chart => {
  const total = chart.data().map(d => d.value).reduce((prev, cur) => prev + cur, 0);
  // Disable elastic x if chart is empty, to prevent centering of graph
  chart.elasticX(total !== 0);
};
