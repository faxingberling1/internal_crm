const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/payroll/list?month=2&year=2026',
    method: 'GET',
    headers: {
        // We might need a session cookie, but for now let's see if we get 401 (which means endpoint exists) vs 404 (missing)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
