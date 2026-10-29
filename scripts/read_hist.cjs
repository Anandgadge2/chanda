const fs = require('fs');
const content = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
const start = content.indexOf('model BackwardHistory {');
console.log(content.substring(start, start + 1200));
