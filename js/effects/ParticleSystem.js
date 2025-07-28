// ParticleSystem class - Manages visual particle effects
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    update() {
        // Update all particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.size *= particle.decay;
            
            // Apply gravity for some particle types
            if (particle.gravity) {
                particle.vy += 0.1;
            }
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.life > 0 && particle.size > 0.1);
    }
    
    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    createGoalExplosion(x, y) {
        const colors = [
            { r: 255, g: 215, b: 0 },   // Gold
            { r: 255, g: 69, b: 0 },    // Red-Orange
            { r: 255, g: 140, b: 0 },   // Dark Orange
            { r: 255, g: 255, b: 0 },   // Yellow
            { r: 255, g: 20, b: 147 }   // Deep Pink
        ];
        
        // Create explosion particles
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                life: 60 + Math.random() * 60,
                maxLife: 60 + Math.random() * 60,
                decay: 0.98,
                color: color,
                gravity: false
            });
        }
        
        // Create sparkle particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                life: 90,
                maxLife: 90,
                decay: 0.99,
                color: { r: 255, g: 255, b: 255 }, // White sparkles
                gravity: false
            });
        }
    }
    
    createPowerUpCollection(x, y, powerUpType) {
        let colors;
        
        switch (powerUpType) {
            case 'speed':
                colors = [{ r: 255, g: 215, b: 0 }]; // Gold
                break;
            case 'biggoal':
                colors = [{ r: 255, g: 105, b: 180 }]; // Hot Pink
                break;
            case 'magnet':
                colors = [{ r: 0, g: 191, b: 255 }]; // Deep Sky Blue
                break;
            default:
                colors = [{ r: 255, g: 255, b: 255 }]; // White
        }
        
        // Create collection burst
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                life: 45,
                maxLife: 45,
                decay: 0.97,
                color: colors[0],
                gravity: false
            });
        }
    }
    
    createBallImpact(x, y, intensity = 1) {
        const particleCount = Math.floor(5 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2 * intensity;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                life: 20,
                maxLife: 20,
                decay: 0.95,
                color: { r: 255, g: 255, b: 255 }, // White
                gravity: false
            });
        }
    }
    
    createCelebrationFireworks(x, y) {
        // Create multiple firework bursts
        for (let burst = 0; burst < 3; burst++) {
            setTimeout(() => {
                const colors = [
                    { r: 255, g: 0, b: 0 },     // Red
                    { r: 0, g: 255, b: 0 },     // Green
                    { r: 0, g: 0, b: 255 },     // Blue
                    { r: 255, g: 255, b: 0 },   // Yellow
                    { r: 255, g: 0, b: 255 },   // Magenta
                    { r: 0, g: 255, b: 255 }    // Cyan
                ];
                
                const burstX = x + (Math.random() - 0.5) * 200;
                const burstY = y + (Math.random() - 0.5) * 100;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                for (let i = 0; i < 25; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 4;
                    
                    this.particles.push({
                        x: burstX,
                        y: burstY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 2 + Math.random() * 3,
                        life: 60,
                        maxLife: 60,
                        decay: 0.98,
                        color: color,
                        gravity: true
                    });
                }
            }, burst * 200);
        }
    }
    
    createSpeedTrail(x, y, vx, vy) {
        // Create trail particles for speed boost
        if (Math.random() < 0.3) { // Not every frame
            this.particles.push({
                x: x - vx * 2,
                y: y - vy * 2,
                vx: 0,
                vy: 0,
                size: 3 + Math.random() * 2,
                life: 15,
                maxLife: 15,
                decay: 0.9,
                color: { r: 255, g: 215, b: 0 }, // Gold
                gravity: false
            });
        }
    }
    
    clear() {
        this.particles = [];
    }
    
    getParticleCount() {
        return this.particles.length;
    }
}