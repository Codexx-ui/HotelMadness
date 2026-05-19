import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EventTerminal from './components/EventTerminal';
import Auth from './components/Auth';
import SlapOMeter from './components/SlapOMeter';
import { supabase } from './supabaseClient';
import { generateNextState } from './services/aiService';
import { ChefHat, Coffee, Hotel, ShieldAlert, Volume2, VolumeX, Settings, ShoppingBag, LogOut, Trophy } from 'lucide-react';
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
  thesfapaSpawnedThisSeason: false,
  currentDate: '2026-02-01',
  turnCount: 0,
  season: 1,
  tips: 0,
  usedEventTexts: [],
  magicEyePurchasedCount: 0,
  grandmaCashPurchasedCount: 0
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
  const [isMobileLayout, setIsMobileLayout] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // One-time automatic cleanup of old local leaderboard scores to prevent confusion
  useEffect(() => {
    const hasCleanedLegacy = localStorage.getItem('hotel_legacy_cleaned_v2');
    if (!hasCleanedLegacy) {
      localStorage.removeItem('hotel_madness_leaderboard');
      localStorage.setItem('hotel_legacy_cleaned_v2', 'true');
    }
  }, []);  // Supabase auth listener is handled in the main auth listener below

  // Settings and Difficulty States
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [onlineScores, setOnlineScores] = useState([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [isOnlineConnected, setIsOnlineConnected] = useState(false);
  const [difficulty, setDifficulty] = useState(localStorage.getItem('game_difficulty') || 'medium');
  const [useAI, setUseAI] = useState(localStorage.getItem('game_use_ai') !== 'false');
  const [musicVolume, setMusicVolume] = useState(parseFloat(localStorage.getItem('game_music_volume') || '0.5'));
  const [useSFX, setUseSFX] = useState(localStorage.getItem('game_use_sfx') !== 'false');
  const [musicPlaylist, setMusicPlaylist] = useState(audioService.getPlaylist());
  const [showSlapOMeter, setShowSlapOMeter] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const showToast = (text, icon = '💵') => {
    setToastMessage({ text, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const triggerTipsToast = (amount) => {
    showToast(`Έλαβες Φιλοδώρημα: +${amount}€!`, '💵');
    audioService.playCashSound();
  };

  const STORE_ITEMS = [
    { id: 'coffee', name: 'Καφές στο Roi Mat', price: 5, stressReduction: 5, emoji: '☕', desc: 'Μειώνει ελαφρώς το άγχος.' },
    { id: 'beach', name: 'Παραλία', price: 10, stressReduction: 10, emoji: '🏖️', desc: 'Χαλάρωση στον ήλιο.' },
    { id: 'drink', name: 'Ποτό στο Σκάλα', price: 15, stressReduction: 15, emoji: '🍹', desc: 'Βραδινό ποτάκι για αποσυμπίεση.' },
    { id: 'eye', name: 'Μαγικό Μάτι 🧿', price: 20, stressReduction: 0, emoji: '🧿', desc: 'Ακυρώνει αυτόματα την επόμενη αναποδιά / κακή συνέπεια.' },
    { id: 'grandma', name: 'Χαρτζιλίκι Γιαγιάς 👵', price: 0, stressReduction: -15, emoji: '👵', desc: 'Σου δίνει +20€ cash, αλλά αυξάνει το stress κατά 15% (λόγω ερωτήσεων γάμου!).' },
    { id: 'doctor', name: 'Αναρρωτική από τον Γιατρό Σωτήρη', price: 30, stressReduction: 20, emoji: '🩺', desc: 'Επίσημη δικαιολογία για ξεκούραση.' },
    { id: 'steakhouse', name: 'Λάμπρος Steakhouse', price: 100, stressReduction: 30, emoji: '🥩', desc: 'Καλό φαγητό για γερό στομάχι.' },
    { id: 'car', name: 'Αγορά Αυτοκινήτου', price: 15000, stressReduction: 99, emoji: '🚗', desc: 'Το απόλυτο status symbol της Faplantica.' }
  ];

  const buyStoreItem = (item) => {
    if (hasPurchasedThisTurn) {
      showToast("Έχεις ήδη κάνει μία αγορά σε αυτή τη βάρδια!", "⚠️");
      return;
    }
    if (item.id === 'eye' && (gameState.magicEyePurchasedCount || 0) >= 2) {
      showToast("🧿 Έχεις ήδη αγοράσει το όριο των 2 Μαγικών Ματιών για αυτή τη σεζόν!", "⚠️");
      return;
    }
    if (item.id === 'grandma' && (gameState.grandmaCashPurchasedCount || 0) >= 2) {
      showToast("👵 Η γιαγιά ξέμεινε από μετρητά! Έχεις ήδη πάρει 2 χαρτζιλίκια για αυτή τη σεζόν!", "⚠️");
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
      stress: Math.max(0, Math.min(100, gameState.stress - stressDelta))
    };

    if (item.id === 'car') {
      if (!newState.inventory.includes('Αυτοκίνητο')) {
        newState.inventory = [...newState.inventory, 'Αυτοκίνητο'];
      }
    }

    if (item.id === 'eye') {
      newState.inventory = [...newState.inventory, 'Μαγικό Μάτι 🧿'];
      newState.magicEyePurchasedCount = (newState.magicEyePurchasedCount || 0) + 1;
    }

    if (item.id === 'grandma') {
      newState.cash += 20;
      newState.grandmaCashPurchasedCount = (newState.grandmaCashPurchasedCount || 0) + 1;
    }

    setGameState(newState);
    setHasPurchasedThisTurn(true);
    
    if (item.id === 'grandma') {
      showToast("👵 Η γιαγιά σου έδωσε 20€ και σε ρώτησε πότε θα παντρευτείς!", "❤️");
    } else if (item.id === 'eye') {
      showToast("🧿 Αγόρασες το Μαγικό Μάτι! Σε προστατεύει από την επόμενη αναποδιά.", "🔮");
    } else {
      showToast(`Αγόρασες ${item.name}!`, item.emoji);
    }
    
    audioService.playCashSound();
  };

  const getDifficultyMultipliers = () => {
    switch (difficulty) {
      case 'easy':
        return { stressUp: 0.5, stressDown: 1.4, repUp: 1.4, repDown: 0.5, cash: 1.3 };
      case 'hard':
        return { stressUp: 1.1, stressDown: 0.95, repUp: 0.95, repDown: 1.1, cash: 0.9 };
      case 'nightmare':
        return { stressUp: 1.4, stressDown: 0.75, repUp: 0.75, repDown: 1.4, cash: 0.7 };
      default:
        return { stressUp: 0.8, stressDown: 1.15, repUp: 1.15, repDown: 0.8, cash: 1.1 };
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

  const getMockLeaderboard = () => [];

  const calculateSuccessRate = (state) => {
    if (!state) return 0;
    const turnWeight = Math.min(1, (state.turnCount || 0) / 30);
    const cashWeight = Math.min(1, (state.cash + (state.tips || 0)) / (2000 + (state.season || 1) * 800));
    const stressPenalty = (state.stress || 0) * 0.3;
    const repBonus = ((state.reputation || 50) - 50) * 0.4;

    let score = (turnWeight * 40) + (cashWeight * 60) + repBonus - stressPenalty;
    if (state.resigned) score -= 15;
    
    const isSeasonEnd = new Date(state.currentDate) >= new Date(`${2025 + (state.season || 1)}-11-01`);
    
    if (!isSeasonEnd && (state.stress >= 100 || state.reputation <= 0 || state.alcoholWarnings >= 3)) {
        score = score * 0.6;
    }
    
    // Bonus for surviving the season
    if (isSeasonEnd) {
        score += 15;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getEvaluationGrade = (rate, state) => {
    const isSeasonEnd = new Date(state.currentDate) >= new Date(`${2025 + (state.season || 1)}-11-01`);

    if (state.resigned) {
      if (rate >= 70) return { grade: 'B-', label: 'Συνειδητοποιημένος Δραπέτης 🏃', desc: 'Έφυγες με γεμάτες τσέπες, αφήνοντας τον Μουστάκα στα κρύα του λουτρού!' };
      return { grade: 'D', label: 'Λιποτάκτης 🏃', desc: 'Πέταξες τη ποδιά και έφυγες τρέχοντας για το πλοίο της επιστροφής.' };
    }
    
    if (!isSeasonEnd) {
      if (state.stress >= 100) {
        return { grade: 'F+', label: 'Θύμα του Συστήματος 🤯', desc: 'Κατέρρευσες από το ακραίο stress. Σε βρήκαν στην αποθήκη να κλαις αγκαλιά με ένα σεντόνι.' };
      }
      if (state.reputation <= 0) {
        return { grade: 'F-', label: 'Ανεπιθύμητος 📉', desc: 'Κατέστρεψες τη φήμη του ξενοδοχείου. Ο Μουστάκας σε πέταξε έξω με κλωτσιές και σου μαύρισε το βιογραφικό.' };
      }
      if (state.alcoholWarnings >= 3) {
        return { grade: 'F', label: 'Αλκοολικός της Faplantica ⚠️', desc: 'Σε έπιασαν να πίνεις το σφηνάκι του VIP. Σε έστειλαν σπίτι σου με 3 πειθαρχικές προειδοποιήσεις.' };
      }
    }
    
    if (rate >= 95) return { grade: 'S+', label: 'Διάδοχος του Μουστάκα 👑', desc: 'Αδιανόητο! Έγινες ο φόβος και ο τρόμος των υπαλλήλων. Ο Μουστάκας υποκλίνεται στο μεγαλείο σου!' };
    if (rate >= 85) return { grade: 'A', label: 'Υπάλληλος της Χρονιάς 🏆', desc: 'Το HR σε έχει ως πρότυπο (αν και ακόμα δεν σου έχουν πληρώσει τις υπερωρίες).' };
    if (rate >= 70) return { grade: 'B', label: 'Έμπειρος Επαγγελματίας 🛎️', desc: 'Ξέρεις πώς να κρύβεις τα λάθη σου και πώς να παίρνεις tips. Ένας αληθινός επαγγελματίας.' };
    if (rate >= 50) return { grade: 'C', label: 'Επιζών της Σεζόν 🩹', desc: 'Με μισό κουτί depon την ημέρα και άπειρο καφέ, κατάφερες να βγάλεις τη σεζόν όρθιος.' };
    if (rate >= 30) return { grade: 'D', label: 'Φοβισμένο Γατάκι 🐱', desc: 'Κρυβόσουν στις τουαλέτες κάθε φορά που φώναζε ο Μουστάκας. Αλλά τουλάχιστον πληρώθηκες.' };
    
    if (isSeasonEnd) {
      return { grade: 'D-', label: 'Με το Ζόρι Επιζών 🤕', desc: 'Η χειρότερη σεζόν της ζωής σου. Ο Μουστάκας κλαίει τα λεφτά που σε πλήρωσε, αλλά τουλάχιστον έφτασες στο τέλος χωρίς να απολυθείς!' };
    }
    
    return { grade: 'F', label: 'Απολυμένος 💼', desc: 'Δεν άντεξες ούτε τη βασική εκπαίδευση. Ο τουρισμός δεν είναι για σένα.' };
  };

  const saveScoreToLeaderboard = (state) => {
    try {
      const difficultyMap = {
        easy: 'HR Lover 💖',
        normal: 'Normal Shift ⚙️',
        hard: 'August Peak 🏖️',
        nightmare: 'Mustakas Mood 💀'
      };

      const diff = localStorage.getItem('game_difficulty') || 'normal';
      const roleMap = {
        reception: 'Υποδοχή 🛎️',
        waiter: 'Σέρβις 🍽️',
        chef: 'Chef 🍳',
        maintenance: 'Συντήρηση 🔧'
      };

      let status = 'Επιβίωσε 🎉';
      if (state.resigned) {
        status = 'Παραιτήθηκε 🏃';
      } else if (state.stress >= 100) {
        status = 'Έπαθε Burnout 🤯';
      } else if (state.reputation <= 0) {
        status = 'Απολύθηκε (Κακή Φήμη) 📉';
      } else if (state.alcoholWarnings >= 3) {
        status = 'Απολύθηκε (GM Warning) ⚠️';
      }

      const successRate = calculateSuccessRate(state);
      const evalObj = getEvaluationGrade(successRate, state);

      // Robust resolved nickname finder
      const resolvedNickname = nickname || 
                               (session?.user?.user_metadata?.full_name) || 
                               (session?.user?.email ? session.user.email.split('@')[0] : '') || 
                               'Guest';

      const newEntry = {
        id: Date.now().toString(),
        nickname: resolvedNickname,
        role: roleMap[state.role] || state.role || '—',
        turns: state.turnCount || 0,
        season: state.season || 1,
        cash: state.cash || 0,
        tips: state.tips || 0,
        difficulty: difficultyMap[diff] || 'Normal Shift ⚙️',
        status: status,
        successRate: successRate,
        evaluationGrade: evalObj.grade,
        evaluationLabel: evalObj.label,
        date: new Date().toLocaleDateString('el-GR')
      };

      const currentLeaderboard = JSON.parse(localStorage.getItem('hotel_madness_leaderboard')) || getMockLeaderboard();
      const updatedLeaderboard = [...currentLeaderboard, newEntry];
      
      // Sort by season (descending), then turns (descending), then cash (descending)
      updatedLeaderboard.sort((a, b) => {
        if (b.season !== a.season) return b.season - a.season;
        if (b.turns !== a.turns) return b.turns - a.turns;
        return b.cash - a.cash;
      });

      // Keep top 100 entries
      localStorage.setItem('hotel_madness_leaderboard', JSON.stringify(updatedLeaderboard.slice(0, 100)));

      // POST to global online database (include auth token if logged in)
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      fetch('/api/leaderboard', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nickname: resolvedNickname,
          role: roleMap[state.role] || state.role || '—',
          turns: state.turnCount || 0,
          season: state.season || 1,
          cash: state.cash || 0,
          tips: state.tips || 0,
          difficulty: difficultyMap[diff] || 'Normal Shift ⚙️',
          status: status,
          success_rate: successRate,
          evaluation: `${evalObj.grade} - ${evalObj.label}`
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Saved score to global online database!');
        }
      })
      .catch(err => console.warn('Failed to save score online, saved locally:', err));
    } catch (e) {
      console.error('Failed to save to leaderboard:', e);
    }
  };

  const fetchOnlineLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.scores) {
        setOnlineScores(data.scores.filter(s => s.nickname !== '__MOTD__'));
        setIsOnlineConnected(true);
      } else {
        setOnlineScores([]);
        setIsOnlineConnected(false);
      }
    } catch (e) {
      console.warn('Failed to fetch online leaderboard, using offline fallback:', e);
      setOnlineScores([]);
      setIsOnlineConnected(false);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (showLeaderboard) {
      fetchOnlineLeaderboard();
    }
  }, [showLeaderboard]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.scores) {
          const motdEntry = data.scores.find(s => s.nickname === '__MOTD__');
          if (motdEntry && motdEntry.status) {
            setGlobalMotd(motdEntry.status);
            setTimeout(() => {
              showToast("📢 Ανακοίνωση Διοίκησης: " + motdEntry.status, "🔔");
            }, 1500);
          }
        }
      })
      .catch(() => {});
  }, []);


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
  // Monitor Supabase Authentication & Sync Nickname
  useEffect(() => {
    const handleSessionUpdate = (session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        // Save token to localStorage for Serverless API Authorization headers
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
        }
        
        // Resolve google display name or email prefix
        const resolvedName = session.user.user_metadata?.full_name || 
                             (session.user.email ? session.user.email.split('@')[0] : '');
        
        if (resolvedName) {
          setNickname(resolvedName);
          localStorage.setItem('player_nickname', resolvedName);
          setNicknameConfirmed(true);
        }
        checkCloudSave(session);
      } else {
        localStorage.removeItem('auth_token');
        setHasCloudSave(false);
        setCloudSaveData(null);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUpdate(session);
    });

    // Subscribe to auth status changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUpdate(session);
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
    setShowSlapOMeter(true);
  };

  const handleSlapResult = (score) => {
    setGameState(prev => {
      const newState = { ...prev };
      if (score === 'perfect') {
        newState.stress = Math.max(0, newState.stress - 40);
        newState.reputation = Math.min(100, newState.reputation + 10);
        newState.cash += 50;
        
        try {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#66fcf1', '#45a29e', '#4bff4b', '#ffdd67']
          });
        } catch (e) {}

        setTimeout(() => {
          showToast("💥 FLAWLESS MEGASLAP! Το stress μειώθηκε κατά 40%, κέρδισες +10% Φήμη και +50€ tips!", "⚡");
          audioService.playCashSound();
        }, 100);
      } else if (score === 'good') {
        newState.stress = Math.max(0, newState.stress - 15);
        setTimeout(() => {
          showToast("👋 Έριξες μια κλασική, τίμια σφαλιάρα! Το stress μειώθηκε κατά 15%.", "❤️");
        }, 100);
      } else {
        newState.stress = Math.min(100, newState.stress + 15);
        newState.reputation = Math.max(0, newState.reputation - 15);
        
        // Ensure warnings exists
        const currentWarnings = newState.warnings || 0;
        newState.warnings = Math.min(3, currentWarnings + 1);

        setTimeout(() => {
          showToast("💀 ΑΣΤΟΧΗΣΕΣ! Ο πελάτης απέφυγε τη φάπα, σε κατήγγειλε στον Μουστάκα και έφαγες +1 Warning, +15% Stress & -15% Φήμη!", "⚠️");
        }, 100);
      }
      return newState;
    });
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
      let stressDelta = choice.stress_change > 0 
        ? choice.stress_change * mult.stressUp 
        : choice.stress_change * mult.stressDown;
      let repDelta = choice.reputation_change > 0
        ? choice.reputation_change * mult.repUp
        : choice.reputation_change * mult.repDown;
      let cashDelta = choice.cash_change ? Math.round(choice.cash_change * mult.cash) : 0;
      let staffDelta = choice.staff_relations_change || 0;

      // Check Magic Eye Protection!
      const hasBadConsequence = stressDelta > 0 || repDelta < 0 || staffDelta < 0;
      if (hasBadConsequence && updatedState.inventory && updatedState.inventory.includes('Μαγικό Μάτι 🧿')) {
        const eyeIdx = updatedState.inventory.indexOf('Μαγικό Μάτι 🧿');
        if (eyeIdx !== -1) {
          const newInv = [...updatedState.inventory];
          newInv.splice(eyeIdx, 1);
          updatedState.inventory = newInv;

          // Nullify all negative impacts!
          if (stressDelta > 0) stressDelta = 0;
          if (repDelta < 0) repDelta = 0;
          if (staffDelta < 0) staffDelta = 0;

          // Push visual feedback toast with delay
          setTimeout(() => {
            showToast("🧿 Το Μαγικό Μάτι σε προστάτεψε από την αναποδιά!", "🔮");
          }, 600);
        }
      }

      updatedState.stress = Math.max(0, Math.min(100, updatedState.stress + stressDelta));
      updatedState.reputation = Math.max(0, Math.min(100, updatedState.reputation + repDelta));
      updatedState.cash += cashDelta;
      updatedState.staffRelations = Math.max(-100, Math.min(100, updatedState.staffRelations + staffDelta));
      
      if (stressDelta > 0 || repDelta < 0) {
        audioService.playSlapSound();
      }

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
          story_text: "Ο GM Γεώργιος Μουστάκας σε κοίταξε υποτιμητικά από πάνω μέχρι κάτω. «Δεν μου αρέσει η φάτσα σου. Δεν ταιριάζεις στο corporate alignment της Faplantica. Έξω!» Η καριέρα σου έληξε πριν καν αρχίσει.",
          choices: [],
          game_over: true
        });
        setGameOver(true);
        audioService.playGameOverSound();
        const rejectedState = { ...updatedState, turnCount: 0, resigned: false };
        setGameState(rejectedState);
        saveScoreToLeaderboard(rejectedState);
        return;
      }
    }

    setGameState(updatedState);
    await processTurn(`I choose option ${choice.id}: ${choice.text}`, updatedState);
  };


  const [fakeScore, setFakeScore] = useState({ nickname: 'Μουστάκας Θεός', cash: 9999999, turns: 50, season: 2 });
  const [motdInput, setMotdInput] = useState('');
  
  const injectFakeScore = async () => {
    try {
      const payload = {
        nickname: fakeScore.nickname,
        role: 'GM',
        turns: fakeScore.turns,
        season: fakeScore.season,
        cash: fakeScore.cash,
        tips: 0,
        difficulty: 'Hard',
        status: 'HACKED'
      };
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast("☠️ Το ψεύτικο σκορ ενέθηκε επιτυχώς στη βάση!", "👑");
    } catch (e) {
      showToast("❌ Σφάλμα!", "⛔");
    }
  };

  const deleteScore = async (id) => {
    if (!window.confirm('Διαγραφή αυτού του σκορ από τη βάση;')) return;
    try {
      await fetch('/api/leaderboard?id=' + id, { method: 'DELETE' });
      showToast("🗑️ Το σκορ διαγράφηκε!", "✨");
      fetchOnlineLeaderboard();
    } catch (e) {
      showToast("❌ Σφάλμα διαγραφής!", "⛔");
    }
  };

  const setGlobalMessage = async () => {
    try {
      // First try to find existing MOTD to delete it
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.scores) {
        const existing = data.scores.find(s => s.nickname === '__MOTD__');
        if (existing) {
          await fetch('/api/leaderboard?id=' + existing.id, { method: 'DELETE' });
        }
      }
      
      if (motdInput.trim() !== '') {
        const payload = {
          nickname: '__MOTD__',
          role: 'ADMIN',
          turns: 0,
          season: 1,
          cash: 0,
          tips: 0,
          difficulty: 'Normal',
          status: motdInput
        };
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast("📢 Η ανακοίνωση στάλθηκε σε όλους τους παίκτες!", "🔔");
      } else {
        showToast("🗑️ Η ανακοίνωση καθαρίστηκε!", "✨");
      }
    } catch (e) {
      showToast("❌ Σφάλμα!", "⛔");
    }
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
      audioService.playGameOverSound();
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
      audioService.playGameOverSound();
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
      const hasSpecificEvent = SPECIFIC_EVENTS[currentTurn] && (currentTurn !== 7 || currentState.season === 2);
      if (hasSpecificEvent) {
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

      // Dynamic Thesfapa Injection
      if (!updatedState.thesfapaTargetTurn) {
        updatedState.thesfapaTargetTurn = Math.floor(Math.random() * 15) + 11; // Turn 11 to 25
      }
      if (updatedState.turnCount === updatedState.thesfapaTargetTurn && !updatedState.thesfapaSpawnedThisSeason) {
        nextScene.story_text += " \n\nΈνας πελάτης σε βγάζει εκτός εαυτού με τις παράλογες απαιτήσεις του! Νιώθεις το αίμα σου να βράζει και θες απεγνωσμένα να τον χαστουκίσεις! Ξέσπασε εδώ: http://FapOMeter";
        updatedState.thesfapaSpawnedThisSeason = true;
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

      if (response.stress_change > 0 || response.reputation_change < 0) {
        audioService.playSlapSound();
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

      // Dynamic Thesfapa Injection
      if (!newState.thesfapaTargetTurn) {
        newState.thesfapaTargetTurn = Math.floor(Math.random() * 15) + 11; // Turn 11 to 25
      }
      if (newState.turnCount === newState.thesfapaTargetTurn && !newState.thesfapaSpawnedThisSeason) {
        response.story_text += " \n\nΈνας πελάτης σε βγάζει εκτός εαυτού με τις παράλογες απαιτήσεις του! Νιώθεις το αίμα σου να βράζει και θες απεγνωσμένα να τον χαστουκίσεις! Ξέσπασε εδώ: http://FapOMeter";
        newState.thesfapaSpawnedThisSeason = true;
      }

      setGameState(newState);
      setSceneData(response);

      if (response.game_over || newState.stress >= 100 || newState.reputation <= 0 || newState.alcoholWarnings >= 3) {
        setGameOver(true);
        audioService.playGameOverSound();
        saveScoreToLeaderboard(newState);
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
      <h2 style={{ fontSize: '2.2rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Καλώς ήρθατε</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.35rem', marginBottom: '1.25rem' }}>Πώς σε λένε, νέε υπάλληλε;</p>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '2rem 2rem',
        maxWidth: '480px',
        margin: '1rem auto',
        textAlign: 'center'
      }}>
        <label style={{ display: 'block', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
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
            padding: '0.8rem 1.2rem',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '1.25rem',
            textAlign: 'center',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={() => { localStorage.setItem('player_nickname', nickname.trim()); setNicknameConfirmed(true); }}
          disabled={!nickname.trim()}
          style={{
            marginTop: '1.25rem',
            backgroundColor: nickname.trim() ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.85rem 2.5rem',
            color: '#fff',
            fontSize: '1.15rem',
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
    <div className="role-selection" style={{ textAlign: 'center', padding: '1.5rem 1.5rem' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.35rem', maxWidth: '750px', margin: '1.5rem auto 1.5rem auto', lineHeight: '1.6' }}>
        Καλώς ήρθατε στον κορυφαίο εξομοιωτή Ελληνικής Φιλοξενίας. Επιβιώστε από τον GM Μουστάκα, διαχειριστείτε υπερκρατήσεις, αγενείς VIP και το ακραίο εργασιακό stress.
      </p>
      
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '2rem 2rem',
        maxWidth: '480px',
        margin: '0 auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.45rem', marginBottom: '1rem', marginTop: 0 }}>Είσοδος στο Παιχνίδι</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Συνδεθείτε με Google για να ανανεώνεται αυτόματα το βιογραφικό σας.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Auth session={session} loading={authLoading} />
        </div>
        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.25rem' }}>
          <button
            onClick={() => setIsGuest(true)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
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
      <div className="intro-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh', padding: '1rem 0' }}>
        <div className="intro-subtitle" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', letterSpacing: '0.25em', marginBottom: '1rem', animation: 'fadeUp 1.5s ease-out' }}>GREEK TOURISM RPG</div>
        <h1 className="intro-main-title" style={{ fontSize: '3.6rem', textShadow: '0 0 20px rgba(102, 252, 241, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', animation: 'fadeUp 2s ease-out' }}>HOTEL MADNESS</h1>
        
        <div className="intro-narrative" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
          <div className="intro-line line-1" style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>ΕΛΛΗΝΙΚΟΣ ΤΟΥΡΙΣΜΟΣ. 2026.</div>
          <div className="intro-line line-2" style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>Υψηλές προσδοκίες. Ακραίο Stress. Ατελείωτες βάρδιες.</div>
          <div className="intro-line line-3" style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>Ο GM Μουστάκας παρακολουθεί κάθε σου κίνηση...</div>
          <div className="intro-line line-4" style={{ fontSize: '1.5rem', color: 'var(--accent-color)', fontWeight: 600, textShadow: '0 0 10px rgba(102, 252, 241, 0.2)' }}>Είσαι έτοιμος να επιβιώσεις στη "Βαριά Βιομηχανία" της χώρας;</div>
        </div>

        <div>
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
              padding: '0.9rem 2.5rem',
              fontSize: '1.15rem',
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
        </div>

        <div style={{ marginTop: '1rem' }}>
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
              fontSize: '0.9rem',
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
          <div className="role-desc">Ο αφανής ήρωας του F&B. Αντιμετωπίστε αγενείς πελάτες, το χάος της σάλας και το κυνήγι του φιλοδωρήματος.</div>
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
    const successRate = calculateSuccessRate(gameState);
    const evalObj = getEvaluationGrade(successRate, gameState);

    return (
      <div className="game-over-screen">
        <div className="game-over-title" style={isSeasonEnd && !isResigned ? { color: '#4bff4b', textShadow: '0 0 25px rgba(75, 255, 75, 0.6)' } : {}}>
          {isSeasonEnd && !isResigned ? "ΤΕΛΟΣ ΣΕΖΟΝ!" :
           isResigned ? "ΠΑΡΑΙΤΗΣΗ! GAME OVER" :
           gameState.stress >= 100 ? "BURNOUT! GAME OVER" : 
           gameState.reputation <= 0 ? "ΑΠΟΛΥΘΗΚΕΣ! GAME OVER" : 
           gameState.alcoholWarnings >= 3 ? "ΠΕΙΘΑΡΧΙΚΗ ΑΠΟΛΥΣΗ! GAME OVER" : 
           "GAME OVER"}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', lineHeight: '1.6' }}>
          {isResigned 
            ? "Πέταξες τη στολή στα μούτρα του Μουστάκα, μάζεψες τα πράγματά σου και έφυγες τρέχοντας για το λιμάνι! Είσαι πλέον ένας ελεύθερος άνθρωπος μακριά από το ξενοδοχειακό χάος! 🏖️✈️"
            : isSeasonEnd 
            ? "Καλό χειμώνα! Τα καταφέρατε και επιβιώσατε άλλη μια σεζόν. Ξεκουραστείτε... γιατί του χρόνου ο εφιάλτης συνεχίζεται! 🏖️🔥"
            : "Υπέκυψες στην αβάσταχτη πίεση του σύγχρονου ελληνικού ξενοδοχειακού management. Ο GM Μουστάκας σε αντικατέστησε ήδη."}
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>Τελικό Άγχος: <span className="text-danger">{gameState.stress}%</span></div>
          <div>Τελική Φήμη: <span className="text-warning">{gameState.reputation}%</span></div>
          <div>Λογαριασμός Eurobank: <span className="text-success">€{gameState.cash}</span></div>
        </div>

        {/* GORGEOUS EMPLOYEE CAREER CARD */}
        <div className="employee-profile-card" style={{
          marginTop: '2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(102, 252, 241, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem',
          maxWidth: '550px',
          margin: '2rem auto',
          textAlign: 'center',
          boxShadow: '0 0 25px rgba(102, 252, 241, 0.03)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Retro Watermarked Badge */}
          <div style={{
            position: 'absolute',
            top: '0.8rem',
            right: '-2.5rem',
            background: evalObj.grade.startsWith('S') || evalObj.grade.startsWith('A') || evalObj.grade.startsWith('B') ? 'rgba(75, 255, 75, 0.15)' : 'rgba(255, 75, 75, 0.15)',
            color: evalObj.grade.startsWith('S') || evalObj.grade.startsWith('A') || evalObj.grade.startsWith('B') ? '#4bff4b' : '#ff4b4b',
            border: '1px solid currentColor',
            padding: '0.2rem 2.5rem',
            transform: 'rotate(35deg)',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            {gameState.season === 1 ? '1η Σεζόν' : `${gameState.season}η Σεζόν`}
          </div>

          <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            💼 ΚΑΡΤΕΛΑ ΥΠΑΛΛΗΛΟΥ FAPLANTICA
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Success Rate Circle */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                Ποσοστό Επιτυχίας
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#66fcf1', textShadow: '0 0 10px rgba(102, 252, 241, 0.3)' }}>
                {successRate}%
              </div>
            </div>

            {/* Grade Badge */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                Αξιολόγηση HR
              </span>
              <div style={{
                fontSize: '2.2rem',
                fontWeight: 900,
                color: evalObj.grade.startsWith('S') || evalObj.grade.startsWith('A') || evalObj.grade.startsWith('B') ? '#4bff4b' : '#ff4b4b',
                textShadow: evalObj.grade.startsWith('S') || evalObj.grade.startsWith('A') || evalObj.grade.startsWith('B') ? '0 0 10px rgba(75,255,75,0.3)' : '0 0 10px rgba(255,75,75,0.3)'
              }}>
                {evalObj.grade}
              </div>
            </div>
          </div>

          {/* Character Evaluation Label & Description */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              {evalObj.label}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              {evalObj.desc}
            </p>
          </div>
        </div>

        {/* HR SUBMISSION PANEL */}
        <div style={{ marginTop: '1.5rem', backgroundColor: 'rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '12px', maxWidth: '550px', margin: '1.5rem auto', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent-color)', fontSize: '1.1rem' }}>
            {isSeasonEnd ? "Πώς θα περιέγραφες τη φετινή εμπειρία σου;" : "Υπόβαλε Αναφορά στο HR της Faplantica:"}
          </h3>
          {!feedbackSent ? (
            <>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Γράψε εδώ τα παράπονά σου (δεν θα τα διαβάσει κανείς στο HR)..."
                style={{ width: '100%', height: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', marginTop: '0.5rem', resize: 'vertical', fontSize: '0.9rem' }}
              />
              <button 
                className="btn-primary" 
                style={{ marginTop: '0.75rem', width: '100%', padding: '0.6rem 1rem' }}
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
                        nickname: nickname || 'Guest',
                        role: gameState.role,
                        season: gameState.season || 1,
                        turns: gameState.turnCount || 0,
                        stress: gameState.stress,
                        reputation: gameState.reputation,
                        cash: gameState.cash,
                        tips: gameState.tips || 0,
                        success_rate: `${successRate}%`,
                        evaluation: `${evalObj.grade} - ${evalObj.label}`,
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
                {isSendingFeedback ? 'Υποβολή...' : 'Υποβολή Φακέλου στο HR'}
              </button>
            </>
          ) : (
            <p style={{ color: 'var(--success-color)', fontWeight: 'bold', margin: 0, fontSize: '0.95rem' }}>
              Η αναφορά σας αρχειοθετήθηκε επιτυχώς (στα σκουπίδια του HR). Καλή τύχη!
            </p>
          )}
        </div>

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
      alcoholWarnings: 0,
      magicEyePurchasedCount: 0,
      grandmaCashPurchasedCount: 0
    };
    setGameState(newState);
    setGameOver(false);
    setFeedbackSent(false);
    setFeedbackText('');
    
    setSceneData({
      scene_title: `Καλώς Ήρθες στη Σεζόν ${nextSeason}`,
      story_text: `Ο χειμώνας πέρασε. Επέστρεψες στην Faplantica. Φέτος τα πράγματα αλλάζουν: Πήρες προαγωγή σε ${nextRole}! Ο Μουστάκας σε περιμένει...`,
      active_vip_archetype: 'None',
      choices: [{ id: 1, text: 'Πάμε γερά!' }]
    });
  };

  const renderDisclaimerScreen = () => (
    <div className="intro-screen">
      <div className="intro-content" style={{ textAlign: 'center', padding: '1rem 0' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', textShadow: '0 0 15px rgba(102, 252, 241, 0.3)', marginBottom: '1rem', marginTop: 0 }}>
          Καλώς ήρθες στην Οικογένεια της Faplantica
        </h1>
        <p style={{ marginTop: '1.25rem', fontSize: '1.35rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '1.25rem auto', lineHeight: '1.65' }}>
          Οποιαδήποτε ομοιότητα με πρόσωπα, καταστάσεις ή γεγονότα είναι εντελώς συμπτωματική και δεν ανταποκρίνεται στην πραγματικότητα.
          <br /><br />
          Αν όμως νομίζεις ότι κάτι σου θυμίζει... μάλλον έχεις δίκιο.
        </p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '1.5rem', padding: '0.85rem 3rem', fontSize: '1.2rem', borderRadius: '30px' }}
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

  const renderLeaderboardModal = () => {
    if (!showLeaderboard) return null;
    const offlineList = JSON.parse(localStorage.getItem('hotel_madness_leaderboard')) || getMockLeaderboard();
    
    // Merge online scores with offline list and mock scores
    const uniqueScores = [...onlineScores];
    
    // Add local scores to uniqueScores if they aren't already represented online
    offlineList.forEach(localEntry => {
      const exists = uniqueScores.some(e => 
        (e.id && e.id === localEntry.id) ||
        (e.nickname === localEntry.nickname && e.turns === localEntry.turns && e.cash === localEntry.cash && e.season === localEntry.season)
      );
      if (!exists) {
        uniqueScores.push(localEntry);
      }
    });

    const mockList = getMockLeaderboard();
    mockList.forEach(mockEntry => {
      if (!uniqueScores.some(e => e.nickname.trim().toLowerCase() === mockEntry.nickname.trim().toLowerCase())) {
        uniqueScores.push(mockEntry);
      }
    });
    
    // Sort by season (descending), then turns (descending), then cash (descending)
    uniqueScores.sort((a, b) => {
      if (b.season !== a.season) return b.season - a.season;
      if (b.turns !== a.turns) return b.turns - a.turns;
      return b.cash - a.cash;
    });

    const list = isOnlineConnected ? uniqueScores : offlineList;
    const isOnline = isOnlineConnected;

    return (
      <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowLeaderboard(false)}>
        <div style={{ background: '#0b0c10', border: '1px solid #66fcf1', borderRadius: '16px', padding: '2rem', maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Trophy color="var(--warning-color)" /> Hall of Fame - Κατάταξη 
              {isLeaderboardLoading ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', background: 'rgba(102, 252, 241, 0.1)', border: '1px solid var(--accent-color)', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', fontWeight: 600 }}>ΑΝΑΝΕΩΣΗ... ⏳</span>
              ) : isOnline ? (
                <span style={{ fontSize: '0.8rem', color: '#4bff4b', background: 'rgba(75, 255, 75, 0.1)', border: '1px solid #4bff4b', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', fontWeight: 600 }}>ONLINE 🌐</span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--warning-color)', background: 'rgba(255, 170, 0, 0.1)', border: '1px solid var(--warning-color)', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', fontWeight: 600 }}>LOCAL 📂</span>
              )}
            </h3>
            <button 
              onClick={() => setShowLeaderboard(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(102, 252, 241, 0.3)', color: 'var(--accent-color)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Όνομα</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Ρόλος</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Σεζόν</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Βάρδιες</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Eurobank</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Tips</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Δυσκολία</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Κατάσταση</th>
                </tr>
              </thead>
              <tbody>
                {list.map((entry, index) => {
                  const isTop3 = index < 3;
                  const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                  return (
                    <tr 
                      key={entry.id || index} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                        fontWeight: isTop3 ? '600' : '400',
                        color: isTop3 ? '#ffffff' : 'var(--text-secondary)'
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {isTop3 ? medalEmoji : index + 1}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: isTop3 ? 'var(--accent-color)' : '#fff' }}>
                        {entry.nickname}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{entry.role}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{entry.season}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{entry.turns}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--success-color)' }}>€{entry.cash.toLocaleString('el-GR')}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#ffd700' }}>€{entry.tips.toLocaleString('el-GR')}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{entry.difficulty}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{entry.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={() => setShowLeaderboard(false)}
              style={{ padding: '0.6rem 2.5rem', width: 'auto' }}
            >
              Κλείσιμο
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showIntro) {
    return renderIntroScreen();
  }

  const isMobileDevice = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const showMobileSpacer = isMobileLayout || isMobileDevice;

  return (
    <div className="app-container">
      {showMobileSpacer && (
        <div className="mobile-vertical-spacer" style={{ height: '3.5rem' }} />
      )}
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
            onClick={() => setShowLeaderboard(true)}
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
            title="Κατάταξη"
          >
            <Trophy size={16} color="var(--warning-color)" />
            <span>Κατάταξη</span>
          </button>
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

          {/* Admin Panel Button */}
          {nickname && nickname.trim().toLowerCase() === 'admin' && (
            <button
              onClick={() => setShowAdminPanel(true)}
              style={{
                background: 'linear-gradient(135deg, #ff4b4b, #b388ff)',
                border: 'none',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                boxShadow: '0 0 12px rgba(255, 75, 75, 0.3)',
                transition: 'all 0.2s',
                gap: '0.4rem',
                fontWeight: 600
              }}
              title="Admin Panel"
            >
              <span>🛠️ Admin</span>
            </button>
          )}
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
              <div className="settings-row" style={{ marginTop: '0.75rem' }}>
                <span className="settings-label">Κανάλι Μουσικής:</span>
                <select 
                  className="settings-select" 
                  value={musicPlaylist} 
                  onChange={(e) => {
                    const pl = e.target.value;
                    setMusicPlaylist(pl);
                    audioService.setPlaylist(pl);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '60%'
                  }}
                >
                  <option value="faplantica" style={{ background: '#0b0c10' }}>Faplantica Ambient (Original) 🏝️</option>
                  <option value="synthwave" style={{ background: '#0b0c10' }}>Retro Greek Synthwave 80s 🕶️</option>
                  <option value="lounge" style={{ background: '#0b0c10' }}>Elevator Lounge Jazz 🍸</option>
                  <option value="panic" style={{ background: '#0b0c10' }}>August Rush (Panic Beat) 🥵</option>
                  <option value="reggae" style={{ background: '#0b0c10' }}>Chill Aegon Reggae 🍹</option>
                </select>
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
                    if (confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις όλη την πρόοδό σου, τις ρυθμίσεις και την κατάταξη για να ξεκινήσεις από την αρχή;")) {
                      localStorage.removeItem('game_difficulty');
                      localStorage.removeItem('game_use_ai');
                      localStorage.removeItem('game_music_volume');
                      localStorage.removeItem('game_use_sfx');
                      localStorage.removeItem('player_nickname');
                      localStorage.removeItem('hotel_madness_leaderboard');
                      // Reset local storage states
                      setGameState(INITIAL_STATE);
                      setGameStarted(false);
                      setNicknameConfirmed(false);
                      setIsGuest(false);
                      setOnlineScores([]);
                      setShowSettings(false);
                      alert("Η πρόοδος και η κατάταξη διαγράφηκαν επιτυχώς!");
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

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="modal-overlay" onClick={() => setShowAdminPanel(false)}>
          <div className="settings-modal" style={{ background: '#0b0c10', border: '2px solid #ff4b4b', boxShadow: '0 0 25px rgba(255, 75, 75, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div className="settings-header" style={{ borderBottom: '1px solid rgba(255, 75, 75, 0.3)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, color: '#ff4b4b', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛠️ Πάνελ Διαχειριστή (God Mode)
              </h2>
              <button className="modal-close-btn" style={{ color: '#ff4b4b' }} onClick={() => setShowAdminPanel(false)}>x</button>
            </div>
            
            <div className="settings-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* God Mode Stats */}
              <div className="settings-section" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="settings-section-title" style={{ color: '#ffdd67', borderBottom: '1px solid rgba(255, 221, 103, 0.2)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                  👼 Βασικά Stats
                </div>
                
                <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="settings-label">🤯 Άγχος (Stress): <strong>{gameState.stress}%</strong></span>
                  <button onClick={() => { setGameState(prev => ({ ...prev, stress: 0 })); showToast("🧘 Το Stress μηδενίστηκε!", "😇"); }} style={{ background: 'rgba(75, 255, 75, 0.1)', border: '1px solid #4bff4b', color: '#4bff4b', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    🧘 Μηδενισμός
                  </button>
                </div>

                <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="settings-label">🌟 Φήμη (Reputation): <strong>{gameState.reputation}%</strong></span>
                  <button onClick={() => { setGameState(prev => ({ ...prev, reputation: 100 })); showToast("🌟 Η Φήμη εκτοξεύτηκε στο 100%!", "👑"); }} style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid #66fcf1', color: '#66fcf1', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    👑 Μέγιστο
                  </button>
                </div>

                <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="settings-label">💵 Μετρητά (Cash): <strong>{gameState.cash.toLocaleString('el-GR')}€</strong></span>
                  <button onClick={() => { setGameState(prev => ({ ...prev, cash: prev.cash + 5000 })); showToast("💵 Προστέθηκαν +5.000€!", "💰"); audioService.playCashSound(); }} style={{ background: 'rgba(255, 221, 103, 0.1)', border: '1px solid #ffdd67', color: '#ffdd67', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    💰 +5.000€
                  </button>
                </div>
              </div>

              {/* Time Travel */}
              <div className="settings-section" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="settings-section-title" style={{ color: '#45a29e', borderBottom: '1px solid rgba(69, 162, 158, 0.2)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                  ⏱️ Έλεγχος Χρόνου & Σεζόν
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      setGameState(prev => ({ ...prev, currentDate: '2026-08-01', turnCount: prev.turnCount + 24, occupancy: 100 }));
                      showToast("☀️ Καλωσήρθες στον Δεκαπενταύγουστο!", "🔥");
                    }}
                    style={{ flex: 1, background: 'rgba(69, 162, 158, 0.1)', border: '1px solid #45a29e', color: '#45a29e', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    🔥 Μετάβαση στον Αύγουστο (Peak)
                  </button>
                  <button 
                    onClick={() => {
                      setGameState(prev => ({ ...prev, currentDate: '2026-11-01' }));
                      showToast("❄️ Ο χειμώνας έφτασε! Κάνε μια ενέργεια για να τερματίσεις.", "⛄");
                    }}
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #ccc', color: '#ccc', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    ⏩ Skip στο Τέλος (Νοέμβριος)
                  </button>
                </div>
              </div>

              {/* Inventory Spawner */}
              <div className="settings-section" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="settings-section-title" style={{ color: '#ff77ff', borderBottom: '1px solid rgba(255, 119, 255, 0.2)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                  🎒 Γεννήτρια Αντικειμένων (Store)
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => { setGameState(prev => ({ ...prev, inventory: [...prev.inventory, 'Μαγικό Μάτι 🧿'] })); showToast("🧿 Προστέθηκε Μαγικό Μάτι!"); }} style={{ flex: 1, background: 'rgba(255, 119, 255, 0.1)', border: '1px solid #ff77ff', color: '#ff77ff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>+1 Μαγικό Μάτι 🧿</button>
                  <button onClick={() => { setGameState(prev => ({ ...prev, inventory: [...prev.inventory, 'Lexotanil 💊'] })); showToast("💊 Προστέθηκε Lexotanil!"); }} style={{ flex: 1, background: 'rgba(255, 119, 255, 0.1)', border: '1px solid #ff77ff', color: '#ff77ff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>+1 Lexotanil 💊</button>
                  <button onClick={() => { setGameState(prev => ({ ...prev, inventory: [...prev.inventory, 'Καφές Φραπέ ☕'] })); showToast("☕ Προστέθηκε Φραπές!"); }} style={{ flex: 1, background: 'rgba(255, 119, 255, 0.1)', border: '1px solid #ff77ff', color: '#ff77ff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>+1 Φραπές ☕</button>
                </div>
              </div>

              {/* Disaster Triggers */}
              <div className="settings-section" style={{ border: '1px solid rgba(255, 75, 75, 0.1)', background: 'rgba(255, 75, 75, 0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div className="settings-section-title" style={{ color: '#ff4b4b', borderBottom: '1px solid rgba(255, 75, 75, 0.2)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                  🌪️ Απόλυτο Χάος (Disaster Triggers)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    onClick={() => {
                      setGameState(prev => ({ ...prev, occupancy: 120, reputation: Math.max(0, prev.reputation - 20) }));
                      showToast("🚨 Overbooking! Η πληρότητα πήγε στο 120% και η φήμη έπεσε!", "🔥");
                    }}
                    style={{ background: 'rgba(255, 75, 75, 0.1)', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    🔥 Πρόβλημα Overbooking (120%)
                  </button>
                  <button 
                    onClick={() => {
                      setGameState(prev => ({ ...prev, reputation: Math.max(0, prev.reputation - 35), stress: Math.min(100, prev.stress + 40) }));
                      showToast("🤢 Μαζική Τροφική Δηλητηρίαση! Τεράστιο πλήγμα στη φήμη!", "🤮");
                    }}
                    style={{ background: 'rgba(255, 75, 75, 0.1)', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    🤮 Μαζική Τροφική Δηλητηρίαση
                  </button>
                  <button 
                    onClick={() => {
                      setGameState(prev => ({ ...prev, staffTurnover: 100, staffRelations: -50 }));
                      showToast("😡 Το προσωπικό παραιτείται μαζικά!", "📉");
                    }}
                    style={{ background: 'rgba(255, 75, 75, 0.1)', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    📉 Μαζική Παραίτηση Προσωπικού
                  </button>
                </div>
              </div>

              {/* Multiplayer / Supabase Admin */}
              <div className="settings-section" style={{ border: '1px solid rgba(179, 136, 255, 0.2)', background: 'rgba(179, 136, 255, 0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div className="settings-section-title" style={{ color: '#b388ff', borderBottom: '1px solid rgba(179, 136, 255, 0.2)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                  🌐 Online Multiplayer Control
                </div>
                
                {/* MOTD */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Παγκόσμια Ανακοίνωση (MOTD):</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Μήνυμα σε όλους τους παίκτες..."
                      value={motdInput}
                      onChange={(e) => setMotdInput(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #b388ff', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                    />
                    <button onClick={setGlobalMessage} style={{ background: '#b388ff', border: 'none', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Αποστολή</button>
                  </div>
                </div>

                {/* Fake Score Injection */}
                <div style={{ marginBottom: '1rem', borderTop: '1px dashed rgba(179, 136, 255, 0.3)', paddingTop: '1rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Ένεση Ψεύτικου Σκορ (Trolling):</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input type="text" value={fakeScore.nickname} onChange={e => setFakeScore({...fakeScore, nickname: e.target.value})} placeholder="Όνομα" style={{ width: '120px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #45a29e', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                    <input type="number" value={fakeScore.cash} onChange={e => setFakeScore({...fakeScore, cash: parseInt(e.target.value)})} placeholder="Χρήματα" style={{ width: '100px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #45a29e', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                    <button onClick={injectFakeScore} style={{ background: 'rgba(69, 162, 158, 0.2)', border: '1px solid #45a29e', color: '#45a29e', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Inject</button>
                  </div>
                </div>
                
                {/* Leaderboard Wipe */}
                <div style={{ borderTop: '1px dashed rgba(179, 136, 255, 0.3)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Διαχείριση Κατάταξης:</label>
                    <button onClick={() => { setShowLeaderboard(true); fetchOnlineLeaderboard(); }} style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #fff', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Φόρτωση / Διαγραφή</button>
                  </div>
                </div>
              </div>


              {/* Force Events */}
              <div className="settings-section" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="settings-section-title" style={{ color: '#b388ff', borderBottom: '1px solid rgba(179, 136, 255, 0.2)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                  🎯 Εξαναγκασμός Συμβάντων (Force Events)
                </div>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #b388ff, #ff4b4b)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.5rem',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(179, 136, 255, 0.3)',
                    transition: 'all 0.2s',
                    width: '100%',
                    textTransform: 'uppercase'
                  }}
                  onClick={() => {
                    setGameState(prev => ({ ...prev, thesfapaTargetTurn: prev.turnCount + 1, thesfapaSpawnedThisSeason: false }));
                    showToast("🎯 Το ΦαΠ-Ο-Μέτρο θα εμφανιστεί στο ΑΜΕΣΩΣ επόμενο Arc!", "✨");
                    setShowAdminPanel(false);
                  }}
                >
                  ⚡ Force "ΦαΠ-Ο-Μέτρο" Link (Next Arc)
                </button>
                
                <button
                  style={{
                    marginTop: '0.5rem',
                    background: 'linear-gradient(135deg, #66fcf1, #45a29e)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.5rem',
                    color: '#0b0c10',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(102, 252, 241, 0.3)',
                    transition: 'all 0.2s',
                    width: '100%',
                    textTransform: 'uppercase'
                  }}
                  onClick={() => {
                    setShowAdminPanel(false);
                    setShowSlapOMeter(true);
                  }}
                >
                  🤚 ΠΑΙΞΕ ΤΩΡΑ ΤΟ ΦαΠ-Ο-Μέτρο
                </button>
              </div>

            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1.25rem', background: '#ff4b4b', color: '#ffffff', border: 'none' }} 
              onClick={() => setShowAdminPanel(false)}
            >
              Κλείσιμο Πάνελ
            </button>
          </div>
        </div>
      )}

      {showStore && (
        <div className="modal-overlay" onClick={() => setShowStore(false)}>
          <div style={{ background: '#0b0c10', border: '1px solid #66fcf1', borderRadius: '16px', padding: '2rem', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#66fcf1' }}>🛍️ Κατάστημα Faplantica</h2>
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
                
                // Seasonal limits checks
                let isLimitReached = false;
                let limitText = null;
                if (item.id === 'eye') {
                  const count = gameState.magicEyePurchasedCount || 0;
                  isLimitReached = count >= 2;
                  limitText = `Όριο σεζόν: ${count}/2`;
                } else if (item.id === 'grandma') {
                  const count = gameState.grandmaCashPurchasedCount || 0;
                  isLimitReached = count >= 2;
                  limitText = `Όριο σεζόν: ${count}/2`;
                }

                const isDisabled = hasPurchasedThisTurn || !canAfford || isLimitReached;

                return (
                  <div
                    key={item.id}
                    className="store-item-card"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: isLimitReached ? '1px solid rgba(255, 75, 75, 0.3)' : '1px solid rgba(102,252,241,0.2)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      position: 'relative'
                    }}
                  >
                    {/* Floating Tooltip */}
                    <div className="store-item-tooltip">
                      {item.desc}
                    </div>

                    <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{item.emoji}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{item.name}</div>
                      {limitText && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isLimitReached ? '#ff4b4b' : '#66fcf1',
                          background: isLimitReached ? 'rgba(255,75,75,0.1)' : 'rgba(102,252,241,0.1)',
                          border: isLimitReached ? '1px solid rgba(255,75,75,0.3)' : '1px solid rgba(102,252,241,0.3)',
                          borderRadius: '4px',
                          padding: '0.1rem 0.4rem'
                        }}>
                          {limitText}
                        </span>
                      )}
                    </div>

                    {item.id === 'eye' ? (
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#b388ff',
                        background: 'rgba(179,136,255,0.1)',
                        border: '1px solid rgba(179,136,255,0.3)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        alignSelf: 'flex-start',
                      }}>
                        🧿 Ασπίδα Προστασίας
                      </div>
                    ) : item.id === 'grandma' ? (
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#ffdd67',
                        background: 'rgba(255,221,103,0.1)',
                        border: '1px solid rgba(255,221,103,0.3)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        alignSelf: 'flex-start',
                      }}>
                        💵 +20€ | 🤯 Stress +15%
                      </div>
                    ) : (
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
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#66fcf1' }}>
                        {item.price.toLocaleString('el-GR')}€
                      </div>
                      <button
                        disabled={isDisabled}
                        onClick={() => buyStoreItem(item)}
                        style={{
                          background: isLimitReached 
                            ? 'rgba(255, 75, 75, 0.08)' 
                            : (hasPurchasedThisTurn 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : (!canAfford 
                                    ? 'rgba(255, 75, 75, 0.08)' 
                                    : 'linear-gradient(135deg, #66fcf1, #45a29e)')),
                          border: isLimitReached 
                            ? '1px solid rgba(255, 75, 75, 0.4)' 
                            : (hasPurchasedThisTurn 
                                ? '1px solid rgba(255, 255, 255, 0.15)' 
                                : (!canAfford 
                                    ? '1px solid rgba(255, 75, 75, 0.4)' 
                                    : 'none')),
                          borderRadius: '6px',
                          padding: '0.5rem 1.2rem',
                          color: isLimitReached 
                            ? '#ff4b4b' 
                            : (hasPurchasedThisTurn 
                                ? 'rgba(255, 255, 255, 0.4)' 
                                : (!canAfford 
                                    ? '#ff4b4b' 
                                    : '#0b0c10')),
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                          boxShadow: !isDisabled 
                            ? '0 0 10px rgba(102, 252, 241, 0.2)' 
                            : (!canAfford && !hasPurchasedThisTurn && !isLimitReached 
                                ? '0 0 10px rgba(255, 75, 75, 0.15)' 
                                : 'none')
                        }}
                      >
                        {isLimitReached ? 'Όριο Σεζόν' : (hasPurchasedThisTurn ? '1 Αγορά/Βάρδια' : 'Αγορά')}
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
      {showSlapOMeter && (
        <SlapOMeter
          onClose={() => setShowSlapOMeter(false)}
          onResult={handleSlapResult}
        />
      )}
      {renderLeaderboardModal()}
    </div>
  );
}

export default App;
