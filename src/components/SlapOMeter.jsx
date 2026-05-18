// src/components/SlapOMeter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Zap, Flame } from 'lucide-react';

export default function SlapOMeter({ onClose, onResult }) {
  const [position, setPosition] = useState(0);
  const [isSlapped, setIsSlapped] = useState(false);
  const [slapScore, setSlapScore] = useState(null); // 'perfect', 'good', 'fail'
  const directionRef = useRef(1); // 1 = right, -1 = left
  const requestRef = useRef(null);

  // Rapidly slide cursor back and forth
  useEffect(() => {
    if (isSlapped) return;

    const animate = () => {
      setPosition((prev) => {
        let next = prev + directionRef.current * 1.8; // Speed of the slider
        if (next >= 100) {
          next = 100;
          directionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isSlapped]);

  const handleSlapClick = () => {
    if (isSlapped) return;
    setIsSlapped(true);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // Determine score based on cursor position (0 - 100)
    // Center is 50. Green Perfect zone: 45 - 55 (10% wide)
    // Yellow Good zone: 30 - 44 & 56 - 70 (30% wide)
    // Red Fail zone: <30 & >70 (60% wide)
    let score = 'fail';
    if (position >= 45 && position <= 55) {
      score = 'perfect';
    } else if (position >= 28 && position <= 72) {
      score = 'good';
    }

    setSlapScore(score);
    
    // Pass result to parent after 2 seconds to let them see the animations
    setTimeout(() => {
      onResult(score);
      onClose();
    }, 2200);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, backgroundColor: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95), rgba(5, 5, 15, 0.95))',
        border: '2px solid rgba(102, 252, 241, 0.4)',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 0 40px rgba(102, 252, 241, 0.25)',
        position: 'relative',
        animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        
        {/* Title */}
        <h2 style={{ color: '#66fcf1', margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Zap size={28} fill="currentColor" /> ΦαΠ-Ο-ΜΕΤΡΟ <Zap size={28} fill="currentColor" />
        </h2>
        <p style={{ color: '#a8b2d8', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
          Πέτυχε την πράσινη ζώνη στο κέντρο για το απόλυτο <strong>MEGASLAP</strong>!
        </p>

        {/* Visual Slap Meter Bar */}
        <div style={{
          position: 'relative',
          height: '40px',
          background: 'linear-gradient(to right, #ff4b4b 0%, #ff4b4b 30%, #ffc107 30%, #ffc107 45%, #4bff4b 45%, #4bff4b 55%, #ffc107 55%, #ffc107 70%, #ff4b4b 70%, #ff4b4b 100%)',
          borderRadius: '20px',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5), 0 0 15px rgba(255,255,255,0.05)',
          marginBottom: '2rem',
          overflow: 'visible'
        }}>
          {/* Label markers */}
          <div style={{ position: 'absolute', left: '15%', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' }}>FAIL</div>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.82rem', fontWeight: 'extrabold', color: '#0b0c10', textShadow: '0 0 5px rgba(255,255,255,0.8)' }}>MEGA</div>
          <div style={{ position: 'absolute', right: '15%', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' }}>FAIL</div>

          {/* Sliding Pointer Cursor */}
          <div style={{
            position: 'absolute',
            left: `${position}%`,
            top: '-5px',
            width: '10px',
            height: '50px',
            background: '#ffffff',
            borderRadius: '5px',
            boxShadow: '0 0 12px rgba(255,255,255,0.9), 0 0 4px #000',
            transform: 'translateX(-50%)',
            transition: isSlapped ? 'none' : 'left 0.03s linear',
            zIndex: 10
          }}>
            {/* Pointer arrow */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid #ffffff'
            }}></div>
          </div>
        </div>

        {/* Outcome Splash Art */}
        <div style={{ height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
          {!isSlapped ? (
            <div style={{ animation: 'pulse 1.5s infinite', fontSize: '1.1rem', color: '#a8b2d8', fontWeight: 600 }}>
              Ο δείκτης κουνιέται... Προετοιμάσου! 🤚
            </div>
          ) : (
            <div style={{
              fontSize: '3rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.5)',
              color: slapScore === 'perfect' ? '#4bff4b' : slapScore === 'good' ? '#ffc107' : '#ff4b4b',
              textShadow: slapScore === 'perfect' 
                ? '0 0 20px rgba(75, 255, 75, 0.6), 0 0 5px #fff' 
                : slapScore === 'good' 
                  ? '0 0 20px rgba(255, 193, 7, 0.6)' 
                  : '0 0 20px rgba(255, 75, 75, 0.6)'
            }}>
              {slapScore === 'perfect' && "💥 MEGASLAP! 💥"}
              {slapScore === 'good' && "👋 ΑΠΛΗ ΦΑΠΑ 👋"}
              {slapScore === 'fail' && "💀 ΑΣΤΟΧΙΑ! 💀"}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          disabled={isSlapped}
          onClick={handleSlapClick}
          style={{
            width: '100%',
            background: isSlapped 
              ? 'rgba(255,255,255,0.05)' 
              : 'linear-gradient(135deg, #66fcf1, #45a29e)',
            border: isSlapped ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: '16px',
            padding: '1.25rem',
            color: isSlapped ? 'rgba(255,255,255,0.3)' : '#0b0c10',
            fontSize: '1.4rem',
            fontWeight: 800,
            cursor: isSlapped ? 'not-allowed' : 'pointer',
            boxShadow: isSlapped ? 'none' : '0 0 20px rgba(102, 252, 241, 0.4)',
            transition: 'all 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            textTransform: 'uppercase'
          }}
        >
          <Flame size={24} fill="currentColor" /> ΡΙΞΕ ΦΑΠΑ! <Flame size={24} fill="currentColor" />
        </button>

        {/* Small Close Button */}
        {!isSlapped && (
          <button 
            onClick={onClose} 
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
