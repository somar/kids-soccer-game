import pygame
import math

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.radius = 20
        self.speed = 5
        self.color = (0, 100, 255)
        self.last_move_x = 0
        self.last_move_y = 0
        
    def update(self, keys):
        dx = 0
        dy = 0
        
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx = -self.speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx = self.speed
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            dy = -self.speed
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy = self.speed
        
        # Update position with boundary checking
        new_x = self.x + dx
        new_y = self.y + dy
        
        # Keep player within field bounds
        if 40 <= new_x <= 760:
            self.x = new_x
        if 40 <= new_y <= 560:
            self.y = new_y
            
        self.last_move_x = dx
        self.last_move_y = dy
    
    def draw(self, screen):
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.radius)
        # Draw a simple face
        eye_offset = 6
        pygame.draw.circle(screen, (255, 255, 255), (int(self.x - eye_offset), int(self.y - 5)), 3)
        pygame.draw.circle(screen, (255, 255, 255), (int(self.x + eye_offset), int(self.y - 5)), 3)
        pygame.draw.circle(screen, (0, 0, 0), (int(self.x - eye_offset), int(self.y - 5)), 1)
        pygame.draw.circle(screen, (0, 0, 0), (int(self.x + eye_offset), int(self.y - 5)), 1)
    
    def collides_with(self, ball):
        distance = math.sqrt((self.x - ball.x) ** 2 + (self.y - ball.y) ** 2)
        return distance < self.radius + ball.radius
    
    def get_kick_direction(self):
        if self.last_move_x == 0 and self.last_move_y == 0:
            return (1, 0)  # Default kick right
        
        # Normalize the movement direction
        length = math.sqrt(self.last_move_x ** 2 + self.last_move_y ** 2)
        if length == 0:
            return (1, 0)
        
        return (self.last_move_x / length, self.last_move_y / length)