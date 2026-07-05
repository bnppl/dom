# Shadow Club Runner (Prototype)

This repository now contains the first playable slice of a mystery-themed side-scroller game for kids.

## Current Features

- Side-scroller movement:
  - Left arrow: move left
  - Right arrow: move right
  - Up arrow: jump
  - Down arrow: roll
- Polished platformer controls inspired by popular side-scroller design patterns:
	- Smoother acceleration and deceleration
	- Coyote time and jump buffering for forgiving jumps
	- Variable jump height (tap vs hold up)
- Start menu skin selection
- Unlockable skins using collected Mystery Keys
- Save progress in browser local storage
- Mystery-themed world with platforms and collectible keys
- Hazard gameplay loop:
	- Roll under low lasers
	- Jump over spike traps
	- Checkpoints and respawn system
	- Combo system and bonus key rewards

## Run Locally

1. Start a local server:

	```bash
	python3 -m http.server 8080
	```

2. Open in your browser:

	```
	http://localhost:8080
	```

3. Click **Start Mission** and play.

## Files

- `index.html`: game layout and menu UI
- `style.css`: visual style and responsive layout
- `game.js`: core game loop, player controls, skins, unlocks, and rendering