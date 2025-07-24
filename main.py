import pygame
import sys
from game.field import Field
from game.player import Player
from game.ball import Ball

pygame.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

GREEN = (34, 139, 34)
WHITE = (255, 255, 255)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Kids Soccer Game!")
        self.clock = pygame.time.Clock()
        self.running = True
        
        self.field = Field(SCREEN_WIDTH, SCREEN_HEIGHT)
        self.player = Player(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)
        self.ball = Ball(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50)
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
    
    def update(self):
        keys = pygame.key.get_pressed()
        self.player.update(keys)
        self.ball.update()
        
        if self.player.collides_with(self.ball):
            self.ball.kick(self.player.get_kick_direction())
    
    def draw(self):
        self.screen.fill(GREEN)
        self.field.draw(self.screen)
        self.player.draw(self.screen)
        self.ball.draw(self.screen)
        pygame.display.flip()
    
    def run(self):
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()