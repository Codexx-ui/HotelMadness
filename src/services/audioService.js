// src/services/audioService.js

let audioCtx = null;
let masterGain = null;
let oscillators = [];
let isPlaying = false;
let isMuted = false;
let chordInterval = null;
let currentPlaylist = localStorage.getItem('game_music_playlist') || 'faplantica';

export const PLAYLISTS = {
  faplantica: {
    name: 'Faplantica Ambient (Original) 🏝️',
    oscType: 'triangle',
    droneFreq: 55,
    chordInterval: 4000,
    chords: [
      [110, 130.81, 164.81], // Am
      [87.31, 130.81, 174.61], // F
      [130.81, 164.81, 196.00], // C
      [82.41, 123.47, 164.81]  // E
    ]
  },
  synthwave: {
    name: 'Retro Greek Synthwave 80s 🕶️',
    oscType: 'sawtooth',
    droneFreq: 41.20, // Low E1
    chordInterval: 2500, // Faster, energetic synthwave
    chords: [
      [110, 130.81, 196.00], // Am7
      [98.00, 116.54, 174.61], // Gm7
      [87.31, 103.83, 155.56], // Fm7
      [82.41, 98.00, 146.83]    // Em7
    ]
  },
  lounge: {
    name: 'Elevator Lounge Jazz 🍸',
    oscType: 'sine',
    droneFreq: 65.41, // C2
    chordInterval: 5000, // Very slow and soothing
    chords: [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [146.83, 174.61, 220.00, 261.63], // Dmin7
      [98.00, 123.47, 146.83, 196.00],   // G7
      [110, 130.81, 164.81, 196.00]      // Amin7
    ]
  },
  panic: {
    name: 'August Rush (Panic Beat) 🥵',
    oscType: 'square',
    droneFreq: 58.27, // A#1
    chordInterval: 1200, // Intense, fast, high-stress
    chords: [
      [110, 116.54, 123.47], // Tense dissonant cluster
      [116.54, 123.47, 130.81],
      [123.47, 130.81, 138.59],
      [130.81, 138.59, 146.83]
    ]
  },
  reggae: {
    name: 'Chill Aegon Reggae 🍹',
    oscType: 'triangle',
    droneFreq: 65.41, // C2
    chordInterval: 3000, // Laid-back reggae beat
    chords: [
      [130.81, 164.81, 196.00], // C
      [98.00, 123.47, 146.83],   // G
      [110, 130.81, 164.81],     // Am
      [87.31, 110, 130.81]       // F
    ]
  }
};

export const audioService = {
  init() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Soft master gain
    masterGain.connect(audioCtx.destination);
  },

  start() {
    this.init();
    if (!audioCtx || isPlaying) return;
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    isPlaying = true;
    oscillators = [];
    
    const playlist = PLAYLISTS[currentPlaylist] || PLAYLISTS.faplantica;
    
    // Create soft ambient drone
    const droneOsc = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    
    droneOsc.type = playlist.oscType === 'sine' ? 'sine' : 'sawtooth';
    droneOsc.frequency.setValueAtTime(playlist.droneFreq, audioCtx.currentTime);
    
    // Lowpass filter to make it soft and warm
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(playlist.oscType === 'sawtooth' ? 100 : 180, audioCtx.currentTime);
    
    droneGain.gain.setValueAtTime(playlist.oscType === 'square' ? 0.08 : 0.25, audioCtx.currentTime);
    
    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(masterGain);
    
    droneOsc.start();
    oscillators.push(droneOsc);
    
    // Pulse/Arpeggio Chord loop
    let currentChordIndex = 0;
    const playChordStep = () => {
      const activePlaylist = PLAYLISTS[currentPlaylist] || PLAYLISTS.faplantica;
      const chord = activePlaylist.chords[currentChordIndex];
      const now = audioCtx.currentTime;
      const duration = activePlaylist.chordInterval / 1000;
      
      chord.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = activePlaylist.oscType;
        const multiplier = activePlaylist.oscType === 'sine' ? 2 : 2;
        osc.frequency.setValueAtTime(freq * multiplier, now);
        
        // Attack-decay envelope for pulsing synth pad
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(activePlaylist.oscType === 'square' ? 0.06 : 0.2, now + (duration * 0.3));
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.start();
        osc.stop(now + duration);
      });
      
      currentChordIndex = (currentChordIndex + 1) % activePlaylist.chords.length;
    };
    
    playChordStep();
    chordInterval = setInterval(playChordStep, playlist.chordInterval);
  },

  stop() {
    if (chordInterval) {
      clearInterval(chordInterval);
      chordInterval = null;
    }
    
    oscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    oscillators = [];
    isPlaying = false;
  },

  toggleMute() {
    isMuted = !isMuted;
    if (masterGain) {
      const targetVolume = isMuted ? 0 : 0.04;
      masterGain.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + 0.5);
    }
    return isMuted;
  },

  setVolume(vol) {
    if (masterGain) {
      const targetVal = isMuted ? 0 : (vol * 0.08);
      masterGain.gain.linearRampToValueAtTime(targetVal, audioCtx.currentTime + 0.1);
    }
  },

  setPlaylist(playlistId) {
    if (!PLAYLISTS[playlistId]) return;
    currentPlaylist = playlistId;
    localStorage.setItem('game_music_playlist', playlistId);
    
    if (isPlaying) {
      this.stop();
      this.start();
    }
  },

  getPlaylist() {
    return currentPlaylist;
  },

  isMuted() {
    return isMuted;
  },

  playSlapSound() {
    this.init();
    if (isMuted || !audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 0.15);
  },

  playCashSound() {
    this.init();
    if (isMuted || !audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.08);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  },

  playGameOverSound() {
    this.init();
    if (isMuted || !audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    
    const notes = [
      { freq: 392.00, time: 0 },    // G4
      { freq: 349.23, time: 0.15 }, // F4
      { freq: 311.13, time: 0.30 }, // Eb4
      { freq: 261.63, time: 0.45 }  // C4
    ];
    
    notes.forEach(note => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);
      
      gainNode.gain.setValueAtTime(0.15, now + note.time);
      gainNode.gain.linearRampToValueAtTime(0, now + note.time + 0.35);
      
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      
      osc.start(now + note.time);
      osc.stop(now + note.time + 0.35);
    });
  },
  
  playNotificationSound() {
    this.init();
    if (isMuted || !audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.08);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.08);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  }
};
