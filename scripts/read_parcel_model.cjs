const fs = require('fs');
const content = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
const start = content.indexOf('model LandParcel {');
const end = content.indexOf('model HistoricalSurveyRecord {');
console.log(content.substring(start, end));
