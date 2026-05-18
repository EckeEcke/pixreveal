# PixReveal

PixReveal is a pixel-based image guessing game. A pixel art is revealed pixel by pixel. The faster you guess the more points you earn. 
Play live at: https://pixreveal.com

## Party Multiplayer

The core of PixReveal is its local party multipalyer in Jackbox style.
- host the game on the big screen, players control via smartphone
- use powerups to sabotage your friends
- social features: send emote reactions to the big screen, earn many different player titles depending on your play 
- robot moderator to add more character to the game
- lobby chat for real-time communication
- additionally regular online multiplayer let's you play with your friends remotely

## Singleplayer

PixReveal provides 5 different singleplayer game modes:
- Classic: pixels plopping up
- Gravity: pixels dropping down Tetris style
- Inspect: use a lens to inspect the dark canvas
- Buzzer: hit the buzzer to see answer options
- Survival: highscore challenge, how many drawings can you guess before time runs out

## Daily challenge
- new set of drawings every day
- global leaderboard for the daily challenge
- varying game modes

## Editor and user generated content
- pixel art editor to create your own pixel art
- submit your art to be playable in the game (after approval, to keep TTP high)
- activate/deactivate user generated content in the settings

## General settings
- set round length and round amount
- turn sound and music on/off
- activate fullscreen mode
- turn user generated content on/off
- category filter to adjust the drawing set to your likings

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- Apinator.io client/server packages
- Hosted on Vercel

## Local Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Preview Production Build

```sh
npm run preview
```
