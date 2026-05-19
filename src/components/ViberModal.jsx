import React, { useRef, useEffect } from 'react';

const ViberModal = ({ messages, onClose, onAcceptItem }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="viber-container" style={{
        width: '90%', maxWidth: '400px', height: '80vh', maxHeight: '700px',
        backgroundColor: '#f5f5f5', borderRadius: '24px', display: 'flex',
        flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(115, 96, 242, 0.4)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#7360f2', color: 'white', padding: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem' }}>💬</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Hotel Chats</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Online</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'white',
            fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem'
          }}>✕</button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1, padding: '1rem', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: '#e5e5ea', backgroundImage: 'radial-gradient(#d1d1d6 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          {!messages || messages.filter(m => m && m.sender && m.text).length === 0 ? (
            <div style={{ textAlign: 'center', color: '#8e8e93', marginTop: '2rem', fontSize: '0.9rem' }}>
              Κανένα νέο μήνυμα.
            </div>
          ) : (
            messages
              .filter(m => m && m.sender && m.text)
              .map((msg, index) => {
                const isOps = msg.sender && msg.sender.includes('Τσαφρακίδης');
                return (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isOps ? '#7360f2' : '#8e8e93',
                      marginBottom: '0.2rem',
                      marginLeft: '0.5rem',
                      fontWeight: isOps ? 'bold' : 'normal'
                    }}>
                      {msg.sender}
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      color: '#000',
                      padding: '0.75rem 1rem',
                      borderRadius: '18px',
                      borderTopLeftRadius: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}>
                      {msg.text}
                      {msg.item && !msg.accepted && (
                        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
                          <button onClick={() => onAcceptItem(index)} style={{
                            backgroundColor: '#7360f2', color: 'white', border: 'none',
                            padding: '0.5rem 1rem', borderRadius: '8px', width: '100%',
                            cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                          }}>
                            🎁 Αποδοχή Δώρου
                          </button>
                        </div>
                      )}
                      {msg.item && msg.accepted && (
                        <div style={{
                          marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold'
                        }}>
                          ✓ Δώρο λήφθηκε!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ViberModal;
