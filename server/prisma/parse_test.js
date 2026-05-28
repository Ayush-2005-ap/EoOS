const fs = require('fs');
const { parse } = require('csv-parse/sync');

const content = fs.readFileSync('raw_data.csv', 'utf-8');
const records = parse(content, { relax_quotes: true, relax_column_count: true });

const headerRow = records[0];
let apCol = -1;
for(let i=0; i<headerRow.length; i++) {
  if(headerRow[i].includes('Telangana (Score)')) apCol = i;
}
console.log("Telangana Score Col:", apCol);

records.slice(0, 10).forEach((r, idx) => {
  console.log(`Row ${idx}: col0="${r[0]}" TG_Score="${r[apCol]}"`);
});
