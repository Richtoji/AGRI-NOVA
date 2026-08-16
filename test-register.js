const http = require('http');

const data = JSON.stringify({
  name: "Test User",
  email: "testuser" + Math.random() + "@example.com",
  phone: "9999999999",
  password: "TestPassword123!",
  confirmPassword: "TestPassword123!",
  role: "FARMER"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${responseData}`);
  });
});

req.on('error', (error) => {
  console.error('Error hitting /api/auth/register:', error);
});

req.write(data);
req.end();
