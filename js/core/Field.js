// Field class - Soccer field rendering and layout
class Field {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.goalWidth = 30;
        this.goalHeight = 150;
        this.goalY = (height - this.goalHeight) / 2;
        this.bigGoalMultiplier = 1;
    }
    
    setBigGoals(isActive) {
        this.bigGoalMultiplier = isActive ? 1.5 : 1;
    }
    
    getGoalDimensions() {
        return {
            width: this.goalWidth,
            height: this.goalHeight * this.bigGoalMultiplier,
            y: this.goalY - ((this.goalHeight * this.bigGoalMultiplier - this.goalHeight) / 2)
        };
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
        
        const goalDimensions = this.getGoalDimensions();
        
        // Add glow effect for big goals
        if (this.bigGoalMultiplier > 1) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
        }
        
        // Left goal
        ctx.beginPath();
        ctx.rect(20, goalDimensions.y, goalDimensions.width, goalDimensions.height);
        ctx.stroke();
        
        // Right goal
        ctx.beginPath();
        ctx.rect(this.width - 50, goalDimensions.y, goalDimensions.width, goalDimensions.height);
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
}