const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else if (filePath.endsWith('.tsx') && !filePath.includes('login') && !filePath.includes('layout')) {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src/app/admin'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('fetch(') && !content.includes('adminFetch')) {
    content = 'import { adminFetch } from "@/utils/api";\n' + content;
    // Replace standalone fetch calls
    content = content.replace(/\bfetch\(/g, 'adminFetch(');
    // Specifically handle the fetchDomains() vs fetch()
    content = content.replace(/adminFetchDomains/g, 'fetchDomains');
    content = content.replace(/adminFetchDomain/g, 'fetchDomain');
    content = content.replace(/adminFetchReports/g, 'fetchReports');
    content = content.replace(/adminFetchVoices/g, 'fetchVoices');
    content = content.replace(/adminFetchQueries/g, 'fetchQueries');
    content = content.replace(/adminFetchReviews/g, 'fetchReviews');
    content = content.replace(/adminFetchDomainsAndStates/g, 'fetchDomainsAndStates');
    content = content.replace(/adminFetchStateData/g, 'fetchStateData');
    content = content.replace(/adminFetchIndicatorAndDomains/g, 'fetchIndicatorAndDomains');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
