const xlsx = require('xlsx');
const fs = require('fs');

const excel = xlsx.readFileSync("metric-bnchmrk-16-17.xlsx");

const years = excel.SheetNames.slice(1);

const orgData = {};
const dataOutput = [];

const chunks = {
  HR: [2, 3, 4, 5],
  FIN: [2, 3, 4, 5],
  ICT: [5, 12, 13, 14, 15],
  PR: [3, 4, 5, 6],
  CES: [2, 3, 4, 5, 6, 7, 8],
}

const cohortMap = {
  PG1: 'Small',
  PG2: 'Medium',
  PG3: 'Large',
}

years.forEach(year => {
  const worksheet = excel.Sheets[year];

  const cellsInFirstRow = Object.keys(worksheet).filter(d => d.match(/^[A-Z]*1$/)); // these are the columns for each agency
  const orgStructureType = worksheet[cellsInFirstRow[0]].v === 'PG1';

  const cellsInFirstCol = Object.keys(worksheet).filter(d => d.match(/^A[0-9]*$/));
  const gen1 = xlsx.utils.decode_cell(cellsInFirstCol.find(cell => worksheet[cell].v === 'GEN 1'));

  cellsInFirstRow.map(xlsx.utils.decode_cell).forEach(({ c }) => {
    const shortOrgName = worksheet[xlsx.utils.encode_cell({ c, r: orgStructureType ? 2 : 3 })].v.trim();
    const fullOrgName = worksheet[xlsx.utils.encode_cell({ c, r: orgStructureType ? 4 : 5 })].v.trim();

    if(!orgData[shortOrgName]) {
      const cohortVal = (worksheet[xlsx.utils.encode_cell({ c, r: orgStructureType ? 0 : 1 })] || {}).v;
      const cohort = cohortMap[cohortVal] || null;
      orgData[shortOrgName] = { full_name: fullOrgName, cohort, FTEs: {} };
    }
    const fteValue = worksheet[xlsx.utils.encode_cell({ c, r: gen1.r + 2 })].v;
    orgData[shortOrgName].FTEs[year] = fteValue;

    Object.entries(chunks).forEach(([type, rows]) => {
      const typeRow = xlsx.utils.decode_cell(cellsInFirstCol.find(cell => worksheet[cell].v === `${type} 1`));
      rows.forEach(i => {
        const typeRowR = typeRow.r + i;
        const metric = worksheet[xlsx.utils.encode_cell({ c: 1, r: typeRowR })].v;
        const value = worksheet[xlsx.utils.encode_cell({ c, r: typeRowR })].v;
        if(value !== 0) {
          dataOutput.push({
            type,
            org: shortOrgName,
            year,
            value,
            metric,
          });
        }
      })
    });
  });
});

fs.writeFile('orgData.json', JSON.stringify(orgData, null, 2));
fs.writeFile('data.json', JSON.stringify(dataOutput, null, 2));
