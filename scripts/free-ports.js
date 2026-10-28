const { execSync } = require('child_process');

const ports = [3000, 5000];

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== `${process.pid}`) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try {
          process.stdout.write(`[free-ports] Freeing port ${port} (PID ${pid})...\n`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch {
          // Ignore if process already exited
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
    }
  } catch {
    // Port is not in use
  }
}

for (const port of ports) {
  freePort(port);
}

