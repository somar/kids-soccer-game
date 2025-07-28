// Main Game class - Orchestrates all game systems
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        
        // Initialize all systems
        this.audioManager = new AudioManager();
        this.performanceTracker = new AIPerformanceTracker();
        this.achievementSystem = new AchievementSystem();
        this.powerUpManager = new PowerUpManager();
        this.particleSystem = new ParticleSystem();
        
        // Game objects
        this.player = new Player(this.width / 2, this.height / 2);
        this.aiPlayer = new EnhancedAIPlayer(this.width / 2, this.height / 2 - 100, this.performanceTracker);
        this.ball = new Ball(this.width / 2, this.height / 2 + 50);
        this.field = new Field(this.width, this.height);
        
        // Scoring system
        this.leftScore = 0;
        this.rightScore = 0;
        this.goalCelebrationTimer = 0;
        this.lastGoalScorer = null;
        this.countdownTimer = 180; // 3 seconds at 60fps
        this.gameState = 'countdown'; // 'countdown', 'playing', 'goal_celebration'
        
        // Goal dimensions (matching Field class)
        this.goalWidth = 30;
        this.goalHeight = 150; 
        this.goalY = (this.height - this.goalHeight) / 2;
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Start audio
        this.audioManager.startAmbientCrowd();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle various controls
            switch (e.code) {
                case 'KeyR':
                    this.restart();
                    this.audioManager.playUIClick();
                    break;
                case 'KeyM':
                    this.audioManager.toggleMute();
                    break;
                case 'Equal': // + key
                case 'NumpadAdd':
                    this.audioManager.setVolume(this.audioManager.volume + 0.1);
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    this.audioManager.setVolume(this.audioManager.volume - 0.1);
                    break;
                case 'Digit1':
                    this.aiPlayer.setPersonality('easy');
                    console.log('AI Difficulty: Easy');
                    break;
                case 'Digit2':
                    this.aiPlayer.setPersonality('medium');
                    console.log('AI Difficulty: Medium');
                    break;
                case 'Digit3':
                    this.aiPlayer.setPersonality('hard');
                    console.log('AI Difficulty: Hard');
                    break;
                case 'Digit4':
                    this.aiPlayer.setPersonality('friendly');
                    console.log('AI Difficulty: Friendly');
                    break;
                case 'KeyA':
                    if (!this.keys['ArrowLeft']) { // Only if not used for movement
                        this.performanceTracker.setAdaptiveDifficulty(!this.performanceTracker.adaptiveDifficulty);
                        console.log(`Adaptive Difficulty: ${this.performanceTracker.adaptiveDifficulty ? 'On' : 'Off'}`);
                    }
                    break;
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
        
        // Reset positions
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.aiPlayer.x = this.width / 2;
        this.aiPlayer.y = this.height / 2 - 100;
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2 + 50;
        this.ball.vx = 0;
        this.ball.vy = 0;
        
        // Reset systems
        this.performanceTracker.reset();
        this.achievementSystem.reset();
        this.powerUpManager.reset();
        this.particleSystem.clear();
    }
    
    update() {
        // Update all systems
        this.achievementSystem.update();
        this.particleSystem.update();
        this.performanceTracker.updateGameTime();
        
        // Handle game states
        if (this.gameState === 'countdown') {
            this.countdownTimer--;
            if (this.countdownTimer === 120 || this.countdownTimer === 60) {
                this.audioManager.playCountdownBeep();
            } else if (this.countdownTimer === 0) {
                this.audioManager.playCountdownBeep(true); // "GO!" beep
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
        this.player.update(this.keys);
        this.aiPlayer.update(this.ball, this.player);
        this.ball.update();
        
        // Apply ball magnetism if player has magnet power-up
        if (this.player.powerUps.magnet.active) {
            this.ball.applyMagnetism(this.player.x, this.player.y);
        }
        
        // Update power-ups
        const powerUpCollected = this.powerUpManager.update(this.player, this.field);
        if (powerUpCollected) {
            this.audioManager.playPowerUpSound();
            this.achievementSystem.recordPowerUpCollection(powerUpCollected.type);
            this.particleSystem.createPowerUpCollection(this.player.x, this.player.y, powerUpCollected.type);
        }
        
        // Check player-ball collision
        if (this.player.collidesWith(this.ball)) {
            const kickDirection = this.player.getKickDirection();
            this.ball.kick(kickDirection);
            this.audioManager.playKickSound(0.9 + Math.random() * 0.2); // Pitch variation
            this.particleSystem.createBallImpact(this.ball.x, this.ball.y, 1.5);
            this.performanceTracker.updateBallPossession(true);
        }
        
        // Check AI player-ball collision
        if (this.aiPlayer.collidesWith(this.ball)) {
            const kickDirection = this.aiPlayer.getKickDirection();
            this.ball.kick(kickDirection);
            this.audioManager.playKickSound(0.8 + Math.random() * 0.15); // Different pitch for AI
            this.particleSystem.createBallImpact(this.ball.x, this.ball.y, 1.0);
            this.performanceTracker.updateBallPossession(false);
        }
        
        // Check for goals
        this.checkGoals();
    }
    
    checkGoals() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const ballRadius = this.ball.radius;
        const goalDimensions = this.field.getGoalDimensions();
        
        // Left goal area: x: 20-50, y: goalY to goalY+goalHeight
        if (ballX - ballRadius <= 50 && ballX + ballRadius >= 20 && 
            ballY >= goalDimensions.y && ballY <= goalDimensions.y + goalDimensions.height) {
            this.scoreGoal('right'); // Right player (AI) scores in left goal
        }
        
        // Right goal area: x: 750-780, y: goalY to goalY+goalHeight  
        if (ballX + ballRadius >= 750 && ballX - ballRadius <= 780 &&
            ballY >= goalDimensions.y && ballY <= goalDimensions.y + goalDimensions.height) {
            this.scoreGoal('left'); // Left player (human) scores in right goal
        }
    }
    
    scoreGoal(scorer) {
        // Increment score
        if (scorer === 'left') {
            this.leftScore++;
            this.performanceTracker.recordGoal('player');
            this.achievementSystem.recordGoal('player');
        } else {
            this.rightScore++;
            this.performanceTracker.recordGoal('ai');
            this.achievementSystem.recordGoal('ai');
            this.aiPlayer.startCelebration();
        }
        
        // Play celebration sound and effects
        this.audioManager.playGoalCelebration();
        this.particleSystem.createGoalExplosion(this.ball.x, this.ball.y);
        this.particleSystem.createCelebrationFireworks(this.width / 2, this.height / 2);
        
        // Start celebration
        this.goalCelebrationTimer = 120; // 2 seconds at 60fps
        this.lastGoalScorer = scorer;
        this.gameState = 'goal_celebration';
        
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
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#228B22'; // Forest green
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw game objects
        this.field.draw(this.ctx);
        this.player.draw(this.ctx);
        this.aiPlayer.draw(this.ctx);
        this.ball.draw(this.ctx);
        
        // Draw systems
        this.powerUpManager.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        
        // Draw UI elements
        this.drawScore();
        this.drawDifficultyIndicator();
        this.powerUpManager.drawUI(this.ctx, this.width);
        this.achievementSystem.draw(this.ctx, this.width, this.height);
        
        // Draw game state overlays
        if (this.gameState === 'goal_celebration') {
            this.drawGoalCelebration();
        } else if (this.gameState === 'countdown') {
            this.drawCountdown();
        }
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
        
        this.ctx.fillStyle = '#FF4444'; // Red for opponent
        this.ctx.textAlign = 'left'; 
        this.ctx.fillText('OPPONENT', this.width / 2 + 40, 50);
    }
    
    drawDifficultyIndicator() {
        const stats = this.performanceTracker.getStats();
        const difficulty = stats.difficulty;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 80, 200, 60);
        
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('AI Difficulty', 30, 100);
        
        // Difficulty bar
        const barWidth = 150;
        const barHeight = 10;
        const barX = 30;
        const barY = 110;
        
        // Background bar
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Difficulty fill
        const fillWidth = (difficulty / 100) * barWidth;
        let fillColor;
        if (difficulty < 30) fillColor = '#4CAF50'; // Green (Easy)
        else if (difficulty < 60) fillColor = '#FFA500'; // Orange (Medium)
        else if (difficulty < 80) fillColor = '#FF6B35'; // Red-Orange (Hard)
        else fillColor = '#FF1744'; // Red (Expert)
        
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Difficulty text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`${stats.skillLevel} (${difficulty}%)`, 30, 135);
        
        // AI state indicator
        this.ctx.fillText(`AI: ${this.aiPlayer.getBehaviorState()}`, 120, 135);
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
        
        // Goal celebration particles (handled by ParticleSystem)
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
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});