import pygame
import math

class Ball:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.radius = 12
        self.color = (255, 255, 255)
        self.shadow_color = (200, 200, 200)
        self.vx = 0
        self.vy = 0
        self.friction = 0.95
        self.bounce_damping = 0.7
        
    def update(self):
        # Apply friction
        self.vx *= self.friction
        self.vy *= self.friction
        
        # Stop very slow movement
        if abs(self.vx) < 0.1:
            self.vx = 0
        if abs(self.vy) < 0.1:
            self.vy = 0
        
        # Update position
        self.x += self.vx
        self.y += self.vy
        
        # Bounce off walls
        if self.x - self.radius <= 20 or self.x + self.radius >= 780:
            self.vx = -self.vx * self.bounce_damping
            if self.x - self.radius <= 20:
                self.x = 20 + self.radius
            else:
                self.x = 780 - self.radius
                
        if self.y - self.radius <= 20 or self.y + self.radius >= 580:
            self.vy = -self.vy * self.bounce_damping
            if self.y - self.radius <= 20:
                self.y = 20 + self.radius
            else:
                self.y = 580 - self.radius
    
    def kick(self, direction):
        kick_power = 8
        self.vx = direction[0] * kick_power
        self.vy = direction[1] * kick_power
    
    def draw(self, screen):
        # Draw shadow
        shadow_offset = 3
        pygame.draw.circle(screen, self.shadow_color, 
                         (int(self.x + shadow_offset), int(self.y + shadow_offset)), 
                         self.radius)
        
        # Draw ball
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.radius)
        
        # Draw soccer ball pattern
        pygame.draw.circle(screen, (0, 0, 0), (int(self.x), int(self.y)), self.radius, 2)
        # Simple pentagon pattern
        for i in range(5):
            angle = i * math.pi * 2 / 5
            x_offset = math.cos(angle) * (self.radius // 2)
            y_offset = math.sin(angle) * (self.radius // 2)
            pygame.draw.circle(screen, (0, 0, 0), 
                             (int(self.x + x_offset), int(self.y + y_offset)), 2)