# UI Mockup - Template Comparison Feature

## Page Layout: CreateComparisonPage

### 1. Selection Form (Top Section)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         Compare Template Versions                          │
│                                                                            │
│  Select two template versions to compare and analyze the differences      │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬─────────────────────────────┐
│      SOURCE VERSION         │      TARGET VERSION         │
├─────────────────────────────┼─────────────────────────────┤
│                             │                             │
│  [Template Dropdown ▼]      │  [Template Dropdown ▼]      │
│  Solicitud Prestación...    │  Solicitud Prestación...    │
│                             │                             │
│  [Version Dropdown ▼]       │  [Version Dropdown ▼]       │
│  2024-Q1                    │  2024-Q2                    │
│                             │                             │
│  📄 Version: 2024-Q1        │  📄 Version: 2024-Q2        │
│  📅 Created: Jan 15, 2024   │  📅 Created: Apr 20, 2024   │
│  📊 48 fields, 5 pages      │  📊 52 fields, 6 pages      │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘

        ⚠️  Templates are identical. Nothing to compare.
              (shown only if source_id == target_id)

                   [ Execute Comparison ]
                          (button)
```

### 2. Global Metrics Cards (After Comparison)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          Comparison Results                                │
│                      2024-Q1 → 2024-Q2                                     │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Page Count   │ Field Count  │ Changes      │ Modified     │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  5 → 6       │  48 → 52     │ ✅ 4 Added   │   14.58%     │
│  ⚠️ Changed  │  ⚠️ Changed  │ ❌ 0 Removed │              │
│              │              │ 🔄 3 Modified│  ████░░░░░░  │
│              │              │ ✓ 45 Same    │  (progress)  │
└──────────────┴──────────────┴──────────────┴──────────────┘

Version Timeline:
Source: Jan 15, 2024 ────────────────────▶ Target: Apr 20, 2024
                      (3 months, 5 days)
```

### 3. Filter Buttons

```
Show:  [ All (52) ]  [ Added (4) ]  [ Removed (0) ]  [ Modified (3) ]  [ Unchanged (45) ]
       ───────────   ────────────   ──────────────   ────────────────   ──────────────────
        (active)      (clickable)     (disabled)        (clickable)        (clickable)
```

### 4. Field Changes Table

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Field ID          │Status    │Src Page│Tgt Page│Near Text Diff│Value Options│Position Change  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ NOMBRE_SOLICITANTE│UNCHANGED │   1    │   1    │   EQUAL ✓    │  N/A        │    EQUAL ✓      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIPO_PRESTACION   │MODIFIED  │   2    │   2    │   EQUAL ✓    │ DIFFERENT ⚠️│    EQUAL ✓      │
│                   │  🔄      │        │        │              │   [Details ▼]│                 │
│                   │          │        │        │              │ Source: [   ]│                 │
│                   │          │        │        │              │ - Contributiv│                 │
│                   │          │        │        │              │ - Asistencial│                 │
│                   │          │        │        │              │ Target: [   ]│                 │
│                   │          │        │        │              │ - Contributiv│                 │
│                   │          │        │        │              │ - Asistencial│                 │
│                   │          │        │        │              │ + Subsidio ag│                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ACEPTA_CONDICIONES│MODIFIED  │   5    │   6    │ DIFFERENT ⚠️ │  N/A        │ DIFFERENT ⚠️    │
│                   │  🔄      │        │        │   [Details ▼]│             │   [Details ▼]   │
│                   │          │        │        │ Source:      │             │ Source:         │
│                   │          │        │        │ "Acepto las  │             │ X: 50, Y: 700   │
│                   │          │        │        │  condiciones"│             │                 │
│                   │          │        │        │ Target:      │             │ Target:         │
│                   │          │        │        │ "Acepto las  │             │ X: 50, Y: 750   │
│                   │          │        │        │  condiciones │             │                 │
│                   │          │        │        │  y política  │             │                 │
│                   │          │        │        │  de privac..." │           │                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CONSENTIMIENTO_   │ADDED     │   -    │   6    │     N/A      │  N/A        │     N/A         │
│ RGPD              │  ✅      │        │        │              │             │                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CAMPO_OBSOLETO    │REMOVED   │   4    │   -    │     N/A      │  N/A        │     N/A         │
│                   │  ❌      │        │        │              │             │                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

                            [ ◀ Previous ]  Page 1 of 2  [ Next ▶ ]
```

## Color Scheme

### Status Colors

```css
/* Light Mode */
.status-added {
  background: #dcfce7;
  color: #166534;
} /* Green */
.status-removed {
  background: #fee2e2;
  color: #991b1b;
} /* Red */
.status-modified {
  background: #fed7aa;
  color: #9a3412;
} /* Orange */
.status-unchanged {
  background: #f3f4f6;
  color: #4b5563;
} /* Gray */

/* Dark Mode */
.dark .status-added {
  background: #166534;
  color: #dcfce7;
}
.dark .status-removed {
  background: #991b1b;
  color: #fee2e2;
}
.dark .status-modified {
  background: #9a3412;
  color: #fed7aa;
}
.dark .status-unchanged {
  background: #374151;
  color: #d1d5db;
}
```

### Diff Indicators

```
✓  EQUAL       (Green checkmark)
⚠️  DIFFERENT   (Orange warning)
-  N/A         (Gray dash)
```

## Responsive Breakpoints

### Mobile (< 640px)

- Stack source and target selectors vertically
- Show metrics in 2x2 grid
- Hide some table columns (show only: Field ID, Status, Details button)
- Implement horizontal scroll for table

### Tablet (640px - 1024px)

- Show source and target side-by-side (50/50)
- Show metrics in 4-column grid
- Show essential table columns
- Collapsible detail sections

### Desktop (> 1024px)

- Full layout as shown in mockups
- All columns visible
- Inline detail expansion
- Optimal spacing and padding

## Interactive Elements

### 1. Template Selector

- Dropdown with search/filter
- Shows template name
- Loads versions on selection

### 2. Version Selector

- Dropdown populated based on template selection
- Shows version number and creation date
- Disabled until template is selected

### 3. Execute Comparison Button

- Disabled until both versions selected
- Disabled if versions are identical
- Shows loading spinner during execution
- Changes to "Compare Again" after results shown

### 4. Filter Buttons

- Toggle between All/Added/Removed/Modified/Unchanged
- Shows count for each category
- Grays out buttons with 0 count
- Updates table immediately on click

### 5. Table Rows

- Click to expand/collapse details
- Hover effect for better UX
- Keyboard navigation support (Tab, Enter, Arrow keys)

### 6. Detail Sections

- Expandable/collapsible with animation
- Shows source vs target side-by-side
- Highlights differences with color coding
- Copy button for text values

## Loading States

### During Comparison Execution

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    ⏳ Analyzing...                     │
│                                                        │
│          Comparing 48 fields from 2024-Q1              │
│                      with                              │
│          52 fields from 2024-Q2                        │
│                                                        │
│             [████████░░░░░░░░░░] 60%                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Error States

### Validation Error (Same Versions)

```
┌────────────────────────────────────────────────────────┐
│  ⚠️  Templates are identical. Nothing to compare.      │
│                                                        │
│  Please select two different template versions.        │
└────────────────────────────────────────────────────────┘
```

### API Error

```
┌────────────────────────────────────────────────────────┐
│  ❌  Comparison Failed                                 │
│                                                        │
│  Unable to compare versions. Please try again.         │
│                                                        │
│  Error: Version with ID 999 not found                  │
│                                                        │
│               [ Try Again ]                            │
└────────────────────────────────────────────────────────┘
```

## Empty State (No Results for Filter)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    📭 No Results                       │
│                                                        │
│       No fields match the selected filter.             │
│                                                        │
│        Try selecting a different filter option.        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Accessibility Features

1. **ARIA Labels:**

   - Form controls: `aria-label="Source template selector"`
   - Status badges: `aria-label="Field status: Added"`
   - Interactive elements: `aria-expanded`, `aria-controls`

2. **Keyboard Navigation:**

   - Tab: Navigate through form and table
   - Enter/Space: Expand/collapse details
   - Arrow keys: Navigate table rows
   - Escape: Close expanded details

3. **Screen Reader Support:**

   - Descriptive alt text for icons
   - Live regions for dynamic content updates
   - Proper heading hierarchy (h1, h2, h3)
   - Table headers with scope attributes

4. **Visual Accessibility:**
   - High contrast ratios (4.5:1 minimum)
   - Focus indicators on all interactive elements
   - Color is not the only indicator (icons + text)
   - Readable font sizes (16px minimum)
