const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// API to get TODO.md content
app.get('/api/tasks', (req, res) => {
    try {
        const todoPath = '/home/kakarifki/.openclaw/workspace/personal/TODO.md';
        const content = fs.readFileSync(todoPath, 'utf8');
        const html = md.render(content);
        res.json({ html });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

// API to get Agent Status
app.get('/api/agents', (req, res) => {
    try {
        const agents = execSync('openclaw agents list').toString();
        const status = execSync('openclaw status').toString();
        res.json({ agents, status });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch agent status' });
    }
});

app.listen(port, () => {
    console.log(`Dashboard listening at http://localhost:${port}`);
});
