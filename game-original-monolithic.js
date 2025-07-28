// Kids Soccer Game - JavaScript Version with Audio Enhancement and Advanced Features

// Power-up System for Enhanced Gameplay
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'speed', 'biggoal', 'magnet'
        this.radius = 15;
        this.collected = false;
        this.animationTime = 0;
        this.floatOffset = 0;
        
        // Power-up properties
        this.types = {
            speed: {
                color: '#FFD700',
                icon: '⚡',
                duration: 600, // 10 seconds at 60fps
                description: 'Super Speed!'
            },
            biggoal: {
                color: '#FF69B4',
                icon: '🥅',
                duration: 900, // 15 seconds at 60fps
                description: 'Big Goals!'
            },
            magnet: {
                color: '#00BFFF',
                icon: '🧲',
                duration: 750, // 12.5 seconds at 60fps
                description: 'Ball Magnet!'
            }
        };
    }
    
    update() {
        this.animationTime++;
        this.floatOffset = Math.sin(this.animationTime * 0.1) * 3;
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        const powerUpData = this.types[this.type];
        
        // Draw glowing effect
        const glowRadius = this.radius + Math.sin(this.animationTime * 0.15) * 3;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        gradient.addColorStop(0, powerUpData.color);
        gradient.addColorStop(0.7, powerUpData.color + '80');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.floatOffset, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw power-up circle
        ctx.fillStyle = powerUpData.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.floatOffset, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.floatOffset, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw icon
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(powerUpData.icon, this.x, this.y + this.floatOffset + 7);
    }
    
    collidesWith(player) {
        if (this.collected) return false;
        const distance = Math.sqrt((this.x - player.x) ** 2 + ((this.y + this.floatOffset) - player.y) ** 2);
        return distance < this.radius + player.radius;
    }
    
    collect() {
        this.collected = true;
        return {
            type: this.type,
            duration: this.types[this.type].duration,
            description: this.types[this.type].description
        };
    }
}

// Particle System for Visual Effects
class Particle {
    constructor(x, y, vx, vy, color, life, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.gravity = 0.1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        
        // Fade out over time
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    
    isAlive() {
        return this.life > 0;
    }
}

// Achievement System
class Achievement {
    constructor(id, name, description, condition, icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.condition = condition;
        this.icon = icon;
        this.unlocked = false;
        this.unlockedTime = null;
    }
    
    check(stats) {
        if (!this.unlocked && this.condition(stats)) {
            this.unlocked = true;
            this.unlockedTime = Date.now();
            return true;
        }
        return false;
    }
}

class AchievementManager {
    constructor() {
        this.achievements = this.createAchievements();
        this.loadProgress();
        this.notifications = [];
    }
    
    createAchievements() {
        return [
            new Achievement(
                'first_goal',
                'First Goal!',
                'Score your very first goal!',
                (stats) => stats.totalGoals >= 1,
                '⚽'
            ),
            new Achievement(
                'hat_trick',
                'Hat Trick Hero!',
                'Score 3 goals in a single game!',
                (stats) => stats.goalsInCurrentGame >= 3,
                '🎩'
            ),
            new Achievement(
                'speedster',
                'Speed Demon!',
                'Use 5 speed power-ups!',
                (stats) => stats.speedPowerUpsUsed >= 5,
                '⚡'
            ),
            new Achievement(
                'goalkeeper',
                'Keeper King!',
                'Prevent 5 AI goals in one game!',
                (stats) => stats.aiGoalsBlocked >= 5,
                '🥅'
            ),
            new Achievement(
                'marathon',
                'Soccer Marathon!',
                'Play for 10 minutes total!',
                (stats) => stats.totalPlayTime >= 600000,
                '🏃'
            ),
            new Achievement(
                'power_collector',
                'Power Collector!',
                'Collect 10 power-ups!',
                (stats) => stats.totalPowerUpsCollected >= 10,
                '💎'
            ),
            new Achievement(
                'goal_machine',
                'Goal Machine!',
                'Score 25 total goals!',
                (stats) => stats.totalGoals >= 25,
                '🏆'
            ),
            new Achievement(
                'perfectionist',
                'Perfect Game!',
                'Win a game 5-0!',
                (stats) => stats.perfectGame,
                '💯'
            )
        ];
    }
    
    checkAchievements(stats) {
        const newUnlocks = [];
        for (let achievement of this.achievements) {
            if (achievement.check(stats)) {
                newUnlocks.push(achievement);
                this.addNotification(achievement);
            }
        }
        
        if (newUnlocks.length > 0) {
            this.saveProgress();
        }
        
        return newUnlocks;
    }
    
    addNotification(achievement) {
        this.notifications.push({
            achievement: achievement,
            displayTime: 300, // 5 seconds at 60fps
            animationTime: 0
        });
    }
    
    updateNotifications() {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            notification.displayTime--;
            notification.animationTime++;
            
            if (notification.displayTime <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }
    
    drawNotifications(ctx, width, height) {
        for (let i = 0; i < this.notifications.length; i++) {
            const notification = this.notifications[i];
            const achievement = notification.achievement;
            const animTime = notification.animationTime;
            const displayTime = notification.displayTime;
            
            // Slide in from right
            let x = width - 20;
            if (animTime < 30) {
                x = width + 300 - (animTime / 30) * 320;
            } else if (displayTime < 30) {
                x = width - 20 + (30 - displayTime) * 10;
            }
            
            const y = 80 + i * 120;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x - 280, y, 280, 80);
            
            // Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 280, y, 280, 80);
            
            // Achievement icon
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(achievement.icon, x - 240, y + 45);
            
            // Achievement text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('ACHIEVEMENT UNLOCKED!', x - 200, y + 20);
            
            ctx.font = 'bold 14px Arial';
            ctx.fillText(achievement.name, x - 200, y + 40);
            
            ctx.font = '12px Arial';
            ctx.fillStyle = '#CCC';
            ctx.fillText(achievement.description, x - 200, y + 60);
        }
    }
    
    saveProgress() {
        const data = {
            achievements: this.achievements.map(a => ({
                id: a.id,
                unlocked: a.unlocked,
                unlockedTime: a.unlockedTime
            }))
        };
        localStorage.setItem('soccerGameAchievements', JSON.stringify(data));
    }
    
    loadProgress() {
        try {
            const data = localStorage.getItem('soccerGameAchievements');
            if (data) {
                const parsed = JSON.parse(data);
                for (let savedAchievement of parsed.achievements) {
                    const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = savedAchievement.unlocked;
                        achievement.unlockedTime = savedAchievement.unlockedTime;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load achievement progress:', error);
        }
    }
    
    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }
    
    getTotalCount() {
        return this.achievements.length;
    }
}

// Audio Manager Class for Kid-Friendly Soccer Game Sounds
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // Kid-friendly volume level
        this.sounds = {};
        this.isEnabled = true;
        
        this.initializeAudio();
        this.createSounds();
    }
    
    initializeAudio() {
        try {
            // Create AudioContext with fallback for older browsers
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Handle browser autoplay policy
            if (this.audioContext.state === 'suspended') {
                const resumeAudio = () => {
                    this.audioContext.resume();
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
            }
        } catch (error) {
            console.warn('Web Audio API not supported, audio disabled:', error);
            this.isEnabled = false;
        }
    }
    
    createSounds() {
        if (!this.isEnabled) return;
        
        // Pre-generate all game sounds
        this.sounds = {
            goalCelebration: this.createGoalCelebrationSound(),
            ballKick: this.createBallKickSound(),
            countdownBeep: this.createCountdownBeepSound(),
            goBeep: this.createGoBeepSound(),
            crowdCheer: this.createCrowdCheerSound(),
            uiClick: this.createUIClickSound(),
            powerUpCollect: this.createPowerUpCollectSound(),
            powerUpActivate: this.createPowerUpActivateSound(),
            achievementUnlock: this.createAchievementUnlockSound()
        };
    }
    
    // Create cheerful goal celebration fanfare (major chord progression)
    createGoalCelebrationSound() {
        const duration = 2.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // Triumphant chord progression: C major -> F major -> G major -> C major
            const chordTimes = [0, 0.5, 1.0, 1.5];
            const chords = [
                [261.63, 329.63, 392.00], // C major (C-E-G)
                [349.23, 440.00, 523.25], // F major (F-A-C)
                [392.00, 493.88, 587.33], // G major (G-B-D)
                [261.63, 329.63, 392.00]  // C major (C-E-G)
            ];
            
            // Determine current chord
            let chordIndex = Math.floor(time * 2);
            if (chordIndex >= chords.length) chordIndex = chords.length - 1;
            
            const chord = chords[chordIndex];
            
            // Add harmonious frequencies with envelope
            for (let freq of chord) {
                const envelope = Math.exp(-time * 1.5) * (1 - time / duration);
                sample += Math.sin(2 * Math.PI * freq * time) * envelope * 0.15;
            }
            
            // Add sparkly overtones for excitement
            sample += Math.sin(2 * Math.PI * 523.25 * time) * Math.exp(-time * 3) * 0.1;
            sample += Math.sin(2 * Math.PI * 659.25 * time) * Math.exp(-time * 4) * 0.08;
            
            data[i] = Math.max(-1, Math.min(1, sample));
        }
        
        return buffer;
    }
    
    // Create satisfying ball kick impact sound
    createBallKickSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Sharp attack with quick decay for impact
            const envelope = Math.exp(-time * 15);
            
            // Low frequency thump (ball impact)
            const thump = Math.sin(2 * Math.PI * 80 * time) * envelope * 0.4;
            
            // Mid frequency pop (satisfying kick sound)
            const pop = Math.sin(2 * Math.PI * 200 * time) * envelope * 0.3;
            
            // High frequency snap (crisp contact)
            const snap = Math.sin(2 * Math.PI * 800 * time) * Math.exp(-time * 25) * 0.2;
            
            // Add subtle noise for texture
            const noise = (Math.random() - 0.5) * envelope * 0.1;
            
            data[i] = Math.max(-1, Math.min(1, thump + pop + snap + noise));
        }
        
        return buffer;
    }
    
    // Create countdown beep (friendly, not alarming)
    createCountdownBeepSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Gentle beep with soft attack and decay
            const envelope = Math.sin(Math.PI * time / duration) * 0.5;
            const beep = Math.sin(2 * Math.PI * 440 * time) * envelope; // A4 note
            
            data[i] = beep;
        }
        
        return buffer;
    }
    
    // Create exciting "GO!" beep (higher pitch, more energetic)
    createGoBeepSound() {
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Rising pitch for excitement
            const pitchMod = 1 + time * 0.5;
            const envelope = Math.sin(Math.PI * time / duration) * 0.6;
            const beep = Math.sin(2 * Math.PI * 660 * pitchMod * time) * envelope; // E5 rising
            
            data[i] = beep;
        }
        
        return buffer;
    }
    
    // Create subtle crowd ambience (layered sine waves at low frequencies)
    createCrowdCheerSound() {
        const duration = 4.0; // Longer for ambient sound
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // Multiple frequency layers for crowd murmur
            const frequencies = [80, 120, 160, 200, 240];
            
            for (let freq of frequencies) {
                // Slow modulation to simulate crowd movement
                const modulation = 1 + Math.sin(2 * Math.PI * 0.3 * time) * 0.1;
                const envelope = 0.1 + Math.sin(2 * Math.PI * 0.1 * time) * 0.05;
                sample += Math.sin(2 * Math.PI * freq * modulation * time) * envelope * 0.1;
            }
            
            // Add very subtle noise for realism
            sample += (Math.random() - 0.5) * 0.02;
            
            data[i] = Math.max(-1, Math.min(1, sample));
        }
        
        return buffer;
    }
    
    // Create gentle UI feedback sound
    createUIClickSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Soft click sound
            const envelope = Math.exp(-time * 30);
            const click = Math.sin(2 * Math.PI * 800 * time) * envelope * 0.3;
            
            data[i] = click;
        }
        
        return buffer;
    }
    
    // Create magical power-up collection sound
    createPowerUpCollectSound() {
        const duration = 0.6;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Rising magical tone
            const frequency = 440 + time * 440; // A4 to A5
            const envelope = Math.exp(-time * 2) * Math.sin(Math.PI * time / duration);
            
            // Main tone
            let sample = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.4;
            
            // Add sparkly harmonics
            sample += Math.sin(2 * Math.PI * frequency * 2 * time) * envelope * 0.2;
            sample += Math.sin(2 * Math.PI * frequency * 3 * time) * envelope * 0.1;
            
            // Add some shimmer
            sample += Math.sin(2 * Math.PI * (frequency + 50) * time) * envelope * 0.15;
            
            data[i] = Math.max(-1, Math.min(1, sample));
        }
        
        return buffer;
    }
    
    // Create power-up activation sound
    createPowerUpActivateSound() {
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Power surge sound
            const envelope = Math.sin(Math.PI * time / duration) * 0.6;
            
            // Base frequency sweep
            const frequency = 200 + Math.sin(time * 8) * 100;
            let sample = Math.sin(2 * Math.PI * frequency * time) * envelope;
            
            // Add energy burst
            const burstFreq = 800 + time * 400;
            sample += Math.sin(2 * Math.PI * burstFreq * time) * envelope * 0.3;
            
            data[i] = Math.max(-1, Math.min(1, sample));
        }
        
        return buffer;
    }
    
    // Create achievement unlock fanfare
    createAchievementUnlockSound() {
        const duration = 1.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            
            // Triumphant fanfare progression
            const progression = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
            const noteLength = duration / progression.length;
            const noteIndex = Math.floor(time / noteLength);
            const noteTime = (time % noteLength) / noteLength;
            
            if (noteIndex < progression.length) {
                const frequency = progression[noteIndex];
                const envelope = Math.sin(Math.PI * noteTime) * Math.exp(-noteTime * 2);
                
                let sample = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.4;
                
                // Add harmonics for richness
                sample += Math.sin(2 * Math.PI * frequency * 2 * time) * envelope * 0.2;
                sample += Math.sin(2 * Math.PI * frequency * 0.5 * time) * envelope * 0.3;
                
                data[i] = Math.max(-1, Math.min(1, sample));
            }
        }
        
        return buffer;
    }
    
    // Play a specific sound with optional pitch and volume modulation
    playSound(soundName, pitch = 1.0, volume = 1.0) {
        if (!this.isEnabled || !this.sounds[soundName]) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            source.playbackRate.value = pitch;
            
            gainNode.gain.value = volume * this.masterVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start();
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }
    
    // Start ambient crowd sound (looped)
    startCrowdAmbience() {
        if (!this.isEnabled) return;
        
        this.stopCrowdAmbience(); // Stop any existing ambience
        
        try {
            this.crowdSource = this.audioContext.createBufferSource();
            this.crowdGain = this.audioContext.createGain();
            
            this.crowdSource.buffer = this.sounds.crowdCheer;
            this.crowdSource.loop = true;
            this.crowdGain.gain.value = 0.4 * this.masterVolume;
            
            this.crowdSource.connect(this.crowdGain);
            this.crowdGain.connect(this.masterGain);
            
            this.crowdSource.start();
        } catch (error) {
            console.warn('Error starting crowd ambience:', error);
        }
    }
    
    // Stop ambient crowd sound
    stopCrowdAmbience() {
        if (this.crowdSource) {
            try {
                this.crowdSource.stop();
            } catch (error) {
                // Source might already be stopped
            }
            this.crowdSource = null;
        }
    }
    
    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    // Toggle audio on/off
    toggleAudio() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            this.stopCrowdAmbience();
        }
        return this.isEnabled;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        
        // Initialize Audio Manager
        this.audioManager = new AudioManager();
        
        // AI Performance Tracking for Adaptive Difficulty
        this.aiPerformanceTracker = new AIPerformanceTracker();
        
        // Initialize Achievement System
        this.achievementManager = new AchievementManager();
        
        // Game objects
        this.player = new Player(this.width / 2, this.height / 2);
        this.aiPlayer = new EnhancedAIPlayer(this.width / 2, this.height / 2 - 100, this.aiPerformanceTracker);
        this.ball = new Ball(this.width / 2, this.height / 2 + 50);
        this.field = new Field(this.width, this.height);
        
        // Power-up system
        this.powerUps = [];
        this.powerUpSpawnTimer = 0;
        this.activePowerUps = {}; // Currently active power-ups on player
        
        // Particle system
        this.particles = [];
        
        // Scoring system
        this.leftScore = 0;
        this.rightScore = 0;
        this.goalCelebrationTimer = 0;
        this.lastGoalScorer = null;
        this.countdownTimer = 180; // 3 seconds at 60fps
        this.gameState = 'countdown'; // 'countdown', 'playing', 'goal_celebration'
        this.lastCountdownSecond = -1; // Track countdown for audio
        
        // Game session tracking
        this.gameStartTime = Date.now();
        this.sessionStartTime = Date.now();
        this.totalGoalsScored = 0;
        this.playerGoals = 0;
        this.aiGoals = 0;
        this.goalsInCurrentGame = 0;
        this.consecutiveGoals = 0;
        this.maxConsecutiveGoals = 0;
        
        // Achievement tracking stats
        this.stats = {
            totalGoals: this.loadStat('totalGoals', 0),
            goalsInCurrentGame: 0,
            speedPowerUpsUsed: this.loadStat('speedPowerUpsUsed', 0),
            aiGoalsBlocked: 0,
            totalPlayTime: this.loadStat('totalPlayTime', 0),
            totalPowerUpsCollected: this.loadStat('totalPowerUpsCollected', 0),
            perfectGame: false
        };
        
        // Goal dimensions (matching Field class)
        this.goalWidth = 30;
        this.goalHeight = 150; 
        this.goalY = (this.height - this.goalHeight) / 2;
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Start ambient crowd sound
        this.audioManager.startCrowdAmbience();
        
        // Start game loop
        this.gameLoop();
    }
    
    // Helper methods for persistent stats
    loadStat(key, defaultValue) {
        try {
            const saved = localStorage.getItem(`soccerGame_${key}`);
            return saved ? parseInt(saved, 10) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }
    
    saveStat(key, value) {
        try {
            localStorage.setItem(`soccerGame_${key}`, value.toString());
        } catch (error) {
            console.warn('Could not save stat:', key, error);
        }
    }
    
    // Power-up management
    spawnPowerUp() {
        if (this.powerUps.length >= 2) return; // Max 2 power-ups on field
        
        const types = ['speed', 'biggoal', 'magnet'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Spawn in safe locations (avoid goals and center)
        let x, y;
        do {
            x = 100 + Math.random() * 600;
            y = 100 + Math.random() * 400;
        } while (
            (x < 150 || x > 650) && // Avoid goal areas
            Math.abs(x - this.width / 2) < 80 && Math.abs(y - this.height / 2) < 80 // Avoid center
        );
        
        this.powerUps.push(new PowerUp(x, y, type));
    }
    
    activatePowerUp(powerUpData) {
        this.activePowerUps[powerUpData.type] = {
            timeLeft: powerUpData.duration,
            description: powerUpData.description
        };
        
        // Apply immediate effects
        if (powerUpData.type === 'speed') {
            this.stats.speedPowerUpsUsed++;
            this.saveStat('speedPowerUpsUsed', this.stats.speedPowerUpsUsed);
        }
        
        this.audioManager.playSound('powerUpActivate');
        
        // Create activation particles
        this.createPowerUpParticles(this.player.x, this.player.y, powerUpData.type);
    }
    
    updatePowerUps() {
        // Update active power-ups
        for (let type in this.activePowerUps) {
            this.activePowerUps[type].timeLeft--;
            if (this.activePowerUps[type].timeLeft <= 0) {
                delete this.activePowerUps[type];
            }
        }
        
        // Update power-up spawn timer
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer >= 1800) { // 30 seconds at 60fps
            this.spawnPowerUp();
            this.powerUpSpawnTimer = Math.random() * 600; // Add randomness
        }
        
        // Update existing power-ups
        for (let powerUp of this.powerUps) {
            powerUp.update();
        }
        
        // Check for power-up collection
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (powerUp.collidesWith(this.player)) {
                const powerUpData = powerUp.collect();
                this.activatePowerUp(powerUpData);
                this.audioManager.playSound('powerUpCollect');
                
                // Update stats
                this.stats.totalPowerUpsCollected++;
                this.saveStat('totalPowerUpsCollected', this.stats.totalPowerUpsCollected);
                
                // Create collection particles
                this.createCollectionParticles(powerUp.x, powerUp.y, powerUp.type);
                
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    // Particle effects
    createCollectionParticles(x, y, type) {
        const colors = {
            speed: '#FFD700',
            biggoal: '#FF69B4', 
            magnet: '#00BFFF'
        };
        
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 2 + Math.random() * 3;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[type],
                30 + Math.random() * 20,
                2 + Math.random() * 2
            ));
        }
    }
    
    createPowerUpParticles(x, y, type) {
        const colors = {
            speed: '#FFD700',
            biggoal: '#FF69B4',
            magnet: '#00BFFF'
        };
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * 4,
                Math.sin(angle) * 4,
                colors[type],
                40,
                3
            ));
        }
    }
    
    createGoalParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 4)],
                60 + Math.random() * 30,
                3 + Math.random() * 2
            ));
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (!particle.isAlive()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle restart
            if (e.code === 'KeyR') {
                this.audioManager.playSound('uiClick');
                this.restart();
            }
            
            // Handle AI difficulty changes
            if (e.code === 'Digit1') {
                this.aiPlayer.setPersonality('easy');
                this.audioManager.playSound('uiClick');
                console.log('AI set to Easy mode');
            }
            if (e.code === 'Digit2') {
                this.aiPlayer.setPersonality('medium');
                this.audioManager.playSound('uiClick');
                console.log('AI set to Medium mode');
            }
            if (e.code === 'Digit3') {
                this.aiPlayer.setPersonality('hard');
                this.audioManager.playSound('uiClick');
                console.log('AI set to Hard mode');
            }
            if (e.code === 'Digit4') {
                this.aiPlayer.setPersonality('friendly');
                this.audioManager.playSound('uiClick');
                console.log('AI set to Friendly mode');
            }
            if (e.code === 'KeyA') {
                this.aiPlayer.toggleAdaptiveDifficulty();
                this.audioManager.playSound('uiClick');
                console.log('Adaptive difficulty ' + (this.aiPlayer.useAdaptiveDifficulty ? 'enabled' : 'disabled'));
            }
            
            // Handle volume controls
            if (e.code === 'KeyM') {
                const isEnabled = this.audioManager.toggleAudio();
                console.log('Audio ' + (isEnabled ? 'enabled' : 'disabled'));
            }
            
            if (e.code === 'Equal' || e.code === 'NumpadAdd') {
                const currentVolume = this.audioManager.masterVolume;
                this.audioManager.setVolume(currentVolume + 0.1);
                console.log('Volume: ' + Math.round(this.audioManager.masterVolume * 100) + '%');
            }
            
            if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
                const currentVolume = this.audioManager.masterVolume;
                this.audioManager.setVolume(currentVolume - 0.1);
                console.log('Volume: ' + Math.round(this.audioManager.masterVolume * 100) + '%');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    restart() {
        // Reset scores
        this.leftScore = 0;
        this.rightScore = 0;
        this.goalCelebrationTimer = 0;
        this.lastGoalScorer = null;
        this.countdownTimer = 180;
        this.gameState = 'countdown';
        
        // Reset game tracking
        this.gameStartTime = Date.now();
        this.totalGoalsScored = 0;
        this.playerGoals = 0;
        this.aiGoals = 0;
        
        // Reset AI performance tracking
        this.aiPerformanceTracker.reset();
        
        // Reset positions
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.aiPlayer.x = this.width / 2;
        this.aiPlayer.y = this.height / 2 - 100;
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2 + 50;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }
    
    update() {
        // Update session time for achievements
        const currentTime = Date.now();
        this.stats.totalPlayTime = this.loadStat('totalPlayTime', 0) + (currentTime - this.sessionStartTime);
        this.saveStat('totalPlayTime', this.stats.totalPlayTime);
        
        // Update particles and achievements always
        this.updateParticles();
        this.achievementManager.updateNotifications();
        
        // Handle game states
        if (this.gameState === 'countdown') {
            this.countdownTimer--;
            
            // Play countdown beeps
            const currentSecond = Math.ceil(this.countdownTimer / 60);
            if (currentSecond !== this.lastCountdownSecond && currentSecond > 0) {
                this.audioManager.playSound('countdownBeep');
                this.lastCountdownSecond = currentSecond;
            }
            
            if (this.countdownTimer <= 0) {
                this.audioManager.playSound('goBeep', 1.0, 0.8); // Slightly louder GO beep
                this.gameState = 'playing';
            }
            return; // Don't update gameplay during countdown
        }
        
        if (this.gameState === 'goal_celebration') {
            this.goalCelebrationTimer--;
            if (this.goalCelebrationTimer <= 0) {
                this.gameState = 'countdown';
                this.countdownTimer = 180; // 3 second countdown
            }
            return; // Don't update gameplay during celebration
        }
        
        // Normal gameplay
        // Update player with power-up effects
        this.updatePlayerWithPowerUps();
        this.aiPlayer.update(this.ball, this.player, this);
        this.updateBallWithPowerUps();
        
        // Update systems
        this.updatePowerUps();
        
        // Update AI performance tracking
        this.aiPerformanceTracker.update(this.ball, this.player, this.aiPlayer);
        
        // Check player-ball collision
        if (this.player.collidesWith(this.ball)) {
            this.ball.kick(this.player.getKickDirection());
            // Play kick sound with slight pitch variation for variety
            const pitchVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
            this.audioManager.playSound('ballKick', pitchVariation, 0.8);
        }
        
        // Check AI player-ball collision
        if (this.aiPlayer.collidesWith(this.ball)) {
            this.ball.kick(this.aiPlayer.getKickDirection());
            // Play kick sound with lower pitch for AI (different character)
            const aiPitchVariation = 0.8 + Math.random() * 0.15; // 0.8 to 0.95
            this.audioManager.playSound('ballKick', aiPitchVariation, 0.7);
        }
        
        // Check for goals
        this.checkGoals();
        
        // Check achievements
        this.checkAchievements();
    }
    
    updatePlayerWithPowerUps() {
        // Apply speed boost
        const speedMultiplier = this.activePowerUps.speed ? 1.8 : 1.0;
        this.player.updateWithSpeed(this.keys, speedMultiplier);
    }
    
    updateBallWithPowerUps() {
        // Apply ball magnetism
        if (this.activePowerUps.magnet) {
            const magnetDistance = 80;
            const ballDistance = Math.sqrt((this.player.x - this.ball.x) ** 2 + (this.player.y - this.ball.y) ** 2);
            
            if (ballDistance < magnetDistance && ballDistance > this.player.radius + this.ball.radius) {
                const magnetForce = 0.3;
                const dirX = this.player.x - this.ball.x;
                const dirY = this.player.y - this.ball.y;
                const length = Math.sqrt(dirX ** 2 + dirY ** 2);
                
                if (length > 0) {
                    this.ball.vx += (dirX / length) * magnetForce;
                    this.ball.vy += (dirY / length) * magnetForce;
                }
            }
        }
        
        this.ball.update();
    }
    
    checkAchievements() {
        // Update stats for achievement checking
        this.stats.goalsInCurrentGame = this.playerGoals;
        
        // Check for perfect game
        if (this.playerGoals >= 5 && this.aiGoals === 0) {
            this.stats.perfectGame = true;
        }
        
        // Check achievements and play sound for new unlocks
        const newAchievements = this.achievementManager.checkAchievements(this.stats);
        if (newAchievements.length > 0) {
            this.audioManager.playSound('achievementUnlock');
        }
    }
    
    checkGoals() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const ballRadius = this.ball.radius;
        
        // Determine goal size based on power-up
        const goalHeight = this.activePowerUps.biggoal ? 220 : 150;
        const goalY = (this.height - goalHeight) / 2;
        
        // Left goal area: x: 20-50, y: goalY to goalY+goalHeight
        if (ballX - ballRadius <= 50 && ballX + ballRadius >= 20 && 
            ballY >= goalY && ballY <= goalY + goalHeight) {
            this.scoreGoal('right'); // Right player scores in left goal
        }
        
        // Right goal area: x: 750-780, y: goalY to goalY+goalHeight  
        if (ballX + ballRadius >= 750 && ballX - ballRadius <= 780 &&
            ballY >= goalY && ballY <= goalY + goalHeight) {
            this.scoreGoal('left'); // Left player scores in right goal
        }
    }
    
    scoreGoal(scorer) {
        // Increment score
        if (scorer === 'left') {
            this.leftScore++;
            this.playerGoals++;
            this.stats.totalGoals++;
            this.saveStat('totalGoals', this.stats.totalGoals);
            this.consecutiveGoals++;
            this.maxConsecutiveGoals = Math.max(this.maxConsecutiveGoals, this.consecutiveGoals);
        } else {
            this.rightScore++;
            this.aiGoals++;
            this.consecutiveGoals = 0; // Reset consecutive goals on AI score
        }
        
        this.totalGoalsScored++;
        
        // Update AI performance tracking
        this.aiPerformanceTracker.onGoalScored(scorer, this.playerGoals, this.aiGoals);
        
        // Create goal celebration particles
        this.createGoalParticles(this.ball.x, this.ball.y);
        
        // Start celebration
        this.goalCelebrationTimer = 120; // 2 seconds at 60fps
        this.lastGoalScorer = scorer;
        this.gameState = 'goal_celebration';
        
        // AI celebration behavior
        if (scorer === 'right') {
            this.aiPlayer.celebrate();
        }
        
        // Play goal celebration sound
        this.audioManager.playSound('goalCelebration', 1.0, 0.9);
        
        // Reset ball to center
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        
        // Reset players to center
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.aiPlayer.x = this.width / 2;
        this.aiPlayer.y = this.height / 2 - 100;
        
        // Reset countdown second tracker
        this.lastCountdownSecond = -1;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#228B22'; // Forest green
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw field with power-up effects
        this.drawFieldWithPowerUps();
        
        // Draw game objects
        this.player.draw(this.ctx);
        this.aiPlayer.draw(this.ctx);
        this.ball.drawWithTrail(this.ctx, this.activePowerUps.speed || this.activePowerUps.magnet);
        
        // Draw power-ups
        for (let powerUp of this.powerUps) {
            powerUp.draw(this.ctx);
        }
        
        // Draw particles
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        // Draw score
        this.drawScore();
        
        // Draw power-up status
        this.drawPowerUpStatus();
        
        // Draw achievement progress
        this.drawAchievementProgress();
        
        // Draw AI difficulty indicator
        this.drawAIDifficultyIndicator();
        
        // Draw controls help
        this.drawControlsHelp();
        
        // Draw achievement notifications
        this.achievementManager.drawNotifications(this.ctx, this.width, this.height);
        
        // Draw game state overlays
        if (this.gameState === 'goal_celebration') {
            this.drawGoalCelebration();
        } else if (this.gameState === 'countdown') {
            this.drawCountdown();
        }
    }
    
    drawFieldWithPowerUps() {
        // Draw larger goals if power-up is active
        if (this.activePowerUps.biggoal) {
            const modifiedField = new Field(this.width, this.height);
            modifiedField.drawWithBigGoals(this.ctx);
        } else {
            this.field.draw(this.ctx);
        }
    }
    
    drawPowerUpStatus() {
        if (Object.keys(this.activePowerUps).length === 0) return;
        
        let yOffset = 0;
        for (let type in this.activePowerUps) {
            const powerUp = this.activePowerUps[type];
            const timeLeft = Math.ceil(powerUp.timeLeft / 60);
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.width - 220, 80 + yOffset, 200, 40);
            
            // Power-up info
            const powerUpData = new PowerUp(0, 0, type).types[type];
            this.ctx.fillStyle = powerUpData.color;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${powerUpData.icon} ${powerUpData.description}`, this.width - 210, 100 + yOffset);
            
            // Timer bar
            const barWidth = 180;
            const barHeight = 6;
            const fillWidth = (powerUp.timeLeft / 600) * barWidth; // Assuming max 600 frames
            
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(this.width - 210, 105 + yOffset, barWidth, barHeight);
            
            this.ctx.fillStyle = powerUpData.color;
            this.ctx.fillRect(this.width - 210, 105 + yOffset, fillWidth, barHeight);
            
            // Time text
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`${timeLeft}s`, this.width - 210, 102 + yOffset);
            
            yOffset += 50;
        }
    }
    
    drawAchievementProgress() {
        const unlockedCount = this.achievementManager.getUnlockedCount();
        const totalCount = this.achievementManager.getTotalCount();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.height - 60, 200, 50);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`🏆 Achievements: ${unlockedCount}/${totalCount}`, 15, this.height - 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`⚽ Total Goals: ${this.stats.totalGoals}`, 15, this.height - 20);
    }
    
    drawScore() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        
        // Draw score in center top
        const scoreText = `${this.leftScore} - ${this.rightScore}`;
        this.ctx.fillText(scoreText, this.width / 2, 50);
        
        // Draw team labels
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#0064FF'; // Blue for player
        this.ctx.textAlign = 'right';
        this.ctx.fillText('PLAYER', this.width / 2 - 40, 50);
        
        this.ctx.fillStyle = '#FF4444'; // Red for opponent (future AI)
        this.ctx.textAlign = 'left'; 
        this.ctx.fillText('OPPONENT', this.width / 2 + 40, 50);
    }
    
    drawGoalCelebration() {
        // Flashing goal text
        if (Math.floor(this.goalCelebrationTimer / 10) % 2 === 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            
            const celebrationText = this.lastGoalScorer === 'left' ? 'PLAYER GOAL!' : 'OPPONENT GOAL!';
            this.ctx.fillText(celebrationText, this.width / 2, this.height / 2 - 50);
        }
        
        // Goal celebration particles (simple circles)
        for (let i = 0; i < 10; i++) {
            const angle = (this.goalCelebrationTimer + i * 36) * Math.PI / 180;
            const radius = 60 + (120 - this.goalCelebrationTimer) * 2;
            const x = this.width / 2 + Math.cos(angle) * radius;
            const y = this.height / 2 + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `hsl(${(this.goalCelebrationTimer + i * 36) % 360}, 100%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawCountdown() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Countdown number
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        
        const secondsLeft = Math.ceil(this.countdownTimer / 60);
        let countdownText = '';
        
        if (secondsLeft > 0) {
            countdownText = secondsLeft.toString();
        } else {
            countdownText = 'GO!';
        }
        
        this.ctx.fillText(countdownText, this.width / 2, this.height / 2);
        
        // Ready text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Get Ready!', this.width / 2, this.height / 2 - 80);
    }
    
    drawAIDifficultyIndicator() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 60);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        
        const personality = this.aiPlayer.currentPersonality;
        const adaptiveText = this.aiPlayer.useAdaptiveDifficulty ? ' (Adaptive)' : '';
        
        this.ctx.fillText(`AI: ${personality.toUpperCase()}${adaptiveText}`, 15, 30);
        
        // Difficulty bar
        const difficultyLevel = this.aiPlayer.getCurrentDifficultyLevel();
        const barWidth = 180;
        const barHeight = 8;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(15, 40, barWidth, barHeight);
        
        this.ctx.fillStyle = this.getDifficultyColor(difficultyLevel);
        this.ctx.fillRect(15, 40, barWidth * difficultyLevel, barHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`Skill: ${Math.round(difficultyLevel * 100)}%`, 15, 58);
    }
    
    getDifficultyColor(level) {
        if (level < 0.3) return '#00FF00'; // Green for easy
        if (level < 0.6) return '#FFFF00'; // Yellow for medium
        if (level < 0.8) return '#FF8800'; // Orange for hard
        return '#FF0000'; // Red for very hard
    }
    
    drawControlsHelp() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width - 220, this.height - 120, 210, 110);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        const controls = [
            'WASD/Arrows: Move',
            '1-4: AI Difficulty',
            'A: Toggle Adaptive',
            'R: Restart',
            'M: Mute/Unmute'
        ];
        
        controls.forEach((control, index) => {
            this.ctx.fillText(control, this.width - 215, this.height - 100 + (index * 18));
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 5;
        this.color = '#0064FF'; // Blue
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.trailPositions = [];
    }
    
    update(keys) {
        this.updateWithSpeed(keys, 1.0);
    }
    
    updateWithSpeed(keys, speedMultiplier) {
        let dx = 0;
        let dy = 0;
        
        const currentSpeed = this.speed * speedMultiplier;
        
        // Movement controls (Arrow keys or WASD)
        if (keys['ArrowLeft'] || keys['KeyA']) dx = -currentSpeed;
        if (keys['ArrowRight'] || keys['KeyD']) dx = currentSpeed;
        if (keys['ArrowUp'] || keys['KeyW']) dy = -currentSpeed;
        if (keys['ArrowDown'] || keys['KeyS']) dy = currentSpeed;
        
        // Store current position for trail effect
        if (speedMultiplier > 1.0) {
            this.trailPositions.push({x: this.x, y: this.y, life: 10});
            if (this.trailPositions.length > 8) {
                this.trailPositions.shift();
            }
        }
        
        // Update trail positions
        for (let i = this.trailPositions.length - 1; i >= 0; i--) {
            this.trailPositions[i].life--;
            if (this.trailPositions[i].life <= 0) {
                this.trailPositions.splice(i, 1);
            }
        }
        
        // Update position with boundary checking
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Keep player within field bounds
        if (newX >= 40 && newX <= 760) this.x = newX;
        if (newY >= 40 && newY <= 560) this.y = newY;
        
        this.lastMoveX = dx;
        this.lastMoveY = dy;
    }
    
    draw(ctx) {
        // Draw speed trail if active
        for (let i = 0; i < this.trailPositions.length; i++) {
            const trail = this.trailPositions[i];
            const alpha = trail.life / 10;
            ctx.fillStyle = `rgba(0, 100, 255, ${alpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, this.radius * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw player body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw simple face
        ctx.fillStyle = 'white';
        // Eyes
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y - 5, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + 2, 8, 0, Math.PI);
        ctx.stroke();
    }
    
    collidesWith(ball) {
        const distance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        return distance < this.radius + ball.radius;
    }
    
    getKickDirection() {
        if (this.lastMoveX === 0 && this.lastMoveY === 0) {
            return { x: 1, y: 0 }; // Default kick right
        }
        
        // Normalize movement direction
        const length = Math.sqrt(this.lastMoveX ** 2 + this.lastMoveY ** 2);
        if (length === 0) return { x: 1, y: 0 };
        
        return {
            x: this.lastMoveX / length,
            y: this.lastMoveY / length
        };
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.95;
        this.bounceDamping = 0.7;
        this.trailPositions = [];
    }
    
    update() {
        // Store position for trail effect if moving fast
        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > 3) {
            this.trailPositions.push({x: this.x, y: this.y, life: 8});
            if (this.trailPositions.length > 6) {
                this.trailPositions.shift();
            }
        }
        
        // Update trail positions
        for (let i = this.trailPositions.length - 1; i >= 0; i--) {
            this.trailPositions[i].life--;
            if (this.trailPositions[i].life <= 0) {
                this.trailPositions.splice(i, 1);
            }
        }
        
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Stop very slow movement
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls
        if (this.x - this.radius <= 20 || this.x + this.radius >= 780) {
            this.vx = -this.vx * this.bounceDamping;
            if (this.x - this.radius <= 20) this.x = 20 + this.radius;
            else this.x = 780 - this.radius;
        }
        
        if (this.y - this.radius <= 20 || this.y + this.radius >= 580) {
            this.vy = -this.vy * this.bounceDamping;
            if (this.y - this.radius <= 20) this.y = 20 + this.radius;
            else this.y = 580 - this.radius;
        }
    }
    
    kick(direction) {
        const kickPower = 8;
        this.vx = direction.x * kickPower;
        this.vy = direction.y * kickPower;
    }
    
    draw(ctx) {
        this.drawWithTrail(ctx, false);
    }
    
    drawWithTrail(ctx, showTrail) {
        // Draw trail if active
        if (showTrail) {
            for (let i = 0; i < this.trailPositions.length; i++) {
                const trail = this.trailPositions[i];
                const alpha = trail.life / 8;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
                ctx.beginPath();
                ctx.arc(trail.x, trail.y, this.radius * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y + 3, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ball
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw soccer ball pattern
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Simple pentagon pattern
        ctx.fillStyle = 'black';
        for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI * 2 / 5;
            const xOffset = Math.cos(angle) * (this.radius / 2);
            const yOffset = Math.sin(angle) * (this.radius / 2);
            ctx.beginPath();
            ctx.arc(this.x + xOffset, this.y + yOffset, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add glow effect for magnet power-up
        if (showTrail) {
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}

// AI Performance Tracker for Adaptive Difficulty
class AIPerformanceTracker {
    constructor() {
        this.playerGoals = 0;
        this.aiGoals = 0;
        this.gameStartTime = Date.now();
        this.ballPossessionTime = { player: 0, ai: 0 };
        this.lastBallOwner = null;
        this.lastOwnershipTime = Date.now();
        this.playerSkillLevel = 0.5; // 0 = beginner, 1 = expert
        this.adaptiveTarget = 0.4; // Target win rate for AI (40% to keep it fun)
    }
    
    update(ball, player, aiPlayer) {
        // Track ball possession
        const currentTime = Date.now();
        const playerDist = Math.sqrt((player.x - ball.x) ** 2 + (player.y - ball.y) ** 2);
        const aiDist = Math.sqrt((aiPlayer.x - ball.x) ** 2 + (aiPlayer.y - ball.y) ** 2);
        
        const currentOwner = playerDist < aiDist ? 'player' : 'ai';
        
        if (this.lastBallOwner && this.lastBallOwner !== currentOwner) {
            const timeDiff = currentTime - this.lastOwnershipTime;
            this.ballPossessionTime[this.lastBallOwner] += timeDiff;
            this.lastOwnershipTime = currentTime;
        }
        
        this.lastBallOwner = currentOwner;
    }
    
    onGoalScored(scorer, playerGoals, aiGoals) {
        this.playerGoals = playerGoals;
        this.aiGoals = aiGoals;
        
        // Adjust player skill level based on performance
        const totalGoals = playerGoals + aiGoals;
        if (totalGoals >= 3) {
            const playerWinRate = playerGoals / totalGoals;
            
            // If player is winning too much, they're skilled - increase AI difficulty
            if (playerWinRate > 0.7) {
                this.playerSkillLevel = Math.min(1.0, this.playerSkillLevel + 0.1);
            }
            // If player is losing too much, they need help - decrease AI difficulty  
            else if (playerWinRate < 0.3) {
                this.playerSkillLevel = Math.max(0.0, this.playerSkillLevel - 0.1);
            }
        }
    }
    
    getAdaptiveDifficulty() {
        // Base difficulty on player skill and current game state
        const totalGoals = this.playerGoals + this.aiGoals;
        const gameTime = (Date.now() - this.gameStartTime) / 1000;
        
        // Start easier and adapt based on performance
        let difficulty = 0.3 + (this.playerSkillLevel * 0.4);
        
        // Slight adjustment based on current score difference
        if (totalGoals > 0) {
            const scoreDiff = this.playerGoals - this.aiGoals;
            if (scoreDiff > 1) {
                difficulty += 0.1; // Player is ahead, make AI slightly harder
            } else if (scoreDiff < -1) {
                difficulty -= 0.1; // AI is ahead, make it easier
            }
        }
        
        // Ensure difficulty stays in reasonable bounds for kids
        return Math.max(0.2, Math.min(0.8, difficulty));
    }
    
    reset() {
        this.playerGoals = 0;
        this.aiGoals = 0;
        this.gameStartTime = Date.now();
        this.ballPossessionTime = { player: 0, ai: 0 };
        this.lastBallOwner = null;
        this.lastOwnershipTime = Date.now();
        // Don't reset playerSkillLevel - it carries across games
    }
}

// Enhanced AI Player with Multiple Personalities and Adaptive Behavior
class EnhancedAIPlayer {
    constructor(x, y, performanceTracker) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.baseSpeed = 2.5;
        this.color = '#FF4444'; // Red
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.performanceTracker = performanceTracker;
        
        // AI Personality System
        this.personalities = {
            easy: {
                speed: 0.6,
                accuracy: 0.4,
                reactionTime: 60,
                aggression: 0.3,
                mistakeChance: 0.3,
                celebrationLevel: 0.5
            },
            medium: {
                speed: 0.8,
                accuracy: 0.6,
                reactionTime: 30,
                aggression: 0.5,
                mistakeChance: 0.15,
                celebrationLevel: 0.7
            },
            hard: {
                speed: 1.0,
                accuracy: 0.8,
                reactionTime: 15,
                aggression: 0.8,
                mistakeChance: 0.05,
                celebrationLevel: 0.9
            },
            friendly: {
                speed: 0.7,
                accuracy: 0.5,
                reactionTime: 45,
                aggression: 0.4,
                mistakeChance: 0.25,
                celebrationLevel: 0.3
            }
        };
        
        this.currentPersonality = 'medium';
        this.useAdaptiveDifficulty = true;
        
        // Enhanced AI State
        this.state = 'chasing'; // 'chasing', 'positioning', 'defending', 'attacking'
        this.reactionDelay = 0;
        this.targetX = x;
        this.targetY = y;
        this.lastBallPosition = { x: 0, y: 0 };
        this.ballPrediction = { x: 0, y: 0 };
        this.celebrationTimer = 0;
        this.mistakeTimer = 0;
        
        // Strategic positioning
        this.preferredPositions = {
            defensive: { x: 150, y: 300 },
            midfield: { x: 300, y: 300 },
            attacking: { x: 600, y: 300 }
        };
        
        this.targetGoalX = 50; // Aims for left goal
    }
    
    update(ball, player, game) {
        // Handle celebration state
        if (this.celebrationTimer > 0) {
            this.celebrationTimer--;
            this.updateCelebration();
            return;
        }
        
        // Handle mistakes
        if (this.mistakeTimer > 0) {
            this.mistakeTimer--;
            // Move randomly during mistake
            this.lastMoveX = (Math.random() - 0.5) * this.baseSpeed * 0.5;
            this.lastMoveY = (Math.random() - 0.5) * this.baseSpeed * 0.5;
            this.move();
            return;
        }
        
        // Handle reaction delay
        if (this.reactionDelay > 0) {
            this.reactionDelay--;
            return;
        }
        
        // Get current personality settings
        const personality = this.getPersonalitySettings();
        
        // Predict ball movement
        this.updateBallPrediction(ball);
        
        // Determine AI state based on game situation
        this.updateAIState(ball, player, game);
        
        // Execute behavior based on current state
        this.executeBehavior(ball, player, personality);
        
        // Apply movement with bounds checking
        this.move();
        
        // Random reaction delays and mistakes
        this.applyRandomFactors(personality);
    }
    
    getPersonalitySettings() {
        let personality = this.personalities[this.currentPersonality];
        
        if (this.useAdaptiveDifficulty) {
            // Blend personality with adaptive difficulty
            const adaptiveDifficulty = this.performanceTracker.getAdaptiveDifficulty();
            
            personality = {
                speed: personality.speed * (0.7 + adaptiveDifficulty * 0.6),
                accuracy: personality.accuracy * (0.5 + adaptiveDifficulty * 0.5),
                reactionTime: personality.reactionTime * (1.5 - adaptiveDifficulty * 0.8),
                aggression: personality.aggression * (0.7 + adaptiveDifficulty * 0.6),
                mistakeChance: personality.mistakeChance * (1.5 - adaptiveDifficulty),
                celebrationLevel: personality.celebrationLevel
            };
        }
        
        return personality;
    }
    
    updateBallPrediction(ball) {
        // Simple ball movement prediction
        this.ballPrediction.x = ball.x + ball.vx * 5;
        this.ballPrediction.y = ball.y + ball.vy * 5;
        
        // Keep prediction within field bounds
        this.ballPrediction.x = Math.max(50, Math.min(750, this.ballPrediction.x));
        this.ballPrediction.y = Math.max(50, Math.min(550, this.ballPrediction.y));
    }
    
    updateAIState(ball, player, game) {
        const ballDistance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        const playerToBallDist = Math.sqrt((player.x - ball.x) ** 2 + (player.y - ball.y) ** 2);
        
        // Determine if AI should be aggressive or defensive
        const isPlayerCloser = playerToBallDist < ballDistance;
        const ballInPlayerHalf = ball.x > 400;
        
        if (ballDistance < 40) {
            this.state = 'attacking';
        } else if (isPlayerCloser && ballInPlayerHalf) {
            this.state = 'defending';
        } else if (ballDistance > 100) {
            this.state = 'positioning';
        } else {
            this.state = 'chasing';
        }
    }
    
    executeBehavior(ball, player, personality) {
        const speed = this.baseSpeed * personality.speed;
        
        switch (this.state) {
            case 'attacking':
                this.executeAttack(ball, personality, speed);
                break;
            case 'defending':
                this.executeDefense(ball, player, speed);
                break;
            case 'positioning':
                this.executePositioning(ball, speed);
                break;
            case 'chasing':
            default:
                this.executeChasing(ball, personality, speed);
                break;
        }
    }
    
    executeAttack(ball, personality, speed) {
        // Move to optimal shooting position
        const goalDirection = Math.atan2(300 - ball.y, this.targetGoalX - ball.x);
        const shootingDistance = 25;
        
        this.targetX = ball.x + Math.cos(goalDirection + Math.PI) * shootingDistance;
        this.targetY = ball.y + Math.sin(goalDirection + Math.PI) * shootingDistance;
        
        this.moveToTarget(speed * 1.2); // Faster when attacking
    }
    
    executeDefense(ball, player, speed) {
        // Position between ball and goal
        const goalX = this.targetGoalX;
        const goalY = 300;
        
        const ballToGoalX = goalX - ball.x;
        const ballToGoalY = goalY - ball.y;
        const distance = Math.sqrt(ballToGoalX ** 2 + ballToGoalY ** 2);
        
        if (distance > 0) {
            // Position 60% of the way from goal to ball
            this.targetX = goalX + (ballToGoalX * 0.6);
            this.targetY = goalY + (ballToGoalY * 0.6);
        }
        
        this.moveToTarget(speed);
    }
    
    executePositioning(ball, speed) {
        // Smart positioning based on ball location
        let targetPosition;
        
        if (ball.x < 200) {
            targetPosition = this.preferredPositions.attacking;
        } else if (ball.x < 600) {
            targetPosition = this.preferredPositions.midfield;
        } else {
            targetPosition = this.preferredPositions.defensive;
        }
        
        this.targetX = targetPosition.x;
        this.targetY = targetPosition.y + (Math.random() - 0.5) * 100; // Add some randomness
        
        this.moveToTarget(speed * 0.8); // Slower when positioning
    }
    
    executeChasing(ball, personality, speed) {
        // Chase ball with prediction
        const usePredict = Math.random() < personality.accuracy;
        const target = usePredict ? this.ballPrediction : ball;
        
        this.targetX = target.x;
        this.targetY = target.y;
        
        this.moveToTarget(speed);
    }
    
    moveToTarget(speed) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance > 5) {
            this.lastMoveX = (dx / distance) * speed;
            this.lastMoveY = (dy / distance) * speed;
        } else {
            this.lastMoveX = 0;
            this.lastMoveY = 0;
        }
    }
    
    move() {
        // Update position with boundary checking
        const newX = this.x + this.lastMoveX;
        const newY = this.y + this.lastMoveY;
        
        // Keep AI within field bounds
        if (newX >= 40 && newX <= 760) this.x = newX;
        if (newY >= 40 && newY <= 560) this.y = newY;
    }
    
    applyRandomFactors(personality) {
        // Random reaction delays
        if (Math.random() < 0.02) {
            this.reactionDelay = Math.floor(personality.reactionTime * (0.5 + Math.random() * 0.5));
        }
        
        // Random mistakes
        if (Math.random() < personality.mistakeChance * 0.01) {
            this.mistakeTimer = Math.floor(Math.random() * 30) + 15;
        }
    }
    
    celebrate() {
        const personality = this.getPersonalitySettings();
        this.celebrationTimer = Math.floor(60 * personality.celebrationLevel);
    }
    
    updateCelebration() {
        // Simple celebration movement
        const angle = (this.celebrationTimer * 0.2) % (Math.PI * 2);
        this.lastMoveX = Math.cos(angle) * 2;
        this.lastMoveY = Math.sin(angle) * 1;
        this.move();
    }
    
    setPersonality(personality) {
        if (this.personalities[personality]) {
            this.currentPersonality = personality;
        }
    }
    
    toggleAdaptiveDifficulty() {
        this.useAdaptiveDifficulty = !this.useAdaptiveDifficulty;
    }
    
    getCurrentDifficultyLevel() {
        if (this.useAdaptiveDifficulty) {
            return this.performanceTracker.getAdaptiveDifficulty();
        } else {
            const personality = this.personalities[this.currentPersonality];
            return (personality.speed + personality.accuracy + (1 - personality.mistakeChance)) / 3;
        }
    }
    
    draw(ctx) {
        // Draw AI player body with difficulty-based color intensity
        const difficultyLevel = this.getCurrentDifficultyLevel();
        const intensity = Math.floor(255 * (0.5 + difficultyLevel * 0.5));
        ctx.fillStyle = `rgb(${intensity}, 68, 68)`;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw state indicator
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.state.charAt(0).toUpperCase(), this.x, this.y - 25);
        
        // Draw facial expression based on personality and celebration
        this.drawFace(ctx);
        
        // Draw celebration effects
        if (this.celebrationTimer > 0) {
            this.drawCelebrationEffects(ctx);
        }
    }
    
    drawFace(ctx) {
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils - different based on state
        ctx.fillStyle = 'black';
        const pupilY = this.state === 'attacking' ? this.y - 4 : this.y - 5;
        ctx.beginPath();
        ctx.arc(this.x - 6, pupilY, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, pupilY, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth - changes based on personality and celebration
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (this.celebrationTimer > 0) {
            // Happy celebration smile
            ctx.arc(this.x, this.y + 2, 8, 0, Math.PI);
        } else if (this.currentPersonality === 'friendly') {
            // Neutral friendly expression
            ctx.arc(this.x, this.y + 4, 4, 0, Math.PI);
        } else {
            // Determined/competitive expression
            ctx.arc(this.x, this.y + 8, 6, Math.PI, 0);
        }
        
        ctx.stroke();
    }
    
    drawCelebrationEffects(ctx) {
        // Draw celebration stars
        for (let i = 0; i < 3; i++) {
            const angle = (this.celebrationTimer * 0.1 + i * Math.PI * 2 / 3) % (Math.PI * 2);
            const radius = 30 + Math.sin(this.celebrationTimer * 0.2) * 5;
            const starX = this.x + Math.cos(angle) * radius;
            const starY = this.y + Math.sin(angle) * radius;
            
            ctx.fillStyle = '#FFD700';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('★', starX, starY);
        }
    }
    
    collidesWith(ball) {
        const distance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        return distance < this.radius + ball.radius;
    }
    
    getKickDirection() {
        const personality = this.getPersonalitySettings();
        
        // Base direction toward goal
        let targetX = this.targetGoalX;
        let targetY = 300;
        
        // Add inaccuracy based on personality
        const inaccuracy = (1 - personality.accuracy) * 100;
        targetX += (Math.random() - 0.5) * inaccuracy;
        targetY += (Math.random() - 0.5) * inaccuracy;
        
        const dirX = targetX - this.x;
        const dirY = targetY - this.y;
        const length = Math.sqrt(dirX ** 2 + dirY ** 2);
        
        if (length === 0) return { x: -1, y: 0 };
        
        return {
            x: dirX / length,
            y: dirY / length
        };
    }
}

class AIPlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 2.5; // Slower than human player for fairness
        this.color = '#FF4444'; // Red
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.reactionDelay = 0;
        this.targetGoalX = 50; // Aims for left goal (correct goal for AI)
    }
    
    update(ball) {
        // Add some reaction delay for more realistic AI
        if (this.reactionDelay > 0) {
            this.reactionDelay--;
            return;
        }
        
        let dx = 0;
        let dy = 0;
        
        // Less aggressive AI: Only chase ball sometimes
        const ballDistance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        
        if (ballDistance > 50) {
            // Move toward ball more slowly when far away
            const dirX = ball.x - this.x;
            const dirY = ball.y - this.y;
            const length = Math.sqrt(dirX ** 2 + dirY ** 2);
            
            if (length > 0) {
                dx = (dirX / length) * this.speed * 0.6; // Even slower approach
                dy = (dirY / length) * this.speed * 0.6;
                
                // Add more randomness to make AI less perfect
                dx += (Math.random() - 0.5) * 1.0;
                dy += (Math.random() - 0.5) * 1.0;
            }
        } else if (ballDistance > 25) {
            // Move toward ball when medium distance
            const dirX = ball.x - this.x;
            const dirY = ball.y - this.y;
            const length = Math.sqrt(dirX ** 2 + dirY ** 2);
            
            if (length > 0) {
                dx = (dirX / length) * this.speed * 0.8;
                dy = (dirY / length) * this.speed * 0.8;
            }
        } else {
            // When close to ball, try to kick it toward left goal (AI's goal)
            const goalDirection = Math.atan2(300 - ball.y, this.targetGoalX - ball.x);
            dx = Math.cos(goalDirection) * this.speed * 0.3; // Gentler kicks
            dy = Math.sin(goalDirection) * this.speed * 0.3;
        }
        
        // Update position with boundary checking
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Keep AI within field bounds
        if (newX >= 40 && newX <= 760) this.x = newX;
        if (newY >= 40 && newY <= 560) this.y = newY;
        
        this.lastMoveX = dx;
        this.lastMoveY = dy;
        
        // More frequent reaction delays to make AI more human-like
        if (Math.random() < 0.03) {
            this.reactionDelay = Math.floor(Math.random() * 40) + 10;
        }
    }
    
    draw(ctx) {
        // Draw AI player body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw simple face (angry expression for competition)
        ctx.fillStyle = 'white';
        // Eyes
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils (angry slant)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 4, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y - 4, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry mouth (upside down smile)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + 8, 6, Math.PI, 0);
        ctx.stroke();
    }
    
    collidesWith(ball) {
        const distance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        return distance < this.radius + ball.radius;
    }
    
    getKickDirection() {
        // AI tries to kick toward left goal (AI's goal to score on player)
        const targetX = 35; // Left goal center
        const targetY = 300;
        
        const dirX = targetX - this.x;
        const dirY = targetY - this.y;
        const length = Math.sqrt(dirX ** 2 + dirY ** 2);
        
        if (length === 0) return { x: -1, y: 0 }; // Default kick left
        
        return {
            x: dirX / length,
            y: dirY / length
        };
    }
}

class Field {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        this.drawWithGoalSize(ctx, 150);
    }
    
    drawWithBigGoals(ctx) {
        this.drawWithGoalSize(ctx, 220); // Bigger goals
    }
    
    drawWithGoalSize(ctx, goalHeight) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        
        // Center circle
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center line
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        
        // Field borders
        ctx.beginPath();
        ctx.rect(20, 20, this.width - 40, this.height - 40);
        ctx.stroke();
        
        // Goals
        ctx.strokeStyle = goalHeight > 150 ? '#FF69B4' : '#FFD700'; // Pink for big goals, gold for normal
        ctx.lineWidth = goalHeight > 150 ? 5 : 3; // Thicker line for big goals
        
        const goalWidth = 30;
        const goalY = (this.height - goalHeight) / 2;
        
        // Left goal
        ctx.beginPath();
        ctx.rect(20, goalY, goalWidth, goalHeight);
        ctx.stroke();
        
        // Right goal
        ctx.beginPath();
        ctx.rect(this.width - 50, goalY, goalWidth, goalHeight);
        ctx.stroke();
        
        // Add glow effect for big goals
        if (goalHeight > 150) {
            ctx.shadowColor = '#FF69B4';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.rect(20, goalY, goalWidth, goalHeight);
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(this.width - 50, goalY, goalWidth, goalHeight);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});