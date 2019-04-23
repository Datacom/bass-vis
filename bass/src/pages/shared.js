import { format } from 'd3';

export const moneyFormat = d => format('$.2s')(d).replace(/G/, 'B');
export const title = (d) => `${d.key}: ${moneyFormat(d.value)}`;
export const reduceSum = d => d.value;
