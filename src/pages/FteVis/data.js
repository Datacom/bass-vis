import orgData from '../../data/orgData';

export default function() {
  const output = [];

  Object.entries(orgData).forEach(([org, obj]) => {
    const years = Object.keys(obj.FTEs);

    years.forEach(year => {
      output.push({ org, year, fte: obj.FTEs[year], value: obj.expenditure[year]})
    })
  })

  return output;
}
