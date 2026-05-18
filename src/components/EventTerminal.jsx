import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';

const SURVIVAL_TIPS = [
  "Tip: Αν ο Μουστάκας φωνάζει, απλά κουνήστε το κεφάλι καταφατικά και πείτε 'corporate alignment'. Λειτουργεί πάντα.",
  "Tip: Μην πίνετε ποτέ το σφηνάκι του VIP πελάτη. Είναι παγίδα του HR.",
  "Tip: Η γιαγιά είναι ο κρυφός επενδυτής της Faplantica. Κάντε της ένα τηλέφωνο αν ξεμείνετε από ρευστό.",
  "Tip: Το 'Μαγικό Μάτι' 🧿 δεν είναι απλή πρόληψη. Στη Faplantica είναι ζήτημα επιβίωσης.",
  "Tip: Αν δείτε τον Μουστάκα να έρχεται με το tablet στο χέρι, κρυφτείτε πίσω από τα λινά της λάντζας.",
  "Tip: Ο διπλός Freddo Espresso είναι το επίσημο καύσιμο της σεζόν. Χωρίς αυτόν, το burnout παραμονεύει.",
  "Tip: VIP πελάτης που ζητάει 'καλή θέση' χωρίς tip είναι σαν καλοκαίρι χωρίς ζέστη. Απλά δεν υπάρχει.",
  "Tip: Αν χυθεί καφές πάνω σε λευκό παντελόνι πελάτη, πείτε ότι είναι το νέο organic pattern του ξενοδοχείου.",
  "Tip: Οι Influencers τρέφονται με likes, αλλά εσείς τρέφεστε με tips. Μην μπερδεύετε τις προτεραιότητες.",
  "Tip: Το ρεπό στην Faplantica είναι σαν τον Μινώταυρο: όλοι έχουν ακούσει γι' αυτό, κανείς δεν το έχει δει.",
  "Tip: Ο Γιατρός Σωτήρης υπογράφει αναρρωτικές πιο γρήγορα και από τη σκιά του. Χρησιμοποιήστε τον σοφά.",
  "Tip: Αν σας ρωτήσει ο Μουστάκας για το 'KPI alignment', απαντήστε 'το έχουμε φτάσει στο 110% κύριε Γιώργο'.",
  "Tip: Η Faplantica έχει 5 αστέρια, αλλά οι εργαζόμενοι βλέπουν μόνο τα αστέρια της κούρασης το βράδυ.",
  "Tip: Μην προσπαθήσετε να εξηγήσετε το μενού στους τουρίστες. Απλά πείτε 'very traditional, high energy' και θα το αγοράσουν.",
  "Tip: Αν ο πελάτης παραπονεθεί για τη ζέστη, πείτε του ότι είναι μέρος της αυθεντικής 'Greek Bath Experience'.",
  "Tip: Το Λάμπρος Steakhouse είναι για τους πλούσιους. Για εσάς, υπάρχει πάντα το Roi Mat.",
  "Tip: Αν το Stress φτάσει στο 99%, μην πανικοβληθείτε. Απλά αγοράστε ένα αυτοκίνητο. Ή ένα Depon.",
  "Tip: Η Φήμη του ξενοδοχείου πέφτει πιο γρήγορα από το ίντερνετ στα δωμάτια. Προσοχή στις κριτικές!",
  "Tip: Αν δείτε τουρίστα να φοράει κάλτσα με σανδάλι, χρεώστε τον έξτρα. Είναι άγραφος νόμος.",
  "Tip: Στη Faplantica δεν δουλεύουμε απλά. Aligning dreams, converting nightmares."
];

export default function EventTerminal({ state, sceneData, onChoice, isLoading, onThesfapaClick }) {
  const [inputText, setInputText] = useState('');
  const [currentTip, setCurrentTip] = useState('');

  useEffect(() => {
    if (isLoading) {
      const randomTip = SURVIVAL_TIPS[Math.floor(Math.random() * SURVIVAL_TIPS.length)];
      setCurrentTip(randomTip);
    }
  }, [isLoading]);

  if (!sceneData) {
    return (
      <div className="panel terminal-panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Awaiting systemic initialization...</p>
      </div>
    );
  }

  const {
    scene_title,
    story_text,
    active_vip_archetype,
    recent_tripadvisor_review,
    choices
  } = sceneData;

  return (
    <div className="panel terminal-panel" style={{ position: 'relative' }}>
      {isLoading && (
        <div className="loading-overlay" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner"></div>
          {currentTip && (
            <div className="loading-tip-container" style={{
              maxWidth: '85%',
              background: 'rgba(102, 252, 241, 0.05)',
              border: '1px solid rgba(102, 252, 241, 0.2)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              color: '#66fcf1',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              lineHeight: '1.5',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
            }}>
              {currentTip}
            </div>
          )}
        </div>
      )}

      <div>
        {state && !sceneData.game_over && (
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>
            Σεζόν {state.season || 1}, {state.turnCount === 0 ? 'Προετοιμασία' : `Εβδομάδα ${state.turnCount}`}
          </div>
        )}
        <div className="terminal-header">
          <h2 className="scene-title">{scene_title}</h2>
          {active_vip_archetype && active_vip_archetype !== 'None' && (
            <span className="badge vip">{active_vip_archetype}</span>
          )}
        </div>

        <div className="story-content">
          <p>
            {(() => {
              if (!story_text) return null;
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const parts = story_text.split(urlRegex);
              return parts.map((part, index) => {
                if (part.match(urlRegex)) {
                  const isThesfapa = part.includes('Thesfapa');
                  const cleanHref = part.replace(/['".,;!]$/, '');
                  return (
                    <a
                      key={index}
                      href={cleanHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (isThesfapa && onThesfapaClick) {
                          onThesfapaClick();
                        }
                      }}
                      style={{
                        color: 'var(--accent-color)',
                        textDecoration: 'underline',
                        fontWeight: 600,
                        wordBreak: 'break-all',
                        cursor: 'pointer'
                      }}
                    >
                      {isThesfapa ? 'Θες Φαπα ✨ παίξε τώρα!' : part}
                    </a>
                  );
                }
                return part;
              });
            })()}
          </p>
          
          {recent_tripadvisor_review && recent_tripadvisor_review.text && (
            <div className="review-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MessageSquare size={16} color="var(--warning-color)" />
                <span style={{ fontWeight: 600 }}>TripAdvisor Review alert</span>
              </div>
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < recent_tripadvisor_review.stars ? "currentColor" : "none"} />
                ))}
              </div>
              <div className="review-text">"{recent_tripadvisor_review.text}"</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                - {recent_tripadvisor_review.author || 'Anonymous Guest'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="choices-container">
        {sceneData.requires_text_input ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <p style={{ color: 'var(--accent-color)', fontWeight: 600, margin: 0 }}>
              {sceneData.requires_text_input}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Γράψε την απάντησή σου..."
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputText.trim()) {
                    onChoice({ id: 0, text: inputText.trim() });
                    setInputText('');
                  }
                }}
              />
              <button
                className="choice-btn"
                style={{ width: 'auto', padding: '0 2rem', marginBottom: 0 }}
                onClick={() => {
                  if (inputText.trim()) {
                    onChoice({ id: 0, text: inputText.trim() });
                    setInputText('');
                  }
                }}
                disabled={isLoading || !inputText.trim()}
              >
                Απάντηση
              </button>
            </div>
          </div>
        ) : (
          choices && choices.map((choice) => (
            <button 
              key={choice.id} 
              className="choice-btn"
              onClick={() => onChoice(choice)}
              disabled={isLoading}
            >
              {choice.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
