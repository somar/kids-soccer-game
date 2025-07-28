// EnhancedAIPlayer class - Advanced AI with multiple personalities and behaviors
class EnhancedAIPlayer {
    constructor(x, y, performanceTracker) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.baseSpeed = 2.5;
        this.speed = this.baseSpeed;
        this.color = '#FF4444'; // Red
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.reactionDelay = 0;
        this.targetGoalX = 50; // Aims for left goal
        this.performanceTracker = performanceTracker;
        
        // AI Behavior States
        this.behaviorState = 'chasing'; // 'attacking', 'defending', 'positioning', 'chasing'
        this.stateTimer = 0;
        
        // AI Personalities
        this.personalities = {
            easy: {
                speed: 1.5,
                accuracy: 0.3,
                reactionTime: 60,
                mistakeChance: 0.3,
                aggression: 0.2
            },
            medium: {
                speed: 2.5,
                accuracy: 0.6,
                reactionTime: 30,
                mistakeChance: 0.15,
                aggression: 0.5
            },
            hard: {
                speed: 3.5,
                accuracy: 0.9,
                reactionTime: 10,
                mistakeChance: 0.05,
                aggression: 0.8
            },
            friendly: {
                speed: 2.0,
                accuracy: 0.4,
                reactionTime: 45,
                mistakeChance: 0.4,
                aggression: 0.3,
                celebratesPlayerGoals: true
            }
        };
        
        this.currentPersonality = 'medium';
        this.celebrationTimer = 0;
        this.celebrationStars = [];
    }
    
    setPersonality(personality) {
        if (this.personalities[personality]) {
            this.currentPersonality = personality;
            this.updateStatsFromPersonality();
        }
    }
    
    updateStatsFromPersonality() {
        const personality = this.personalities[this.currentPersonality];
        
        // Apply adaptive difficulty if enabled
        if (this.performanceTracker && this.performanceTracker.adaptiveDifficulty) {
            const difficultyMultiplier = this.performanceTracker.getDifficultyLevel();
            this.speed = personality.speed * (0.7 + difficultyMultiplier * 0.6);
        } else {
            this.speed = personality.speed;
        }
        
        // Update color intensity based on difficulty
        const intensity = Math.round(100 + this.speed * 30);
        this.color = `rgb(${Math.min(255, intensity)}, 68, 68)`;
    }
    
    update(ball, player) {
        this.updateStatsFromPersonality();
        this.updateBehaviorState(ball, player);
        this.updateCelebration();
        
        // Add reaction delay for more realistic AI
        if (this.reactionDelay > 0) {
            this.reactionDelay--;
            return;
        }
        
        let dx = 0;
        let dy = 0;
        
        const personality = this.personalities[this.currentPersonality];
        
        // Execute behavior based on current state
        switch (this.behaviorState) {
            case 'attacking':
                ({ dx, dy } = this.getAttackingMovement(ball, personality));
                break;
            case 'defending':
                ({ dx, dy } = this.getDefendingMovement(ball, player, personality));
                break;
            case 'positioning':
                ({ dx, dy } = this.getPositioningMovement(ball, personality));
                break;
            case 'chasing':
            default:
                ({ dx, dy } = this.getChasingMovement(ball, personality));
                break;
        }
        
        // Apply random mistakes based on personality
        if (Math.random() < personality.mistakeChance) {
            dx += (Math.random() - 0.5) * 2;
            dy += (Math.random() - 0.5) * 2;
        }
        
        // Update position with boundary checking
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Keep AI within field bounds
        if (newX >= 40 && newX <= 760) this.x = newX;
        if (newY >= 40 && newY <= 560) this.y = newY;
        
        this.lastMoveX = dx;
        this.lastMoveY = dy;
        
        // Random reaction delays for realism
        const personality_reaction = this.personalities[this.currentPersonality];
        if (Math.random() < 0.03) {
            this.reactionDelay = Math.floor(Math.random() * personality_reaction.reactionTime) + 5;
        }
    }
    
    updateBehaviorState(ball, player) {
        this.stateTimer++;
        
        const ballDistance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        const playerDistance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
        
        // Change behavior based on game situation
        if (ballDistance < 30) {
            this.behaviorState = 'attacking';
        } else if (playerDistance < 50 && ball.x > this.x) {
            this.behaviorState = 'defending';
        } else if (this.stateTimer % 180 === 0) { // Every 3 seconds, consider repositioning
            this.behaviorState = Math.random() < 0.3 ? 'positioning' : 'chasing';
        }
    }
    
    getAttackingMovement(ball, personality) {
        // Move aggressively toward ball and try to kick toward goal
        const dirX = ball.x - this.x;
        const dirY = ball.y - this.y;
        const length = Math.sqrt(dirX ** 2 + dirY ** 2);
        
        if (length > 0) {
            return {
                dx: (dirX / length) * this.speed * personality.aggression,
                dy: (dirY / length) * this.speed * personality.aggression
            };
        }
        return { dx: 0, dy: 0 };
    }
    
    getDefendingMovement(ball, player, personality) {
        // Position between player and goal
        const goalX = this.targetGoalX;
        const goalY = 300;
        
        // Calculate optimal defensive position
        const defenseX = (player.x + goalX) / 2;
        const defenseY = (player.y + goalY) / 2;
        
        const dirX = defenseX - this.x;
        const dirY = defenseY - this.y;
        const length = Math.sqrt(dirX ** 2 + dirY ** 2);
        
        if (length > 0) {
            return {
                dx: (dirX / length) * this.speed * 0.7,
                dy: (dirY / length) * this.speed * 0.7
            };
        }
        return { dx: 0, dy: 0 };
    }
    
    getPositioningMovement(ball, personality) {
        // Move to strategic position based on ball location
        let targetX, targetY;
        
        if (ball.x < 400) {
            // Ball on left side, position for counter-attack
            targetX = 300;
            targetY = 300;
        } else {
            // Ball on right side, move up for support
            targetX = ball.x - 100;
            targetY = ball.y;
        }
        
        const dirX = targetX - this.x;
        const dirY = targetY - this.y;
        const length = Math.sqrt(dirX ** 2 + dirY ** 2);
        
        if (length > 0) {
            return {
                dx: (dirX / length) * this.speed * 0.5,
                dy: (dirY / length) * this.speed * 0.5
            };
        }
        return { dx: 0, dy: 0 };
    }
    
    getChasingMovement(ball, personality) {
        // Basic ball chasing with some intelligence
        const ballDistance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        
        if (ballDistance > 50) {
            // Move toward ball when far away
            const dirX = ball.x - this.x;
            const dirY = ball.y - this.y;
            const length = Math.sqrt(dirX ** 2 + dirY ** 2);
            
            if (length > 0) {
                return {
                    dx: (dirX / length) * this.speed * 0.6,
                    dy: (dirY / length) * this.speed * 0.6
                };
            }
        }
        return { dx: 0, dy: 0 };
    }
    
    startCelebration() {
        this.celebrationTimer = 120; // 2 seconds
        this.celebrationStars = [];
        
        // Create celebration stars
        for (let i = 0; i < 8; i++) {
            this.celebrationStars.push({
                angle: i * Math.PI / 4,
                distance: 0,
                life: 120
            });
        }
    }
    
    updateCelebration() {
        if (this.celebrationTimer > 0) {
            this.celebrationTimer--;
            
            // Update celebration stars
            this.celebrationStars.forEach(star => {
                star.distance += 1;
                star.life--;
            });
            
            this.celebrationStars = this.celebrationStars.filter(star => star.life > 0);
        }
    }
    
    draw(ctx) {
        // Draw AI player body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw behavior state indicator
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const stateChar = this.behaviorState.charAt(0).toUpperCase();
        ctx.fillText(stateChar, this.x, this.y - this.radius - 5);
        
        // Draw face based on personality and state
        this.drawFace(ctx);
        
        // Draw celebration effects
        if (this.celebrationTimer > 0) {
            this.drawCelebration(ctx);
        }
    }
    
    drawFace(ctx) {
        const personality = this.personalities[this.currentPersonality];
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils (expression based on personality)
        ctx.fillStyle = 'black';
        const eyeY = personality === this.personalities.friendly ? this.y - 5 : this.y - 4;
        ctx.beginPath();
        ctx.arc(this.x - 6, eyeY, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 6, eyeY, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth (friendly vs competitive)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (personality === this.personalities.friendly) {
            // Smile
            ctx.arc(this.x, this.y + 2, 8, 0, Math.PI);
        } else {
            // Determined expression
            ctx.arc(this.x, this.y + 8, 6, Math.PI, 0);
        }
        ctx.stroke();
    }
    
    drawCelebration(ctx) {
        // Draw celebration stars
        this.celebrationStars.forEach(star => {
            const starX = this.x + Math.cos(star.angle) * star.distance;
            const starY = this.y + Math.sin(star.angle) * star.distance;
            const alpha = star.life / 120;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', starX, starY);
        });
    }
    
    collidesWith(ball) {
        const distance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2);
        return distance < this.radius + ball.radius;
    }
    
    getKickDirection() {
        const personality = this.personalities[this.currentPersonality];
        
        // AI tries to kick toward left goal with accuracy based on personality
        const targetX = 35 + (Math.random() - 0.5) * (100 * (1 - personality.accuracy));
        const targetY = 300 + (Math.random() - 0.5) * (50 * (1 - personality.accuracy));
        
        const dirX = targetX - this.x;
        const dirY = targetY - this.y;
        const length = Math.sqrt(dirX ** 2 + dirY ** 2);
        
        if (length === 0) return { x: -1, y: 0 };
        
        return {
            x: dirX / length,
            y: dirY / length
        };
    }
    
    getBehaviorState() {
        return this.behaviorState;
    }
    
    getCurrentPersonality() {
        return this.currentPersonality;
    }
}