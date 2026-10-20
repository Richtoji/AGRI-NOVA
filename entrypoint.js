process.env.PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';
console.log(`Starting AGRI-NOVA on port ${process.env.PORT}...`);
require('./server.js');
