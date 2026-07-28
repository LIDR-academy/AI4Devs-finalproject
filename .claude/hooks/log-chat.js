#!/usr/bin/env node
/*
 * Stop hook: appends new turns from the current transcript to a daily
 * markdown log under chats/YYYY-MM-DD.md in the project root.
 *
 * Only logs the user's message (cleaned of injected system tags) and the
 * FINAL assistant reply of each turn - intermediate "working on it..."
 * narration and tool-call noise are discarded.
 *
 * Reads hook input JSON from stdin (expects at least transcript_path).
 * Tracks how many transcript lines have already been logged in
 * .claude/hooks/.chatlog-state.json so re-runs don't duplicate entries.
 */

var fs = require('fs');
var path = require('path');

var PROJECT_ROOT = path.join(__dirname, '..', '..');
var CHATS_DIR = path.join(PROJECT_ROOT, 'chats');
var STATE_FILE = path.join(__dirname, '.chatlog-state.json');

// Wrapper tags injected by the harness around real user text - strip these
// before logging so only what the user actually typed is kept.
var SYSTEM_TAGS = [
  'ide_opened_file',
  'ide_selection',
  'ide_diagnostics',
  'system-reminder',
  'user-prompt-submit-hook'
];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (e) {
    return '';
  }
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function dateKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function timeKey(d) {
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function toDate(timestamp) {
  var ts = timestamp ? new Date(timestamp) : new Date();
  return isNaN(ts.getTime()) ? new Date() : ts;
}

// Extract plain human-readable text from a transcript message's content.
// content can be a plain string, or an array of content blocks (text,
// tool_use, tool_result, thinking, image, ...). Only "text" blocks are kept.
function extractText(content) {
  if (typeof content === 'string') {
    return content.trim();
  }
  if (Array.isArray(content)) {
    var parts = [];
    for (var i = 0; i < content.length; i++) {
      var block = content[i];
      if (block && block.type === 'text' && typeof block.text === 'string') {
        parts.push(block.text);
      }
    }
    return parts.join('\n\n').trim();
  }
  return '';
}

// Strip harness-injected wrapper tags (<ide_opened_file>, <system-reminder>,
// ...) from a user message so only what the user actually typed remains.
function cleanUserText(text) {
  var cleaned = text;
  for (var i = 0; i < SYSTEM_TAGS.length; i++) {
    var tag = SYSTEM_TAGS[i];
    var re = new RegExp('<' + tag + '>[\\s\\S]*?<\\/' + tag + '>', 'g');
    cleaned = cleaned.replace(re, '');
  }
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}

function flushGroup(group, byDate) {
  if (!group || (!group.userText && !group.assistantText)) {
    return;
  }
  var refTs = group.userTs || group.assistantTs;
  var dKey = dateKey(refTs);
  if (!byDate[dKey]) {
    byDate[dKey] = [];
  }
  if (group.userText) {
    byDate[dKey].push('## ' + timeKey(group.userTs) + ' - User\n\n' + group.userText + '\n\n---\n');
  }
  if (group.assistantText) {
    byDate[dKey].push('## ' + timeKey(group.assistantTs) + ' - Assistant\n\n' + group.assistantText + '\n\n---\n');
  }
}

function main() {
  var raw = readStdin();
  var input = {};
  try {
    input = JSON.parse(raw || '{}');
  } catch (e) {
    return;
  }

  var transcriptPath = input.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return;
  }

  var content;
  try {
    content = fs.readFileSync(transcriptPath, 'utf8');
  } catch (e) {
    return;
  }

  var lines = content.split('\n').filter(function (l) {
    return l.trim().length > 0;
  });

  var state = loadState();
  var lastCount = state[transcriptPath] || 0;

  if (lines.length <= lastCount) {
    // Nothing new (or transcript got shorter/rotated); just resync.
    state[transcriptPath] = lines.length;
    saveState(state);
    return;
  }

  var newLines = lines.slice(lastCount);
  var byDate = {}; // date key -> array of markdown blocks
  var current = null; // { userTs, userText, assistantTs, assistantText }

  for (var i = 0; i < newLines.length; i++) {
    var entry;
    try {
      entry = JSON.parse(newLines[i]);
    } catch (e) {
      continue;
    }

    var role = entry.type || (entry.message && entry.message.role);
    if (role !== 'user' && role !== 'assistant') {
      continue;
    }
    if (entry.isMeta) {
      // Synthetic entries injected by the harness (skill/subagent output fed
      // back as a "user" turn, etc.) - not something the human actually typed.
      continue;
    }

    var msg = entry.message || {};
    var rawText = extractText(msg.content);

    if (role === 'user') {
      var userText = cleanUserText(rawText);
      if (!userText) {
        // Pure tool-result feedback, or a message that was only system tags.
        continue;
      }
      // A new user message starts a new turn: flush the previous one.
      flushGroup(current, byDate);
      current = {
        userTs: toDate(entry.timestamp),
        userText: userText,
        assistantTs: null,
        assistantText: null
      };
    } else {
      // assistant
      if (!rawText) {
        // Tool-call-only step: internal work, not a reply to log.
        continue;
      }
      if (!current) {
        current = { userTs: null, userText: null, assistantTs: null, assistantText: null };
      }
      // Keep overwriting: only the LAST assistant text of the turn survives,
      // discarding intermediate "working on it..." narration.
      current.assistantTs = toDate(entry.timestamp);
      current.assistantText = rawText;
    }
  }

  flushGroup(current, byDate);

  if (Object.keys(byDate).length === 0) {
    state[transcriptPath] = lines.length;
    saveState(state);
    return;
  }

  if (!fs.existsSync(CHATS_DIR)) {
    fs.mkdirSync(CHATS_DIR, { recursive: true });
  }

  Object.keys(byDate).forEach(function (dKey) {
    var filePath = path.join(CHATS_DIR, dKey + '.md');
    var blocks = byDate[dKey].join('\n');
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '# Chat log - ' + dKey + '\n\n' + blocks);
    } else {
      fs.appendFileSync(filePath, '\n' + blocks);
    }
  });

  state[transcriptPath] = lines.length;
  saveState(state);
}

main();
