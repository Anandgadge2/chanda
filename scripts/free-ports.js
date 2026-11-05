const { execSync } = require('child_process');

const ports = [3000, 5000];

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const pids = new Set();

      // Method 1: PowerShell Get-NetTCPConnection (accurate on Windows, catches all states)
      try {
        const psOut = execSync(
          `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`,
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
        );
        for (const pidStr of psOut.trim().split(/\r?\n/)) {
          const pid = pidStr.trim();
          if (pid && pid !== '0' && pid !== `${process.pid}`) {
            pids.add(pid);
          }
        }
      } catch {}

      // Method 2: netstat fallback
      try {
        const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        const lines = output.trim().split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const parts = trimmed.split(/\s+/);
          const localAddr = parts[1] || '';
          if (localAddr.endsWith(`:${port}`)) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && pid !== `${process.pid}`) {
              pids.add(pid);
            }
          }
        }
      } catch {}

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
