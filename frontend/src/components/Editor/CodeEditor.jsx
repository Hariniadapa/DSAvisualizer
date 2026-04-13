// frontend/src/components/Editor/CodeEditor.jsx
import { useState } from 'react';
import Editor from '@monaco-editor/react';

const STARTER_CODE = {
  javascript: `// Write your solution here
function solve(input) {
  // your code
}`,
  python: `# Write your solution here
def solve(input):
    # your code
    pass`,
  cpp: `// Write your solution here
#include <bits/stdc++.h>
using namespace std;

int main() {
    // your code
    return 0;
}`
};

export default function CodeEditor({ onCodeChange }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode]         = useState(STARTER_CODE['javascript']);

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
    onCodeChange && onCodeChange(STARTER_CODE[lang]);
  };

  const handleCodeChange = (val) => {
    setCode(val);
    onCodeChange && onCodeChange(val);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Code Editor</span>
        <div style={styles.langRow}>
          {['javascript', 'python', 'cpp'].map(lang => (
            <button
              key={lang}
              style={{
                ...styles.langBtn,
                background: language === lang ? '#6366f1' : '#2a2a2a'
              }}
              onClick={() => handleLangChange(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <Editor
        height="350px"
        language={language === 'cpp' ? 'cpp' : language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          fontSize:        14,
          minimap:         { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize:         2
        }}
      />
    </div>
  );
}

const styles = {
  container: { background:'#1a1a1a', borderRadius:'12px', overflow:'hidden', border:'1px solid #2a2a2a' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.8rem 1rem', borderBottom:'1px solid #2a2a2a' },
  title:     { color:'white', fontWeight:'500' },
  langRow:   { display:'flex', gap:'0.4rem' },
  langBtn:   { padding:'0.3rem 0.8rem', border:'none', color:'white', borderRadius:'5px', cursor:'pointer', fontSize:'0.8rem' }
};