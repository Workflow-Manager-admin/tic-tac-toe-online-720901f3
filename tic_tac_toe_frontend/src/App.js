import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Minimal Tic Tac Toe: All-in-one component.
 * Implements:
 * - Game board rendering
 * - Game mode select: PvP / PvCPU
 * - Responsive, light-themed, minimal UI
 * - Game status display (win/draw/ongoing)
 * - Board reset
 */

// Helper to calculate winner: returns "X", "O", or null
function calculateWinner(squares) {
  const wins = [
    [0, 1, 2],[3, 4, 5],[6, 7, 8], // Rows
    [0, 3, 6],[1, 4, 7],[2, 5, 8], // Cols
    [0, 4, 8],[2, 4, 6]            // Diags
  ];
  for (let [a,b,c] of wins) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// Random CPU: picks a random empty spot
function cpuMove(squares) {
  const empties = squares.map((v,i) => v ? null : i).filter(i => i!==null);
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random()*empties.length)];
}

// PUBLIC_INTERFACE
function App() {
  // Theme support (minimal, using original template logic)
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t==='light'?'dark':'light');

  // Game mode: "pvp" or "cpu"
  const [mode, setMode] = useState('cpu'); // default = cpu
  // Game core state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // true: X, false: O
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Update winner / game-over state on change
  useEffect(() => {
    const win = calculateWinner(squares);
    setWinner(win);
    if (win || squares.every(Boolean)) setGameOver(true);
    else setGameOver(false);
  }, [squares]);

  // CPU move: useEffect to make move after X turn, if PvCPU && not over && O's turn
  useEffect(() => {
    if (
      mode === 'cpu' &&
      !gameOver &&
      !xIsNext // CPU always plays 'O'
    ) {
      const t = setTimeout(() => {
        const idx = cpuMove(squares);
        if (typeof idx === 'number') {
          const next = squares.slice();
          next[idx] = 'O';
          setSquares(next);
          setXIsNext(true);
        }
      }, 450); // short pause for realism
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line
  }, [mode, squares, xIsNext, gameOver]);

  // PUBLIC_INTERFACE
  function handleSquare(idx) {
    // If over, or not player turn (vs CPU), or spot filled, do nothing
    if (gameOver || squares[idx]) return;
    if (mode === 'cpu' && !xIsNext) return; // user is always X in CPU mode
    const next = squares.slice();
    next[idx] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    // Changing mode restarts the game
    setMode(newMode);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
  }

  // Status text
  let status = '';
  if (winner) status = `Winner: ${winner}`;
  else if (gameOver) status = 'Draw!';
  else if (mode === 'cpu' && !xIsNext) status = "CPU thinking...";
  else status = `Next turn: ${xIsNext ? 'X' : 'O'}`;

  // Accent/helper colors from requirements
  const ACCENT = '#F50057'; const PRIMARY = '#1976D2'; const WHITE = '#fff';

  // -- UI COMPONENT RENDER --
  return (
    <div className="App">
      <header className="App-header" style={{minHeight: '100vh'}}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div style={{
          maxWidth: 360, minWidth: 240, width: '96%',
          margin: '40px auto 0 auto', background: 'var(--bg-secondary)', borderRadius: 24,
          boxShadow: '0 2px 8px rgba(30,40,70,0.08)', padding: "16px 8px 24px 8px",
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <h1 style={{margin: 0, color: PRIMARY, fontSize: 32, letterSpacing: -1}}>Tic Tac Toe</h1>
          <div style={{
            marginTop: 12, marginBottom: 14,
            display: 'flex', gap: 10, fontSize: 15, width: '96%', justifyContent: 'center'
          }}>
            <button
              onClick={() => handleModeChange('pvp')}
              disabled={mode==='pvp'}
              style={{
                border: 'none', outline: 'none',
                background: mode === 'pvp' ? ACCENT : PRIMARY,
                color: WHITE, borderRadius: 8, padding: '6px 14px', fontWeight: mode === 'pvp' ? 600 : 400,
                cursor: mode === 'pvp' ? 'default' : 'pointer', opacity: mode === 'pvp' ? 1 : 0.92,
                transition: 'background 0.15s'
              }}
              tabIndex={mode==='pvp'? -1: undefined}
            >PvP</button>
            <button
              onClick={() => handleModeChange('cpu')}
              disabled={mode==='cpu'}
              style={{
                border: 'none', outline: 'none',
                background: mode === 'cpu' ? ACCENT : PRIMARY,
                color: WHITE, borderRadius: 8, padding: '6px 14px', fontWeight: mode === 'cpu' ? 600 : 400,
                cursor: mode === 'cpu' ? 'default' : 'pointer', opacity: mode === 'cpu' ? 1 : 0.92,
                transition: 'background 0.15s'
              }}
              tabIndex={mode==='cpu'? -1: undefined}
            >CPU</button>
          </div>

          <div style={{
            margin: '6px 0 8px', fontWeight: 500, fontSize: 17, minHeight: 28,
            color: winner ? ACCENT : PRIMARY, letterSpacing: '.01em'
          }}>{status}</div>

          {/* Game Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 0,
              background: 'var(--border-color)',
              borderRadius: 12,
              margin: '10px auto 0',
              boxSizing: 'border-box',
              width: 'min(94vw, 310px)',
              aspectRatio: '1 / 1',
              boxShadow: '0 0 3px #EEE'
            }}
            aria-label="Game board"
            role="grid"
            tabIndex={0}
          >
            {squares.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleSquare(i)}
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: cell === 'X' ? PRIMARY : (cell === 'O' ? ACCENT : '#2B2B2B'),
                  fontWeight: 700,
                  fontSize: 'clamp(2rem,8vw,2.4rem)',
                  lineHeight: 1.45,
                  width: '100%', height: '100%',
                  cursor: (!gameOver && (!cell) && (mode!=='cpu' || xIsNext)) ? 'pointer' : 'default',
                  pointerEvents: (gameOver||cell||(mode==='cpu'&&!xIsNext)) ? 'none' : 'auto',
                  borderRadius: [
                    [0,2,6,8].includes(i)?'10px':'0',  // BL
                    [2,5,8].includes(i)?'10px':'0',   // BR
                    [0,1,2].includes(i)?'10px':'0',   // TL
                    [0,3,6].includes(i)?'10px':'0',   // TR
                  ].join(' ')
                }}
                aria-label={`Cell ${i+1} ${cell||''}`}
                aria-disabled={Boolean(cell)||gameOver||(mode==='cpu'&&!xIsNext)}
                role="gridcell"
              >
                {cell}
              </button>
            ))}
          </div>

          <button
            onClick={handleRestart}
            style={{
              marginTop: 18, background: ACCENT, color: WHITE,
              border: 'none', borderRadius: 8, padding: '8px 21px',
              fontWeight: 600, fontSize: 15, letterSpacing: '.02em', cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(245,0,87,0.03)', transition: 'background 0.2s'
            }}
          >
            Restart
          </button>
          <div style={{
            fontSize: 13, marginTop: 12, color: "#555A", lineHeight: 1.6, maxWidth: 240
          }}>
            <span style={{display:'block'}}>Game by KAVIA | X = {mode==='cpu'?'You':'Player 1'}, O = {mode==='cpu'?'CPU':'Player 2'}</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
