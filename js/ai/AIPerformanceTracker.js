// AIPerformanceTracker class - Tracks player performance for adaptive difficulty
class AIPerformanceTracker {
    constructor() {
        this.playerGoals = 0;
        this.aiGoals = 0;
        this.gameTime = 0;
        this.ballPossessionTime = 0;
        this.adaptiveDifficulty = true;
        this.currentDifficulty = 0.5; // 0.0 = easiest, 1.0 = hardest
        this.performanceHistory = [];
        this.targetWinRate = 0.4; // AI should win about 40% of the time
    }
    
    recordGoal(scorer) {
        if (scorer === 'player') {
            this.playerGoals++;
        } else {
            this.aiGoals++;
        }
        this.updateDifficulty();
    }
    
    updateGameTime() {
        this.gameTime++;
    }
    
    updateBallPossession(hasPlayerPossession) {
        if (hasPlayerPossession) {
            this.ballPossessionTime++;
        }
    }
    
    updateDifficulty() {
        if (!this.adaptiveDifficulty) return;
        
        const totalGoals = this.playerGoals + this.aiGoals;
        if (totalGoals === 0) return;
        
        const aiWinRate = this.aiGoals / totalGoals;
        const adjustment = (this.targetWinRate - aiWinRate) * 0.1;
        
        this.currentDifficulty = Math.max(0.1, Math.min(0.9, this.currentDifficulty + adjustment));
        
        // Store performance data
        this.performanceHistory.push({
            difficulty: this.currentDifficulty,
            aiWinRate: aiWinRate,
            timestamp: Date.now()
        });
        
        // Keep only last 10 data points
        if (this.performanceHistory.length > 10) {
            this.performanceHistory.shift();
        }
    }
    
    getDifficultyLevel() {
        return this.currentDifficulty;
    }
    
    getSkillLevel() {
        if (this.currentDifficulty < 0.3) return 'Beginner';
        if (this.currentDifficulty < 0.6) return 'Intermediate';
        if (this.currentDifficulty < 0.8) return 'Advanced';
        return 'Expert';
    }
    
    setAdaptiveDifficulty(enabled) {
        this.adaptiveDifficulty = enabled;
    }
    
    reset() {
        this.playerGoals = 0;
        this.aiGoals = 0;
        this.gameTime = 0;
        this.ballPossessionTime = 0;
    }
    
    getStats() {
        return {
            playerGoals: this.playerGoals,
            aiGoals: this.aiGoals,
            gameTime: this.gameTime,
            skillLevel: this.getSkillLevel(),
            difficulty: Math.round(this.currentDifficulty * 100)
        };
    }
}