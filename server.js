const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Path inside container (will be mounted via Coolify)
const TODO_PATH = process.env.TODO_PATH || '/app/data/TODO.md';

app.get('/api/tasks', (req, res) => {
    try {
        if (fs.existsSync(TODO_PATH)) {
            const content = fs.readFileSync(TODO_PATH, 'utf8');
            const html = md.render(content);
            res.json({ html });
        } else {
            res.json({ html: '<p class="text-orange-400">⚠️ TODO.md not found. Please check volume mount.</p>' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read tasks', details: err.message });
    }
});

app.get('/api/agents', (req, res) => {
    // For now, let's keep it simple. Full CLI access from Docker is complex.
    res.json({ 
        agents: "Armada is active. Connect via SSH to use CLI.",
        status: "Gateway: Connected to " + (process.env.GATEWAY_URL || 'Local VPS')
    });
});

app.listen(port, () => {
    console.log(`Dashboard listening at http://localhost:${port}`);
});
