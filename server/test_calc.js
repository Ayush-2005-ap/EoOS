const fs = require('fs');
const data = JSON.parse(fs.readFileSync('dev_tg_data.json', 'utf8'));
const d1 = data.data.domains.find(d => d.domainId === 'Access');
console.log("Domain Score in DB:", d1.score);
const indScores = d1.indicators.map(i => i.score);
console.log("Indicator Scores:", indScores);
const avgOfInds = indScores.reduce((a, b) => a + b, 0) / indScores.length;
console.log("Average of Indicators:", avgOfInds);
