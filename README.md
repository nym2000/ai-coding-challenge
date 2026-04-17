# Flashcards Study App

A browser-based flashcard study application built with vanilla HTML, CSS, and JavaScript. Study decks of flashcards with flip animations, keyboard shortcuts, and persistent local storage.

## Features

✅ **Deck Management**
- Create, edit, and delete multiple decks
- Switch between decks with active deck highlighting
- Card count displayed per deck

✅ **Card Management**
- Add, edit, and delete cards within decks
- Cards have front (question) and back (answer) content
- Organize unlimited cards per deck

✅ **Study Mode**
- Flip cards with smooth 3D animation
- Navigate with Previous/Next buttons
- Keyboard shortcuts:
  - `Space` to flip card
  - `←` / `→` to navigate
  - `Esc` to close modals
- Jump to specific card by number
- Shuffle deck for randomized study

✅ **Search & Filter**
- Search cards by keyword (front or back text)
- Case-insensitive search
- Shows filtered count

✅ **Data Persistence**
- All decks and cards auto-saved to browser's LocalStorage
- State persists across page reloads
- Last active deck remembered

✅ **Responsive Design**
- Works on desktop, tablet, and mobile
- Collapsible sidebar on mobile (<768px)
- Touch-friendly buttons and controls

✅ **Accessibility**
- ARIA labels on buttons and inputs
- Semantic HTML structure
- Keyboard-navigable modals with focus management
- Visible focus states on all interactive elements
- Dark mode support via `prefers-color-scheme`
- Reduced motion support

## Getting Started

1. **Open the app:**
   ```
   open index.html
   ```
   Or use any web server (e.g., `python -m http.server 8000`).

2. **Create a deck:**
   - Click "+ New Deck" button
   - Enter a deck name
   - Click "Save Deck"

3. **Add cards:**
   - Select a deck from the sidebar
   - Click "+ New Card"
   - Enter front (question) and back (answer)
   - Click "Save Card"

4. **Study:**
   - Click a deck to view its cards
   - Click the card or press `Space` to flip
   - Use arrow keys or buttons to navigate
   - Shuffle button randomizes card order

5. **Edit or delete:**
   - Use Edit/Delete buttons for decks and cards
   - Confirm action in the confirmation dialog

## File Structure

```
flashcards-app/
├── index.html      # Semantic HTML structure with modals
├── styles.css      # Responsive CSS with dark mode & animations
├── app.js          # Application logic, state management, event handlers
└── README.md       # This file
```

## Technical Details

### State Management
- Centralized `AppState` object with:
  - Decks array (with IDs and names)
  - `cardsByDeckId` object for fast lookups
  - Active deck and card tracking
  - Search and UI state

### Storage
- Custom `Storage` utility with safe JSON serialization
- Fallback handling for corrupted data
- Single source of truth: `localStorage['flashcards_app_state']`

### Architecture
- **Modular design:** Separated concerns into Storage, DeckOps, CardOps, StudyMode, Search, Modal, and UI
- **Event-driven:** Delegated event listeners prevent memory leaks
- **Efficient rendering:** Only re-render affected parts of the DOM
- **No dependencies:** Pure vanilla JS, no frameworks or libraries

### CSS Features
- **CSS Variables** for colors, spacing, and animations
- **CSS Grid** for responsive two-column layout
- **CSS Transform** for 3D flip animation with `perspective` and `backface-visibility`
- **Dark mode** via `@media (prefers-color-scheme: dark)`
- **Reduced motion** support for accessibility

## Browser Compatibility

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Model

```javascript
{
  decks: [
    { id: "abc123", name: "Spanish Vocab", createdAt: 1234567890 }
  ],
  cardsByDeckId: {
    "abc123": [
      { id: "xyz789", front: "Hola", back: "Hello", createdAt: 1234567891 }
    ]
  },
  activeDeckId: "abc123",
  activeCardIndex: 0,
  isCardFlipped: false
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Flip current card |
| `←` | Previous card |
| `→` | Next card |
| `Esc` | Close modal |
| `Click card` | Flip (alternate) |

## Reflection: AI-Assisted Development

### 1. Where AI Saved Time ✅
- **HTML Structure:** AI generated semantic, accessible HTML skeleton with modals and proper ARIA attributes
- **CSS Layout:** Responsive two-column grid with dark mode variables implemented in ~5 minutes
- **3D Flip Animation:** AI provided the correct CSS 3D transform technique with `perspective`, `transform-style: preserve-3d`, and `backface-visibility`
- **Form Handling:** Modal focus management and form validation boilerplate

### 2. AI Bugs Found & Fixed 🔧
- **Event Listener Duplicates:** AI initially generated inline event listeners on each render. **Fix:** Refactored to use permanent event listeners added once during init, with function-based handlers that read current state from `AppState`
- **Focus Trap Missing:** AI's initial modal didn't trap focus on Tab. **Fix:** Added `setTimeout(() => input.focus(), 100)` in `Modal.open()` and `Esc` listener to return focus control to user
- **Search Mutating Data:** AI's search implementation modified the original array. **Fix:** Created separate `filteredCards` array in state for view-only filtering, leaving original `cardsByDeckId` untouched
- **Card Flip State Desync:** When navigating cards, flip state wasn't resetting. **Fix:** Added `AppState.isCardFlipped = false` in navigation functions to ensure clean state

### 3. Code Refactored for Clarity 📝
**Before (AI-generated):**
```javascript
function renderDeck() {
  const deckList = document.getElementById('deckList');
  AppState.decks.forEach(deck => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${deck.name}</span>`;
    li.onclick = () => {
      AppState.activeDeckId = deck.id;
      renderDeck(); // recursion and inline handler
      renderCard();
    };
    deckList.appendChild(li);
  });
}
```

**After (refactored):**
```javascript
UI.renderDeckList() {
  const deckList = document.getElementById('deckList');
  deckList.innerHTML = ''; // Clear first
  AppState.decks.forEach(deck => {
    const li = document.createElement('li');
    li.className = 'deck-item'; // class-based styling
    li.innerHTML = `<span class="deck-item-name">${escapeHtml(deck.name)}</span>`;
    li.addEventListener('click', () => {
      DeckOps.select(deck.id); // delegated to ops module
      UI.render(); // single render call
    });
    deckList.appendChild(li);
  });
}
```

**Benefits:**
- Separated concerns: `DeckOps` handles state, `UI` handles rendering
- `escapeHtml()` prevents XSS vulnerabilities
- Single `UI.render()` ensures consistent state across all sections
- Clearer intent with semantic class names

### 4. Accessibility Improvement Added ♿
- **ARIA Labels:** Added `aria-label` to all buttons (e.g., "Create a new deck", "Flip card")
- **Form Labels:** All inputs have associated `<label>` tags with `for` attributes and `aria-required="true"` on required fields
- **Modal Semantics:** Used `role="dialog"`, `aria-labelledby`, and `aria-hidden` on modals
- **Semantic HTML:** Used `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` instead of divs
- **Focus Visible:** Added `.btn:focus-visible` and `.input:focus` styles with clear outlines (blue on white, inverted on dark mode)
- **Keyboard Navigation:** Full keyboard support—Tab cycles through controls, Shift+Tab reverses, Enter/Space activate buttons
- **Color Contrast:** Used CSS variables to ensure WCAG AA contrast ratios in both light and dark modes

### 5. Prompt Changes That Improved AI Output 🎯
- **"Use semantic HTML"** → AI remembered to use `<nav>`, `<section>`, `<dialog>` patterns
- **"Add CSS variables for theming"** → AI created proper `:root` variables and dark mode media queries instead of hardcoded colors
- **"Separate concerns: storage, operations, UI"** → AI structured code into modules instead of one giant function
- **"No recursive rendering"** → AI refactored to avoid re-attaching listeners; now uses permanent event setup
- **"Generate unique IDs with Math.random().toString(36)"** → Simple, collision-resistant IDs without UUID library
- **"Use delegated events or event handler functions that read AppState"** → Prevented stale closures; handlers always access current state

## Future Enhancements (Optional)

- Import/Export deck JSON
- Spaced repetition with SRS algorithm (Again/Good/Easy intervals)
- Progress stats per deck
- Card categories/tags
- Pronunciation audio for language decks
- Time-based study sessions (e.g., study for 10 minutes)
- Deck sharing (JSON export/import)
- Custom card styling per deck

## Testing Checklist

- [x] Create new deck and add cards
- [x] Edit deck name and card content
- [x] Delete deck and cards with confirmation
- [x] Search and filter cards
- [x] Flip cards with button and keyboard shortcut
- [x] Navigate with prev/next buttons and arrow keys
- [x] Shuffle deck
- [x] Jump to specific card by index
- [x] Data persists on page reload
- [x] Responsive layout on mobile
- [x] Dark mode colors render correctly
- [x] Keyboard focus visible on all controls
- [x] Modals close with Escape key and outside click

## License

Public domain (MIT or CC0). Use freely for learning and projects.

---

**Built with:** Vanilla HTML5, CSS3, JavaScript ES6+  
**No dependencies** — runs in any modern browser  
**Time spent:** ~2 hours with AI assistance
