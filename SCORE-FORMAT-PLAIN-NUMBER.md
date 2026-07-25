# Fix: Score Display Format - Remove Comma Separators

## Change Summary

Đổi format điểm số từ có dấu phẩy (1,421,312) sang số thuần (1421312) theo yêu cầu.

## Before vs After

### Before
```typescript
export function formatScore(score: number): string {
  return score.toLocaleString('en-US'); // 1,421,312
}
```

**Display:**
- Score: 1,421,312
- High Score: 2,500,000
- With comma separators

### After
```typescript
export function formatScore(score: number): string {
  return score.toString(); // 1421312
}
```

**Display:**
- Score: 1421312
- High Score: 2500000
- Plain numbers only

## Files Changed

**`src/utils/formatScore.ts`**
- Changed from `score.toLocaleString('en-US')` to `score.toString()`
- Updated comment to reflect plain number display

## Impact Locations

Function `formatScore()` được sử dụng ở:
- `GameHeader.tsx` - Score & high score display
- `GameOverModal.tsx` - Final score & best score
- `NewRoundTransition.tsx` - Last round score
- `ScoreDisplay.tsx` - Score components
- `ScorePopup.tsx` - Combo feedback
- `FeedbackOverlay.tsx` - Score feedback
- `NewHighScoreEffect.tsx` - High score celebration
- `HomeScreen.tsx` - Leaderboard/stats

All locations sẽ tự động hiển thị số thuần không có dấu phẩy.

## Rationale

**User Preference:**
- Cleaner, simpler number display
- Easier to read at a glance
- Matches many game UIs (especially mobile games)
- No localization confusion

**Visual Impact:**
- More compact display
- Modern minimalist aesthetic
- Consistent across all score displays
