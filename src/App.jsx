import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EventTerminal from './components/EventTerminal';
import Auth from './components/Auth';
import SlapOMeter from './components/SlapOMeter';
import DishwasherModal from './components/DishwasherModal';
import FrappeModal from './components/FrappeModal';
import RoomCleaningModal from './components/RoomCleaningModal';
import ViberModal from './components/ViberModal';
import { supabase } from './supabaseClient';
import { generateNextState } from './services/aiService';
import { ChefHat, Coffee, Hotel, ShieldAlert, Volume2, VolumeX, Settings, ShoppingBag, LogOut, Trophy } from 'lucide-react';
import { audioService } from './services/audioService';
import { SPECIFIC_EVENTS, GENERAL_EVENTS } from './data/events';
import confetti from 'canvas-confetti';

const isRoleMatch = (eventRole, playerRole) => {
  if (!eventRole) return true;
  if (eventRole === playerRole) return true;

  const receptionistRoles = ['F.O AGENT', 'Assistant Fom', 'Front Office Manager', 'Operations Manager', 'General Manager'];
  const waiterRoles = ['Βοηθός Σερβιτόρου', 'Σερβιτόρος Α', 'Captain', 'Maitre', 'F&B Manager', 'Σερβιτόρος', 'Head Waiter', "Maitre d'hotel"];
  const chefRoles = ['Γ Μάγειρας', 'Β Μάγειρας', 'Α Μάγειρας', 'Sous Chef', 'Executive Chef', 'Μάγειρας', 'Section Chef', 'Head Chef'];

  if (receptionistRoles.includes(eventRole) && receptionistRoles.includes(playerRole)) return true;
  if (waiterRoles.includes(eventRole) && waiterRoles.includes(playerRole)) return true;
  if (chefRoles.includes(eventRole) && chefRoles.includes(playerRole)) return true;

  return false;
};

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
  grandmaCashPurchasedCount: 0,
  viberMessages: [],
  viberUnreadCount: 0,
  opsManagerSpawnsThisSeason: 0,
  christosRelation: 50
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
  const [showDishwasher, setShowDishwasher] = useState(false);
  const [hasWashedDishesThisTurn, setHasWashedDishesThisTurn] = useState(false);
  const [pendingChoiceData, setPendingChoiceData] = useState(null);
  const [showFrappe, setShowFrappe] = useState(false);
  const [showRoomCleaning, setShowRoomCleaning] = useState(false);
  const [showViber, setShowViber] = useState(false);
  const [opsManagerSpawnsThisSeason, setOpsManagerSpawnsThisSeason] = useState(0);

  const handleDishwasherComplete = ({ success, score }) => {
    let stressChange = success ? -20 : 15;
    let cashChange = success ? 10 : 0;

    if (pendingChoiceData) {
      const { choice, updatedState } = pendingChoiceData;
      const mult = getDifficultyMultipliers();
      let stressDelta = stressChange > 0
        ? stressChange * mult.stressUp
        : stressChange * mult.stressDown;
      let cashDelta = Math.round(cashChange * mult.cash);

      updatedState.stress = Math.max(0, Math.min(100, updatedState.stress + stressDelta));
      updatedState.cash += cashDelta;

      if (choice.reputation_change !== undefined) {
        let repDelta = choice.reputation_change > 0
          ? choice.reputation_change * mult.repUp
          : choice.reputation_change * mult.repDown;
        updatedState.reputation = Math.max(0, Math.min(100, updatedState.reputation + repDelta));
      }

      setGameState(updatedState);
      processTurn(`I choose option ${choice.id}: ${choice.text}. Mini-game result: ${success ? 'Success' : 'Failure'} with score ${score}.`, updatedState);
      setPendingChoiceData(null);
    } else {
      setGameState((prev) => {
        const newStress = Math.max(0, Math.min(100, prev.stress + stressChange));
        const newCash = Math.max(0, prev.cash + cashChange);
        return {
          ...prev,
          stress: newStress,
          cash: newCash
        };
      });
      setHasWashedDishesThisTurn(true);
    }

    if (success) {
      if (useSFX) {
        audioService.playCashSound();
      }
      showToast(`Καθάρισες ${score} πιάτα! Stress -20, Bonus +10€`, '🧼');
    } else {
      showToast(`Καθάρισες μόνο ${score} πιάτα! Stress +15`, '🤦‍♂️');
    }
  };

  // ─── Frappe Mini-Game Handler ───
  const handleFrappeComplete = ({ result, correctCount }) => {
    const mult = getDifficultyMultipliers();
    let stressChange = 0, cashChange = 0, repChange = 0;
    if (result === 'perfect') {
      stressChange = -25; cashChange = 20;
    } else if (result === 'good') {
      stressChange = -10; cashChange = 5;
    } else {
      stressChange = 20; repChange = -10;
    }

    if (pendingChoiceData) {
      const { choice, updatedState } = pendingChoiceData;
      updatedState.stress = Math.max(0, Math.min(100, updatedState.stress + (stressChange > 0 ? stressChange * mult.stressUp : stressChange * mult.stressDown)));
      updatedState.cash += Math.round(cashChange * mult.cash);
      updatedState.reputation = Math.max(0, Math.min(100, updatedState.reputation + (repChange > 0 ? repChange * mult.repUp : repChange * mult.repDown)));
      setGameState(updatedState);
      processTurn(`I choose option ${choice.id}: ${choice.text}. Mini-game result: ${result}.`, updatedState);
      setPendingChoiceData(null);
    } else {
      setGameState(prev => ({
        ...prev,
        stress: Math.max(0, Math.min(100, prev.stress + (stressChange > 0 ? stressChange * mult.stressUp : stressChange * mult.stressDown))),
        cash: Math.max(0, prev.cash + Math.round(cashChange * mult.cash)),
        reputation: Math.max(0, Math.min(100, prev.reputation + (repChange > 0 ? repChange * mult.repUp : repChange * mult.repDown)))
      }));
    }

    if (result === 'perfect') showToast('Τέλειος καφές! Stress -25, +20€ φιλοδώρημα! ☕✨', '🏆');
    else if (result === 'good') showToast('Σχεδόν σωστός καφές! Stress -10, +5€', '☕');
    else showToast('Λάθος καφές! Stress +20, Reputation -10', '💀');
  };

  // ─── Room Cleaning Mini-Game Handler ───
  const handleRoomCleaningComplete = ({ success, score }) => {
    const mult = getDifficultyMultipliers();
    const stressChange = success ? -20 : 25;
    const repChange = success ? 15 : -15;

    if (pendingChoiceData) {
      const { choice, updatedState } = pendingChoiceData;
      updatedState.stress = Math.max(0, Math.min(100, updatedState.stress + (stressChange > 0 ? stressChange * mult.stressUp : stressChange * mult.stressDown)));
      updatedState.reputation = Math.max(0, Math.min(100, updatedState.reputation + (repChange > 0 ? repChange * mult.repUp : repChange * mult.repDown)));
      setGameState(updatedState);
      processTurn(`I choose option ${choice.id}: ${choice.text}. Mini-game result: ${success ? 'Success' : 'Failure'}.`, updatedState);
      setPendingChoiceData(null);
    } else {
      setGameState(prev => ({
        ...prev,
        stress: Math.max(0, Math.min(100, prev.stress + (stressChange > 0 ? stressChange * mult.stressUp : stressChange * mult.stressDown))),
        reputation: Math.max(0, Math.min(100, prev.reputation + (repChange > 0 ? repChange * mult.repUp : repChange * mult.repDown)))
      }));
    }

    if (success) showToast(`Μάζεψες ${score} αντικείμενα! Stress -20, Reputation +15 🧹✨`, '✅');
    else showToast(`Μόνο ${score} αντικείμενα! Stress +25, Reputation -15`, '💀');
  };

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
      newState.cash += 50;
      newState.grandmaCashPurchasedCount = (newState.grandmaCashPurchasedCount || 0) + 1;
    }

    setGameState(newState);
    setHasPurchasedThisTurn(true);

    if (item.id === 'grandma') {
      showToast("👵 Η γιαγιά σου έδωσε 50€ και σε ρώτησε πότε θα παντρευτείς!", "❤️");
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
        return { stressUp: 0.4, stressDown: 1.68, repUp: 1.68, repDown: 0.4, cash: 1.56 * 4 };
      case 'hard':
        return { stressUp: 0.88, stressDown: 1.14, repUp: 1.14, repDown: 0.88, cash: 1.08 * 4 };
      case 'nightmare':
        return { stressUp: 1.12, stressDown: 0.9, repUp: 0.9, repDown: 1.12, cash: 0.84 * 4 };
      default:
        return { stressUp: 0.64, stressDown: 1.38, repUp: 1.38, repDown: 0.64, cash: 1.32 * 4 };
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

  const saveScoreToLeaderboard = (state, forceGameOver = false) => {
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
        maintenance: 'Συντήρηση 🔧',
        'F.O AGENT': 'F.O AGENT 🛎️',
        'Assistant Fom': 'Assistant Fom 🛎️',
        'Front Office Manager': 'Front Office Manager 🛎️',
        'Operations Manager': 'Operations Manager 🛎️',
        'General Manager': 'General Manager 🛎️',
        'Βοηθός Σερβιτόρου': 'Βοηθός Σερβιτόρου 🍽️',
        'Σερβιτόρος Α': 'Σερβιτόρος Α 🍽️',
        'Captain': 'Captain 🍽️',
        'Maitre': 'Maitre 🍽️',
        'F&B Manager': 'F&B Manager 🍽️',
        'Γ Μάγειρας': 'Γ Μάγειρας 🍳',
        'Β Μάγειρας': 'Β Μάγειρας 🍳',
        'Α Μάγειρας': 'Α Μάγειρας 🍳',
        'Sous Chef': 'Sous Chef 🍳',
        'Executive Chef': 'Executive Chef 🍳'
      };

      const isGameOver = forceGameOver || state.stress >= 100 || state.reputation <= 0 || state.alcoholWarnings >= 3 || state.resigned || state.ultimateVictory;
      let status = 'Εργάζεται';

      const isFired = state.stress >= 100 || state.reputation <= 0 || state.alcoholWarnings >= 3;
      if (isFired) {
        status = 'Απολύθηκε';
      } else if (state.resigned) {
        status = 'Παραιτήθηκε';
      } else if (state.ultimateVictory) {
        status = 'Συνταξιοδοτήθηκε';
      }

      const successRate = calculateSuccessRate(state);
      const evalObj = getEvaluationGrade(successRate, state);

      // Robust resolved nickname finder
      const resolvedNickname = nickname ||
        (session?.user?.user_metadata?.full_name) ||
        (session?.user?.email ? session.user.email.split('@')[0] : '') ||
        'Guest';

      const runId = state.runId || `run_${Date.now()}`;

      const newEntry = {
        id: runId,
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
        date: new Date().toLocaleDateString('el-GR'),
        saveData: isGameOver ? null : {
          gameState: { ...state, runId },
          sceneData: sceneData,
          nickname: resolvedNickname
        }
      };

      const currentLeaderboard = JSON.parse(localStorage.getItem('hotel_madness_leaderboard')) || getMockLeaderboard();
      const targetRole = roleMap[state.role] || state.role || '—';

      let updatedLeaderboard;
      if (isGameOver) {
        // For completed game: remove the active save for this run first
        let cleanLeaderboard = currentLeaderboard.filter(e => e.id !== runId);

        // Find if there is an existing completed score for the same user and role
        const existingCompIndex = cleanLeaderboard.findIndex(e =>
          e.status !== 'Εργάζεται' &&
          (e.nickname || '').trim().toLowerCase() === resolvedNickname.trim().toLowerCase() &&
          (e.role || '').trim().toLowerCase() === targetRole.trim().toLowerCase()
        );

        if (existingCompIndex !== -1) {
          const existing = cleanLeaderboard[existingCompIndex];
          const newSeason = newEntry.season || 1;
          const oldSeason = existing.season || 1;

          let isNewBetter = false;
          if (newSeason > oldSeason) {
            isNewBetter = true;
          } else if (newSeason === oldSeason) {
            const newTurns = newEntry.turns || 0;
            const oldTurns = existing.turns || 0;
            if (newTurns > oldTurns) {
              isNewBetter = true;
            } else if (newTurns === oldTurns) {
              const newCash = newEntry.cash || 0;
              const oldCash = existing.cash || 0;
              if (newCash > oldCash) {
                isNewBetter = true;
              }
            }
          }

          if (isNewBetter) {
            cleanLeaderboard[existingCompIndex] = newEntry;
          }
        } else {
          // No completed score exists yet, so append newEntry
          cleanLeaderboard = [newEntry, ...cleanLeaderboard];
        }
        updatedLeaderboard = cleanLeaderboard;
      } else {
        // For active game: overwrite the active save entry with this run ID
        const existingIndex = currentLeaderboard.findIndex(e => e.id === runId);
        if (existingIndex !== -1) {
          updatedLeaderboard = [...currentLeaderboard];
          updatedLeaderboard[existingIndex] = newEntry;
        } else {
          updatedLeaderboard = [newEntry, ...currentLeaderboard];
        }
      }

      // Sort by season (descending), then turns (descending), then cash (descending)
      updatedLeaderboard.sort((a, b) => {
        if (b.season !== a.season) return b.season - a.season;
        if (b.turns !== a.turns) return b.turns - a.turns;
        return b.cash - a.cash;
      });

      // Keep top 100 entries
      localStorage.setItem('hotel_madness_leaderboard', JSON.stringify(updatedLeaderboard.slice(0, 100)));

      // POST to global online database ONLY if game is completed
      if (isGameOver) {
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
            role: targetRole,
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
      }
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
      .catch(() => { });
  }, []);


  // Fireworks effect for Disclaimer Screen
  useEffect(() => {
    if (showDisclaimer) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
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
      let currentState = gameState;
      if (!gameState.runId) {
        const newRunId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        currentState = { ...gameState, runId: newRunId };
        setGameState(currentState);
      }

      localStorage.setItem('hotel_saved_game', JSON.stringify({ gameState: currentState, sceneData, gameStarted, nickname }));

      // Save current turn state to leaderboard
      saveScoreToLeaderboard(currentState);

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
            gameState: currentState,
            sceneData,
            role: currentState.role
          })
        }).catch(err => console.error('Auto-save to server failed:', err));
      }
    }
    if (gameOver) {
      // Save game over state to leaderboard
      saveScoreToLeaderboard(gameState, true);

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
  }, [gameState, sceneData, gameOver, session, gameStarted, nickname]);

  const checkAndLoadState = (loadedState, loadedSceneData, loadedNickname) => {
    if (!loadedState) return;

    // Check if the loaded state is a Game Over state
    const isGameOverState =
      loadedState.stress >= 100 ||
      loadedState.reputation <= 0 ||
      loadedState.alcoholWarnings >= 3 ||
      loadedState.resigned ||
      loadedState.ultimateVictory ||
      loadedSceneData?.game_over ||
      loadedState.gameOver;

    setGameState(loadedState);
    setSceneData(loadedSceneData || {
      scene_title: "Επιβίωση",
      story_text: "Συνέχεια παιχνιδιού...",
      choices: []
    });
    setNickname(loadedNickname || '');
    setNicknameConfirmed(true);
    setGameStarted(true);
    setOpsManagerSpawnsThisSeason(loadedState.opsManagerSpawnsThisSeason || 0);

    if (isGameOverState) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  };

  const loadSavedGame = () => {
    if (savedGame) {
      checkAndLoadState(savedGame.gameState, savedGame.sceneData, savedGame.nickname);
      setHasSavedGame(false);
    }
  };

  const loadCloudSave = () => {
    if (cloudSaveData) {
      checkAndLoadState(cloudSaveData.game_state, cloudSaveData.scene_data, cloudSaveData.nickname);
      setHasCloudSave(false);
    }
  };

  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isKeyConfigured, setIsKeyConfigured] = useState(true);

  const saveApiKey = (key) => {
    const trimmed = key.trim();
    setApiKeyInput(trimmed);
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      setIsKeyConfigured(true);
      setErrorMsg('');
    } else {
      localStorage.removeItem('gemini_api_key');
      setIsKeyConfigured(true);
    }
  };

  const startGame = async (roleKey) => {
    let actualRole = roleKey;
    if (roleKey === 'Μάγειρας') actualRole = 'Γ Μάγειρας';
    if (roleKey === 'Σερβιτόρος') actualRole = 'Βοηθός Σερβιτόρου';
    if (roleKey === 'Ρεσεψιονίστ') actualRole = 'F.O AGENT';
    const newRunId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newState = { ...INITIAL_STATE, role: actualRole, nickname, runId: newRunId };
    setGameState(newState);
    setOpsManagerSpawnsThisSeason(0);
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
        } catch (e) { }

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
    setHasWashedDishesThisTurn(false);
    const updatedState = { ...gameState };

    if (choice.trigger_dishwasher) {
      setPendingChoiceData({ choice, updatedState });
      setShowDishwasher(true);
      return;
    }
    if (choice.trigger_frappe) {
      setPendingChoiceData({ choice, updatedState });
      setShowFrappe(true);
      return;
    }
    if (choice.trigger_cleaning) {
      setPendingChoiceData({ choice, updatedState });
      setShowRoomCleaning(true);
      return;
    }
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
        saveScoreToLeaderboard(rejectedState, true);
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


  const useInventoryItem = (item) => {
    const idx = gameState.inventory.indexOf(item);
    if (idx === -1) return;
    const newInv = [...gameState.inventory];
    newInv.splice(idx, 1);
    let newState = { ...gameState, inventory: newInv };

    if (item.includes('Φραπέ') || item.includes('Frappe') || item.includes('☕')) {
      newState.stress = Math.max(0, newState.stress - 8);
      showToast("☕ Ο Φραπές σε ηρεμεί! -8% Stress", "😌");
    } else if (item.includes('Lexotanil')) {
      newState.stress = Math.max(0, newState.stress - 20);
      showToast("💊 Το Lexotanil σε ηρεμεί βαθιά! -20% Stress", "😴");
    } else if (item.includes('Xanax')) {
      newState.stress = Math.max(0, newState.stress - 35);
      showToast("💊 Το Xanax σε ρίχνει σε βαθύ λήθαργο! -35% Stress", "😪");
    } else if (item.includes('Πορτοκαλάδα')) {
      newState.stress = Math.max(0, newState.stress - 15);
      newState.cash = (newState.cash || 0) + 5;
      showToast("🍹 Η Πορτοκαλάδα-Λεμονάδα 70-30 σε φρεσκάρει! -15% Stress & +5€", "⚡");
    } else if (item.includes('Μαγικό Μάτι') || item.includes('🧿')) {
      // Magic Eye is passive, put it back
      newState.inventory = gameState.inventory;
      showToast("🧿 Το Μαγικό Μάτι είναι παθητικό - ενεργοποιείται αυτόματα!", "✨");
      return;
    }
    setGameState(newState);
  };

  const checkNikosViberInjection = (stateToUpdate) => {
    const currentSeason = stateToUpdate.season || 1;
    const currentTurn = stateToUpdate.turnCount || 0;
    if (currentSeason === 1 && currentTurn >= 15 && canNikosSend) {
      nikosShouldSend = Math.random() < 0.2;
    } else if (currentSeason >= 2 && canNikosSend) {
      nikosShouldSend = Math.random() < 0.15;
    }

    if (nikosShouldSend) {
      const randItem = Math.random();
      let nikosItem = 'Lexotanil 💊';
      let nikosText = 'Επειδη σε βλεπω δεν την παλευεις.. Πάρε αυτό να σε βοηθήσει. Μην το πεις στον Μουστάκα δεν ξέρει ότι σου τα στελνω.🤫';
      
      if (randItem > 0.8) {
        nikosItem = 'Xanax 💊';
        nikosText = 'Μαν το βλέπω πως ζορίζεσαι και ανησυχώ. Πάρε αυτό να κρατάς. Ο Μουστάκας δεν πρέπει να το μάθει ποτέ 🤫';
      } else if (randItem > 0.5) {
        nikosItem = 'Πορτοκαλάδα-Λεμονάδα Μιξ 70-30% 🍹';
        nikosText = 'Δεν έχω άλλα λεφτά για φαρμακεία. Πάρε αυτή την πορτοκαλάδα από τον μπουφέ. 70 πορτοκάλι, 30 λεμόνι - όπως το λέμε εμείς 😁';
      }
      const nikosMsg = { sender: 'Τσαφρακίδης Νίκος (Οπερατιονς Manager)', text: nikosText, item: nikosItem, accepted: false };

      const newMsgs = [...(stateToUpdate.viberMessages || []), nikosMsg];
      stateToUpdate.viberMessages = newMsgs;
      stateToUpdate.viberUnreadCount = (stateToUpdate.viberUnreadCount || 0) + 1;
      stateToUpdate.opsManagerSpawnsThisSeason = currentSpawns + 1;

      setOpsManagerSpawnsThisSeason(stateToUpdate.opsManagerSpawnsThisSeason);
      audioService.playNotificationSound();
    }
  };

  const getWelcomeViberMessage = (role) => {
    const welcomeMsgs = [
      { sender: 'Γιάννης (Reception)', text: 'Γεια σου! Καλώς όρισες στη Reception της Faplantica. Κουράγιο για την πρώτη σου μέρα, ο Μουστάκας είναι σε τρελά κέφια σήμερα... 😅' },
      { sender: 'Chef Αντώνης', text: 'Καλώς τον νέο! Ετοιμάσου να ιδρώσεις, έχουμε 400 άτομα buffet το βράδυ. Μην καθυστερήσεις στη βάρδια σου! 🍳' },
      { sender: 'Αλεξάνδρα (F&B Captain)', text: 'Γεια! Καλώς ήρθες στην ομάδα του service. Πάρε βαθιά ανάσα, σήμερα έχει γάμο στο beach bar και θα τρέχουμε όλοι. 😅' },
      { sender: 'Κώστας (Maintenance)', text: 'Καλώς ήρθες φίλε/φίλη! Είμαι ο Κώστας από τη συντήρηση. Αν σου χαλάσει κάνα air condition ή βγάλει καπνούς το POS, πάρε με αλλά μην το πεις στον Μουστάκα αμέσως! 🔧' },
      { sender: 'Μαρία (Housekeeping)', text: 'Γεια σου! Καλή αρχή! Είμαι η Μαρία από τις οροφοκομίες. Αν δεις πελάτες να ζητάνε έξτρα μαξιλάρια στη βάρδια σου, στείλε μου Viber να το κανονίσω! 🧹' },
      { sender: 'Γιώργος (Bellboy)', text: 'Καλώς ήρθες στην τρέλα! Εγώ κουβαλάω τις βαλίτσες. Αν δεις τον Μουστάκα να τρέχει με κόκκινο πρόσωπο, κρύψου πίσω από τις κολόνες, είναι η καλύτερη άμυνα! 🧳' },
      { sender: 'Ελένη (Spa)', text: 'Καλή αρχή στο ξενοδοχείο! Είμαι η Ελένη από το Spa. Αν νιώσεις ότι το stress σου χτυπάει 100%, έλα από δω κρυφά να σου κάνω κάνα μασάζ να συνέλθεις! 💆' },
      { sender: 'Νίκος (Μπαρ)', text: 'Γεια σου συνάδελφε! Καλώς όρισες. Είμαι στο κεντρικό μπαρ. Το βράδυ μετά το σχόλασμα κερνάω σφηνάκι για το καλωσόρισμα, θα το χρειαστείς σίγουρα! 🍹' },
      { sender: 'Κατερίνα (Guest Relations)', text: 'Γεια σου και καλή αρχή! Είμαι η Κατερίνα. Αν έχεις πελάτες που φωνάζουν για το παραμικρό, στείλτους σε μένα να τους φλομώσω στα welcome drinks και στα free vouchers! 🥂' },
      { sender: 'Σπύρος (Pool Bar)', text: 'Καλώς ήρθες στην ομάδα! Εδώ Pool Bar. Έχουμε φουλ κρατήσεις σήμερα, αν περάσεις από δω φέρε κάνα μπουκάλι νερό γιατί έχουμε λιώσει από τη ζέστη! 🏊' },
      { sender: 'Στέλιος (Night Auditor)', text: 'Καλή αρχή! Εγώ δουλεύω νύχτα οπότε μάλλον δεν θα βλεπόμαστε πολύ. Απλά πρόσεχε τα reports σου γιατί ο Μουστάκας τα ελέγχει στις 7 το πρωί! 📊' },
      { sender: 'Χριστίνα (Κρατήσεις)', text: 'Γεια σου! Καλώς ήρθες στη Faplantica! Σου εύχομαι καλή υπομονή. Αν δεις ότι κάναμε overbooking (που κάνουμε κάθε μέρα), κάνε τον ανήξερο! 😉' },
      { sender: 'Θωμάς (Ασφάλεια)', text: 'Καλώς ήρθες στην ομάδα. Είμαι ο Θωμάς από την ασφάλεια. Αν δεις κάνα μεθυσμένο Άγγλο να προσπαθεί να κάνει βουτιά από το μπαλκόνι, σφύρα μου! 👮' },
      { sender: 'Μανώλης (Κηπουρός)', text: 'Καλή αρχή παιδί μου! Είμαι ο Μανώλης. Πρόσεχε εκεί που περπατάς στους κήπους, έβαλα αυτόματο πότισμα και θα σε κάνει λούτσα! 💦' },
      { sender: 'Ανθή (Animation)', text: 'Γειαααα! Καλή αρχή! Είμαστε η ομάδα του animation. Αν σε δούμε να ζορίζεσαι, θα σε βάλουμε να χορέψεις club dance μαζί μας να σου φύγει το άγχος! 💃' },
      { sender: 'Δημήτρης (Purchasing)', text: 'Καλώς ήρθες! Είμαι ο Δημήτρης στις προμήθειες. Αν σου λείψουν στυλό, χαρτιά ή καφέδες, στείλε μου αλλά κράτα χαμηλό προφίλ! 📝' },
      { sender: 'Βάσω (Λογιστήριο)', text: 'Καλή αρχή στη Faplantica. Είμαι η Βάσω. Για τις πληρωμές και τα tips θα μιλάς με μένα. Μην καθυστερείς τα reports των shift σου! 💶' },
      { sender: 'Τσαφρακίδης Νίκος (Operations Manager)', text: 'Καλώς ήρθες! Είμαι ο Νίκος. Πρόσεχε τον Μουστάκα, έχει νεύρα σήμερα. Αν δεις τα σκούρα, στείλε μου Viber, θα σε καλύψω! 😉' },
      { sender: 'Σάββας (Sous Chef)', text: 'Καλώς ήρθες! Αν δουλεύεις κουζίνα, πρόσεχε πώς κόβεις τα κρεμμύδια. Αν δουλεύεις service, μην αργείς να παίρνεις τα πιάτα γιατί κρυώνουν! 🔪' },
      { sender: 'Γιάννα (Υποδοχή)', text: 'Γεια σου και καλή αρχή! Είμαστε μαζί στη Reception. Αν δεις τηλέφωνα να χτυπάνε non-stop, απλά χαμογέλα και πες ότι το σύστημα έχει κολλήσει! ☎️' }
    ];

    const roleFiltered = welcomeMsgs.filter(m => {
      if (role === 'F.O AGENT' && (m.sender.includes('Reception') || m.sender.includes('Υποδοχή'))) return false;
      if (role === 'Γ Μάγειρας' && (m.sender.includes('Chef') || m.sender.includes('Sous Chef'))) return false;
      if (role === 'Βοηθός Σερβιτόρου' && (m.sender.includes('Captain') || m.sender.includes('Μπαρ') || m.sender.includes('Pool Bar'))) return false;
      return true;
    });

    return roleFiltered[Math.floor(Math.random() * roleFiltered.length)];
  };

  const getFallbackCoworkerMessage = (role) => {
    const messages = [
      { sender: 'Γιάννης (Reception)', text: 'Ρε συ, είδες τι έγινε χθες με τον Μουστάκα; Ούρλιαζε πάλι για τις πετσέτες. Κουράγιο...' },
      { sender: 'Μαρία (Housekeeping)', text: 'Έχουμε 5 check-out στο 2ο όροφο και είμαστε μόνο δύο κοπέλες. Αν δεις τον Τάρναβα πες του ότι καθαρίζουμε!' },
      { sender: 'Chef Αντώνης', text: 'Πάλι τελείωσε το ελαιόλαδο. Ποιος ξέχασε να παραγγείλει; Θα γίνει σφαγή σήμερα...' },
      { sender: 'Ταρακας (Maintenance)', text: 'Το air condition στο 104 πάλι στάζει. Μην νοικιάσετε αυτό το δωμάτιο, θα φάμε TripAdvisor κράξιμο!' },
      { sender: 'Ελένη (Spa)', text: 'Ήρθε μια περίεργη κυρία και ζητάει δωρεάν μασάζ επειδή λέει είδε μια μέλισσα στην πισίνα. Τι να της πω;' },
      { sender: 'Αγγελος (Beach Bar)', text: 'Φίλε έχει 40 βαθμούς έξω και έχει τελειώσει ο πάγος. Αν δεν φέρουν σε μισή ώρα, φεύγω.' },
      { sender: 'Αλεξάνδρα (F&B Captain)', text: 'Κάποιος έσπασε 3 δίσκους στην κουζίνα και ο Chef κοντεύει να πάθει εγκεφαλικό. Μην πλησιάζεις.' },
      { sender: 'Νίκος (Μπαρ)', text: 'Φίλε, κρύψε καμιά μπύρα στην αποθήκη. Θα περάσω μετά το σχόλασμα να την πιούμε κρυφά 🤫' },
      { sender: 'Γιώργος (Bellboy)', text: 'Ήρθαν κάτι VIPs με 10 βαλίτσες ο καθένας και δεν λειτουργεί το ασανσέρ. Μάλλον θα παραιτηθώ σήμερα.' },
      { sender: 'Γιάννης (Reception)', text: 'Ένας τύπος στο 203 ισχυρίζεται ότι το φάντασμα της Faplantica του έκλεψε τις κάλτσες. Θέλεις να πας εσύ ή να στείλω τον Μανώλη;' },
      { sender: 'Μαρία (Housekeeping)', text: 'Ο πελάτης στο 402 έχει κλειδωθεί στο μπαλκόνι από τις 5 το πρωί και φωνάζει. Η συντήρηση δεν απαντάει, τι να κάνουμε;' },
      { sender: 'Chef Αντώνης', text: 'Ποιος έβαλε τις γαρίδες δίπλα στα παγωτά; Το παγωτό βανίλια μυρίζει ψαρίλα τώρα! Αν το μάθει ο Μουστάκας, απολυόμαστε όλοι!' },
      { sender: 'Κώστας (Maintenance)', text: 'Το τζακούζι στη σουίτα 505 άρχισε να βγάζει πράσινους αφρούς. Μάλλον έβαλαν μέσα λάθος σαπούνι. Μην αφήσεις κανέναν να μπει!' },
      { sender: 'Ελένη (Spa)', text: 'Ήρθε μια περίεργη influencer και ζητάει δωρεάν μασάζ με αντάλλαγμα 2 stories στο Instagram. Της είπα ότι ο Μουστάκας θα την κάνει tag σε καταγγελία του ΙΚΑ!' },
      { sender: 'Βασίλης (Beach Bar)', text: 'Ένα group από μεθυσμένους άρχισε να παίζει beach volley με τις καρύδες από το ντεκόρ. Ήδη έσπασαν ένα τραπέζι. Βοήθεια!' },
      { sender: 'Αλεξάνδρα (F&B Captain)', text: 'Το γκρουπ των Γερμανών ήπιε όλο το βαρελίσιο κρασί σε 1 ώρα. Τώρα ζητάνε ούζο. Αν δεν έχουμε, θα γίνει εξέγερση.' },
      { sender: 'Αγγελος (Μπαρ)', text: 'Ο Μουστάκας με είδε να πίνω freddo espresso. Μου είπε ότι ο καφές μειώνει το corporate speed μου. Έχω πάθει σοκ.' },
      { sender: 'Νικος Μουσκ (Bellboy)', text: 'Μια οικογένεια έχασε το σκυλάκι της και νομίζει ότι μπήκε στις αποσκευές άλλου πελάτη που έφυγε για το αεροδρόμιο. Τρέχω!' },
      { sender: 'Φαφουτη (Κρατήσεις)', text: 'Έχουμε 3 overbookings στη VIP κατηγορία σήμερα. Πρέπει να πείσουμε κάποιον να κοιμηθεί στο staff house. Ποιος προσφέρεται;' },
      { sender: 'Σπύρος (Pool Bar)', text: 'Κάποιος έριξε ολόκληρο καρπούζι στην πισίνα και κόλλησε στο φίλτρο. Το νερό έχει γίνει κόκκινο. Ο Μουστάκας έρχεται με το buggy!' },
      { sender: 'Παναγιωτης (Ασφάλεια)', text: 'Οι πελάτες στο 112 κάνουν πάρτι με ελληνικά λαϊκά στις 3 το μεσημέρι. Οι γείτονες απειλούν με αστυνομία. Πάω να τους κάνω ντάντεμα.' },
      { sender: 'Μανώλης (Κηπουρός)', text: 'Ο Μουστάκας θέλει να κουρέψω το γκαζόν σε σχήμα Faplantica logo. Αν δεν τα καταφέρω, μου είπε θα με βάλει να ποτίζω με το ποτήρι!' },
      { sender: 'Ανθή (Animation)', text: 'Ο DJ μας έπαθε ηλίαση και δεν έχουμε μουσική για το aqua aerobic. Μπορείς να έρθεις να κάνεις beatbox;' },
      { sender: 'Θωμας (Purchasing)', text: 'Ήρθαν 200 κιλά λάχανα αντί για μαρούλια. Ο Chef Αντώνης κρατάει μπαλτά και με ψάχνει. Αν με ρωτήσει κανείς, είμαι στην Αθήνα.' },
      { sender: 'Δημητρα (Λογιστήριο)', text: 'Βρήκα μια απόδειξη για "ειδικά κοκτέιλ Μουστάκα" ύψους 500 ευρώ. Ποιος το ενέκρινε αυτό; Θα μας κλείσει η εφορία!' },
      { sender: 'Γιάνκα (Υποδοχή)', text: 'Ένα ζευγάρι τσακώνεται στη Reception επειδή η θέα στη θάλασσα κρύβεται από έναν φοίνικα. Θέλουν να κόψουμε τον φοίνικα τώρα!' },
      { sender: 'Ρηστας (Sous Chef)', text: 'Κάποιος έφαγε το μισό προφιτερόλ που είχαμε για τον VIP πελάτη. Αν σε πιάσω με σοκολάτα στα μούτρα, αλίμονό σου!' }
    ];
    const roleFiltered = messages.filter(m => {
      if (role === 'F.O AGENT' && (m.sender.includes('Reception') || m.sender.includes('Υποδοχή'))) return false;
      if (role === 'Γ Μάγειρας' && (m.sender.includes('Chef') || m.sender.includes('Sous Chef'))) return false;
      if (role === 'Βοηθός Σερβιτόρου' && (m.sender.includes('Captain') || m.sender.includes('Μπαρ') || m.sender.includes('Pool Bar'))) return false;
      return true;
    });
    return roleFiltered[Math.floor(Math.random() * roleFiltered.length)];
  };

  const promoteUser = (currentRole) => {
    const FO_LADDER = ['F.O AGENT', 'Assistant Fom', 'F.Ο Manager', 'Op.Manager', 'General Manager'];
    const FB_LADDER = ['Βοηθός Σερβιτόρου', 'Σερβιτόρος Α', 'Captain', 'Maitre', 'F&B Manager'];
    const KITCHEN_LADDER = ['Γ Μάγειρας', 'Β Μάγειρας', 'Α Μάγειρας', 'Sous Chef', 'Executive Chef'];

    if (FO_LADDER.includes(currentRole)) {
      const idx = FO_LADDER.indexOf(currentRole);
      return idx < FO_LADDER.length - 1 ? FO_LADDER[idx + 1] : currentRole;
    }
    if (FB_LADDER.includes(currentRole)) {
      const idx = FB_LADDER.indexOf(currentRole);
      return idx < FB_LADDER.length - 1 ? FB_LADDER[idx + 1] : currentRole;
    }
    if (KITCHEN_LADDER.includes(currentRole)) {
      const idx = KITCHEN_LADDER.indexOf(currentRole);
      return idx < KITCHEN_LADDER.length - 1 ? KITCHEN_LADDER[idx + 1] : currentRole;
    }
    return currentRole;
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
      saveScoreToLeaderboard(currentState, true);
      return;
    }

    const currentTurn = currentState.turnCount;
    const hasSpecificEvent = SPECIFIC_EVENTS[currentTurn] &&
      SPECIFIC_EVENTS[currentTurn].some(alt => (!alt.season || alt.season === currentState.season) && isRoleMatch(alt.role, currentState.role));
    // AI is used on Turn 0 (Interview) and every 5th turn (5, 10, 15, etc.) EXCEPT if there's a SPECIFIC_EVENT
    const isAITurn = useAI && (currentTurn === 0 || currentTurn % 5 === 0) && !hasSpecificEvent;

    if (!isAITurn) {
      // Hardcoded Route
      let nextScene = null;
      if (hasSpecificEvent) {
        const alternatives = SPECIFIC_EVENTS[currentTurn];
        const roleFiltered = alternatives.filter(alt => isRoleMatch(alt.role, currentState.role));

        // Filter by season if the event has a specific season requirement
        const seasonFiltered = roleFiltered.filter(alt => !alt.season || alt.season === currentState.season);

        // Exclude Fasli and Valantis in Season 2
        let filteredAlts = seasonFiltered;
        if (currentState.season === 2) {
          filteredAlts = seasonFiltered.filter(alt =>
            !alt.story_text.includes('Βαλάντης') &&
            !alt.story_text.includes('Φασλί') &&
            !alt.story_text.includes('Fasli') &&
            !alt.scene_title.includes('Βαλάντης') &&
            !alt.scene_title.includes('Φασλί') &&
            !alt.scene_title.includes('Fasli')
          );
        }

        const unused = filteredAlts.filter(alt => !currentState.usedEventTexts?.includes(alt.story_text));
        const pool = unused.length > 0 ? unused : (filteredAlts.length > 0 ? filteredAlts : roleFiltered);
        nextScene = pool[Math.floor(Math.random() * pool.length)] || alternatives[0];
      } else {
        // Filter general events so that role-specific events are only served to players with that role
        const filteredEvents = GENERAL_EVENTS.filter(e => isRoleMatch(e.role, currentState.role));

        // Filter by season if the event has a specific season requirement
        const seasonFiltered = filteredEvents.filter(e => !e.season || e.season === currentState.season);

        // Exclude Fasli and Valantis in Season 2
        let finalEvents = seasonFiltered;
        if (currentState.season === 2) {
          finalEvents = seasonFiltered.filter(e =>
            !e.story_text.includes('Βαλάντης') &&
            !e.story_text.includes('Φασλί') &&
            !e.story_text.includes('Fasli') &&
            !e.scene_title.includes('Βαλάντης') &&
            !e.scene_title.includes('Φασλί') &&
            !e.scene_title.includes('Fasli')
          );
        }

        const unused = finalEvents.filter(e => !currentState.usedEventTexts?.includes(e.story_text));
        const pool = unused.length > 0 ? unused : finalEvents;
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

      // Dynamic Thesfapa Injection
      if (!updatedState.thesfapaTargetTurn) {
        updatedState.thesfapaTargetTurn = Math.floor(Math.random() * 15) + 11; // Turn 11 to 25
      }
      const isSeason1 = !updatedState.season || updatedState.season === 1;
      if (isSeason1 && updatedState.turnCount === updatedState.thesfapaTargetTurn && !updatedState.thesfapaSpawnedThisSeason) {
        nextScene.story_text += " \n\nΈνας πελάτης σε βγάζει εκτός εαυτού με τις παράλογες απαιτήσεις του! Νιώθεις το αίμα σου να βράζει και θες απεγνωσμένα να τον χαστουκίσεις! Ξέσπασε εδώ: http://FapOMeter";
        updatedState.thesfapaSpawnedThisSeason = true;
      }

      // Coworker Viber message check
      if (updatedState.turnCount === 1) {
        const welcome = getWelcomeViberMessage(updatedState.role);
        const coworkerMsg = { sender: welcome.sender, text: welcome.text, item: null, accepted: false };
        updatedState.viberMessages = [...(updatedState.viberMessages || []), coworkerMsg];
        updatedState.viberUnreadCount = (updatedState.viberUnreadCount || 0) + 1;
        audioService.playNotificationSound();
      } else if (updatedState.turnCount > 0 && updatedState.turnCount % 3 === 0) {
        const fallback = getFallbackCoworkerMessage(updatedState.role);
        const coworkerMsg = { sender: fallback.sender, text: fallback.text, item: null, accepted: false };
        updatedState.viberMessages = [...(updatedState.viberMessages || []), coworkerMsg];
        updatedState.viberUnreadCount = (updatedState.viberUnreadCount || 0) + 1;
        audioService.playNotificationSound();
      }

      checkNikosViberInjection(updatedState);
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

      if (response.promotion_triggered) {
        const newRole = promoteUser(newState.role);
        if (newRole !== newState.role) {
          newState.role = newRole;
          setTimeout(() => showToast(`Συγχαρητήρια! Προήχθης σε ${newRole}! 🎉`, "🎓"), 1000);
          audioService.playCashSound();
        }
      }

      // Dynamic Thesfapa Injection
      if (!newState.thesfapaTargetTurn) {
        newState.thesfapaTargetTurn = Math.floor(Math.random() * 19) + 1; // Turn 1 to 19 for Season 1
      }
      const isSeason1 = !newState.season || newState.season === 1;
      if (isSeason1 && newState.turnCount === newState.thesfapaTargetTurn && !newState.thesfapaSpawnedThisSeason) {
        response.story_text += " \n\nΈνας πελάτης σε βγάζει εκτός εαυτού με τις παράλογες απαιτήσεις του! Νιώθεις το αίμα σου να βράζει και θες απεγνωσμένα να τον χαστουκίσεις! Ξέσπασε εδώ: http://FapOMeter";
        newState.thesfapaSpawnedThisSeason = true;
      }

      // Coworker Viber message check/extraction
      let coworkerMsg = null;
      if (response.viber_message && response.viber_message.sender && response.viber_message.text) {
        coworkerMsg = {
          sender: response.viber_message.sender,
          text: response.viber_message.text,
          item: null,
          accepted: false
        };
      } else if (newState.turnCount === 1) {
        const welcome = getWelcomeViberMessage(newState.role);
        coworkerMsg = { sender: welcome.sender, text: welcome.text, item: null, accepted: false };
      } else if (newState.turnCount > 0 && newState.turnCount % 3 === 0) {
        const fallback = getFallbackCoworkerMessage(newState.role);
        coworkerMsg = {
          sender: fallback.sender,
          text: fallback.text,
          item: null,
          accepted: false
        };
      }

      if (coworkerMsg) {
        newState.viberMessages = [...(newState.viberMessages || []), coworkerMsg];
        newState.viberUnreadCount = (newState.viberUnreadCount || 0) + 1;
        audioService.playNotificationSound();
      }

      checkNikosViberInjection(newState);
      setGameState(newState);
      setSceneData(response);

      if (response.game_over || newState.stress >= 100 || newState.reputation <= 0 || newState.alcoholWarnings >= 3) {
        setGameOver(true);
        audioService.playGameOverSound();
        saveScoreToLeaderboard(newState, true);
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
      // Coworker Viber message check fallback
      if (updatedState.turnCount === 1) {
        const welcome = getWelcomeViberMessage(updatedState.role);
        const coworkerMsg = { sender: welcome.sender, text: welcome.text, item: null, accepted: false };
        updatedState.viberMessages = [...(updatedState.viberMessages || []), coworkerMsg];
        updatedState.viberUnreadCount = (updatedState.viberUnreadCount || 0) + 1;
        audioService.playNotificationSound();
      } else if (updatedState.turnCount > 0 && updatedState.turnCount % 3 === 0) {
        const fallback = getFallbackCoworkerMessage(updatedState.role);
        const coworkerMsg = { sender: fallback.sender, text: fallback.text, item: null, accepted: false };
        updatedState.viberMessages = [...(updatedState.viberMessages || []), coworkerMsg];
        updatedState.viberUnreadCount = (updatedState.viberUnreadCount || 0) + 1;
        audioService.playNotificationSound();
      }

      checkNikosViberInjection(updatedState);
      setGameState(updatedState);
      setSceneData({ ...randomGen });

      if (randomGen.game_over || updatedState.stress >= 100 || updatedState.reputation <= 0 || updatedState.alcoholWarnings >= 3) {
        setGameOver(true);
        audioService.playGameOverSound();
        saveScoreToLeaderboard(updatedState, true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderNicknameScreen = () => {
    const userNickname = nickname || '';
    const leaderboard = (() => {
      try {
        return JSON.parse(localStorage.getItem('hotel_madness_leaderboard')) || [];
      } catch {
        return [];
      }
    })();
    const activeSaves = leaderboard.filter(entry =>
      entry.nickname &&
      entry.nickname.trim().toLowerCase() === userNickname.trim().toLowerCase() &&
      entry.status === 'Εργάζεται' &&
      entry.saveData
    );

    return (
      <div className="role-selection">
        <h2 style={{ fontSize: '2.2rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Καλώς ήρθατε</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.35rem', marginBottom: '1.25rem' }}>Πώς σε λένε;</p>
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

        {activeSaves.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(102, 252, 241, 0.03)',
            border: '1px solid rgba(102, 252, 241, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '500px',
            margin: '1.5rem auto',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: 'var(--accent-color)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>📂</span> Βρέθηκαν Ενεργά Παιχνίδια
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
              Έχετε ενεργά παιχνίδια σε εξέλιξη με αυτό το όνομα. Επιλέξτε ένα για να συνεχίσετε:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeSaves.map(save => (
                <div key={save.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  textAlign: 'left'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
                      {save.role} <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', marginLeft: '0.5rem' }}>({save.difficulty})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Σεζόν {save.season} • Γύρος {save.turns} • €{save.cash.toLocaleString('el-GR')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Θέλεις να φορτώσεις το παιχνίδι σου (Σεζόν ${save.season}, Γύρος ${save.turns});`)) {
                        checkAndLoadState(save.saveData.gameState, save.saveData.sceneData, save.saveData.nickname);
                        showToast("🎮 Το παιχνίδι φορτώθηκε με επιτυχία!", "✅");
                      }
                    }}
                    className="btn-primary"
                    style={{
                      width: 'auto',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Φόρτωση 💾
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
  };

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

  const renderRoleSelection = () => {
    const userNickname = nickname || '';
    const leaderboard = (() => {
      try {
        return JSON.parse(localStorage.getItem('hotel_madness_leaderboard')) || [];
      } catch {
        return [];
      }
    })();
    const activeSaves = leaderboard.filter(entry =>
      entry.nickname &&
      entry.nickname.trim().toLowerCase() === userNickname.trim().toLowerCase() &&
      entry.status === 'Εργάζεται' &&
      entry.saveData
    );

    return (
      <div className="role-selection">
        <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>Επίλεξε τον Ρόλο σου, <span style={{ color: '#fff' }}>{nickname}</span></h2>
        <p style={{ color: 'var(--text-secondary)' }}>Μπείτε στον γεμάτο προκλήσεις κόσμο της Ελληνικής Ξενοδοχειακής Βιομηχανίας.</p>

        {activeSaves.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(102, 252, 241, 0.03)',
            border: '1px solid rgba(102, 252, 241, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '600px',
            margin: '1.5rem auto',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: 'var(--accent-color)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>📂</span> Βρέθηκαν Ενεργά Παιχνίδια
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
              Έχετε ενεργά παιχνίδια σε εξέλιξη. Επιλέξτε ένα για να συνεχίσετε την καριέρα σας:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeSaves.map(save => (
                <div key={save.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  textAlign: 'left'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                      {save.role} <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginLeft: '0.5rem' }}>({save.difficulty})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Σεζόν {save.season} • Γύρος {save.turns} • Ταμείο: €{save.cash.toLocaleString('el-GR')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Θέλεις να φορτώσεις το παιχνίδι σου (Σεζόν ${save.season}, Γύρος ${save.turns});`)) {
                        checkAndLoadState(save.saveData.gameState, save.saveData.sceneData, save.saveData.nickname);
                        showToast("🎮 Το παιχνίδι φορτώθηκε με επιτυχία!", "✅");
                      }
                    }}
                    className="btn-primary"
                    style={{
                      width: 'auto',
                      padding: '0.4rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Φόρτωση 💾
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed API Key Panel to avoid user confusion */}
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(255, 75, 75, 0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '8px', maxWidth: '600px', margin: '1rem auto', color: 'var(--danger-color)' }}>
            <ShieldAlert style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            {errorMsg}
          </div>
        )}

        <div className="role-cards" style={{ opacity: isKeyConfigured ? 1 : 0.5, pointerEvents: isKeyConfigured ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
          <div className="role-card" onClick={() => startGame('F.O AGENT')}>
            <Hotel className="role-icon" color="var(--accent-color)" />
            <div className="role-title">F.O AGENT</div>
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
      </div>
    );
  };

  const renderGameOver = () => {
    const isSeasonEnd = new Date(gameState.currentDate) >= new Date('2026-11-01');
    const isResigned = gameState.resigned;
    const isUltimateVictory = gameState.ultimateVictory;
    const successRate = calculateSuccessRate(gameState);

    let evalObj = getEvaluationGrade(successRate, gameState);
    if (isUltimateVictory) {
      evalObj = {
        grade: 'S++',
        label: 'Ultimate Legend 👑',
        desc: 'Ολοκλήρωσες το παιχνίδι θριαμβευτικά φτάνοντας στον κορυφαίο τίτλο!'
      };
    }

    return (
      <div className="game-over-screen">
        <div className="game-over-title" style={isUltimateVictory ? { color: '#ffd700', textShadow: '0 0 25px rgba(255, 215, 0, 0.8)' } : isSeasonEnd && !isResigned ? { color: '#4bff4b', textShadow: '0 0 25px rgba(75, 255, 75, 0.6)' } : {}}>
          {isUltimateVictory ? "ΘΡΙΑΜΒΟΣ! ΟΛΟΚΛΗΡΩΣΗ ΠΑΙΧΝΙΔΙΟΥ" :
            isSeasonEnd && !isResigned ? "ΤΕΛΟΣ ΣΕΖΟΝ!" :
              isResigned ? "ΠΑΡΑΙΤΗΣΗ! GAME OVER" :
                gameState.stress >= 100 ? "BURNOUT! GAME OVER" :
                  gameState.reputation <= 0 ? "ΑΠΟΛΥΘΗΚΕΣ! GAME OVER" :
                    gameState.alcoholWarnings >= 3 ? "ΠΕΙΘΑΡΧΙΚΗ ΑΠΟΛΥΣΗ! GAME OVER" :
                      "GAME OVER"}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', lineHeight: '1.6' }}>
          {isUltimateVictory
            ? (gameState.role === 'General Manager' || gameState.role === 'Operations Manager'
              ? "Συγχαρητήρια! Ξεκίνησες ως απλός F.O AGENT και κατάφερες το αδιανόητο: Έγινες ο νέος General Manager της Faplantica! Ο Μουστάκας αποσύρθηκε νικημένος από το άγχος του, και πλέον εσύ κάνεις κουμάντο σε όλο το ξενοδοχείο. Η αυτοκρατορία σου ανήκει! 👑🏨"
              : gameState.role === 'Executive Chef'
                ? "Συγχαρητήρια! Από τις λάντζες και τις φωνές ως Γ Μάγειρας, πλέον είσαι ο Executive Chef της Faplantica! Ο Σάββας εκδιώχθηκε κακήν κακώς μετά τις τοξικές του παρασπονδίες, και πλέον εσύ ορίζεις το μενού, το προσωπικό και την κουζίνα. Η γαστρονομική δόξα είναι δική σου! 🍳👑"
                : "Συγχαρητήρια! Ξεκίνησες ως βοηθός σερβιτόρου και έφτασες στην κορυφή. Στη 4η σεζόν αποκαλύφθηκαν όλες οι δολοπλοκίες και οι λαμογιές του Καρδάρη, ο οποίος απολύθηκε με συνοπτικές διαδικασίες από τον Τάρναβα. Πήρες πανηγυρικά τη θέση του ως F&B Manager και το παιχνίδι ολοκληρώθηκε θριαμβευτικά! 🍽️👑")
            : isResigned
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


        {/* Animated Character Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{
            fontSize: '5rem',
            lineHeight: 1,
            animation: isUltimateVictory ? 'pulse 1.2s ease-in-out infinite' : isSeasonEnd && !isResigned ? 'pulse 1.5s ease-in-out infinite' : gameState.stress >= 100 ? 'shake 0.5s ease-in-out infinite' : 'none',
            display: 'inline-block',
            filter: isUltimateVictory ? 'drop-shadow(0 0 15px rgba(255,215,0,0.6))' : isSeasonEnd && !isResigned ? 'drop-shadow(0 0 10px rgba(75,255,75,0.5))' : gameState.stress >= 100 ? 'drop-shadow(0 0 10px rgba(255,75,75,0.5))' : 'none'
          }}>
            {isUltimateVictory ? '👑' :
              isSeasonEnd && !isResigned
                ? (successRate >= 80 ? '🥳' : successRate >= 50 ? '😤' : '😮‍💨')
                : isResigned ? '🏃'
                  : gameState.stress >= 100 ? '🤯'
                    : gameState.reputation <= 0 ? '😰'
                      : gameState.alcoholWarnings >= 3 ? '🍷'
                        : successRate >= 70 ? '😎'
                          : '😵'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            {isSeasonEnd && !isResigned
              ? (successRate >= 80 ? 'Επιτυχία! Αξίζεις διακοπές!' : 'Φύγαμε για χειμώνα!')
              : isResigned ? 'Λευτεριά!'
                : gameState.stress >= 100 ? 'Burnout!'
                  : gameState.reputation <= 0 ? 'Εκτός Ελέγχου!'
                    : gameState.alcoholWarnings >= 3 ? 'Disciplinary Action!'
                      : successRate >= 70 ? 'Καλή δουλειά!'
                        : 'Επόμενη φορά!'}
          </div>
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


        {/* Share Button */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              const msg = `🏨 Hotel Madness - Faplantica\n👤 ${nickname || 'Άγνωστος'} (${gameState.role})\n📊 Σεζόν: ${gameState.season} | Γύροι: ${gameState.turnCount} | Χρήματα: €${gameState.cash.toLocaleString('el-GR')}\n⭐ Αξιολόγηση: ${evalObj.grade} - ${evalObj.label}\n✅ Ποσοστό Επιτυχίας: ${successRate}%\n\nΠαίξε κι εσύ 👉 https://hotel-madness.vercel.app`;
              if (navigator.share) {
                navigator.share({ title: 'Hotel Madness - Faplantica', text: msg });
              } else {
                navigator.clipboard.writeText(msg);
                showToast("📋 Το σκορ σου αντιγράφηκε! Επικόλλησέ το σε WhatsApp/Instagram!", "🎉");
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none',
              borderRadius: '30px',
              padding: '0.6rem 2rem',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            📤 Μοιράσου το Σκορ σου!
          </button>
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
      'F.O AGENT': ['Assistant Fom', 'Front Office Manager', 'Operations Manager', 'General Manager'],
      'Βοηθός Σερβιτόρου': ['Σερβιτόρος Α', 'Captain', 'Maitre', 'F&B Manager'],
      'Γ Μάγειρας': ['Β Μάγειρας', 'Α Μάγειρας', 'Sous Chef', 'Executive Chef']
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

    const ultimateRoles = ['Executive Chef', 'General Manager', 'F&B Manager'];
    if (ultimateRoles.includes(nextRole)) {
      const newState = {
        ...gameState,
        season: nextSeason,
        role: nextRole,
        turnCount: 1,
        currentDate: `${nextYear}-04-25`,
        ultimateVictory: true
      };
      setGameState(newState);
      setGameOver(true);
      audioService.playGameOverSound();
      saveScoreToLeaderboard(newState);
      return;
    }

    const newState = {
      ...gameState,
      season: nextSeason,
      role: nextRole,
      turnCount: 1,
      currentDate: `${nextYear}-04-25`,
      stress: 10,
      alcoholWarnings: 0,
      magicEyePurchasedCount: 0,
      grandmaCashPurchasedCount: 0,
      thesfapaSpawnedThisSeason: false,
      thesfapaTargetTurn: null,
      viberMessages: [],
      viberUnreadCount: 0,
      opsManagerSpawnsThisSeason: 0
    };
    setGameState(newState);
    setOpsManagerSpawnsThisSeason(0);
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

    const rawList = isOnlineConnected ? uniqueScores : offlineList;

    // Deduplicate by nickname and role, keeping the highest completed/final score
    const uniqueMap = new Map();
    for (const entry of rawList) {
      // Exclude active/in-progress games from the public high-score leaderboard modal
      if (entry.status === 'Εργάζεται') {
        continue;
      }

      const nicknameKey = (entry.nickname || '').trim().toLowerCase();
      const roleKey = (entry.role || '').trim().toLowerCase();
      const key = `${nicknameKey}_${roleKey}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, entry);
      } else {
        const existing = uniqueMap.get(key);
        const newSeason = entry.season || 1;
        const oldSeason = existing.season || 1;

        let isNewBetter = false;
        if (newSeason > oldSeason) {
          isNewBetter = true;
        } else if (newSeason === oldSeason) {
          const newTurns = entry.turns || 0;
          const oldTurns = existing.turns || 0;
          if (newTurns > oldTurns) {
            isNewBetter = true;
          } else if (newTurns === oldTurns) {
            const newCash = entry.cash || 0;
            const oldCash = existing.cash || 0;
            if (newCash > oldCash) {
              isNewBetter = true;
            }
          }
        }

        if (isNewBetter) {
          uniqueMap.set(key, entry);
        }
      }
    }

    const sortedList = [...uniqueMap.values()];

    // Sort by season (descending), then turns (descending), then cash (descending)
    sortedList.sort((a, b) => {
      if (b.season !== a.season) return b.season - a.season;
      if (b.turns !== a.turns) return b.turns - a.turns;
      return b.cash - a.cash;
    });

    const list = sortedList.slice(0, 10);
    const isOnline = isOnlineConnected;

    return (
      <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowLeaderboard(false)}>
        <div style={{ background: '#0b0c10', border: '1px solid #66fcf1', borderRadius: '16px', padding: '2rem', maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Trophy color="var(--warning-color)" /> Hall of Fame - Top 10 Κατάταξη
              {isLeaderboardLoading ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', background: 'rgba(102, 252, 241, 0.1)', border: '1px solid var(--accent-color)', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', fontWeight: 600 }}>ΑΝΑΝΕΩΣΗ... ⏳</span>
              ) : isOnline ? (
                <span style={{ fontSize: '0.8rem', color: '#4bff4b', background: 'rgba(75, 255, 75, 0.1)', border: '1px solid #4bff4b', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', fontWeight: 600 }}>ONLINE 🌐</span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--warning-color)', background: 'rgba(255, 170, 0, 0.1)', border: '1px solid var(--warning-color)', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', fontWeight: 600 }}>LOCAL 📂</span>
              )}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={fetchOnlineLeaderboard}
                disabled={isLeaderboardLoading}
                style={{
                  background: 'var(--accent-color)',
                  border: 'none',
                  color: '#000',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: isLeaderboardLoading ? 'not-allowed' : 'pointer',
                  opacity: isLeaderboardLoading ? 0.6 : 1
                }}
              >
                Ανανέωση
              </button>
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
          </div>

          <div style={{ paddingRight: '0.5rem', overflowX: 'auto' }}>
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

          {/* Viber Button */}
          {gameStarted && !gameOver && (
            <button
              onClick={() => {
                setShowViber(true);
                setGameState(prev => ({ ...prev, viberUnreadCount: 0 }));
              }}
              style={{
                backgroundColor: 'rgba(115, 96, 242, 0.15)',
                border: '1px solid #7360f2',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#b39dff',
                boxShadow: '0 0 10px rgba(115, 96, 242, 0.2)',
                transition: 'all 0.2s',
                gap: '0.4rem',
                fontWeight: 600,
                position: 'relative'
              }}
              title="Viber"
            >
              <span>💬</span>
              <span>Viber</span>
              {(gameState.viberUnreadCount || 0) > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  backgroundColor: '#ff4b4b', color: 'white',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '0.7rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 'bold'
                }}>{gameState.viberUnreadCount}</span>
              )}
            </button>
          )}

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
            <Dashboard state={gameState} nickname={nickname} onUseItem={useInventoryItem} />
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
                      setOpsManagerSpawnsThisSeason(0);
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
                    <input type="text" value={fakeScore.nickname} onChange={e => setFakeScore({ ...fakeScore, nickname: e.target.value })} placeholder="Όνομα" style={{ width: '120px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #45a29e', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
                    <input type="number" value={fakeScore.cash} onChange={e => setFakeScore({ ...fakeScore, cash: parseInt(e.target.value) })} placeholder="Χρήματα" style={{ width: '100px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #45a29e', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
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

                <button
                  style={{
                    marginTop: '0.5rem',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.5rem',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                    transition: 'all 0.2s',
                    width: '100%',
                    textTransform: 'uppercase'
                  }}
                  onClick={() => {
                    setShowAdminPanel(false);
                    setShowDishwasher(true);
                  }}
                >
                  🧼 ΠΑΙΞΕ ΤΗ ΛΑΝΤΖΑ (TEST)
                </button>

                <button
                  style={{
                    marginTop: '0.5rem',
                    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                    border: 'none', borderRadius: '8px',
                    padding: '0.6rem 1.5rem', color: '#000',
                    fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(251,191,36,0.3)',
                    transition: 'all 0.2s', width: '100%',
                    textTransform: 'uppercase'
                  }}
                  onClick={() => { setShowAdminPanel(false); setShowFrappe(true); }}
                >
                  ☕ ΠΑΙΞΕ ΤΗ ΜΑΧΗ ΤΟΥ ΦΡΑΠΕ (TEST)
                </button>

                <button
                  style={{
                    marginTop: '0.5rem',
                    background: 'linear-gradient(135deg, #34d399, #059669)',
                    border: 'none', borderRadius: '8px',
                    padding: '0.6rem 1.5rem', color: '#fff',
                    fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(52,211,153,0.3)',
                    transition: 'all 0.2s', width: '100%',
                    textTransform: 'uppercase'
                  }}
                  onClick={() => { setShowAdminPanel(false); setShowRoomCleaning(true); }}
                >
                  🧹 ΠΑΙΞΕ ΚΑΘΑΡΙΣΜΟ ΔΩΜΑΤΙΟΥ (TEST)
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
      {showDishwasher && (
        <DishwasherModal
          isOpen={showDishwasher}
          onClose={() => setShowDishwasher(false)}
          onComplete={handleDishwasherComplete}
        />
      )}
      {showFrappe && (
        <FrappeModal
          isOpen={showFrappe}
          onClose={() => setShowFrappe(false)}
          onComplete={(res) => { setShowFrappe(false); handleFrappeComplete(res); }}
        />
      )}
      {showRoomCleaning && (
        <RoomCleaningModal
          isOpen={showRoomCleaning}
          onClose={() => setShowRoomCleaning(false)}
          onComplete={(res) => { setShowRoomCleaning(false); handleRoomCleaningComplete(res); }}
        />
      )}
      {renderLeaderboardModal()}
      {showViber && (
        <ViberModal
          messages={gameState.viberMessages || []}
          onClose={() => setShowViber(false)}
          onAcceptItem={(index) => {
            const currentMsgs = gameState.viberMessages || [];
            const msg = currentMsgs[index];
            if (!msg || !msg.item || msg.accepted) return;
            const updated = currentMsgs.map((m, i) => i === index ? { ...m, accepted: true } : m);
            setGameState(prev => ({
              ...prev,
              viberMessages: updated,
              inventory: [...(prev.inventory || []), msg.item]
            }));
            showToast(`🎁 Παρέλαβες: ${msg.item}!`, '✅');
          }}
        />
      )}
    </div>
  );
}

export default App;
