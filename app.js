// ============================================
// State Management
// ============================================

const AppState = {
  decks: [],
  cardsByDeckId: {},
  activeDeckId: null,
  activeCardIndex: 0,
  isCardFlipped: false,
  filteredCards: [],
  isSearchActive: false,
  editingDeckId: null,
  editingCardId: null,
  confirmAction: null,
  theme: 'auto', // 'light', 'dark', or 'auto'
  mode: 'question', // 'question' or 'answer'
};

// ============================================
// Theme Management
// ============================================

const Theme = {
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  getCurrentTheme() {
    if (AppState.theme === 'auto') {
      return Theme.getSystemTheme();
    }
    return AppState.theme;
  },

  applyTheme() {
    const theme = Theme.getCurrentTheme();
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle');

    if (theme === 'dark') {
      body.setAttribute('data-theme', 'dark');
      toggleBtn.textContent = '☀️';
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      body.setAttribute('data-theme', 'light');
      toggleBtn.textContent = '🌙';
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  },

  toggleTheme() {
    if (AppState.theme === 'auto') {
      AppState.theme = Theme.getSystemTheme() === 'dark' ? 'light' : 'dark';
    } else {
      AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    }
    Theme.applyTheme();
    localStorage.setItem('flashcards_theme', AppState.theme);
  },

  init() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('flashcards_theme');
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      AppState.theme = savedTheme;
    }

    // Listen for system theme changes when in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (AppState.theme === 'auto') {
        Theme.applyTheme();
      }
    });

    Theme.applyTheme();
  },
};

// ============================================
// Sample Data
// ============================================

const SampleData = {
  decks: [
    {
      id: 'bodybuilding',
      name: 'Bodybuilding',
      cards: [
        { front: 'What is the primary muscle group worked in squats?', back: 'Quadriceps (front of thighs)' },
        { front: 'What does BMI stand for?', back: 'Body Mass Index' },
        { front: 'What is the recommended daily protein intake for muscle building?', back: '1.6-2.2 grams per kg of body weight' },
        { front: 'What exercise primarily targets the chest muscles?', back: 'Bench press' },
        { front: 'What is progressive overload?', back: 'Gradually increasing weight, reps, or intensity over time' },
        { front: 'What are the three macronutrients?', back: 'Protein, carbohydrates, and fats' },
        { front: 'What muscle group is worked by pull-ups?', back: 'Back and biceps' },
        { front: 'What is DOMS?', back: 'Delayed Onset Muscle Soreness' },
        { front: 'What exercise targets the shoulders?', back: 'Overhead press' },
        { front: 'What is the recovery time between intense workouts?', back: '48-72 hours for the same muscle group' }
      ]
    },
    {
      id: 'running',
      name: 'Running',
      cards: [
        { front: 'What is the average pace for a 5K run?', back: '8-12 minutes per mile' },
        { front: 'What does VO2 max measure?', back: 'Maximum oxygen consumption during exercise' },
        { front: 'What is the proper running form?', back: 'Head up, shoulders relaxed, arms at 90 degrees, midfoot strike' },
        { front: 'What is a fartlek workout?', back: 'Speed play - alternating fast and slow running' },
        { front: 'What is the minimum weekly mileage for marathon training?', back: '20-30 miles' },
        { front: 'What causes runner\'s knee?', back: 'Overuse, improper form, or muscle imbalances' },
        { front: 'What is tempo running?', back: 'Running at a comfortably hard pace for 20-30 minutes' },
        { front: 'What should you eat before a long run?', back: 'Carbohydrates 2-4 hours before, light snack 30-60 minutes before' },
        { front: 'What is the difference between jogging and running?', back: 'Jogging is slower pace (10+ min/mile), running is faster (under 10 min/mile)' },
        { front: 'What is hill training good for?', back: 'Building strength, power, and improving running economy' }
      ]
    },
    {
      id: 'bicycling',
      name: 'Bicycling',
      cards: [
        { front: 'What are the three main types of bicycles?', back: 'Road bikes, mountain bikes, and hybrid bikes' },
        { front: 'What does PSI stand for in tire pressure?', back: 'Pounds per Square Inch' },
        { front: 'What is the proper hand signal for turning right?', back: 'Right arm extended straight out' },
        { front: 'What is a cassette on a bike?', back: 'The cluster of gears on the rear wheel' },
        { front: 'What should you check before every bike ride?', back: 'Tires, brakes, chain, and lights' },
        { front: 'What is the most important piece of safety equipment?', back: 'Helmet' },
        { front: 'What does cadence mean in cycling?', back: 'Pedal revolutions per minute (RPM)' },
        { front: 'What is a group ride called?', back: 'Peloton' },
        { front: 'What is the ideal tire pressure for road bikes?', back: '80-130 PSI depending on rider weight and tire width' },
        { front: 'What should you do at a stop sign?', back: 'Put one foot down and look both ways' }
      ]
    },
    {
      id: 'gaming',
      name: 'Gaming',
      cards: [
        { front: 'What does RPG stand for?', back: 'Role-Playing Game' },
        { front: 'What is the most popular gaming platform worldwide?', back: 'Mobile phones' },
        { front: 'What does FPS mean in gaming?', back: 'First-Person Shooter' },
        { front: 'What is the best-selling video game of all time?', back: 'Minecraft' },
        { front: 'What does MMO stand for?', back: 'Massively Multiplayer Online' },
        { front: 'What is a gaming console?', back: 'Dedicated hardware for playing video games' },
        { front: 'What does DLC mean?', back: 'Downloadable Content' },
        { front: 'What is the difference between PC and console gaming?', back: 'PC offers more customization, console offers ease of use' },
        { front: 'What is a gaming mouse?', back: 'Specialized mouse with high DPI for precise aiming' },
        { front: 'What does esports refer to?', back: 'Competitive video gaming at a professional level' }
      ]
    },
    {
      id: 'legos',
      name: 'Legos',
      cards: [
        { front: 'When were LEGO bricks invented?', back: '1958' },
        { front: 'What is the most expensive LEGO set ever sold?', back: 'The Taj Mahal set ($11,695)' },
        { front: 'What does LEGO stand for?', back: 'LEg GOdt (play well in Danish)' },
        { front: 'What is the largest LEGO set ever made?', back: 'LEGO Art World Map (11,695 pieces)' },
        { front: 'What are LEGO minifigures?', back: 'Small plastic figures that represent people in LEGO sets' },
        { front: 'What is LEGO Architecture?', back: 'A theme featuring famous buildings and structures' },
        { front: 'What is the rarest LEGO piece?', back: 'The 1x1 round plate in transparent brown' },
        { front: 'What does AFOL stand for?', back: 'Adult Fan Of LEGO' },
        { front: 'What is LEGO Mindstorms?', back: 'A robotics theme that allows building programmable robots' },
        { front: 'What is the LEGO Ideas platform?', back: 'A website where fans submit and vote on new LEGO set ideas' }
      ]
    }
  ],

  loadSampleData() {
    // Only load if no decks exist
    if (AppState.decks.length === 0) {
      SampleData.decks.forEach(deckData => {
        const deck = {
          id: deckData.id,
          name: deckData.name,
          createdAt: Date.now()
        };
        AppState.decks.push(deck);
        AppState.cardsByDeckId[deck.id] = deckData.cards.map(card => ({
          id: generateId(),
          front: card.front,
          back: card.back,
          createdAt: Date.now()
        }));
      });

      // Set first deck as active
      if (AppState.decks.length > 0) {
        AppState.activeDeckId = AppState.decks[0].id;
      }

      console.log('Sample data loaded:', AppState.decks.length, 'decks');
    }
  }
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getCurrentDeck() {
  return AppState.decks.find(d => d.id === AppState.activeDeckId) || null;
}

function getCurrentCards() {
  if (!AppState.activeDeckId) return [];
  return AppState.cardsByDeckId[AppState.activeDeckId] || [];
}

function getCurrentCard() {
  const cards = AppState.isSearchActive ? AppState.filteredCards : getCurrentCards();
  return cards[AppState.activeCardIndex] || null;
}

// ============================================
// UI Rendering
// ============================================

const UI = {
  renderDeckList() {
    const deckList = document.getElementById('deck-list');
    const emptyDecks = document.getElementById('empty-decks');

    deckList.innerHTML = '';

    if (AppState.decks.length === 0) {
      emptyDecks.style.display = 'block';
      return;
    }

    emptyDecks.style.display = 'none';

    AppState.decks.forEach(deck => {
      const li = document.createElement('li');
      li.className = 'deck-item';
      if (deck.id === AppState.activeDeckId) {
        li.classList.add('active');
      }

      const cardsCount = (AppState.cardsByDeckId[deck.id] || []).length;
      li.innerHTML = `
        <span class="deck-item-name">${escapeHtml(deck.name)}</span>
        <span class="deck-item-count">${cardsCount}</span>
      `;

      li.addEventListener('click', () => {
        AppState.activeDeckId = deck.id;
        AppState.activeCardIndex = 0;
        AppState.isCardFlipped = false;
        AppState.isSearchActive = false;
        AppState.filteredCards = [];
        UI.render();
      });

      deckList.appendChild(li);
    });
  },

  renderMainContent() {
    const emptyState = document.getElementById('empty-state');
    const deckView = document.getElementById('deck-view');

    if (!AppState.activeDeckId) {
      emptyState.style.display = 'flex';
      deckView.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    deckView.style.display = 'block';

    const deck = getCurrentDeck();
    const cards = getCurrentCards();

    // Update deck title
    document.getElementById('deck-title').textContent = deck.name;

    // Update switch mode button
    const switchModeBtn = document.getElementById('switch-mode-button');
    if (AppState.mode === 'question') {
      switchModeBtn.textContent = '🔄 Answer Mode';
      switchModeBtn.setAttribute('aria-label', 'Switch to answer mode');
    } else {
      switchModeBtn.textContent = '🔄 Question Mode';
      switchModeBtn.setAttribute('aria-label', 'Switch to question mode');
    }

    // Update card stats
    const cardCount = cards.length;
    document.getElementById('card-count').textContent = `${cardCount} card${cardCount !== 1 ? 's' : ''}`;

    if (AppState.isSearchActive) {
      document.getElementById('filter-count').style.display = 'inline';
      document.getElementById('filter-count-num').textContent = AppState.filteredCards.length;
    } else {
      document.getElementById('filter-count').style.display = 'none';
    }

    // Render card
    UI.renderCard();

    // Update card nav
    const currentCount = AppState.isSearchActive ? AppState.filteredCards.length : cards.length;
    document.getElementById('card-nav').textContent = `/ ${currentCount}`;
    document.getElementById('card-index').value = currentCount > 0 ? AppState.activeCardIndex + 1 : 0;
  },

  renderCard() {
    const card = getCurrentCard();
    const flashcard = document.getElementById('flashcard');

    if (!card) {
      document.getElementById('card-front').textContent = 'No cards in this deck';
      document.getElementById('card-back').textContent = 'Add a card to get started';
      flashcard.classList.remove('is-flipped');
      return;
    }

    const labelText = AppState.mode === 'question' ? 'Question' : 'Answer';

    if (AppState.mode === 'question') {
      document.getElementById('card-front').textContent = card.front;
      document.getElementById('card-back').textContent = card.front;
    } else {
      document.getElementById('card-front').textContent = card.back;
      document.getElementById('card-back').textContent = card.back;
    }

    // Update card labels
    document.querySelectorAll('.card-label').forEach(label => {
      label.textContent = labelText;
    });

    // Apply flip state
    if (AppState.isCardFlipped) {
      flashcard.classList.add('is-flipped');
    } else {
      flashcard.classList.remove('is-flipped');
    }
  },

  render() {
    UI.renderDeckList();
    UI.renderMainContent();
  },
};

function onThemeToggleClick() {
  Theme.toggleTheme();
}

function onNewDeckClick() {
  console.log('New deck button clicked');
  // TODO: Open modal for new deck
}

function onEditDeckClick() {
  console.log('Edit deck button clicked');
  // TODO: Open modal for editing deck
}

function onDeleteDeckClick() {
  console.log('Delete deck button clicked');
  // TODO: Show confirmation dialog
}

function onNewCardClick() {
  console.log('New card button clicked');
  // TODO: Open modal for new card
}

function onEditCardClick() {
  console.log('Edit card button clicked');
  // TODO: Open modal for editing card
}

function onDeleteCardClick() {
  console.log('Delete card button clicked');
  // TODO: Show confirmation dialog
}

function onSearchInput(e) {
  const query = e.target.value;
  if (!query.trim()) {
    AppState.isSearchActive = false;
    AppState.filteredCards = [];
    AppState.activeCardIndex = 0;
  } else {
    const cards = getCurrentCards();
    const lowerQuery = query.toLowerCase();
    AppState.filteredCards = cards.filter(
      card =>
        card.front.toLowerCase().includes(lowerQuery) ||
        card.back.toLowerCase().includes(lowerQuery)
    );
    AppState.isSearchActive = true;
    AppState.activeCardIndex = 0;
  }
  UI.renderMainContent();
}

function onCardIndexChange(e) {
  const index = parseInt(e.target.value, 10);
  if (!isNaN(index) && index > 0) {
    const maxIndex = (AppState.isSearchActive ? AppState.filteredCards.length : getCurrentCards().length) - 1;
    AppState.activeCardIndex = Math.max(0, Math.min(index - 1, maxIndex));
    UI.renderCard();
  }
}

function onFlipBtnClick() {
  AppState.isCardFlipped = !AppState.isCardFlipped;
  UI.renderCard();
}

function onNextBtnClick() {
  const count = AppState.isSearchActive ? AppState.filteredCards.length : getCurrentCards().length;
  if (count === 0) return;
  AppState.activeCardIndex = (AppState.activeCardIndex + 1) % count;
  AppState.isCardFlipped = false;
  UI.renderCard();
}

function onPrevBtnClick() {
  const count = AppState.isSearchActive ? AppState.filteredCards.length : getCurrentCards().length;
  if (count === 0) return;
  AppState.activeCardIndex = AppState.activeCardIndex > 0 ? AppState.activeCardIndex - 1 : count - 1;
  AppState.isCardFlipped = false;
  UI.renderCard();
}

function onShuffleBtnClick() {
  const cards = getCurrentCards();
  if (cards.length === 0) return;
  // Shuffle using Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  AppState.activeCardIndex = 0;
  AppState.isCardFlipped = false;
  UI.render();
}

function onSwitchModeBtnClick() {
  AppState.mode = AppState.mode === 'question' ? 'answer' : 'question';
  AppState.isCardFlipped = false;
  UI.renderMainContent();
}

// Keyboard shortcuts
function onKeyDown(e) {
  if (!AppState.activeDeckId) return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      onFlipBtnClick();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      onPrevBtnClick();
      break;
    case 'ArrowRight':
      e.preventDefault();
      onNextBtnClick();
      break;
  }
}

// ============================================
// Utility: HTML Escaping
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// Initialization
// ============================================

function init() {
  // Initialize theme
  Theme.init();

  // Setup event listeners
  document.getElementById('theme-toggle').addEventListener('click', onThemeToggleClick);
  document.getElementById('new-deck-button').addEventListener('click', onNewDeckClick);
  document.getElementById('edit-deck-button').addEventListener('click', onEditDeckClick);
  document.getElementById('delete-deck-button').addEventListener('click', onDeleteDeckClick);

  document.getElementById('new-card-button').addEventListener('click', onNewCardClick);
  document.getElementById('edit-card-button').addEventListener('click', onEditCardClick);
  document.getElementById('delete-card-button').addEventListener('click', onDeleteCardClick);

  document.getElementById('flip-card').addEventListener('click', onFlipBtnClick);
  document.getElementById('next-card').addEventListener('click', onNextBtnClick);
  document.getElementById('prev-card').addEventListener('click', onPrevBtnClick);
  document.getElementById('shuffle-button').addEventListener('click', onShuffleBtnClick);
  document.getElementById('switch-mode-button').addEventListener('click', onSwitchModeBtnClick);

  document.getElementById('search-input').addEventListener('input', onSearchInput);
  document.getElementById('card-index').addEventListener('change', onCardIndexChange);

  document.addEventListener('keydown', onKeyDown);

  // Make flashcard clickable to flip
  document.getElementById('flashcard').addEventListener('click', onFlipBtnClick);

  // Load sample data if no decks exist
  SampleData.loadSampleData();

  // Initial render
  if (AppState.decks.length > 0 && !AppState.activeDeckId) {
    AppState.activeDeckId = AppState.decks[0].id;
  }
  UI.render();

  console.log('Flashcards app initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
