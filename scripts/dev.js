import { spawn } from 'node:child_process';

const npmCommand = 'npm';
const baseEnv = {
  ...process.env,
  PORT: process.env.PORT || '5003',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5174',
};

function start(label, args, env = baseEnv) {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    env,
    // npm is a .cmd shim on Windows. Launch it through the Windows shell so
    // Node does not reject the process with spawn EINVAL.
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
  child.on('error', (error) => console.error(`${label} could not start: ${error.message}`));
  return child;
}

console.log('Starting ResearchGPT at http://127.0.0.1:5174');
const server = start('Backend', ['--prefix', 'server', 'run', 'dev']);
const client = start('Frontend', [
  '--prefix',
  'client',
  'run',
  'dev',
  '--',
  '--port',
  '5174',
  '--host',
  '127.0.0.1',
  '--configLoader',
  'runner',
]);

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  server.kill();
  client.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
server.on('exit', (code) => {
  if (!stopping && code) {
    console.error(`Backend stopped with code ${code}.`);
    stop();
    process.exitCode = code;
  }
});
client.on('exit', (code) => {
  if (!stopping && code) {
    console.error(`Frontend stopped with code ${code}.`);
    stop();
    process.exitCode = code;
  }
});
