# Board Collapse Transition

## Goal
After game over recap, restore the losing board and play a cascade “blocks fall” effect before spawning a fresh round.

## Design choices
- Recap modal stays ~1.1s over the losing board
- Filled cells cascade fall (top→bottom stagger, slight rotate/drift)
- Tray fades with the collapse
- Then reset + spawn new round
- Persist board snapshot in `lastGameOver` so Home → Classic still shows the lost board

## Tasks
1. Extend `LastGameOverResult` + `NewRoundPhase` (`falling`)
2. Snapshot/restore grid, colors, pieces in store
3. Animate `GameBoard` cells + tray on `falling`
4. Retime `NewRoundTransition` / `GameScreen`
5. Tune `ANIMATION` constants

## Verify
- Play until game over → Play Again → see board → fall → new pieces
- Home after loss → Classic → same sequence with restored board
