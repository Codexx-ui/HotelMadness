import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EventTerminal from './components/EventTerminal';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import { generateNextState } from './services/aiService';
import { ChefHat, Coffee, Hotel, ShieldAlert, Volume2, VolumeX, Settings, ShoppingBag, LogOut } from 'lucide-react';
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
  tips: 0,
  usedEventTexts: []
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
  const [tipsNotification, setTipsNotification] = useState(null); // Keep for backwards compatibility if needed
  const [showStore, setShowStore] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [hasPurchasedThisTurn, setHasPurchasedThisTurn] = useState(false);

  // Settings and Difficulty States
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState(localStorage.getItem('game_difficulty') || 'medium');
  const [useAI, setUseAI] = useState(localStorage.getItem('game_use_ai') !== 'false');
  const [musicVolume, setMusicVolume] = useState(parseFloat(localStorage.getItem('game_music_volume') || '0.5'));
  const [useSFX, setUseSFX] = useState(localStorage.getItem('game_use_sfx') !== 'false');

  const showToast = (text, icon = '💵') => {
    setToastMessage({ text, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const triggerTipsToast = (amount) => {
    showToast(`Έλαβες Φιλοδώρημα: +${amount}€!`, '💵');
  };

  const STORE_ITEMS = [
    { id: 'coffee', name: 'Καφές', price: 5, stressReduction: 10, emoji: '☕' },
    { id: 'beach', name: 'Παραλία', price: 10, stressReduction: 25, emoji: '🏖️' },
    { id: 'drink', name: 'Ποτό', price: 15, stressReduction: 25, emoji: '🍹' },
    { id: 'doctor', name: 'Αναρρωτική από τον Γιατρό Σωτήρη', price: 30, stressReduction: 40, emoji: '🩺' },
    { id: 'steakhouse', name: 'Λάμπρος Steakhouse', price: 100, stressReduction: 60, emoji: '🥩' },
    { id: 'car', name: 'Αγορά Αυτοκινήτου', price: 15000, stressReduction: 99, emoji: '🚗' }
  ];

  const buyStoreItem = (item) => {
    if (hasPurchasedThisTurn) {
      showToast("Έχεις ήδη κάνει μία αγορά σε αυτή τη βάρδια!", "⚠️");
      return;
    }
    if (gameState.cash < item.price) {
      showToast("Δεν επαρκούν τα χρήματα!", "⚠️");
      return;
    }

    const mult = getDifficultyMultipliers();
    const stressDelta = item.stressReduction * mult.stressDown;

    const newState = {
      ...gameState,
      cash: gameState.cash - item.price,
      stress: Math.max(0, gameState.stress - stressDelta)
    };

    if (item.id === 'car') {
      if (!newState.inventory.includes('Αυτοκίνητο')) {
        newState.inventory = [...newState.inventory, 'Αυτοκίνητο'];
      }
    }

    setGameState(newState);
    setHasPurchasedThisTurn(true);
    showToast(`Αγόρασες ${item.name}!`, item.emoji);
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
    setHasPurchasedThisTurn(false);
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

    if (updatedState.turnCount === 1) {
      const isRejected = Math.random() < (1 / 15);
      if (isRejected) {
        setSceneData({
          scene_title: "Απόρριψη στη Συνέντευξη",
          story_text: "Ο GM Γεώργιος Μουστάκας σε κοίταξε υποτιμητικά από πάνω μέχρι κάτω. «Δεν μου αρέσει η φάτσα σου. Δεν ταιριάζεις στο corporate alignment της Faplatinca. Έξω!» Η καριέρα σου έληξε πριν καν αρχίσει.",
          choices: [],
          game_over: true
        });
        setGameOver(true);
        setGameState(updatedState);
        return;
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
        const roleFiltered = alternatives.filter(alt => !alt.role || alt.role === currentState.role);
        const unused = roleFiltered.filter(alt => !currentState.usedEventTexts?.includes(alt.story_text));
        const pool = unused.length > 0 ? unused : roleFiltered;
        nextScene = pool[Math.floor(Math.random() * pool.length)] || alternatives[0];
      } else {
        // Filter general events so that role-specific events are only served to players with that role
        const filteredEvents = GENERAL_EVENTS.filter(e => !e.role || e.role === currentState.role);
        const unused = filteredEvents.filter(e => !currentState.usedEventTexts?.includes(e.story_text));
        const pool = unused.length > 0 ? unused : filteredEvents;
        const randomGen = pool[Math.floor(Math.random() * pool.length)];
        nextScene = { ...randomGen };
      }

      // Track this scene text in history
      const updatedState = { ...currentState };
      if (!updatedState.usedEventTexts) {
        updatedState.usedEventTexts = [];
      }
      if (nextScene && nextScene.story_text) {
        updatedState.usedEventTexts.push(nextScene.story_text);
      }
      setGameState(updatedState);

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
      const newState = { ...currentState };
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
      const filteredEvents = GENERAL_EVENTS.filter(e => !e.role || e.role === currentState.role);
      const unused = filteredEvents.filter(e => !currentState.usedEventTexts?.includes(e.story_text));
      const pool = unused.length > 0 ? unused : filteredEvents;
      const randomGen = pool[Math.floor(Math.random() * pool.length)];

      const updatedState = { ...currentState };
      if (!updatedState.usedEventTexts) {
        updatedState.usedEventTexts = [];
      }
      if (randomGen && randomGen.story_text) {
        updatedState.usedEventTexts.push(randomGen.story_text);
      }
      setGameState(updatedState);

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '3rem auto 1.2rem auto', lineHeight: '1.6' }}>
        Καλώς ήρθατε στον κορυφαίο εξομοιωτή Ελληνικής Φιλοξενίας. Επιβιώστε από τον GM Μουστάκα, διαχειριστείτε υπερκρατήσεις, αγενείς VIP και το ακραίο εργασιακό stress.
      </p>
      
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
        maxWidth: '450px',
        margin: '0 auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', marginTop: 0 }}>Είσοδος στο Παιχνίδι</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
          Συνδεθείτε με Google για να ανανεώνεται αυτόματα το βιογραφικό σας.
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
          <div className="role-desc">Η πρώτη γραμμή άμυνας. Διαχειριστείτε υπερκρατήσεις, VIP πελάτες και την εταιρική ευθυγράμμιση.</div>
        </div>
        
        <div className="role-card" onClick={() => startGame('Σερβιτόρος')}>
          <Coffee className="role-icon" color="var(--accent-color)" />
          <div className="role-title">Σερβιτόρος</div>
          <div className="role-desc">Ο αφανής ήρωας του F&B. Αντιμετωπίστε αγενείς πελάτες, το χάος της κουζίνας και το κυνήγι του φιλοδωρήματος.</div>
        </div>
        
        <div className="role-card" onClick={() => startGame('Μάγειρας')}>
          <ChefHat className="role-icon" color="var(--accent-color)" />
          <div className="role-title">Μάγειρας</div>
          <div className="role-desc">Η φωτιά της κουζίνας. Επιβιώστε από χαλασμένο εξοπλισμό, ελλείψεις υλικών και ακραίες θερμοκρασίες.</div>
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
    const isResigned = gameState.resigned;

    return (
      <div className="game-over-screen">
        <div className="game-over-title">
          {isResigned ? "ΠΑΡΑΙΤΗΣΗ! GAME OVER" :
           gameState.stress >= 100 ? "BURNOUT! GAME OVER" : 
           gameState.reputation <= 0 ? "ΑΠΟΛΥΘΗΚΕΣ! GAME OVER" : 
           gameState.alcoholWarnings >= 3 ? "ΠΕΙΘΑΡΧΙΚΗ ΑΠΟΛΥΣΗ! GAME OVER" : 
           isSeasonEnd ? "ΤΕΛΟΣ ΣΕΖΟΝ!" : "GAME OVER"}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', lineHeight: '1.6' }}>
          {isResigned 
            ? "Πέταξες τη στολή στα μούτρα του Μουστάκα, μάζεψες τα πράγματά σου και έφυγες τρέχοντας για το λιμάνι! Είσαι πλέον ένας ελεύθερος άνθρωπος μακριά από το ξενοδοχειακό χάος! 🏖️✈️"
            : isSeasonEnd 
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

  const resetToHome = () => {
    setGameStarted(false);
    setNicknameConfirmed(false);
    setIsGuest(false);
    setShowDisclaimer(false);
    setErrorMsg('');
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
      {toastMessage && (
        <div className="tips-toast">
          <span style={{ fontSize: '1.2rem' }}>{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <h1 
            style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
            className="header-title-link"
            onClick={resetToHome}
          >
            <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 0 8px rgba(255, 75, 75, 0.4))' }}>🏨</span>
            <span>Hotel Madness</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {gameStarted && !gameOver && (
            <button
              onClick={() => setShowStore(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--panel-border)',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--accent-color)',
                boxShadow: '0 0 10px rgba(102, 252, 241, 0.15)',
                transition: 'all 0.2s',
                gap: '0.4rem',
                fontWeight: 600
              }}
              title="Μίνι Μάρκετ"
            >
              <ShoppingBag size={16} />
              <span>Μίνι Μάρκετ</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--accent-color)',
              boxShadow: '0 0 10px rgba(102, 252, 241, 0.1)',
              transition: 'all 0.2s',
              gap: '0.4rem',
              fontWeight: 500
            }}
            title="Ρυθμίσεις"
          >
            <Settings size={16} />
            <span>Ρυθμίσεις</span>
          </button>
          {gameStarted && !gameOver && (
            <button
              onClick={() => {
                if (window.confirm("Είσαι σίγουρος ότι θέλεις να παραιτηθείς και να γλιτώσεις από τον Μουστάκα;")) {
                  const newState = { ...gameState, resigned: true };
                  setGameState(newState);
                  setGameOver(true);
                  saveScoreToLeaderboard(newState);
                }
              }}
              style={{
                backgroundColor: 'rgba(255, 75, 75, 0.1)',
                border: '1px solid var(--danger-color)',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--danger-color)',
                boxShadow: '0 0 10px rgba(255, 75, 75, 0.15)',
                transition: 'all 0.2s',
                gap: '0.4rem',
                fontWeight: 600
              }}
              title="Παραίτηση"
            >
              <LogOut size={16} />
              <span>Παραίτηση</span>
            </button>
          )}
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

      {showStore && (
        <div className="modal-overlay" onClick={() => setShowStore(false)}>
          <div style={{ background: '#0b0c10', border: '1px solid #66fcf1', borderRadius: '16px', padding: '2rem', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#66fcf1' }}>🛍️ Κατάστημα Faplatinca</h2>
              <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowStore(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: hasPurchasedThisTurn ? '#ff4b4b' : '#a8b2d8', fontSize: '0.95rem', fontWeight: hasPurchasedThisTurn ? 'bold' : 'normal' }}>
                {hasPurchasedThisTurn 
                  ? "⚠️ Έχετε ήδη πραγματοποιήσει 1 αγορά σε αυτή τη βάρδια." 
                  : "Αγόρασε είδη πρώτης ανάγκης για να μειώσεις το άγχος της σεζόν."
                }
              </div>
              <div className="store-balance-badge">
                <span>💵 Υπόλοιπο:</span>
                <span>{gameState.cash.toLocaleString('el-GR')}€</span>
              </div>
            </div>

            <div className="store-grid">
              {STORE_ITEMS.map((item) => {
                const canAfford = gameState.cash >= item.price;
                const isDisabled = hasPurchasedThisTurn || !canAfford;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(102,252,241,0.2)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{item.emoji}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{item.name}</div>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#4bff4b',
                      background: 'rgba(75,255,75,0.1)',
                      border: '1px solid rgba(75,255,75,0.3)',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      alignSelf: 'flex-start',
                    }}>
                      Stress: -{item.stressReduction}%
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#66fcf1' }}>
                        {item.price.toLocaleString('el-GR')}€
                      </div>
                      <button
                        disabled={isDisabled}
                        onClick={() => buyStoreItem(item)}
                        style={{
                          background: isDisabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #66fcf1, #45a29e)',
                          border: isDisabled ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          color: isDisabled ? '#ffffff' : '#0b0c10',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {hasPurchasedThisTurn ? '1 Αγορά/Βάρδια' : (canAfford ? 'Αγορά' : 'Λείπουν χρήματα')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem' }} 
              onClick={() => setShowStore(false)}
            >
              Κλείσιμο Καταστήματος
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
