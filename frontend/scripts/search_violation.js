const fs = require('fs');
const path = require('path');
function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.next' || f === '.git') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) search(p);
    else if (f.endsWith('.jsx') || f.endsWith('.js') || f.endsWith('.json')) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('Breach & Revenue Violation Analysis') || c.includes('Breach &') || c.includes('Violation Analysis') || c.includes('Unauthorized Non-Agri Land Monitoring')) {
        console.log(p);
      }
    }
  }
}
search('d:/chanda');
