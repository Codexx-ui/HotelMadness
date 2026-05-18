// src/services/audioService.js

let audioCtx = null;
let masterGain = null;
let oscillators = [];
let isPlaying = false;
let isMuted = false;
let chordInterval = null;

const CHORDS = [
  [110, 130.81, 164.81], // Am (A2, C3, E3)
  [87.31, 130.81, 174.61], // F (F2, C3, F3)
  [130.81, 164.81, 196.00], // C (C3, E3, G3)
  [82.41, 123.47, 164.81]  // E (E2, B2, E3)
];

export const audioService = {
  init() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Soft ambient volume
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
    
    // Create soft ambient drone
    const droneOsc = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A1 drone
    
    // Lowpass filter to make it soft and warm
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, audioCtx.currentTime);
    
    droneGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    
    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(masterGain);
    
    droneOsc.start();
    oscillators.push(droneOsc);
    
    // Pulse/Arpeggio Chord loop
    let currentChordIndex = 0;
    const playChordStep = () => {
      const chord = CHORDS[currentChordIndex];
      const now = audioCtx.currentTime;
      
      chord.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * 2, now); // Pitch up by 1 octave for nice warmth
        
        // Attack-decay envelope for pulsing synth pad
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 1.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 4.0);
        
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.start();
        osc.stop(now + 4.0);
      });
      
      currentChordIndex = (currentChordIndex + 1) % CHORDS.length;
    };
    
    playChordStep();
    chordInterval = setInterval(playChordStep, 4000);
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
      // Smooth fade-in/fade-out
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
    
    // First high beep
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
    
    // Second even higher beep
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
  }
};
