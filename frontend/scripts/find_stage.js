const fs = require('fs');
const path = require('path');
function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) search(p);
    else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('STAGE') || c.includes('Stage')) {
        const lines = c.split('\n');
        lines.forEach((l, idx) => {
          if (l.includes('STAGE') || (l.includes('Stage') && l.includes('1'))) {
            console.log(p.replace(/.*src[\\/]/, 'src/'), 'L' + (idx+1), l.trim());
          }
        });
      }
    }
  }
}
search(path.join(__dirname, '../src'));
