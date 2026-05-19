import React, { useState, useEffect, useRef } from 'react';

const DishwasherModal = ({ isOpen, onClose, onComplete }) => {
  if (!isOpen) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [plates, setPlates] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [sparks, setSparks] = useState([]);
  const nextPlateId = useRef(0);
  const gameTimer = useRef(null);
  const spawnTimer = useRef(null);
  const audioCtx = useRef(null);

  // Play synthesized bubble/pop sound
  const playCleanSound = () => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtx.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  // Start the game loop
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(15);
    setGameOver(false);
    setPlates([]);
    setBubbles([]);
    setSparks([]);
    nextPlateId.current = 0;

    // Initial plates
    const initialPlates = [];
    for (let i = 0; i < 5; i++) {
      initialPlates.push(createRandomPlate());
    }
    setPlates(initialPlates);
  };

  const createRandomPlate = () => {
    const id = nextPlateId.current++;
    // random position within the 90% boundary of container
    const x = 5 + Math.random() * 80;
    const y = 5 + Math.random() * 75;
    const size = 70 + Math.random() * 30; // 70px to 100px
    const rotation = Math.random() * 360;
    // stains count
    const stainCount = Math.floor(Math.random() * 3) + 2; // 2-4 stains
    const stains = Array.from({ length: stainCount }).map((_, idx) => ({
      id: idx,
      top: 15 + Math.random() * 50,
      left: 15 + Math.random() * 50,
      size: 10 + Math.random() * 18,
      color: ['#4d623b', '#2f3b23', '#715a31', '#546b3f'][Math.floor(Math.random() * 4)]
    }));

    return { id, x, y, size, rotation, stains, speedX: (Math.random() - 0.5) * 1.5, speedY: (Math.random() - 0.5) * 1.5 };
  };

  // Handle game timers
  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !gameOver) {
      gameTimer.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(gameTimer.current);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Plate movement & spawn loop
      spawnTimer.current = setInterval(() => {
        setPlates((prev) => {
          // move plates
          let moved = prev.map(p => {
            let nextX = p.x + p.speedX;
            let nextY = p.y + p.speedY;
            let sx = p.speedX;
            let sy = p.speedY;

            // Bounce off boundaries
            if (nextX < 2 || nextX > 88) sx = -sx;
            if (nextY < 2 || nextY > 80) sy = -sy;

            return {
              ...p,
              x: Math.max(2, Math.min(88, nextX)),
              y: Math.max(2, Math.min(80, nextY)),
              speedX: sx,
              speedY: sy
            };
          });

          // occasional spawn if less than 7 plates
          if (moved.length < 7 && Math.random() < 0.35) {
            moved.push(createRandomPlate());
          }
          return moved;
        });
      }, 50);
    }

    return () => {
      clearInterval(gameTimer.current);
      clearInterval(spawnTimer.current);
    };
  }, [isPlaying, timeLeft, gameOver]);

  const endGame = () => {
    setGameOver(true);
    clearInterval(gameTimer.current);
    clearInterval(spawnTimer.current);
  };

  const handlePlateClick = (plateId, e) => {
    if (gameOver || !isPlaying) return;

    // Get click coords for effects
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    const clickX = rect.left - parentRect.left + rect.width / 2;
    const clickY = rect.top - parentRect.top + rect.height / 2;

    playCleanSound();

    // Create sparks & bubbles
    const newBubbles = Array.from({ length: 5 }).map((_, idx) => ({
      id: Date.now() + idx,
      x: clickX,
      y: clickY,
      vx: (Math.random() - 0.5) * 4,
      vy: -2 - Math.random() * 3,
      size: 8 + Math.random() * 12
    }));

    const newSparks = Array.from({ length: 8 }).map((_, idx) => ({
      id: Date.now() + 10 + idx,
      x: clickX,
      y: clickY,
      vx: Math.cos((idx * Math.PI) / 4) * (3 + Math.random() * 3),
      vy: Math.sin((idx * Math.PI) / 4) * (3 + Math.random() * 3),
      size: 4 + Math.random() * 4
    }));

    setBubbles((prev) => [...prev, ...newBubbles]);
    setSparks((prev) => [...prev, ...newSparks]);

    setScore((prev) => prev + 1);

    // Remove the washed plate and spawn a new one
    setPlates((prev) => {
      const filtered = prev.filter((p) => p.id !== plateId);
      // Ensure we always have at least 4 plates
      while (filtered.length < 5) {
        filtered.push(createRandomPlate());
      }
      return filtered;
    });
  };

  // Animate bubbles & sparks
  useEffect(() => {
    if ((bubbles.length > 0 || sparks.length > 0) && !gameOver) {
      const animTimer = setTimeout(() => {
        setBubbles((prev) =>
          prev
            .map((b) => ({
              ...b,
              x: b.x + b.vx,
              y: b.y + b.vy,
              vy: b.vy + 0.1, // gravity
              size: Math.max(0, b.size - 0.4)
            }))
            .filter((b) => b.size > 1)
        );

        setSparks((prev) =>
          prev
            .map((s) => ({
              ...s,
              x: s.x + s.vx,
              y: s.y + s.vy,
              size: Math.max(0, s.size - 0.2)
            }))
            .filter((s) => s.size > 0.5)
        );
      }, 30);

      return () => clearTimeout(animTimer);
    }
  }, [bubbles, sparks, gameOver]);

  const handleFinish = () => {
    const success = score >= 15;
    onComplete({ success, score });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 8, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0d1127',
        border: '2px solid var(--panel-border)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(102, 252, 241, 0.15)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '650px',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Close button (only before starting or after game over) */}
        {(!isPlaying || gameOver) && (
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            ✕
          </button>
        )}

        <h2 style={{
          fontSize: '2rem',
          color: 'var(--accent-color)',
          textShadow: '0 0 10px rgba(102, 252, 241, 0.4)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          🧼 Η Ώρα της Λάντζας
        </h2>

        {!isPlaying && !gameOver ? (
          <div>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Το κεντρικό πλυντήριο πιάτων χάλασε και η κουζίνα έχει γεμίσει βρώμικα σκεύη! 
              Ο Chef ουρλιάζει και ο Μουστάκας ελέγχει τις κάμερες.
            </p>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px dashed rgba(102, 252, 241, 0.2)',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h4 style={{ color: 'var(--accent-color)', margin: '0 0 0.5rem 0' }}>Οδηγίες παιχνιδιού:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <li>Καθάρισε τουλάχιστον <strong>15 πιάτα</strong> σε <strong>15 δευτερόλεπτα</strong>.</li>
                <li>Κάνε κλικ/tap πάνω στα βρώμικα πιάτα για να τα πλύνεις.</li>
                <li><strong>Επιτυχία:</strong> -20 Stress & +10€ Cash.</li>
                <li><strong>Αποτυχία:</strong> +15 Stress (εργασιακό κάψιμο).</li>
              </ul>
            </div>
            <button 
              className="btn-primary"
              onClick={startGame}
              style={{ padding: '0.8rem 3rem', fontSize: '1.2rem', borderRadius: '30px' }}
            >
              Ξεκίνα το Πλύσιμο
            </button>
          </div>
        ) : isPlaying && !gameOver ? (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--panel-border)'
            }}>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                Καθαρά: <strong style={{ color: 'var(--accent-color)', fontSize: '1.3rem' }}>{score}</strong> / 15
              </span>
              <span style={{ 
                fontSize: '1.1rem', 
                color: timeLeft <= 5 ? '#ff4d4d' : 'var(--text-primary)',
                fontWeight: 'bold',
                animation: timeLeft <= 5 ? 'pulse 1s infinite' : 'none'
              }}>
                Χρόνος: {timeLeft}s
              </span>
            </div>

            {/* SINK PLAY AREA */}
            <div style={{
              width: '100%',
              height: '380px',
              backgroundColor: '#0a0d1e',
              border: '2px solid rgba(102, 252, 241, 0.2)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
            }}>
              {/* Water background ripples (bubbles animation decoration) */}
              <div className="water-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.15,
                background: 'linear-gradient(180deg, #1b305c 0%, #0a0d1e 100%)',
                pointerEvents: 'none'
              }} />

              {/* RENDER PLATES */}
              {plates.map((plate) => (
                <div
                  key={plate.id}
                  onClick={(e) => handlePlateClick(plate.id, e)}
                  style={{
                    position: 'absolute',
                    left: `${plate.x}%`,
                    top: `${plate.y}%`,
                    width: `${plate.size}px`,
                    height: `${plate.size}px`,
                    backgroundColor: '#f8f9fa',
                    border: '4px solid #ced4da',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 0 15px rgba(0,0,0,0.1)',
                    transform: `rotate(${plate.rotation}deg)`,
                    transition: 'transform 0.05s linear',
                    userSelect: 'none'
                  }}
                >
                  {/* Outer rim detail */}
                  <div style={{
                    width: '85%',
                    height: '85%',
                    border: '1px solid #dee2e6',
                    borderRadius: '50%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Render dirt/grease stains on the plate */}
                    {plate.stains.map((stain) => (
                      <div
                        key={stain.id}
                        style={{
                          position: 'absolute',
                          top: `${stain.top}%`,
                          left: `${stain.left}%`,
                          width: `${stain.size}px`,
                          height: `${stain.size}px`,
                          backgroundColor: stain.color,
                          borderRadius: '40% 60% 50% 50% / 50% 40% 60% 50%', // organic liquid shape
                          opacity: 0.85,
                          filter: 'blur(1px)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* BUBBLE FX */}
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  style={{
                    position: 'absolute',
                    left: `${b.x}px`,
                    top: `${b.y}px`,
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                    border: '1.5px solid rgba(255, 255, 255, 0.7)',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(102, 252, 241, 0.15)',
                    boxShadow: 'inset 0 0 4px #fff',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                />
              ))}

              {/* SPARKLE FX */}
              {sparks.map((s) => (
                <div
                  key={s.id}
                  style={{
                    position: 'absolute',
                    left: `${s.x}px`,
                    top: `${s.y}px`,
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    backgroundColor: '#66fcf1',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #66fcf1',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* GAME OVER / RESULTS */
          <div>
            {score >= 15 ? (
              <div>
                <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#4caf50', fontSize: '1.8rem', marginBottom: '1rem' }}>
                  Αποστολή Εξετελέσθη!
                </h3>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                  Καθάρισες <strong style={{ color: 'var(--accent-color)' }}>{score}</strong> πιάτα! 
                  Ο Chef Σάββας σε κοιτάζει ικανοποιημένος (για 5 λεπτά) και η κουζίνα λάμπει.
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem',
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  maxWidth: '320px',
                  margin: '0 auto 2rem'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stress</span>
                    <strong style={{ color: '#4caf50', fontSize: '1.25rem' }}>-20</strong>
                  </div>
                  <div style={{ width: '1px', backgroundColor: 'var(--panel-border)' }}></div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bonus</span>
                    <strong style={{ color: 'var(--accent-color)', fontSize: '1.25rem' }}>+10€</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🤦‍♂️</div>
                <h3 style={{ color: '#f44336', fontSize: '1.8rem', marginBottom: '1rem' }}>
                  Τραγική Αποτυχία!
                </h3>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                  Καθάρισες μόνο <strong style={{ color: '#f44336' }}>{score}</strong> πιάτα.
                  Ο Μουστάκας σε βρήκε να χαζεύεις στο κινητό σου δίπλα στο νεροχύτη.
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(244, 67, 54, 0.05)',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  maxWidth: '200px',
                  margin: '0 auto 2rem'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stress</span>
                    <strong style={{ color: '#f44336', fontSize: '1.25rem' }}>+15</strong>
                  </div>
                </div>
              </div>
            )}

            <button 
              className="btn-primary"
              onClick={handleFinish}
              style={{ padding: '0.8rem 3rem', fontSize: '1.2rem', borderRadius: '30px' }}
            >
              Συνέχεια
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishwasherModal;
