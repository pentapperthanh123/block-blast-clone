/**
 * AG Kit - Rules + Cursor Commands Sync
 *
 * What gets synced:
 *   ✅ .agents/rules/ → .cursorrules, .claude/system-context.md, AGENTS.md
 *   ✅ .agents/workflows/*.md → .cursor/commands/*.md  (Cursor slash commands)
 *
 * What does NOT get synced (on-demand):
 *   ❌ .agents/agent/, skills/, memory/, docs/, scripts/
 *
 * Usage:
 *   node .agents/install-agents.js
 */

const fs = require('fs');
const path = require('path');

const agentsDir = __dirname;
const rulesDir = path.join(agentsDir, 'rules');
const workflowsDir = path.join(agentsDir, 'workflows');
const rootDir = path.join(__dirname, '..');

console.log('🔄 Đang tổng hợp hệ thống rules + slash commands...');

// ---------------------------------------------------------------------------
// Rules → .cursorrules / .claude / AGENTS.md
// ---------------------------------------------------------------------------
let combinedRules = "# AI System Rules & Guidelines\n\n";
if (fs.existsSync(rulesDir)) {
    const ruleFiles = fs.readdirSync(rulesDir).filter((file) => file.endsWith('.md'));
    if (ruleFiles.length === 0) {
        console.warn('⚠️  No rule files found in .agents/rules/');
    }
    ruleFiles.forEach((file) => {
        const content = fs.readFileSync(path.join(rulesDir, file), 'utf8');
        combinedRules += `\n--- [Rule: ${file}] ---\n${content}\n`;
    });
} else {
    console.error('❌ Rules directory not found:', rulesDir);
    process.exit(1);
}

const cursorRulesPath = path.join(rootDir, '.cursorrules');
fs.writeFileSync(cursorRulesPath, combinedRules, 'utf8');
console.log('✅ Đã tạo/cập nhật: .cursorrules');

const claudeDir = path.join(rootDir, '.claude');
if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
}
fs.writeFileSync(path.join(claudeDir, 'system-context.md'), combinedRules, 'utf8');
console.log('✅ Đã đồng bộ: .claude/system-context.md');

fs.writeFileSync(
    path.join(rootDir, 'AGENTS.md'),
    `# Project Agent Blueprint\n\n${combinedRules}`,
    'utf8'
);
console.log('✅ Đã tạo: AGENTS.md');

// ---------------------------------------------------------------------------
// Workflows → .cursor/commands (required for Cursor /slash to work)
// ---------------------------------------------------------------------------
function stripYamlFrontmatter(content) {
    if (!content.startsWith('---')) {
        return content;
    }
    const end = content.indexOf('\n---', 3);
    if (end === -1) {
        return content;
    }
    return content.slice(end + 4).replace(/^\s+/, '');
}

function extractDescription(content) {
    const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!m) return null;
    const dm = m[1].match(/^description:\s*(.+)$/m);
    return dm ? dm[1].trim().replace(/^["']|["']$/g, '') : null;
}

const commandsDir = path.join(rootDir, '.cursor', 'commands');
if (!fs.existsSync(workflowsDir)) {
    console.warn('⚠️  No .agents/workflows/ — skip slash command sync');
} else {
    if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
    }

    const workflowFiles = fs
        .readdirSync(workflowsDir)
        .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');

    let synced = 0;
    workflowFiles.forEach((file) => {
        const src = path.join(workflowsDir, file);
        const raw = fs.readFileSync(src, 'utf8');
        const desc = extractDescription(raw);
        let body = stripYamlFrontmatter(raw);

        // Cursor commands: plain markdown; keep $ARGUMENTS as user context hint
        body = body.replace(
            /\$ARGUMENTS/g,
            '(Use the text the user typed after the slash command as the arguments.)'
        );

        const header = desc
            ? `<!-- Synced from .agents/workflows/${file} — do not edit here; edit the workflow source. -->\n\n> ${desc}\n\n`
            : `<!-- Synced from .agents/workflows/${file} — do not edit here; edit the workflow source. -->\n\n`;

        const outPath = path.join(commandsDir, file);
        fs.writeFileSync(outPath, header + body, 'utf8');
        synced += 1;
    });

    // Remove stale commands that no longer exist in workflows (except user extras)
    const expected = new Set(workflowFiles);
    fs.readdirSync(commandsDir)
        .filter((f) => f.endsWith('.md'))
        .forEach((f) => {
            if (!expected.has(f)) {
                const p = path.join(commandsDir, f);
                const head = fs.readFileSync(p, 'utf8').slice(0, 120);
                if (head.includes('Synced from .agents/workflows/')) {
                    fs.unlinkSync(p);
                    console.log(`🗑️  Removed stale command: ${f}`);
                }
            }
        });

    console.log(`✅ Đã sync ${synced} slash commands → .cursor/commands/`);
    console.log('   Ví dụ: /remember, /create, /plan, /reload, …');
}

console.log('');
console.log('🎉 Hoàn tất!');
console.log('💡 Tip: Gõ / trong Cursor chat để thấy commands. Nếu thiếu, Reload Window.');
console.log('💡 Tip: python .agents/scripts/session_boot.py');
