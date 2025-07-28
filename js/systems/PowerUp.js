// PowerUp class - Collectible power-ups with different effects
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
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.floatOffset, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw power-up icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = powerUpData.color;
        ctx.fillText(powerUpData.icon, this.x, this.y + this.floatOffset);
    }
    
    collidesWith(player) {
        if (this.collected) return false;
        const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
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

// PowerUpManager class - Manages spawning and collection of power-ups
class PowerUpManager {
    constructor() {
        this.powerUps = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1800; // 30 seconds at 60fps
        this.activePowerUps = {};
        this.powerUpTypes = ['speed', 'biggoal', 'magnet'];
    }
    
    update(player, field) {
        // Update existing power-ups
        this.powerUps.forEach(powerUp => powerUp.update());
        
        // Remove collected power-ups
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.collected);
        
        // Update active power-up timers
        Object.keys(this.activePowerUps).forEach(type => {
            this.activePowerUps[type].timer--;
            if (this.activePowerUps[type].timer <= 0) {
                this.deactivatePowerUp(type, field);
            }
        });
        
        // Spawn new power-ups
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval && this.powerUps.length < 2) {
            this.spawnPowerUp();
            this.spawnTimer = 0;
        }
        
        // Check for collections
        this.powerUps.forEach(powerUp => {
            if (powerUp.collidesWith(player)) {
                const powerUpData = powerUp.collect();
                this.activatePowerUp(powerUpData, player, field);
                return powerUpData; // For audio/visual feedback
            }
        });
    }
    
    spawnPowerUp() {
        // Random position avoiding goals and center
        let x, y;
        do {
            x = 100 + Math.random() * 600;
            y = 100 + Math.random() * 400;
        } while (
            (x < 150 && (y < 150 || y > 450)) || // Left goal area
            (x > 650 && (y < 150 || y > 450)) || // Right goal area
            (Math.abs(x - 400) < 100 && Math.abs(y - 300) < 100) // Center area
        );
        
        const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        this.powerUps.push(new PowerUp(x, y, type));
    }
    
    activatePowerUp(powerUpData, player, field) {
        this.activePowerUps[powerUpData.type] = {
            timer: powerUpData.duration,
            description: powerUpData.description
        };
        
        switch (powerUpData.type) {
            case 'speed':
                player.activatePowerUp('speed', powerUpData.duration);
                break;
            case 'biggoal':
                field.setBigGoals(true);
                break;
            case 'magnet':
                player.activatePowerUp('magnet', powerUpData.duration);
                break;
        }
    }
    
    deactivatePowerUp(type, field) {
        switch (type) {
            case 'biggoal':
                field.setBigGoals(false);
                break;
        }
        delete this.activePowerUps[type];
    }
    
    draw(ctx) {
        this.powerUps.forEach(powerUp => powerUp.draw(ctx));
    }
    
    drawUI(ctx, canvasWidth) {
        // Draw active power-up indicators
        let indicatorX = canvasWidth - 150;
        const indicatorY = 80;
        
        Object.keys(this.activePowerUps).forEach((type, index) => {
            const powerUp = this.activePowerUps[type];
            const timeLeft = Math.ceil(powerUp.timer / 60); // Convert to seconds
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(indicatorX, indicatorY + index * 25, 140, 20);
            
            // Icon and text
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            
            let icon = '';
            switch (type) {
                case 'speed': icon = '⚡'; break;
                case 'biggoal': icon = '🥅'; break;
                case 'magnet': icon = '🧲'; break;
            }
            
            ctx.fillText(`${icon} ${timeLeft}s`, indicatorX + 5, indicatorY + index * 25 + 15);
        });
    }
    
    getActivePowerUps() {
        return this.activePowerUps;
    }
    
    reset() {
        this.powerUps = [];
        this.activePowerUps = {};
        this.spawnTimer = 0;
    }
}