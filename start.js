const { spawn } = require('child_process');
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || '3000';
console.log(`Starting Next.js on port: ${port}`);
const child = spawn('npx', ['next', 'start', '-p', String(port)], { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code));
