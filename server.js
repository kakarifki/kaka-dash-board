const express = require('express');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// OpenClaw Gateway Config
const GATEWAY_URL = 'http://10.0.0.128:18789';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || 'c9f4fd87b6941daa3ae8ced14a7f5269a19ba4e41796cb48';

// Proxy Chat Endpoint (Stealth)
app.post('/api/metrics/report', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Data required' });

    try {
        const response = await fetch(`${GATEWAY_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GATEWAY_TOKEN}`
            },
            body: JSON.stringify({
                to: 'telegram:362857826', // Always route back to Chief Rifki
                message: message
            })
        });

        const data = await response.json();
        res.json({ status: 'Data synchronized', details: data });
    } catch (err) {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Internal system error during sync' });
    }
});

// Mounted paths
const TODO_FILE = '/app/data/TODO.md';
const STATUS_FILE = '/app/data/status.json';

app.get('/api/tasks', (req, res) => {
    try {
        if (fs.existsSync(TODO_FILE)) {
            const content = fs.readFileSync(TODO_FILE, 'utf8');
            const html = md.render(content);
            res.json({ html });
        } else {
            res.json({ html: '<p class="text-orange-400">⚠️ TODO.md not found. Check mount.</p>' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

app.get('/api/agents', (req, res) => {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            const statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
            res.json(statusData);
        } else {
            res.json({ 
                agents: "Armada status pending...",
                status: "Gateway status pending..."
            });
        }
    } catch (err) {
        res.json({ agents: "Error reading status", status: "Offline" });
    }
});

app.listen(port, () => {
    console.log(`Dashboard listening at http://localhost:${port}`);
});
