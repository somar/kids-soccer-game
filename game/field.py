import pygame

class Field:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.line_color = (255, 255, 255)
        self.goal_color = (255, 255, 0)
        
    def draw(self, screen):
        # Center circle
        pygame.draw.circle(screen, self.line_color, (self.width // 2, self.height // 2), 80, 3)
        
        # Center line
        pygame.draw.line(screen, self.line_color, (self.width // 2, 0), (self.width // 2, self.height), 3)
        
        # Field borders
        pygame.draw.rect(screen, self.line_color, (20, 20, self.width - 40, self.height - 40), 3)
        
        # Goals
        goal_width = 100
        goal_height = 150
        
        # Left goal
        left_goal_y = (self.height - goal_height) // 2
        pygame.draw.rect(screen, self.goal_color, (20, left_goal_y, 30, goal_height), 3)
        
        # Right goal
        right_goal_y = (self.height - goal_height) // 2
        pygame.draw.rect(screen, self.goal_color, (self.width - 50, right_goal_y, 30, goal_height), 3)