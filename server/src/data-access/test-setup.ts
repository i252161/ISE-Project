import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      if (addr && typeof addr === 'object') {
        const { port } = addr;
        srv.close(() => resolve(port));
      } else {
        srv.close(() => reject(new Error('Could not allocate free port')));
      }
    });
  });
}

export async function setup(): Promise<() => Promise<void>> {
  const databaseDir = path.resolve(__dirname, `../../.pgdata/test-${process.pid}-${Date.now()}`);
  const port = await getFreePort();

  const pg = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false
  });

  await pg.initialise();
  await pg.start();

  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;

  return async () => {
    await pg.stop();
    try {
      await fs.rm(databaseDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    } catch {
      // Ignore transient Windows file lock on temp test data dir
    }
  };
}
