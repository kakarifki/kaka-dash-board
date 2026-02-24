const express = require('express');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Mounted paths
const TODO_FILE = process.env.TODO_PATH || '/app/data/TODO.md';
const STATUS_FILE = process.env.STATUS_PATH || '/app/data/status.json';

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
