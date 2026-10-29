const fs = require('fs');
const content = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
const start = content.indexOf('model LandParcel {');
console.log(content.substring(start, start + 2500));
