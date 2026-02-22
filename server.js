const express = require('express');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Update path to look for the file inside the mounted folder
const TODO_FILE = '/app/data/TODO.md';

app.get('/api/tasks', (req, res) => {
    try {
        console.log(`Checking for file at: ${TODO_FILE}`);
        if (fs.existsSync(TODO_FILE)) {
            const content = fs.readFileSync(TODO_FILE, 'utf8');
            const html = md.render(content);
            res.json({ html });
        } else {
            console.error('File not found');
            res.json({ html: '<p class="text-orange-400">⚠️ TODO.md not found in /app/data/. Please check Directory Mount.</p>' });
        }
    } catch (err) {
        console.error('Read error:', err.message);
        res.status(500).json({ error: 'Failed to read tasks', details: err.message });
    }
});

app.get('/api/agents', (req, res) => {
    res.json({ 
        agents: "Armada is active (Kapten Kaka, Kakarir, KaDev).",
        status: "Gateway: Connected to Local VPS"
    });
});

app.listen(port, () => {
    console.log(`Dashboard listening at http://localhost:${port}`);
});
