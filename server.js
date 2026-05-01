const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./db');

const PORT = 3001; // Using 3001 to avoid conflict with campus-smartprint on 3000

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`${new Date().toISOString()} - ${method} ${pathname}`);

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve Static Files
    if (pathname === '/' || pathname === '/index.html' || pathname === '/styles.css' || pathname === '/app.js') {
        const filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript'
        }[ext] || 'text/plain';

        fs.readFile(path.join(__dirname, filePath), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
        return;
    }

    // API Routes
    if (pathname === '/api/check-user' && method === 'GET') {
        const email = parsedUrl.query.email;
        if (!email) {
            res.writeHead(400);
            res.end('Missing email');
            return;
        }
        const allData = db.read();
        const exists = !!allData.users[email];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ exists }));
        return;
    }

    if (pathname === '/api/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);
                const allData = db.read();
                
                // Registration/Login Logic matching app.js
                if (allData.users[email]) {
                    if (allData.users[email] === password) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, email }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Incorrect password' }));
                    }
                } else {
                    // New user registration (simplified for this app)
                    db.registerUser(email, password);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, email, registered: true }));
                }
            } catch (e) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
        return;
    }

    if (pathname === '/api/state' && method === 'GET') {
        const email = req.headers['x-user-email'];
        if (!email) {
            res.writeHead(400);
            res.end('Missing x-user-email header');
            return;
        }
        const state = db.getUserState(email);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(state || {}));
        return;
    }

    if (pathname === '/api/state' && method === 'POST') {
        const email = req.headers['x-user-email'];
        if (!email) {
            res.writeHead(400);
            res.end('Missing x-user-email header');
            return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const state = JSON.parse(body);
                db.saveUserState(email, state);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Syncora Mood Planner Server running at http://localhost:${PORT}`);
});
