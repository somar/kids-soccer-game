// Kids Soccer Game - JavaScript Version
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        
        // Game objects
        this.player = new Player(this.width / 2, this.height / 2);
        this.ball = new Ball(this.width / 2, this.height / 2 + 50);
        this.field = new Field(this.width, this.height);
        
        // Scoring system
        this.leftScore = 0;
        this.rightScore = 0;
        this.goalCelebrationTimer = 0;
        this.lastGoalScorer = null;
        
        // Goal dimensions (matching Field class)
        this.goalWidth = 30;
        this.goalHeight = 150; 
        this.goalY = (this.height - this.goalHeight) / 2;
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle restart
            if (e.code === 'KeyR') {
                this.restart();
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
        
        // Reset positions
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2 + 50;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }
    
    update() {
        this.player.update(this.keys);
        this.ball.update();
        
        // Check player-ball collision
        if (this.player.collidesWith(this.ball)) {
            this.ball.kick(this.player.getKickDirection());
        }
        
        // Check for goals
        this.checkGoals();
        
        // Update goal celebration timer
        if (this.goalCelebrationTimer > 0) {
            this.goalCelebrationTimer--;
        }
    }
    
    checkGoals() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const ballRadius = this.ball.radius;
        
        // Left goal area: x: 20-50, y: goalY to goalY+goalHeight
        if (ballX - ballRadius <= 50 && ballX + ballRadius >= 20 && 
            ballY >= this.goalY && ballY <= this.goalY + this.goalHeight) {
            this.scoreGoal('right'); // Right player scores in left goal
        }
        
        // Right goal area: x: 750-780, y: goalY to goalY+goalHeight  
        if (ballX + ballRadius >= 750 && ballX - ballRadius <= 780 &&
            ballY >= this.goalY && ballY <= this.goalY + this.goalHeight) {
            this.scoreGoal('left'); // Left player scores in right goal
        }
    }
    
    scoreGoal(scorer) {
        // Increment score
        if (scorer === 'left') {
            this.leftScore++;
        } else {
            this.rightScore++;
        }
        
        // Start celebration
        this.goalCelebrationTimer = 120; // 2 seconds at 60fps
        this.lastGoalScorer = scorer;
        
        // Reset ball to center
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        
        // Reset player to center
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#228B22'; // Forest green
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw game objects
        this.field.draw(this.ctx);
        this.player.draw(this.ctx);
        this.ball.draw(this.ctx);
        
        // Draw score
        this.drawScore();
        
        // Draw goal celebration
        if (this.goalCelebrationTimer > 0) {
            this.drawGoalCelebration();
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
    }
    
    update(keys) {
        let dx = 0;
        let dy = 0;
        
        // Movement controls (Arrow keys or WASD)
        if (keys['ArrowLeft'] || keys['KeyA']) dx = -this.speed;
        if (keys['ArrowRight'] || keys['KeyD']) dx = this.speed;
        if (keys['ArrowUp'] || keys['KeyW']) dy = -this.speed;
        if (keys['ArrowDown'] || keys['KeyS']) dy = this.speed;
        
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
    }
    
    update() {
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
    }
}

class Field {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
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
        ctx.strokeStyle = '#FFD700'; // Gold
        ctx.lineWidth = 3;
        
        const goalWidth = 30;
        const goalHeight = 150;
        const goalY = (this.height - goalHeight) / 2;
        
        // Left goal
        ctx.beginPath();
        ctx.rect(20, goalY, goalWidth, goalHeight);
        ctx.stroke();
        
        // Right goal
        ctx.beginPath();
        ctx.rect(this.width - 50, goalY, goalWidth, goalHeight);
        ctx.stroke();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});