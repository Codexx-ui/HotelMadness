import React, { useState, useEffect, useRef, useCallback } from 'react';

const DIRTY_ITEMS = [
  { emoji: '🧻', label: 'Βρώμικη Πετσέτα' },
  { emoji: '🗑️', label: 'Σκουπίδια' },
  { emoji: '🍾', label: 'Άδειο Μπουκάλι' },
  { emoji: '🍕', label: 'Απομεινάρια Φαγητού' },
  { emoji: '👟', label: 'Παπούτσια Παντού' },
  { emoji: '💊', label: 'Χάπια στο Πάτωμα' },
  { emoji: '🧦', label: 'Κάλτσες' },
  { emoji: '📰', label: 'Εφημερίδες' },
  { emoji: '🚬', label: 'Αποτσίγαρα' },
  { emoji: '🍺', label: 'Κουτάκια Μπύρας' },
];

const REQUIRED_CLEAN = 8;
const TIME_LIMIT = 25;

const createItem = (id) => ({
  id,
  ...DIRTY_ITEMS[Math.floor(Math.random() * DIRTY_ITEMS.length)],
  x: 8 + Math.random() * 76,
  y: 8 + Math.random() * 76,
  size: 44 + Math.random() * 22,
  cleaned: false,
  wobble: Math.random() * 360,
});

export default function RoomCleaningModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  const [phase, setPhase] = useState('intro');
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [particles, setParticles] = useState([]);
  const nextId = useRef(0);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const gameOver = phase === 'result';

  const createItems = () => {
    nextId.current = 0;
    return Array.from({ length: 10 }, () => createItem(nextId.current++));
  };

  const startGame = () => {
    setItems(createItems());
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setParticles([]);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(spawnRef.current);
          setPhase('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Respawn items occasionally to keep area busy
    spawnRef.current = setInterval(() => {
      setItems(prev => {
        const cleaned = prev.filter(i => i.cleaned).length;
        const active = prev.filter(i => !i.cleaned).length;
        if (active < 5) {
          return [...prev, createItem(nextId.current++)];
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    };
  }, [phase]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0 || gameOver) return;
    const t = setTimeout(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            size: Math.max(0, p.size - 0.5),
            opacity: Math.max(0, p.opacity - 0.04)
          }))
          .filter(p => p.opacity > 0.05)
      );
    }, 30);
    return () => clearTimeout(t);
  }, [particles, gameOver]);

  const handleItemClick = (itemId, e) => {
    if (gameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    const cx = rect.left - parentRect.left + rect.width / 2;
    const cy = rect.top - parentRect.top + rect.height / 2;

    // Spawn particles
    setParticles(prev => [
      ...prev,
      ...Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: cx, y: cy,
        vx: Math.cos((i * Math.PI) / 4) * (2 + Math.random() * 3),
        vy: Math.sin((i * Math.PI) / 4) * (2 + Math.random() * 3) - 2,
        size: 8 + Math.random() * 8,
        color: ['#66fcf1', '#fbbf24', '#4bff4b', '#ffffff'][Math.floor(Math.random() * 4)],
        opacity: 1
      }))
    ]);

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, cleaned: true } : i));
    setScore(prev => {
      const newScore = prev + 1;
      if (newScore >= REQUIRED_CLEAN) {
        clearInterval(timerRef.current);
        clearInterval(spawnRef.current);
        setTimeout(() => setPhase('result'), 300);
      }
      return newScore;
    });
  };

  const success = score >= REQUIRED_CLEAN;

  useEffect(() => {
    if (phase === 'result') {
      setTimeout(() => {
        onComplete({ success, score });
      }, 2500);
    }
  }, [phase]);

  const progressPct = Math.min(100, (score / REQUIRED_CLEAN) * 100);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(5, 8, 22, 0.9)', backdropFilter: 'blur(12px)',
      zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0d1127',
        border: '2px solid rgba(102, 252, 241, 0.4)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(102,252,241,0.1)',
        borderRadius: '20px', width: '100%', maxWidth: '640px',
        padding: '1.5rem', textAlign: 'center', position: 'relative'
      }}>

        {phase === 'intro' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer'
          }}>✕</button>
        )}

        <h2 style={{
          fontSize: '1.8rem', color: '#66fcf1', margin: '0 0 0.25rem 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          🧹 Καθαρισμός Δωματίου
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 1.2rem 0' }}>
          Season 4 Mini-Game
        </p>

        {/* INTRO */}
        {phase === 'intro' && (
          <div>
            <div style={{
              background: 'rgba(102, 252, 241, 0.05)', border: '1px dashed rgba(102,252,241,0.2)',
              borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left'
            }}>
              <p style={{ color: '#e2e8f0', margin: '0 0 0.75rem 0', lineHeight: '1.6' }}>
                Το δωμάτιο 314 είναι <strong style={{ color: '#ff4b4b' }}>τελεία καταστροφή</strong> και ο επόμενος πελάτης
                φτάνει σε 25 λεπτά! Η καμαριέρα Σούλα έχει πυρετό. Πρέπει να το καθαρίσεις <em>μόνος σου</em>.
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>
                <li>Κάνε κλικ στα βρώμικα αντικείμενα για να τα μαζέψεις.</li>
                <li>Χρειάζεσαι τουλάχιστον <strong>{REQUIRED_CLEAN}</strong> αντικείμενα σε <strong>{TIME_LIMIT} δευτερόλεπτα</strong>.</li>
                <li><strong style={{ color: '#4bff4b' }}>Επιτυχία:</strong> Stress -20, Reputation +15</li>
                <li><strong style={{ color: '#ff4b4b' }}>Αποτυχία:</strong> Stress +25, Reputation -15</li>
              </ul>
            </div>
            <button className="btn-primary" onClick={startGame}
              style={{ padding: '0.8rem 3rem', fontSize: '1.1rem', borderRadius: '30px' }}>
              🧹 Ξεκίνα Καθαρισμό!
            </button>
          </div>
        )}

        {/* PLAYING */}
        {phase === 'playing' && (
          <div>
            {/* HUD */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '0.8rem'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                Καθαρά: <strong style={{ color: '#66fcf1', fontSize: '1.1rem' }}>{score}</strong> / {REQUIRED_CLEAN}
              </span>
              <span style={{
                fontSize: '1.2rem', fontWeight: '800',
                color: timeLeft <= 8 ? '#ff4b4b' : '#fbbf24',
                animation: timeLeft <= 8 ? 'pulse 0.8s infinite' : 'none'
              }}>{timeLeft}s</span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '0.8rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #66fcf1, #4bff4b)',
                borderRadius: '3px', transition: 'width 0.2s'
              }} />
            </div>

            {/* PLAY AREA */}
            <div style={{
              width: '100%', height: '360px',
              background: 'linear-gradient(135deg, #1a1035 0%, #0d1127 100%)',
              border: '2px solid rgba(102,252,241,0.15)',
              borderRadius: '14px', position: 'relative', overflow: 'hidden',
              cursor: 'default'
            }}>
              {/* Room background details */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px',
                background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)'
              }} />

              {/* Dirty items */}
              {items.filter(i => !i.cleaned).map(item => (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(item.id, e)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    fontSize: `${item.size}px`,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transform: `rotate(${item.wobble}deg)`,
                    transition: 'transform 0.1s',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    animation: 'none',
                    zIndex: 5
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = `rotate(${item.wobble}deg) scale(1.2)`; e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255,200,50,0.7))'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${item.wobble}deg) scale(1)`; e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'; }}
                  title={item.label}
                >
                  {item.emoji}
                </div>
              ))}

              {/* Particles */}
              {particles.map(p => (
                <div key={p.id} style={{
                  position: 'absolute',
                  left: `${p.x}px`, top: `${p.y}px`,
                  width: `${p.size}px`, height: `${p.size}px`,
                  background: p.color,
                  borderRadius: '50%',
                  boxShadow: `0 0 6px ${p.color}`,
                  opacity: p.opacity,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 10
                }} />
              ))}

              {/* "Clean" overlay hint */}
              {items.filter(i => !i.cleaned).length === 0 && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#66fcf1', fontSize: '1.2rem', fontWeight: '700'
                }}>
                  ✨ Τέλεια Καθαρό! ✨
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div>
            {success ? (
              <>
                <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🧹✨</div>
                <h3 style={{ color: '#4bff4b', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Λαμπερό Δωμάτιο!</h3>
                <p style={{ color: '#a8b2d8', marginBottom: '1rem' }}>
                  Μάζεψες <strong style={{ color: '#66fcf1' }}>{score}</strong> βρώμικα αντικείμενα!
                  Ο επόμενος πελάτης θα μείνει εντυπωσιασμένος.
                </p>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '2rem',
                  background: 'rgba(75,255,75,0.05)', border: '1px solid rgba(75,255,75,0.2)',
                  borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                }}>
                  <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Stress</span><strong style={{ color: '#4bff4b', fontSize: '1.3rem' }}>-20</strong></div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Reputation</span><strong style={{ color: '#66fcf1', fontSize: '1.3rem' }}>+15</strong></div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🧹💀</div>
                <h3 style={{ color: '#ff4b4b', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Αποτυχία Καθαρισμού!</h3>
                <p style={{ color: '#a8b2d8', marginBottom: '1rem' }}>
                  Μάζεψες μόνο <strong style={{ color: '#ff4b4b' }}>{score}</strong> αντικείμενα.
                  Ο πελάτης βρήκε το δωμάτιο σαν αποθήκη και ζητάει να μιλήσει με τον Μουστάκα.
                </p>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '2rem',
                  background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)',
                  borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                }}>
                  <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Stress</span><strong style={{ color: '#ff4b4b', fontSize: '1.3rem' }}>+25</strong></div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Reputation</span><strong style={{ color: '#ff4b4b', fontSize: '1.3rem' }}>-15</strong></div>
                </div>
              </>
            )}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Επιστρέφεις στο παιχνίδι...</p>
          </div>
        )}
      </div>
    </div>
  );
}
