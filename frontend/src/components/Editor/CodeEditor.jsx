// frontend/src/components/Editor/CodeEditor.jsx
import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

// ── Monaco theme definitions ────────────────────────────────────────────────
const THEMES = {
  'vs-dark':     'vs-dark',
  'one-dark':    'one-dark-pro',
  'monokai':     'monokai',
  'solarized':   'solarized-dark',
  'nord':        'nord',
  'github-dark': 'github-dark',
};

const CUSTOM_THEMES = {
  'one-dark-pro': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',    foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword',    foreground: 'c678dd' },
      { token: 'string',     foreground: '98c379' },
      { token: 'number',     foreground: 'd19a66' },
      { token: 'identifier', foreground: 'e06c75' },
      { token: 'type',       foreground: '61afef' },
      { token: 'function',   foreground: '61afef' },
    ],
    colors: {
      'editor.background':              '#282c34',
      'editor.foreground':              '#abb2bf',
      'editorLineNumber.foreground':    '#495162',
      'editor.selectionBackground':     '#3e4451',
      'editor.lineHighlightBackground': '#2c313a',
      'editorCursor.foreground':        '#528bff',
    },
  },
  monokai: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',  foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword',  foreground: 'f92672' },
      { token: 'string',   foreground: 'e6db74' },
      { token: 'number',   foreground: 'ae81ff' },
      { token: 'type',     foreground: '66d9e8' },
      { token: 'function', foreground: 'a6e22e' },
    ],
    colors: {
      'editor.background':              '#272822',
      'editor.foreground':              '#f8f8f2',
      'editorLineNumber.foreground':    '#90908a',
      'editor.selectionBackground':     '#49483e',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorCursor.foreground':        '#f8f8f0',
    },
  },
  'solarized-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',  foreground: '586e75', fontStyle: 'italic' },
      { token: 'keyword',  foreground: '859900' },
      { token: 'string',   foreground: '2aa198' },
      { token: 'number',   foreground: 'd33682' },
      { token: 'type',     foreground: '268bd2' },
      { token: 'function', foreground: 'b58900' },
    ],
    colors: {
      'editor.background':              '#002b36',
      'editor.foreground':              '#839496',
      'editorLineNumber.foreground':    '#586e75',
      'editor.selectionBackground':     '#073642',
      'editor.lineHighlightBackground': '#073642',
      'editorCursor.foreground':        '#839496',
    },
  },
  nord: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',  foreground: '4c566a', fontStyle: 'italic' },
      { token: 'keyword',  foreground: '81a1c1' },
      { token: 'string',   foreground: 'a3be8c' },
      { token: 'number',   foreground: 'b48ead' },
      { token: 'type',     foreground: '8fbcbb' },
      { token: 'function', foreground: '88c0d0' },
    ],
    colors: {
      'editor.background':              '#2e3440',
      'editor.foreground':              '#d8dee9',
      'editorLineNumber.foreground':    '#4c566a',
      'editor.selectionBackground':     '#434c5e',
      'editor.lineHighlightBackground': '#3b4252',
      'editorCursor.foreground':        '#d8dee9',
    },
  },
  'github-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',  foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword',  foreground: 'ff7b72' },
      { token: 'string',   foreground: 'a5d6ff' },
      { token: 'number',   foreground: '79c0ff' },
      { token: 'type',     foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
    ],
    colors: {
      'editor.background':              '#0d1117',
      'editor.foreground':              '#e6edf3',
      'editorLineNumber.foreground':    '#484f58',
      'editor.selectionBackground':     '#284566',
      'editor.lineHighlightBackground': '#161b22',
      'editorCursor.foreground':        '#e6edf3',
    },
  },
};

// ── Language mapping ────────────────────────────────────────────────────────
const MONACO_LANG = {
  python:     'python',
  javascript: 'javascript',
  java:       'java',
  cpp:        'cpp',
  c:          'c',
};

// ── Default starter code ────────────────────────────────────────────────────
const DEFAULT_CODE = {
  python: `# Write your solution
# Read input with: input() or sys.stdin
import sys
input = sys.stdin.readline

def solve():
    pass

solve()
`,
  javascript: `// Write your solution
// Read input from stdin (Node.js)
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\\n');
let lineIdx = 0;
const readline = () => lines[lineIdx++];

function solve() {
  
}

solve();
`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Read input: br.readLine()
        
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your solution here
    
    return 0;
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Your solution here
    
    return 0;
}
`,
};

export { DEFAULT_CODE };

// ── Component ────────────────────────────────────────────────────────────────
export default function CodeEditor({
  language,
  code,
  onChange,
  theme    = 'vs-dark',
  fontSize = 14,
  onRun,        // callback for Ctrl+Enter shortcut
  onFormat,     // callback for Ctrl+Shift+F
}) {
  const editorRef  = useRef(null);
  const monacoRef  = useRef(null);

  const resolvedTheme = THEMES[theme] || 'vs-dark';

  // Register custom themes before mount
  function handleBeforeMount(monaco) {
    monacoRef.current = monaco;
    Object.entries(CUSTOM_THEMES).forEach(([name, def]) => {
      monaco.editor.defineTheme(name, def);
    });
  }

  // On mount: store ref and register Ctrl+Enter / Ctrl+Shift+F actions
  function handleMount(editor, monaco) {
    editorRef.current = editor;

    // Ctrl+Enter → Run
    editor.addAction({
      id:    'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => { onRun?.(); },
    });

    // Ctrl+Shift+F → Format document
    editor.addAction({
      id:    'format-code',
      label: 'Format Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      ],
      run: (ed) => {
        ed.getAction('editor.action.formatDocument')?.run();
        onFormat?.();
      },
    });
  }

  // Update font size dynamically without remounting
  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize });
  }, [fontSize]);

  return (
    <Editor
      height="100%"
      language={MONACO_LANG[language] || 'python'}
      value={code}
      onChange={val => onChange(val || '')}
      theme={resolvedTheme}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        fontSize,
        fontFamily:                 "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontLigatures:              true,
        lineNumbers:                'on',
        minimap:                    { enabled: false },
        wordWrap:                   'on',
        scrollBeyondLastLine:       false,
        folding:                    true,
        automaticLayout:            true,
        padding:                    { top: 16, bottom: 16 },
        cursorBlinking:             'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling:            true,
        renderLineHighlight:        'all',
        renderWhitespace:           'selection',
        tabSize:                    4,
        insertSpaces:               true,
        autoClosingBrackets:        'always',
        autoClosingQuotes:          'always',
        formatOnType:               true,
        formatOnPaste:              true,
        suggestOnTriggerCharacters: true,
        quickSuggestions:           { other: true, comments: false, strings: false },
        parameterHints:             { enabled: true },
        hover:                      { enabled: true },
        scrollbar: {
          verticalScrollbarSize:   6,
          horizontalScrollbarSize: 6,
        },
        overviewRulerBorder:        false,
        hideCursorInOverviewRuler:  true,
        glyphMargin:                false,
      }}
    />
  );
}