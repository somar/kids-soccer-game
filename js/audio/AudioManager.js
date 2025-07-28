// AudioManager class - Handles all game audio using Web Audio API
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.volume = 0.3; // Kid-friendly volume (30%)
        this.muted = false;
        this.sounds = {};
        this.ambientSound = null;
        
        this.initAudioContext();
    }
    
    async initAudioContext() {
        try {
            // Try to create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.log('Web Audio API not supported, audio will be disabled');
        }
    }
    
    async ensureAudioContext() {
        if (!this.audioContext) return false;
        
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.log('Could not resume audio context');
                return false;
            }
        }
        return true;
    }
    
    createOscillator(frequency, type = 'sine') {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        return oscillator;
    }
    
    createGain(initialValue = 1) {
        if (!this.audioContext) return null;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = initialValue;
        return gain;
    }
    
    async playGoalCelebration() {
        if (!await this.ensureAudioContext() || this.muted) return;
        
        const now = this.audioContext.currentTime;
        const duration = 1.5;
        
        // Create celebratory chord progression (C-F-G-C major)
        const chords = [
            [261.63, 329.63, 392.00], // C major
            [174.61, 220.00, 261.63], // F major  
            [196.00, 246.94, 293.66], // G major
            [261.63, 329.63, 392.00]  // C major
        ];
        
        chords.forEach((chord, chordIndex) => {
            chord.forEach((frequency, noteIndex) => {
                const oscillator = this.createOscillator(frequency, 'triangle');
                const gain = this.createGain(0);
                
                if (!oscillator || !gain) return;
                
                oscillator.connect(gain);
                gain.connect(this.masterGain);
                
                const startTime = now + chordIndex * 0.3;
                const endTime = startTime + 0.25;
                
                // Envelope for smooth sound
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
                gain.gain.linearRampToValueAtTime(0, endTime);
                
                oscillator.start(startTime);
                oscillator.stop(endTime);
            });
        });
    }
    
    async playKickSound(pitchVariation = 1.0) {
        if (!await this.ensureAudioContext() || this.muted) return;
        
        const now = this.audioContext.currentTime;
        const duration = 0.15;
        
        // Layered kick sound (low thump + mid pop + high snap)
        const frequencies = [80, 200, 800];
        const types = ['triangle', 'square', 'sine'];
        const volumes = [0.15, 0.1, 0.05];
        
        frequencies.forEach((baseFreq, index) => {
            const oscillator = this.createOscillator(baseFreq * pitchVariation, types[index]);
            const gain = this.createGain(0);
            
            if (!oscillator || !gain) return;
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            
            // Sharp attack, quick decay
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volumes[index], now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        });
    }
    
    async playCountdownBeep(isGo = false) {
        if (!await this.ensureAudioContext() || this.muted) return;
        
        const now = this.audioContext.currentTime;
        const duration = 0.2;
        
        // Different frequencies for countdown vs "GO!"
        const frequency = isGo ? 660 : 440; // E5 for GO, A4 for countdown
        const oscillator = this.createOscillator(frequency, 'sine');
        const gain = this.createGain(0);
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        // Gentle beep envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    async playUIClick() {
        if (!await this.ensureAudioContext() || this.muted) return;
        
        const now = this.audioContext.currentTime;
        const duration = 0.1;
        
        const oscillator = this.createOscillator(800, 'triangle');
        const gain = this.createGain(0);
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    async playPowerUpSound() {
        if (!await this.ensureAudioContext() || this.muted) return;
        
        const now = this.audioContext.currentTime;
        
        // Rising pitch for power-up collection
        const oscillator = this.createOscillator(440, 'square');
        const gain = this.createGain(0);
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        // Rising frequency sweep
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.linearRampToValueAtTime(880, now + 0.3);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }
    
    async startAmbientCrowd() {
        if (!await this.ensureAudioContext() || this.muted || this.ambientSound) return;
        
        // Create subtle crowd ambience using multiple oscillators
        const frequencies = [100, 150, 200, 250];
        const gains = [];
        const oscillators = [];
        
        frequencies.forEach(freq => {
            const oscillator = this.createOscillator(freq, 'sawtooth');
            const gain = this.createGain(0.008); // Very subtle
            
            if (!oscillator || !gain) return;
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            oscillator.start();
            
            oscillators.push(oscillator);
            gains.push(gain);
            
            // Add slight frequency modulation for realism
            setInterval(() => {
                if (oscillator.frequency) {
                    oscillator.frequency.value = freq + (Math.random() - 0.5) * 10;
                }
            }, 1000 + Math.random() * 2000);
        });
        
        this.ambientSound = { oscillators, gains };
    }
    
    stopAmbientCrowd() {
        if (this.ambientSound) {
            this.ambientSound.oscillators.forEach(osc => {
                try { osc.stop(); } catch (e) {}
            });
            this.ambientSound = null;
        }
    }
    
    setVolume(newVolume) {
        this.volume = Math.max(0, Math.min(1, newVolume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        console.log(`Volume: ${Math.round(this.volume * 100)}%`);
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        console.log(`Audio: ${this.muted ? 'Muted' : 'Unmuted'}`);
        
        if (this.muted) {
            this.stopAmbientCrowd();
        } else {
            this.startAmbientCrowd();
        }
    }
    
    getVolumePercentage() {
        return Math.round(this.volume * 100);
    }
}