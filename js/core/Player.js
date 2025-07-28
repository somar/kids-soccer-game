// Player class - Human player character
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 5;
        this.baseSpeed = 5;
        this.color = '#0064FF'; // Blue
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        
        // Power-up effects
        this.powerUps = {
            speed: { active: false, timer: 0 },
            magnet: { active: false, timer: 0 }
        };
    }
    
    update(keys) {
        // Update power-up timers
        this.updatePowerUps();
        
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
    
    updatePowerUps() {
        // Update speed power-up
        if (this.powerUps.speed.active) {
            this.powerUps.speed.timer--;
            this.speed = this.baseSpeed * 2; // Double speed
            if (this.powerUps.speed.timer <= 0) {
                this.powerUps.speed.active = false;
                this.speed = this.baseSpeed;
            }
        }
        
        // Update magnet power-up
        if (this.powerUps.magnet.active) {
            this.powerUps.magnet.timer--;
            if (this.powerUps.magnet.timer <= 0) {
                this.powerUps.magnet.active = false;
            }
        }
    }
    
    activatePowerUp(type, duration) {
        if (this.powerUps[type]) {
            this.powerUps[type].active = true;
            this.powerUps[type].timer = duration;
        }
    }
    
    draw(ctx) {
        // Draw speed trail if speed boost is active
        if (this.powerUps.speed.active && (this.lastMoveX !== 0 || this.lastMoveY !== 0)) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            for (let i = 1; i <= 3; i++) {
                const trailX = this.x - this.lastMoveX * i * 2;
                const trailY = this.y - this.lastMoveY * i * 2;
                ctx.beginPath();
                ctx.arc(trailX, trailY, this.radius * (1 - i * 0.2), 0, Math.PI * 2);
                ctx.fill();
            }
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
        
        // Draw power-up indicators
        this.drawPowerUpIndicators(ctx);
    }
    
    drawPowerUpIndicators(ctx) {
        let indicatorY = this.y - this.radius - 10;
        
        if (this.powerUps.speed.active) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', this.x, indicatorY);
            indicatorY -= 15;
        }
        
        if (this.powerUps.magnet.active) {
            ctx.fillStyle = '#00BFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🧲', this.x, indicatorY);
        }
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