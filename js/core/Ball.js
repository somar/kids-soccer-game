// Ball class - Soccer ball with physics
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.95;
        this.bounceDamping = 0.7;
        this.trailParticles = [];
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
        
        // Create trail particles for fast movement
        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > 3) {
            this.trailParticles.push({
                x: this.x,
                y: this.y,
                life: 20,
                maxLife: 20,
                size: this.radius * 0.6
            });
        }
        
        // Update trail particles
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.life--;
            return particle.life > 0;
        });
        
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
    
    applyMagnetism(playerX, playerY, magnetStrength = 0.3) {
        const distance = Math.sqrt((playerX - this.x) ** 2 + (playerY - this.y) ** 2);
        if (distance > 5 && distance < 100) { // Only apply within range
            const dirX = (playerX - this.x) / distance;
            const dirY = (playerY - this.y) / distance;
            this.vx += dirX * magnetStrength;
            this.vy += dirY * magnetStrength;
        }
    }
    
    draw(ctx) {
        // Draw trail particles
        this.trailParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
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