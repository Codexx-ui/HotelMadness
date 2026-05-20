import React, { useState, useEffect, useRef } from 'react';

const FRAPPE_TYPES = ['Φραπέ', 'Φρέντο Εσπρέσο', 'Φρέντο Καπουτσίνο'];
const SUGAR_LEVELS = ['Σκέτο', 'Μέτριο', 'Γλυκό', 'Πολύγλυκο'];
const ICE_LEVELS = ['Χωρίς πάγο', 'Λίγο πάγο', 'Κανονικό πάγο', 'Πολύ πάγο'];
const MILK_OPTIONS = ['Χωρίς γάλα', 'Λίγο γάλα', 'Με γάλα'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateOrder = () => ({
  type: randomFrom(FRAPPE_TYPES),
  sugar: randomFrom(SUGAR_LEVELS),
  ice: randomFrom(ICE_LEVELS),
  milk: randomFrom(MILK_OPTIONS),
  customerName: randomFrom(['Κύριος Παπαδόπουλος', 'Κυρία Αλεξίου', 'VIP Κλάιεντ', 'Τουρίστας από Γερμανία', 'Ο Μουστάκας ο ίδιος!']),
  mood: randomFrom(['😤 Εκνευρισμένος', '😠 Αγανακτισμένος', '🤨 Απαιτητικός', '😑 Ανυπόμονος'])
});

export default function FrappeModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  const TIME_LIMIT = 40;

  const [phase, setPhase] = useState('intro'); // intro | playing | result
  const [order] = useState(() => generateOrder());
  const [playerOrder, setPlayerOrder] = useState({
    type: null,
    sugar: null,
    ice: null,
    milk: null
  });
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [result, setResult] = useState(null); // null | 'perfect' | 'good' | 'fail'
  const timerRef = useRef(null);

  const correctCount = () => {
    let count = 0;
    if (playerOrder.type === order.type) count++;
    if (playerOrder.sugar === order.sugar) count++;
    if (playerOrder.ice === order.ice) count++;
    if (playerOrder.milk === order.milk) count++;
    return count;
  };

  const startGame = () => {
    setPhase('playing');
    setPlayerOrder({ type: null, sugar: null, ice: null, milk: null });
    setTimeLeft(TIME_LIMIT);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame(false, 'timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const endGame = (fromButton = false, reason = 'button') => {
    clearInterval(timerRef.current);
    const correct = correctCount();
    let gameResult;
    if (correct === 4) gameResult = 'perfect';
    else if (correct >= 2) gameResult = 'good';
    else gameResult = 'fail';
    if (reason === 'timeout') gameResult = 'fail';
    setResult(gameResult);
    setPhase('result');
    setTimeout(() => {
      onComplete({ result: gameResult, correctCount: correct });
    }, 2500);
  };

  const allSelected = playerOrder.type && playerOrder.sugar && playerOrder.ice && playerOrder.milk;

  const optionBtn = (category, value) => {
    const isSelected = playerOrder[category] === value;
    const isCorrect = isSelected && value === order[category];
    return (
      <button
        key={value}
        onClick={() => setPlayerOrder(prev => ({ ...prev, [category]: value }))}
        style={{
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          border: isSelected ? '2px solid' : '1px solid rgba(255,255,255,0.2)',
          borderColor: isSelected ? (isCorrect ? '#4bff4b' : '#66fcf1') : undefined,
          background: isSelected
            ? 'rgba(102, 252, 241, 0.15)'
            : 'rgba(255,255,255,0.04)',
          color: isSelected ? '#66fcf1' : 'rgba(255,255,255,0.6)',
          fontSize: '0.82rem',
          cursor: 'pointer',
          fontWeight: isSelected ? '700' : '400',
          transition: 'all 0.15s',
          boxShadow: isSelected ? '0 0 8px rgba(102, 252, 241, 0.3)' : 'none'
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(5, 8, 22, 0.9)', backdropFilter: 'blur(12px)',
      zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0d1127',
        border: '2px solid rgba(251, 191, 36, 0.5)',
        boxShadow: '0 8px 40px rgba(251, 191, 36, 0.15), 0 0 20px rgba(0,0,0,0.5)',
        borderRadius: '20px', width: '100%', maxWidth: '600px',
        padding: '2rem', textAlign: 'center', position: 'relative'
      }}>

        {/* CLOSE (only on intro) */}
        {phase === 'intro' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer'
          }}>✕</button>
        )}

        {/* TITLE */}
        <h2 style={{
          fontSize: '1.8rem', color: '#fbbf24', margin: '0 0 0.25rem 0',
          textShadow: '0 0 10px rgba(251,191,36,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          ☕ Η Μάχη του Φραπέ
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
          Season 4 Mini-Game
        </p>

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div>
            <div style={{
              background: 'rgba(251, 191, 36, 0.07)', border: '1px dashed rgba(251,191,36,0.3)',
              borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left'
            }}>
              <p style={{ color: '#e2e8f0', margin: '0 0 0.75rem 0', lineHeight: '1.6' }}>
                Το μπαρ γέμισε και ο πελάτης θέλει <strong style={{ color: '#fbbf24' }}>τον τέλειο καφέ</strong> τώρα!
                Κοίταξε την παραγγελία και φτιάξε τον σωστό συνδυασμό πριν τελειώσει ο χρόνος.
              </p>
              <ul style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>
                <li>Επίλεξε <strong>Τύπο, Ζάχαρη, Πάγο & Γάλα</strong> σύμφωνα με την παραγγελία.</li>
                <li><strong style={{ color: '#4bff4b' }}>Τέλειο (4/4):</strong> Stress -25, Cash +20€ Φιλοδώρημα</li>
                <li><strong style={{ color: '#fbbf24' }}>Σχεδόν (2-3/4):</strong> Stress -10, Cash +5€</li>
                <li><strong style={{ color: '#ff4b4b' }}>Αποτυχία (&lt;2/4):</strong> Stress +20, Reputation -10</li>
              </ul>
            </div>
            <button className="btn-primary" onClick={startGame}
              style={{ padding: '0.8rem 3rem', fontSize: '1.1rem', borderRadius: '30px', background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              ☕ Ξεκίνα τον Καφέ!
            </button>
          </div>
        )}

        {/* PLAYING PHASE */}
        {phase === 'playing' && (
          <div>
            {/* Timer & Customer */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '0.75rem 1.2rem', marginBottom: '1.2rem'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Πελάτης</div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{order.customerName}</div>
                <div style={{ fontSize: '0.85rem' }}>{order.mood}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem', fontWeight: '900',
                  color: timeLeft <= 10 ? '#ff4b4b' : '#fbbf24',
                  animation: timeLeft <= 10 ? 'pulse 0.8s infinite' : 'none'
                }}>
                  {timeLeft}s
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>ΧΡΟΝΟΣ</div>
              </div>
            </div>

            {/* ORDER CARD */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(217,119,6,0.05))',
              border: '1px solid rgba(251,191,36,0.4)',
              borderRadius: '12px', padding: '1rem', marginBottom: '1.2rem'
            }}>
              <div style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                📋 Παραγγελία Πελάτη:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {[order.type, order.sugar, order.ice, order.milk].map((val, i) => (
                  <span key={i} style={{
                    background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)',
                    borderRadius: '20px', padding: '0.3rem 0.8rem',
                    color: '#fbbf24', fontWeight: '700', fontSize: '0.9rem'
                  }}>{val}</span>
                ))}
              </div>
            </div>

            {/* SELECTION AREA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', marginBottom: '1.2rem' }}>
              {[
                { label: '☕ Τύπος Καφέ', cat: 'type', opts: FRAPPE_TYPES },
                { label: '🍬 Ζάχαρη', cat: 'sugar', opts: SUGAR_LEVELS },
                { label: '🧊 Πάγος', cat: 'ice', opts: ICE_LEVELS },
                { label: '🥛 Γάλα', cat: 'milk', opts: MILK_OPTIONS }
              ].map(({ label, cat, opts }) => (
                <div key={cat}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: '600' }}>
                    {label}
                    {playerOrder[cat] === null && <span style={{ color: '#ff9900', marginLeft: '0.4rem' }}>← Επίλεξε!</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {opts.map(v => optionBtn(cat, v))}
                  </div>
                </div>
              ))}
            </div>

            <button
              disabled={!allSelected}
              onClick={() => endGame(true)}
              style={{
                width: '100%', padding: '0.9rem',
                background: allSelected
                  ? 'linear-gradient(135deg, #fbbf24, #d97706)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none', borderRadius: '12px',
                color: allSelected ? '#000' : 'rgba(255,255,255,0.3)',
                fontSize: '1.1rem', fontWeight: '800',
                cursor: allSelected ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: allSelected ? '0 0 20px rgba(251,191,36,0.4)' : 'none'
              }}
            >
              ☕ ΣΕΡΒΙΡΕ ΤΟΝ ΚΑΦΕ!
            </button>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && (
          <div>
            {result === 'perfect' && (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>☕✨</div>
                <h3 style={{ color: '#4bff4b', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>ΤΕΛΕΙΟΣ ΚΑΦΕΣ!</h3>
                <p style={{ color: '#a8b2d8', marginBottom: '1rem' }}>
                  {order.customerName} δεν το πιστεύει! Ο καλύτερος καφές που έχει πιει ποτέ!
                </p>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '2rem',
                  background: 'rgba(75,255,75,0.05)', border: '1px solid rgba(75,255,75,0.2)',
                  borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.8rem' }}>Stress</span><strong style={{ color: '#4bff4b', fontSize: '1.3rem' }}>-25</strong></div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.8rem' }}>Φιλοδώρημα</span><strong style={{ color: '#fbbf24', fontSize: '1.3rem' }}>+20€</strong></div>
                </div>
              </>
            )}
            {result === 'good' && (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>☕👍</div>
                <h3 style={{ color: '#fbbf24', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Σχεδόν Σωστό!</h3>
                <p style={{ color: '#a8b2d8', marginBottom: '1rem' }}>
                  {order.customerName} δεν είναι τέλεια ικανοποιημένος αλλά πάει ψυγείο.
                </p>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '2rem',
                  background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.8rem' }}>Stress</span><strong style={{ color: '#4bff4b', fontSize: '1.3rem' }}>-10</strong></div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.8rem' }}>Cash Bonus</span><strong style={{ color: '#fbbf24', fontSize: '1.3rem' }}>+5€</strong></div>
                </div>
              </>
            )}
            {result === 'fail' && (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>☕💀</div>
                <h3 style={{ color: '#ff4b4b', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Τελεία Καταστροφή!</h3>
                <p style={{ color: '#a8b2d8', marginBottom: '1rem' }}>
                  {order.customerName} απαιτεί να μιλήσει με τον Μουστάκα <em>τώρα</em>!
                </p>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '2rem',
                  background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)',
                  borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.8rem' }}>Stress</span><strong style={{ color: '#ff4b4b', fontSize: '1.3rem' }}>+20</strong></div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.8rem' }}>Reputation</span><strong style={{ color: '#ff4b4b', fontSize: '1.3rem' }}>-10</strong></div>
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
