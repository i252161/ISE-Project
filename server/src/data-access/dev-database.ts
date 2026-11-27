import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

export async function startDevDatabase(): Promise<EmbeddedPostgres> {
  const databaseDir = path.resolve(__dirname, '../../.pgdata/dev');
  const port = Number(process.env.PGPORT ?? 5432);

  const pg = new EmbeddedPostgres({
    databaseDir,
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
    port,
    persistent: true
  });

  await pg.initialise();
  await pg.start();
  console.log(`Embedded PostgreSQL running on 127.0.0.1:${port} (data: ${databaseDir})`);
  return pg;
}

if (require.main === module) {
  let instance: EmbeddedPostgres | null = null;

  const shutdown = async () => {
    if (instance) {
      console.log('Stopping Embedded PostgreSQL...');
      await instance.stop();
      instance = null;
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  startDevDatabase()
    .then((pg) => {
      instance = pg;
    })
    .catch((err) => {
      console.error('Failed to start Embedded PostgreSQL:', err);
      process.exit(1);
    });
}
