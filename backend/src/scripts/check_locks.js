import prisma from '../config/prisma.js';

async function main() {
  const acts = await prisma.$queryRawUnsafe(`
    SELECT pid, usename, state, wait_event_type, wait_event, query
    FROM pg_stat_activity
    WHERE datname = current_database() AND pid <> pg_backend_pid()
  `);
  console.log('Active PostgreSQL connections:');
  console.table(acts);
}

main().finally(() => prisma.$disconnect());
