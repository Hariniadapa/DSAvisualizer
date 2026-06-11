// frontend/src/components/Editor/ProblemIntelligence.jsx
import React, { useState } from 'react';
import { TYPE_LABELS } from '../../utils/problemTemplates';
import toast from 'react-hot-toast';

export default function ProblemIntelligence({ problem, meta, onGetCoachHint }) {
  const [showHint, setShowHint] = useState(false);

  if (!problem || !meta) return null;

  const typeInfo = TYPE_LABELS[meta.inputType] || TYPE_LABELS['generic'];

  const getApproachHintText = () => {
    switch (meta.inputType) {
      case 'array':
        return "💡 Hint: For array problems, check if sorting helps, or look for O(N) single-pass solutions using hashing or sliding window.";
      case 'string':
        return "💡 Hint: Check for character frequency arrays (size 26 for lowercase letters), two-pointer comparisons, or rolling hashes.";
      case 'tree':
        return "💡 Hint: Tree problems are naturally recursive. DFS (pre-order/in-order/post-order) or BFS using a queue are standard approaches.";
      case 'graph':
        return "💡 Hint: Build an adjacency list. Use BFS for shortest path in unweighted graphs, DFS for connectivity/cycles, and Dijkstra for weighted paths.";
      case 'dp':
        return "💡 Hint: Define your state (e.g., DP[i]). Formulate the transition from smaller subproblems and optimize space if possible.";
      case 'greedy':
        return "💡 Hint: Can we make locally optimal choices? Try sorting by end time, weight, or cost ratio and process elements in order.";
      case 'binary-search':
        return "💡 Hint: Define a feasibility function `check(mid)`. Search within range [lo, hi] and move boundaries based on check output.";
      case 'two-pointer':
        return "💡 Hint: Initialize pointers at opposite ends or both at the start. Move them based on sum or constraints.";
      case 'math':
        return "💡 Hint: Look for mathematical properties, prime factorizations, modulo arithmetic, or pre-computed lookup tables.";
      default:
        return "💡 Hint: Break down the simulation step-by-step. Focus on correct representation of state and watch for edge cases.";
    }
  };

  const handleHintClick = () => {
    setShowHint(!showHint);
    if (onGetCoachHint) {
      // Trigger AI coach panel
      onGetCoachHint();
    } else {
      toast(getApproachHintText(), {
        duration: 5000,
        icon: '💡',
        style: {
          background: '#161b22',
          color: '#e6edf3',
          border: '1px solid #30363d',
        }
      });
    }
  };

  // Build signature preview (e.g., solve(int[] nums) -> int)
  const paramsStr = meta.paramNames.map((name, i) => {
    const type = meta.paramTypes[i] || 'int';
    return `${type} ${name}`;
  }).join(', ');
  const signaturePreview = `${meta.functionName}(${paramsStr}) -> ${meta.returnType}`;

  return (
    <div style={styles.container}>
      <div style={styles.badgeRow}>
        <span style={{ ...styles.badge, backgroundColor: `${typeInfo.color}22`, border: `1px solid ${typeInfo.color}`, color: typeInfo.color }}>
          {typeInfo.icon} {typeInfo.label}
        </span>
        <code style={styles.sig} title="Recommended Function Signature">
          {signaturePreview}
        </code>
      </div>
      <div style={styles.actionRow}>
        <button onClick={handleHintClick} style={styles.hintBtn}>
          💡 Get Approach Hint
        </button>
        {showHint && !onGetCoachHint && (
          <div style={styles.hintText}>{getApproachHintText()}</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    gap: 4,
  },
  sig: {
    fontSize: 12,
    color: '#8b949e',
    fontFamily: "'JetBrains Mono', monospace",
  },
  actionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  hintBtn: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: 'none',
    color: '#58a6ff',
    cursor: 'pointer',
    fontSize: 12,
    padding: 0,
    fontWeight: 500,
    textDecoration: 'underline',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#8b949e',
    lineHeight: 1.5,
    background: '#0d1117',
    padding: 8,
    borderRadius: 6,
    border: '1px solid #21262d',
    marginTop: 4,
  }
};
