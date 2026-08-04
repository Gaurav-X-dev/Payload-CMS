const { spawn } = require('child_process');

const child = spawn('npx.cmd', ['payload', 'migrate:create', 'globals_versioning'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  if (output.includes('created or renamed from another enum')) {
    child.stdin.write('\r\n');
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  process.exit(code);
});
