import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EventTerminal from './components/EventTerminal';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import { generateNextState } from './services/aiService';
import { ChefHat, Coffee, Hotel, ShieldAlert, Volume2, VolumeX, Settings } from 'lucide-react';
import { audioService } from './services/audioService';
import { SPECIFIC_EVENTS, GENERAL_EVENTS } from './data/events';
import confetti from 'canvas-confetti';

const INITIAL_STATE = {
  stress: 10,
  reputation: 50,
  cash: 50,
  role: null,
  shift: 'Πρωινή Βάρδια',
  inventory: [],
  staffRelations: 0,
  alcoholWarnings: 0,
  occupancy: 65,
  financialMetric: 45,
  staffTurnover: 5,
  thesfapaClicked: false,
  turnsSinceThesfapa: 0,
  currentDate: '2026-02-01',
  turnCount: 0,
  season: 1,
  tips: 0
};

function App() {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [sceneData, setSceneData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [nickname, setNickname] = useState(localStorage.getItem('player_nickname') || '');
  const [nicknameConfirmed, setNicknameConfirmed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showIntro, setShowIntro] = useState(!sessionStorage.getItem('hotel_intro_seen'));
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(audioService.isMuted());
  // Supabase Authentication state
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasCloudSave, setHasCloudSave] = useState(false);
  const [cloudSaveData, setCloudSaveData] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [tipsNotification, setTipsNotification] = useState(null);

  // Settings and Difficulty States
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState(localStorage.getItem('game_difficulty') || 'medium');
  const [useAI, setUseAI] = useState(localStorage.getItem('game_use_ai') !== 'false');
  const [musicVolume, setMusicVolume] = useState(parseFloat(localStorage.getItem('game_music_volume') || '0.5'));
  const [useSFX, setUseSFX] = useState(localStorage.getItem('game_use_sfx') !== 'false');

  const triggerTipsToast = (amount) => {
    setTipsNotification({ amount });
    setTimeout(() => {
      setTipsNotification(null);
    }, 3000);
  };

  const getDifficultyMultipliers = () => {
    switch (difficulty) {
      case 'easy':
        return { stressUp: 0.7, stressDown: 1.2, repUp: 1.2, repDown: 0.7, cash: 1.2 };
      case 'hard':
        return { stressUp: 1.3, stressDown: 0.8, repUp: 0.8, repDown: 1.3, cash: 0.8 };
      case 'nightmare':
        return { stressUp: 1.7, stressDown: 0.6, repUp: 0.6, repDown: 1.7, cash: 0.5 };
      default:
        return { stressUp: 1.0, stressDown: 1.0, repUp: 1.0, repDown: 1.0, cash: 1.0 };
    }
  };

  // Auto-play music on first click if intro is already seen
  useEffect(() => {
    if (!showIntro) {
      const handleFirstInteraction = () => {
        audioService.start();
        document.removeEventListener('click', handleFirstInteraction);
      };
      document.addEventListener('click', handleFirstInteraction);
      return () => document.removeEventListener('click', handleFirstInteraction);
    }
  }, [showIntro]);

  // Fireworks effect for Disclaimer Screen
  useEffect(() => {
    if (showDisclaimer) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showDisclaimer]);

  // Monitor Supabase Authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        // Pre-fill nickname with Google display name
        const googleName = session.user.user_metadata?.full_name || '';
        if (googleName && !nickname) {
          setNickname(googleName);
        }
        checkCloudSave(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        const googleName = session.user.user_metadata?.full_name || '';
        if (googleName && !nickname) {
          setNickname(googleName);
        }
        checkCloudSave(session);
      } else {
        setHasCloudSave(false);
        setCloudSaveData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkCloudSave = async (currentSession) => {
    if (!currentSession) return;
    try {
      const response = await fetch('/api/load', {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.save) {
          setCloudSaveData(data.save);
          setHasCloudSave(true);
        }
      }
    } catch (err) {
      console.error('Error fetching cloud save:', err);
    }
  };

  // Load saved game from cloud or local
  const savedGame = (() => { try { return JSON.parse(localStorage.getItem('hotel_saved_game')); } catch { return null; } })();
  const [hasSavedGame, setHasSavedGame] = useState(!!(savedGame && savedGame.gameStarted && !savedGame.gameOver));

  // Sync to database and local storage after every turn
  useEffect(() => {
    if (gameStarted && !gameOver) {
      localStorage.setItem('hotel_saved_game', JSON.stringify({ gameState, sceneData, gameStarted, nickname }));
      
      // If user is logged in, sync to Supabase server in background
      if (session) {
        fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            nickname,
            gameState,
            sceneData,
            role: gameState.role
          })
        }).catch(err => console.error('Auto-save to server failed:', err));
      }
    }
    if (gameOver) {
      localStorage.removeItem('hotel_saved_game');
      setHasSavedGame(false);
      setHasCloudSave(false);
      
      // If logged in, delete or clear save on server
      if (session) {
        fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            nickname: null,
            gameState: null,
            sceneData: null,
            role: null
          })
        }).catch(err => console.error('Reset save on server failed:', err));
      }
    }
  }, [gameState, sceneData, gameOver, session]);

  const loadSavedGame = () => {
    if (savedGame) {
      setGameState(savedGame.gameState);
      setSceneData(savedGame.sceneData);
      setNickname(savedGame.nickname || '');
      setNicknameConfirmed(true);
      setGameStarted(true);
      setHasSavedGame(false);
    }
  };

  const loadCloudSave = () => {
    if (cloudSaveData) {
      setGameState(cloudSaveData.game_state);
      setSceneData(cloudSaveData.scene_data);
      setNickname(cloudSaveData.nickname || '');
      setNicknameConfirmed(true);
      setGameStarted(true);
      setHasCloudSave(false);
    }
  };

  // State to hold the API key retrieved from local storage or environment (bypassed in production)
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isKeyConfigured, setIsKeyConfigured] = useState(
    import.meta.env.PROD || !!(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key'))
  );

  const saveApiKey = (key) => {
    const trimmed = key.trim();
    setApiKeyInput(trimmed);
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      setIsKeyConfigured(true);
      setErrorMsg('');
    } else {
      localStorage.removeItem('gemini_api_key');
      setIsKeyConfigured(!!import.meta.env.VITE_GEMINI_API_KEY);
    }
  };

  const startGame = async (roleKey) => {
    if (!import.meta.env.PROD) {
      const currentKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      if (!currentKey) {
        setErrorMsg("Setup Required: Please enter your Google Gemini API Key below to initiate the simulator.");
        return;
      }
    }
    const newState = { ...INITIAL_STATE, role: roleKey, nickname };
    setGameState(newState);
    setShowDisclaimer(true);
  };

  const handleThesfapaClick = () => {
    setGameState(prev => ({
      ...prev,
      thesfapaClicked: true,
      turnsSinceThesfapa: 0
    }));
  };

  const handleChoice = async (choice) => {
    const updatedState = { ...gameState };
    if (updatedState.thesfapaClicked) {
      updatedState.turnsSinceThesfapa += 1;
    }
    
    // Calendar Progression
    let monthChanged = false;
    let oldMonth = -1;
    if (updatedState.currentDate && updatedState.turnCount > 0) {
       oldMonth = new Date(updatedState.currentDate).getMonth();
    }

    if (updatedState.turnCount === 0) {
      const year = 2025 + (updatedState.season || 1);
      updatedState.currentDate = `${year}-04-25`;
    } else {
      const current = new Date(updatedState.currentDate);
      current.setDate(current.getDate() + 7);
      updatedState.currentDate = current.toISOString().split('T')[0];
      
      const newMonth = current.getMonth();
      if (oldMonth !== -1 && oldMonth !== newMonth) {
        monthChanged = true;
      }
    }
    updatedState.turnCount += 1;

    // Salary Logic
    if (monthChanged) {
      const currentSeason = updatedState.season || 1;
      let salary = 1000;
      if (currentSeason === 2) salary = 1200;
      else if (currentSeason === 3) salary = 1400;
      else if (currentSeason >= 4) salary = 1800;
      
      updatedState.cash += salary;
    }

    const mult = getDifficultyMultipliers();

    // Apply hardcoded stat changes if they exist on the choice object
    if (choice.stress_change !== undefined) {
      const stressDelta = choice.stress_change > 0 
        ? choice.stress_change * mult.stressUp 
        : choice.stress_change * mult.stressDown;
      const repDelta = choice.reputation_change > 0
        ? choice.reputation_change * mult.repUp
        : choice.reputation_change * mult.repDown;
      const cashDelta = choice.cash_change ? Math.round(choice.cash_change * mult.cash) : 0;

      updatedState.stress = Math.max(0, Math.min(100, updatedState.stress + stressDelta));
      updatedState.reputation = Math.max(0, Math.min(100, updatedState.reputation + repDelta));
      updatedState.cash += cashDelta;
      updatedState.staffRelations = Math.max(-100, Math.min(100, updatedState.staffRelations + (choice.staff_relations_change || 0)));
      
      if (cashDelta > 0) {
        updatedState.tips = (updatedState.tips || 0) + cashDelta;
        triggerTipsToast(cashDelta);
      }
    }

    setGameState(updatedState);
    await processTurn(`I choose option ${choice.id}: ${choice.text}`, updatedState);
  };

  const processTurn = async (playerInput, currentState) => {
    setIsLoading(true);
    setErrorMsg('');

    // Check Season End
    const currentCal = new Date(currentState.currentDate);
    const seasonYear = 2025 + (currentState.season || 1);
    const endOfSeason = new Date(`${seasonYear}-11-01`);
    if (currentCal >= endOfSeason) {
      setSceneData({
        scene_title: "Τέλος Σεζόν (1η Νοεμβρίου)",
        story_text: "Τα καταφέρατε! Το ξενοδοχείο κλείνει για το χειμώνα. Επιβιώσατε μιας ακόμα εξαντλητικής σεζόν χωρίς να απολυθείτε.",
        choices: [],
        game_over: true
      });
      setGameOver(true);
      setIsLoading(false);
      saveScoreToLeaderboard(currentState);
      return;
    }

    // Check standard Game Over conditions
    if (currentState.stress >= 100 || currentState.reputation <= 0 || currentState.alcoholWarnings >= 3) {
      setSceneData({
        scene_title: "Απόλυση",
        story_text: "Η κατάσταση βγήκε εκτός ελέγχου (υπερβολικό άγχος, κάκιστη φήμη ή πειθαρχικά παραπτώματα). Η διοίκηση αποφάσισε την άμεση απομάκρυνσή σου.",
        choices: [],
        game_over: true
      });
      setGameOver(true);
      setIsLoading(false);
      saveScoreToLeaderboard(currentState);
      return;
    }

    const currentTurn = currentState.turnCount;
    // AI is used on Turn 0 (Interview) and every 5th turn (5, 10, 15, etc.) EXCEPT if there's a SPECIFIC_EVENT
    const isAITurn = useAI && (currentTurn === 0 || currentTurn % 5 === 0) && !SPECIFIC_EVENTS[currentTurn];

    if (!isAITurn) {
      // Hardcoded Route
      let nextScene = null;
      if (SPECIFIC_EVENTS[currentTurn]) {
        const alternatives = SPECIFIC_EVENTS[currentTurn];
        nextScene = alternatives[Math.floor(Math.random() * alternatives.length)];
      } else {
        const randomGen = GENERAL_EVENTS[Math.floor(Math.random() * GENERAL_EVENTS.length)];
        nextScene = { ...randomGen };
      }

      // Simulate network delay for UI smoothness
      setTimeout(() => {
        setSceneData(nextScene);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await generateNextState(playerInput, currentState);
      
      const mult = getDifficultyMultipliers();

      // Update Game State
      const newState = { ...gameState };
      if (response.stress_change) {
        const stressDelta = response.stress_change > 0 
          ? response.stress_change * mult.stressUp 
          : response.stress_change * mult.stressDown;
        newState.stress = Math.max(0, Math.min(100, newState.stress + stressDelta));
      }
      if (response.reputation_change) {
        const repDelta = response.reputation_change > 0
          ? response.reputation_change * mult.repUp
          : response.reputation_change * mult.repDown;
        newState.reputation = Math.max(0, Math.min(100, newState.reputation + repDelta));
      }
      if (response.cash_change) {
        const cashDelta = response.cash_change > 0 ? Math.round(response.cash_change * mult.cash) : response.cash_change;
        newState.cash += cashDelta;
        if (cashDelta > 0) {
          newState.tips = (newState.tips || 0) + cashDelta;
          triggerTipsToast(cashDelta);
        }
      }
      if (response.staff_relations_change) newState.staffRelations += response.staff_relations_change;
      if (response.alcohol_warnings_increment) newState.alcoholWarnings += response.alcohol_warnings_increment;
      if (response.current_shift) newState.shift = response.current_shift;
      if (response.inventory_updated) newState.inventory = response.inventory_updated;
      
      if (response.hotel_metrics_updated) {
        if (response.hotel_metrics_updated.occupancy_change) newState.occupancy += response.hotel_metrics_updated.occupancy_change;
        if (response.hotel_metrics_updated.financial_metric_change) newState.financialMetric += response.hotel_metrics_updated.financial_metric_change;
        if (response.hotel_metrics_updated.staff_turnover_change) newState.staffTurnover += response.hotel_metrics_updated.staff_turnover_change;
      }

      setGameState(newState);
      setSceneData(response);

      if (response.game_over || newState.stress >= 100 || newState.reputation <= 0 || newState.alcoholWarnings >= 3) {
        setGameOver(true);
      }
    } catch (error) {
      console.warn("AI Generation failed. Falling back to a hardcoded generic event.", error);
      // Fallback to GENERAL_EVENTS to prevent the game from getting stuck
      const randomGen = GENERAL_EVENTS[Math.floor(Math.random() * GENERAL_EVENTS.length)];
      setSceneData({ ...randomGen });
    } finally {
      setIsLoading(false);
    }
  };

  const renderNicknameScreen = () => (
    <div className="role-selection">
      <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>Καλώς ήρθατε</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Πώς σε λένε, νέε υπάλληλε;</p>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '420px',
        margin: '2rem auto',
        textAlign: 'center'
      }}>
        <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>
          Nickname
        </label>
        <input
          type="text"
          placeholder="π.χ. Νίκος, Maria, Chef..."
          value={nickname}
          maxLength={20}
          autoFocus
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && nickname.trim()) { localStorage.setItem('player_nickname', nickname.trim()); setNicknameConfirmed(true); } }}
          style={{
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--accent-color)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '1.1rem',
            textAlign: 'center',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={() => { localStorage.setItem('player_nickname', nickname.trim()); setNicknameConfirmed(true); }}
          disabled={!nickname.trim()}
          style={{
            marginTop: '1.5rem',
            backgroundColor: nickname.trim() ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 2rem',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: nickname.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            letterSpacing: '0.05em'
          }}
        >
          Έτοιμος →
        </button>
      </div>

      {hasCloudSave && cloudSaveData && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center', backgroundColor: 'rgba(66, 133, 244, 0.05)', border: '1px solid rgba(66, 133, 244, 0.2)', padding: '1rem', borderRadius: '8px', maxWidth: '420px', margin: '1.5rem auto' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', marginTop: 0 }}>
            ☁ Βρέθηκε Cloud Save ως <strong style={{ color: 'var(--accent-color)' }}>{cloudSaveData.nickname}</strong> ({cloudSaveData.role})
          </p>
          <button
            onClick={loadCloudSave}
            style={{
              backgroundColor: 'var(--accent-color)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.5rem',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ▶ Συνέχεια από το Cloud
          </button>
        </div>
      )}

      {hasSavedGame && savedGame && !hasCloudSave && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            📂 Βρέθηκε τοπικό παιχνίδι ως <strong style={{ color: 'var(--accent-color)' }}>{savedGame.nickname}</strong> ({savedGame.gameState?.role})
          </p>
          <button
            onClick={loadSavedGame}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--accent-color)',
              borderRadius: '6px',
              padding: '0.6rem 1.5rem',
              color: 'var(--accent-color)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ▶ Συνέχεια από εκεί που έμεινα
          </button>
        </div>
      )}
    </div>
  );

  const renderLoginScreen = () => (
    <div className="role-selection" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏨 Hotel Madness</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
        Καλώς ήρθατε στον κορυφαίο εξομοιωτή Ελληνικής Φιλοξενίας. Επιβιώστε από τον GM Μουστάκα, διαχειριστείτε υπερκρατήσεις, αγενείς VIP και το ακραίο εργασιακό stress.
      </p>
      
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
        maxWidth: '450px',
        margin: '2rem auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', marginTop: 0 }}>Είσοδος στο Παιχνίδι</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Συνδεθείτε με Google για να αποθηκεύεται το παιχνίδι σας.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Auth session={session} loading={authLoading} />
        </div>
        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
          <button
            onClick={() => setIsGuest(true)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.6rem 1.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%'
            }}
          >
            Συνδεθείτε ως Επισκέπτης
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntroScreen = () => (
    <div className="intro-overlay">
      <div className="intro-content">
        <div className="intro-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '0.25em', marginBottom: '2rem', animation: 'fadeUp 1.5s ease-out' }}>GREEK TOURISM RPG</div>
        <h1 className="intro-main-title" style={{ fontSize: '3.5rem', textShadow: '0 0 20px rgba(102, 252, 241, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5rem', animation: 'fadeUp 2s ease-out' }}>HOTEL MADNESS</h1>
        
        <div className="intro-narrative" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div className="intro-line line-1" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>ΕΛΛΗΝΙΚΟΣ ΤΟΥΡΙΣΜΟΣ. 2026.</div>
          <div className="intro-line line-2" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Υψηλές προσδοκίες. Ακραίο Stress. Ατελείωτες βάρδιες.</div>
          <div className="intro-line line-3" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Ο GM Μουστάκας παρακολουθεί κάθε σου κίνηση...</div>
          <div className="intro-line line-4" style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 600, textShadow: '0 0 10px rgba(102, 252, 241, 0.2)' }}>Είσαι έτοιμος να επιβιώσεις στη "Βαριά Βιομηχανία" της χώρας;</div>
        </div>

        <button
          className="intro-btn"
          onClick={() => {
            sessionStorage.setItem('hotel_intro_seen', 'true');
            setShowIntro(false);
            audioService.start();
          }}
          style={{
            backgroundColor: 'var(--accent-color)',
            border: 'none',
            borderRadius: '8px',
            color: '#050608',
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(102, 252, 241, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          ΕΙΣΟΔΟΣ ΣΤΗΝ ΕΠΙΧΕΙΡΗΣΗ →
        </button>

        <div style={{ marginTop: '1.5rem' }}>
          <button
            className="intro-skip-btn"
            onClick={() => {
              sessionStorage.setItem('hotel_intro_seen', 'true');
              setShowIntro(false);
              audioService.start();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s'
            }}
          >
            Skip Intro
          </button>
        </div>
      </div>
    </div>
  );

  const renderRoleSelection = () => (
    <div className="role-selection">
      <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>Επίλεξε τον Ρόλο σου, <span style={{ color: '#fff' }}>{nickname}</span></h2>
      <p style={{ color: 'var(--text-secondary)' }}>Μπείτε στον γεμάτο προκλήσεις κόσμο της Ελληνικής Ξενοδοχειακής Βιομηχανίας.</p>
      
      {/* Premium API Key Configuration Panel (only in local development) */}
      {!import.meta.env.PROD && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--panel-border)',
          borderRadius: '8px',
          padding: '1.25rem',
          maxWidth: '500px',
          margin: '1.5rem auto',
          textAlign: 'left'
        }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Gemini API Configuration
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "Loaded from System Env" : "Paste your Gemini API Key here (AIzaSy...)"}
              disabled={!!import.meta.env.VITE_GEMINI_API_KEY}
              value={apiKeyInput}
              onChange={(e) => saveApiKey(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--panel-border)',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
            />
            {apiKeyInput && !import.meta.env.VITE_GEMINI_API_KEY && (
              <button
                onClick={() => saveApiKey('')}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--danger-color)',
                  color: 'var(--danger-color)',
                  borderRadius: '4px',
                  padding: '0 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginOpt: 0 }}>
            {import.meta.env.VITE_GEMINI_API_KEY ? (
              <span className="text-success">✔ API Key detected from local environment configuration.</span>
            ) : isKeyConfigured ? (
              <span className="text-success">✔ API Key securely cached in your local browser storage.</span>
            ) : (
              <span className="text-warning">⚠ A free key is required. Get one at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>Google AI Studio</a>.</span>
            )}
          </p>
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(255, 75, 75, 0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '8px', maxWidth: '600px', margin: '1rem auto', color: 'var(--danger-color)' }}>
          <ShieldAlert style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          {errorMsg}
        </div>
      )}

      <div className="role-cards" style={{ opacity: isKeyConfigured ? 1 : 0.5, pointerEvents: isKeyConfigured ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <div className="role-card" onClick={() => startGame('Ρεσεψιονίστ')}>
          <Hotel className="role-icon" color="var(--accent-color)" />
          <div className="role-title">Ρεσεψιονίστ</div>
          <div className="role-desc">The Front Line. Deal with overbookings, VIPs, and corporate alignment. Path to General Manager.</div>
        </div>
        
        <div className="role-card" onClick={() => startGame('Βοηθός Σερβιτόρου')}>
          <Coffee className="role-icon" color="var(--accent-color)" />
          <div className="role-title">Βοηθός Σερβιτόρου</div>
          <div className="role-desc">F&B Underdog. Navigate rude guests, banquet kitchens, and tip hustling. Path to F&B Manager.</div>
        </div>
        
        <div className="role-card" onClick={() => startGame('Μάγειρας')}>
          <ChefHat className="role-icon" color="var(--accent-color)" />
          <div className="role-title">Μάγειρας</div>
          <div className="role-desc">The Kitchen Heat. Survive broken equipment, shortages, and intense heat. Path to Executive Chef.</div>
        </div>
      </div>
      {!isKeyConfigured && !import.meta.env.PROD && (
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          * Configure your Gemini API Key in the panel above to unlock role selection.
        </p>
      )}
    </div>
  );

  const renderGameOver = () => {
    const isSeasonEnd = new Date(gameState.currentDate) >= new Date('2026-11-01');

    return (
      <div className="game-over-screen">
        <div className="game-over-title">
          {gameState.stress >= 100 ? "BURNOUT! GAME OVER" : 
           gameState.reputation <= 0 ? "ΑΠΟΛΥΘΗΚΕΣ! GAME OVER" : 
           gameState.alcoholWarnings >= 3 ? "ΠΕΙΘΑΡΧΙΚΗ ΑΠΟΛΥΣΗ! GAME OVER" : 
           isSeasonEnd ? "ΤΕΛΟΣ ΣΕΖΟΝ!" : "GAME OVER"}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          {isSeasonEnd 
            ? "Καλό χειμώνα! Τα καταφέρατε και επιβιώσατε άλλη μια σεζόν. Ξεκουραστείτε... γιατί του χρόνου ο εφιάλτης συνεχίζεται! 🏖️🔥"
            : "Υπέκυψες στην αβάσταχτη πίεση του σύγχρονου ελληνικού ξενοδοχειακού management. Ο GM Μουστάκας σε αντικατέστησε ήδη."}
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div>Τελικό Άγχος: <span className="text-danger">{gameState.stress}%</span></div>
          <div>Τελική Φήμη: <span className="text-warning">{gameState.reputation}%</span></div>
          <div>Λογαριασμός Eurobank: <span className="text-success">€{gameState.cash}</span></div>
        </div>

        {isSeasonEnd && (
          <div style={{ marginTop: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', maxWidth: '600px', margin: '2rem auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--accent-color)' }}>Πώς θα περιέγραφες τη φετινή εμπειρία σου;</h3>
            {!feedbackSent ? (
              <>
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Γράψε εδώ τα παράπονά σου (δεν θα τα διαβάσει κανείς στο HR)..."
                  style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--panel-border)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', marginTop: '1rem', resize: 'vertical' }}
                />
                <button 
                  className="btn-primary" 
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={async () => {
                    if (!feedbackText.trim()) return;
                    setIsSendingFeedback(true);
                    try {
                      await fetch('https://formspree.io/f/meedqrjg', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                          nickname: nickname,
                          role: gameState.role,
                          stress: gameState.stress,
                          reputation: gameState.reputation,
                          cash: gameState.cash,
                          feedback: feedbackText
                        })
                      });
                      setFeedbackSent(true);
                    } catch (err) {
                      console.error("Failed to send feedback:", err);
                    }
                    setIsSendingFeedback(false);
                  }}
                  disabled={isSendingFeedback || !feedbackText.trim()}
                >
                  {isSendingFeedback ? 'Αποστολή...' : 'Αποστολή Αναφοράς'}
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Η αναφορά σας εστάλη επιτυχώς. Καλό χειμώνα!</p>
            )}
          </div>
        )}

        <button className="btn-restart" onClick={() => { 
          if (isSeasonEnd) {
            startNextSeason();
          } else {
            setGameStarted(false); setNicknameConfirmed(false); setIsGuest(false); setNickname(localStorage.getItem('player_nickname') || ''); setFeedbackSent(false); setFeedbackText(''); 
          }
        }}>
          {isSeasonEnd ? "Αίτηση για την Επόμενη Σεζόν" : "Αναζήτηση Νέας Δουλειάς"}
        </button>
      </div>
    );
  };

  const getNextRole = (currentRole) => {
    const ladders = {
      'Ρεσεψιονίστ': ['Assistant FO Manager', 'FO Manager', 'Rooms Division Manager', 'Operations Manager', 'GM'],
      'Βοηθός Σερβιτόρου': ['Head Waiter', 'Captain', "Maitre d'hotel", 'F&B Manager'],
      'Μάγειρας': ['Section Chef', 'Sous Chef', 'Head Chef', 'Executive Chef']
    };
    for (const [base, progression] of Object.entries(ladders)) {
      if (currentRole === base) return progression[0];
      const idx = progression.indexOf(currentRole);
      if (idx !== -1 && idx < progression.length - 1) return progression[idx + 1];
    }
    return currentRole;
  };

  const startNextSeason = () => {
    const nextSeason = (gameState.season || 1) + 1;
    const nextYear = 2025 + nextSeason;
    const nextRole = getNextRole(gameState.role);
    
    const newState = {
      ...gameState,
      season: nextSeason,
      role: nextRole,
      turnCount: 1,
      currentDate: `${nextYear}-04-25`,
      stress: 10,
      alcoholWarnings: 0
    };
    setGameState(newState);
    setGameOver(false);
    setFeedbackSent(false);
    setFeedbackText('');
    
    setSceneData({
      scene_title: `Καλώς Ήρθες στη Σεζόν ${nextSeason}`,
      story_text: `Ο χειμώνας πέρασε. Επέστρεψες στην Faplatinca. Φέτος τα πράγματα αλλάζουν: Πήρες προαγωγή σε ${nextRole}! Ο Μουστάκας σε περιμένει...`,
      active_vip_archetype: 'None',
      choices: [{ id: 1, text: 'Πάμε γερά!' }]
    });
  };

  const renderDisclaimerScreen = () => (
    <div className="intro-screen">
      <div className="intro-content" style={{ textAlign: 'center' }}>
        <h1>Καλώς ήρθες στην Οικογένεια της Faplatinca</h1>
        <p style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '2rem auto' }}>
          Οποιαδήποτε ομοιότητα με πρόσωπα, καταστάσεις ή γεγονότα είναι εντελώς συμπτωματική και δεν ανταποκρίνεται στην πραγματικότητα.
          <br /><br />
          Αν όμως νομίζεις ότι κάτι σου θυμίζει... μάλλον έχεις δίκιο.
        </p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '2rem', padding: '1rem 3rem', fontSize: '1.2rem' }}
          onClick={async () => {
             setShowDisclaimer(false);
             setGameStarted(true);
             setGameOver(false);
             setErrorMsg('');
             await processTurn(`START: ${gameState.role}. Player nickname: ${nickname || 'Άγνωστος'}`, gameState);
          }}
        >
          Συνέχεια
        </button>
      </div>
    </div>
  );

  if (showIntro) {
    return renderIntroScreen();
  }

  return (
    <div className="app-container">
      {tipsNotification && (
        <div className="tips-toast">
          <span style={{ fontSize: '1.2rem' }}>💵</span>
          <span>Έλαβες Φιλοδώρημα: <strong>+{tipsNotification.amount}€</strong>!</span>
        </div>
      )}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Hotel Madness</h1>
          <p style={{ margin: '0.25rem 0 0 0' }}>Προηγμένος Εξομοιωτής Εταιρικής Διοίκησης Ξενοδοχείων</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--accent-color)',
              boxShadow: '0 0 10px rgba(102, 252, 241, 0.2)',
              transition: 'all 0.2s',
              marginRight: '0.5rem'
            }}
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => {
              const muted = audioService.toggleMute();
              setIsAudioMuted(muted);
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isAudioMuted ? 'var(--text-secondary)' : 'var(--accent-color)',
              boxShadow: isAudioMuted ? 'none' : '0 0 10px rgba(102, 252, 241, 0.2)',
              transition: 'all 0.2s'
            }}
            title={isAudioMuted ? "Unmute Music" : "Mute Music"}
          >
            {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Auth session={session} loading={authLoading} />
        </div>
      </div>

      <div className="game-layout">
        {!(session || isGuest) ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', width: '100%' }}>
            {renderLoginScreen()}
          </div>
        ) : !gameStarted ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', width: '100%' }}>
            {!nicknameConfirmed ? renderNicknameScreen() : (showDisclaimer ? renderDisclaimerScreen() : renderRoleSelection())}
          </div>
        ) : gameOver ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', width: '100%' }}>
            {renderGameOver()}
          </div>
        ) : (
          <>
            <Dashboard state={gameState} nickname={nickname} />
            <EventTerminal state={gameState} sceneData={sceneData} onChoice={handleChoice} isLoading={isLoading} onThesfapaClick={handleThesfapaClick} />
          </>
        )}
      </div>

      {errorMsg && gameStarted && !gameOver && (
         <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '8px', color: 'var(--danger-color)', zIndex: 100 }}>
           <ShieldAlert size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
           {errorMsg}
         </div>
      )}
      {showSettings && (
        <div className="modal-overlay">
          <div className="settings-modal">
            <div className="settings-header">
              <h2>⚙️ Ρυθμίσεις Παιχνιδιού</h2>
              <button className="modal-close-btn" onClick={() => setShowSettings(false)}>×</button>
            </div>
            
            <div className="settings-section">
              <div className="settings-section-title">Δυσκολία (Difficulty)</div>
              <div className="settings-row">
                <span className="settings-label">Επίπεδο Δυσκολίας:</span>
                <select 
                  className="settings-select" 
                  value={difficulty} 
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    localStorage.setItem('game_difficulty', e.target.value);
                  }}
                >
                  <option value="easy">HR Lover (Εύκολο)</option>
                  <option value="medium">Normal Shift (Κανονικό)</option>
                  <option value="hard">August Peak (Δύσκολο)</option>
                  <option value="nightmare">Mustakas' Mood (Εφιάλτης)</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Ήχος (Audio)</div>
              <div className="settings-row">
                <span className="settings-label">Ένταση Μουσικής:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  className="settings-slider" 
                  value={musicVolume} 
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setMusicVolume(vol);
                    localStorage.setItem('game_music_volume', vol.toString());
                    audioService.setVolume(vol);
                  }}
                />
              </div>
              <div className="settings-row">
                <span className="settings-label">Ηχητικά Εφέ (SFX):</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={useSFX} 
                    onChange={(e) => {
                      setUseSFX(e.target.checked);
                      localStorage.setItem('game_use_sfx', e.target.checked.toString());
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Τεχνητή Νοημοσύνη (AI Settings)</div>
              <div className="settings-row">
                <span className="settings-label">Ενεργοποίηση AI Συμβάντων:</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={useAI} 
                    onChange={(e) => {
                      setUseAI(e.target.checked);
                      localStorage.setItem('game_use_ai', e.target.checked.toString());
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="settings-label" style={{ marginBottom: '0.25rem' }}>Δικό σου Gemini API Key:</span>
                <input 
                  type="password" 
                  className="settings-input" 
                  placeholder="Εισαγωγή API Key..." 
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    localStorage.setItem('gemini_api_key', e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Δεδομένα & Πρόοδος</div>
              <div className="settings-row">
                <span className="settings-label">Επαναφορά Καριέρας:</span>
                <button 
                  className="settings-btn danger" 
                  onClick={() => {
                    if (confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις όλη την πρόοδό σου και να ξεκινήσεις από την αρχή;")) {
                      localStorage.removeItem('game_difficulty');
                      localStorage.removeItem('game_use_ai');
                      localStorage.removeItem('game_music_volume');
                      localStorage.removeItem('game_use_sfx');
                      localStorage.removeItem('player_nickname');
                      // Reset local storage states
                      setGameState(INITIAL_STATE);
                      setGameStarted(false);
                      setNicknameConfirmed(false);
                      setIsGuest(false);
                      setShowSettings(false);
                      alert("Η πρόοδος διαγράφηκε επιτυχώς!");
                    }
                  }}
                >
                  Clear Career
                </button>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }} 
              onClick={() => setShowSettings(false)}
            >
              Αποθήκευση & Κλείσιμο
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
