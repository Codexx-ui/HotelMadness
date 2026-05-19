import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';

const DynamicPortrait = ({ src, alt, fallbackName, fallbackGender, fallbackInitial }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    const gradient = fallbackGender === 'female'
      ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)';
    const border = fallbackGender === 'female' ? '#ec4899' : '#3b82f6';
    const shadow = fallbackGender === 'female'
      ? '0 0 15px rgba(236, 72, 153, 0.4)'
      : '0 0 15px rgba(59, 130, 246, 0.4)';

    return (
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: `2px solid ${border}`,
        boxShadow: shadow,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.4rem',
        userSelect: 'none',
        position: 'relative'
      }} title={fallbackName}>
        {fallbackInitial}
        <span style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          backgroundColor: '#0a0d1e',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          border: `1px solid ${border}`,
          color: '#fff'
        }}>
          {fallbackGender === 'female' ? '♀' : '♂'}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      border: '2px solid var(--accent-color)',
      borderRadius: '50%',
      overflow: 'hidden',
      width: '60px',
      height: '60px',
      boxShadow: '0 2px 8px rgba(102, 252, 241, 0.3)',
      backgroundColor: 'rgba(0,0,0,0.2)'
    }}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};

const getActiveCharacters = (story_text = '', scene_title = '') => {
  const text = ((story_text || '') + ' ' + (scene_title || '')).toLowerCase();
  const chars = [];
  
  const isChefSavvasScene = text.includes('σάββας') || text.includes('σάββα') || text.includes('σεφ αντώνης');
  const isMoustakasScene = text.includes('μουστάκας') || text.includes('μουστάκα') || text.includes('moustakas');
  
  if (isChefSavvasScene) {
    chars.push({
      src: '/savvas_face.jpg',
      alt: 'Chef Antonis Savvas',
      name: 'Chef Αντώνης Σάββας',
      gender: 'male',
      initial: 'Σ'
    });
  }
  
  if (isMoustakasScene) {
    chars.push({
      src: '/moustakas_face.jpg',
      alt: 'GM Georgios Moustakas',
      name: 'GM Γεώργιος Μουστάκας',
      gender: 'male',
      initial: 'Μ'
    });
  }
  
  if (text.includes('κατερίνα') || text.includes('κατερίνας') || text.includes('katerina')) {
    chars.push({
      src: '/katerina_face.jpg',
      alt: 'Maitress Katerina',
      name: 'Maitress Κατερίνα',
      gender: 'female',
      initial: 'Κ'
    });
  }
  
  if (text.includes('μπαλατσούκας') || text.includes('μπαλατσούκα') || text.includes('μπαλατσουκα')) {
    chars.push({
      src: '/balatsoukas_face.jpg',
      alt: 'Balatsoukas',
      name: 'Μπαλατσούκας',
      gender: 'male',
      initial: 'Μ'
    });
  }
  
  if (text.includes('βαλάντης') || text.includes('βαλάντη') || text.includes('βαλαντη')) {
    chars.push({
      src: '/valantis_face.jpg',
      alt: 'Valantis',
      name: 'Βαλάντης',
      gender: 'male',
      initial: 'Β'
    });
  }
  
  if (text.includes('φασλί') || text.includes('fasli') || text.includes('φασλι')) {
    chars.push({
      src: '/fasli_face.jpg',
      alt: 'Fasli',
      name: 'Φασλί',
      gender: 'male',
      initial: 'Φ'
    });
  }
  
  if (text.includes('καμαριέρα') || text.includes('καμαριέρας') || text.includes('καμαριερες')) {
    chars.push({
      src: '/kamariera_face.jpg',
      alt: 'Kamariera',
      name: 'Καμαριέρα',
      gender: 'female',
      initial: 'Κ'
    });
  }
  
  if (text.includes('bellboy') || text.includes('μπελμπόι')) {
    chars.push({
      src: '/bellboy_face.jpg',
      alt: 'Bellboy',
      name: 'Bellboy',
      gender: 'male',
      initial: 'Β'
    });
  }
  
  if (text.includes('λαντζέρης') || text.includes('λαντζέρηδες') || text.includes('λαντζέρη')) {
    chars.push({
      src: '/langeris_face.jpg',
      alt: 'Langeris',
      name: 'Λαντζέρης',
      gender: 'male',
      initial: 'Λ'
    });
  }

  if (chars.length === 0) {
    if (text.includes('καμαριέρα') || text.includes('κοπέλα') || text.includes('συνάδελφος κοπέλα') || text.includes('γυναίκα')) {
      chars.push({
        src: '/generic_female.jpg',
        alt: 'Staff',
        name: 'Υπάλληλος (Γυναίκα)',
        gender: 'female',
        initial: '👩'
      });
    } else if (text.includes('μάγειρας') || text.includes('σερβιτόρος') || text.includes('υπάλληλος') || text.includes('πελάτης') || text.includes('συνάδελφος') || text.includes('άνδρας')) {
      chars.push({
        src: '/generic_male.jpg',
        alt: 'Staff',
        name: 'Υπάλληλος (Άνδρας)',
        gender: 'male',
        initial: '👨'
      });
    }
  }

  return chars;
};

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
        <div className="terminal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <h2 className="scene-title" style={{ margin: 0 }}>{scene_title}</h2>
          {active_vip_archetype && active_vip_archetype !== 'None' && (
            <span className="badge vip" style={{ margin: 0 }}>{active_vip_archetype}</span>
          )}

          {(() => {
            if (sceneData.image) return null;
            const activeChars = getActiveCharacters(story_text, scene_title);
            if (activeChars.length === 0) return null;
            return (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {activeChars.map((char, index) => (
                  <DynamicPortrait
                    key={index}
                    src={char.src}
                    alt={char.alt}
                    fallbackName={char.name}
                    fallbackGender={char.gender}
                    fallbackInitial={char.initial}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        <div className="story-content">
          {sceneData.image && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={sceneData.image} 
                alt="Scene Character" 
                style={{ 
                  maxWidth: '300px', 
                  borderRadius: '12px', 
                  border: '2px solid var(--panel-border)', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }} 
              />
            </div>
          )}
          
          <p>
            {(() => {
              if (!story_text) return null;
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const parts = story_text.split(urlRegex);
              return parts.map((part, index) => {
                if (part.match(urlRegex)) {
                  const isThesfapa = part.includes('Thesfapa');
                  const isFapOMeter = part.includes('FapOMeter');
                  const cleanHref = part.replace(/['".,;!]$/, '');
                  return (
                    <a
                      key={index}
                      href={cleanHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (isFapOMeter) {
                          e.preventDefault();
                          if (onThesfapaClick) {
                            onThesfapaClick();
                          }
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
                      {isFapOMeter ? 'ΦαΠ-Ο-Μέτρο 🤚 Παίξε τώρα!' : (isThesfapa ? 'Θες Φαπα ✨ παίξε τώρα!' : part)}
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
