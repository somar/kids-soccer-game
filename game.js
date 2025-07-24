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
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    update() {
        this.player.update(this.keys);
        this.ball.update();
        
        // Check player-ball collision
        if (this.player.collidesWith(this.ball)) {
            this.ball.kick(this.player.getKickDirection());
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#228B22'; // Forest green
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw game objects
        this.field.draw(this.ctx);
        this.player.draw(this.ctx);
        this.ball.draw(this.ctx);
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