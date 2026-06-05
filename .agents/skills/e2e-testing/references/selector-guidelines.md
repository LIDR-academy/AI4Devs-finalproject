# E2E Selector Guidelines
- **Stable Selectors:** Prioritize `data-testid` attributes (e.g., `[data-testid="submit-btn"]`) over CSS classes or tag names.
- **No DOM Pathing:** Avoid selecting by deep DOM hierarchy (e.g., `div > span > button`) as they break easily.
- **Readable Selectors:** Keep test selectors clear and self-documenting.
