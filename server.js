const express = require('express');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')({
    html: true
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Mounted paths
const TODO_FILE = process.env.TODO_PATH || '/app/data/TODO.md';
const STATUS_FILE = process.env.STATUS_PATH || '/app/data/status.json';

app.get('/api/tasks', (req, res) => {
    try {
        if (fs.existsSync(TODO_FILE)) {
            let content = fs.readFileSync(TODO_FILE, 'utf8');
            let lines = content.split('\n');
            
            // Phase 2: Regex replacement with data-line identifier
            let processedLines = lines.map((line, index) => {
                let processedLine = line;
                processedLine = processedLine.replace(/- \[ \]/g, `- <input type="checkbox" data-line="${index}" class="task-checkbox">`);
                processedLine = processedLine.replace(/- \[x\]/gi, `- <input type="checkbox" checked data-line="${index}" class="task-checkbox">`);
                return processedLine;
            });

            const html = md.render(processedLines.join('\n'));
            res.json({ html });
        } else {
            res.json({ html: '<p class="text-orange-400">⚠️ TODO.md not found. Check mount.</p>' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

app.post('/api/tasks/toggle', (req, res) => {
    try {
        const { lineIndex, checked } = req.body;
        if (lineIndex === undefined) {
            return res.status(400).json({ error: 'lineIndex is required' });
        }

        if (fs.existsSync(TODO_FILE)) {
            let content = fs.readFileSync(TODO_FILE, 'utf8');
            let lines = content.split('\n');
            
            if (lineIndex >= 0 && lineIndex < lines.length) {
                let line = lines[lineIndex];
                if (checked) {
                    lines[lineIndex] = line.replace(/\[ \]/, '[x]');
                } else {
                    lines[lineIndex] = line.replace(/\[x\]/i, '[ ]');
                }
                
                fs.writeFileSync(TODO_FILE, lines.join('\n'), 'utf8');
                res.json({ success: true });
            } else {
                res.status(400).json({ error: 'Invalid line index' });
            }
        } else {
            res.status(404).json({ error: 'TODO.md not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task' });
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
