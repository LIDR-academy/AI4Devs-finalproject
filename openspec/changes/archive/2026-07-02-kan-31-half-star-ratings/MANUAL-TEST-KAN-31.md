# Manual test — KAN-31 Half-star ratings

**Branch:** `feature/KAN-31-half-star-ratings`  
**Requires:** backend + frontend running, DB migrated (`npm run migration:run` in `backend`)

## Book Tracker — inline rating

- [ ] Open Book Tracker; pick a **Leído** book with the rating column visible
- [ ] Click the **left half** of the 4th star → rating saves as **3.5** and displays a half-filled 4th star
- [ ] Click the **right half** of the 5th star → rating updates to **5**
- [ ] Refresh the page → rating persists as **5**

## Completion modal

- [ ] Mark a book **Leído** (or use one that opens the completion modal)
- [ ] In the modal, select **2.5** stars (left half of 3rd star)
- [ ] Save → row shows **2.5** with correct half-star display

## Keyboard accessibility

- [ ] Tab to a star half-button; **ArrowRight** increases by **0.5**, **ArrowLeft** decreases by **0.5**
- [ ] **Home** sets **0.5**, **End** sets **5**
- [ ] Screen reader / accessible name includes value (e.g. “3.5 out of 5 stars”)

## Reading Stats

- [ ] With at least two rated books including a half-star (e.g. **4** and **3.5**), open `/stats`
- [ ] **Valoración media** KPI shows **3.75** (or correct average for your data)

## API (optional curl)

```bash
# Replace TOKEN and BOOK_ID
curl -s -X PATCH "http://localhost:3000/v1/books/BOOK_ID/reading-record" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":3.5}' | jq .reading.rating
# Expected: 3.5

curl -s -X PATCH "http://localhost:3000/v1/books/BOOK_ID/reading-record" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":3.3}' 
# Expected: 400
```
