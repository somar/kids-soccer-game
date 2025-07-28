// AchievementSystem class - Tracks and manages game achievements
class AchievementSystem {
    constructor() {
        this.achievements = {
            'first-goal': {
                name: 'First Goal!',
                description: 'Score your very first goal',
                icon: '⚽',
                unlocked: false,
                condition: (stats) => stats.playerGoals >= 1
            },
            'hat-trick': {
                name: 'Hat Trick Hero',
                description: 'Score 3 goals in one game',
                icon: '🎩',
                unlocked: false,
                condition: (stats) => stats.consecutiveGoals >= 3
            },
            'speed-demon': {
                name: 'Speed Demon',
                description: 'Use 5 speed power-ups',
                icon: '⚡',
                unlocked: false,
                condition: (stats) => stats.speedPowerUpsUsed >= 5
            },
            'keeper-king': {
                name: 'Goalkeeper King',
                description: 'Win a game without letting AI score',
                icon: '🥅',
                unlocked: false,
                condition: (stats) => stats.playerGoals >= 3 && stats.aiGoals === 0
            },
            'marathon': {
                name: 'Marathon Player',
                description: 'Play for 10 minutes total',
                icon: '⏰',
                unlocked: false,
                condition: (stats) => stats.totalPlayTime >= 36000 // 10 minutes at 60fps
            },
            'power-collector': {
                name: 'Power Collector',
                description: 'Collect 10 power-ups',
                icon: '💎',
                unlocked: false,
                condition: (stats) => stats.powerUpsCollected >= 10
            },
            'goal-machine': {
                name: 'Goal Machine',
                description: 'Score 25 total goals',
                icon: '🚀',
                unlocked: false,
                condition: (stats) => stats.totalGoals >= 25
            },
            'perfect-game': {
                name: 'Perfect Game',
                description: 'Score 5 goals without missing',
                icon: '🌟',
                unlocked: false,
                condition: (stats) => stats.perfectGameGoals >= 5
            }
        };
        
        this.stats = {
            playerGoals: 0,
            aiGoals: 0,
            consecutiveGoals: 0,
            totalGoals: 0,
            totalPlayTime: 0,
            powerUpsCollected: 0,
            speedPowerUpsUsed: 0,
            perfectGameGoals: 0,
            lastGoalScorer: null
        };
        
        this.notifications = [];
        this.loadProgress();
    }
    
    update() {
        this.stats.totalPlayTime++;
        this.updateNotifications();
    }
    
    recordGoal(scorer) {
        if (scorer === 'player') {
            this.stats.playerGoals++;
            this.stats.totalGoals++;
            
            if (this.stats.lastGoalScorer === 'player') {
                this.stats.consecutiveGoals++;
                this.stats.perfectGameGoals++;
            } else {
                this.stats.consecutiveGoals = 1;
                this.stats.perfectGameGoals = 1;
            }
        } else {
            this.stats.aiGoals++;
            this.stats.consecutiveGoals = 0;
            this.stats.perfectGameGoals = 0; // Reset perfect game on AI goal
        }
        
        this.stats.lastGoalScorer = scorer;
        this.checkAchievements();
    }
    
    recordPowerUpCollection(type) {
        this.stats.powerUpsCollected++;
        if (type === 'speed') {
            this.stats.speedPowerUpsUsed++;
        }
        this.checkAchievements();
    }
    
    checkAchievements() {
        Object.keys(this.achievements).forEach(id => {
            const achievement = this.achievements[id];
            if (!achievement.unlocked && achievement.condition(this.stats)) {
                this.unlockAchievement(id);
            }
        });
    }
    
    unlockAchievement(id) {
        this.achievements[id].unlocked = true;
        this.notifications.push({
            achievement: this.achievements[id],
            timer: 300, // 5 seconds at 60fps
            slideIn: 0
        });
        this.saveProgress();
    }
    
    updateNotifications() {
        this.notifications.forEach(notification => {
            if (notification.slideIn < 30) {
                notification.slideIn++;
            }
            notification.timer--;
        });
        
        this.notifications = this.notifications.filter(notification => notification.timer > 0);
    }
    
    draw(ctx, canvasWidth, canvasHeight) {
        // Draw achievement notifications
        this.notifications.forEach((notification, index) => {
            const slideProgress = Math.min(notification.slideIn / 30, 1);
            const easeOut = 1 - Math.pow(1 - slideProgress, 3); // Cubic ease-out
            
            const notificationWidth = 280;
            const notificationHeight = 60;
            const targetX = canvasWidth - notificationWidth - 20;
            const startX = canvasWidth;
            const currentX = startX + (targetX - startX) * easeOut;
            const y = 120 + index * (notificationHeight + 10);
            
            // Background
            ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
            ctx.fillRect(currentX, y, notificationWidth, notificationHeight);
            
            // Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(currentX, y, notificationWidth, notificationHeight);
            
            // Icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            ctx.fillText(notification.achievement.icon, currentX + 30, y + 35);
            
            // Text
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Achievement Unlocked!', currentX + 60, y + 20);
            
            ctx.font = '14px Arial';
            ctx.fillText(notification.achievement.name, currentX + 60, y + 40);
        });
        
        // Draw achievement progress indicator
        this.drawProgressIndicator(ctx, canvasWidth);
    }
    
    drawProgressIndicator(ctx, canvasWidth) {
        const totalAchievements = Object.keys(this.achievements).length;
        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvasWidth - 200, 20, 180, 30);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Achievements: ${unlockedCount}/${totalAchievements}`, canvasWidth - 110, 40);
    }
    
    saveProgress() {
        try {
            const saveData = {
                achievements: this.achievements,
                stats: this.stats
            };
            localStorage.setItem('kidsSoccerAchievements', JSON.stringify(saveData));
        } catch (error) {
            console.log('Could not save achievement progress');
        }
    }
    
    loadProgress() {
        try {
            const saveData = localStorage.getItem('kidsSoccerAchievements');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                
                // Merge saved achievements with current structure (in case new achievements were added)
                Object.keys(parsed.achievements || {}).forEach(id => {
                    if (this.achievements[id]) {
                        this.achievements[id].unlocked = parsed.achievements[id].unlocked;
                    }
                });
                
                // Merge saved stats
                this.stats = { ...this.stats, ...(parsed.stats || {}) };
            }
        } catch (error) {
            console.log('Could not load achievement progress');
        }
    }
    
    reset() {
        // Reset current game stats but keep total progress
        this.stats.playerGoals = 0;
        this.stats.aiGoals = 0;
        this.stats.consecutiveGoals = 0;
        this.stats.perfectGameGoals = 0;
        this.stats.lastGoalScorer = null;
    }
    
    getUnlockedCount() {
        return Object.values(this.achievements).filter(a => a.unlocked).length;
    }
    
    getTotalCount() {
        return Object.keys(this.achievements).length;
    }
    
    getAchievements() {
        return this.achievements;
    }
    
    getStats() {
        return this.stats;
    }
}