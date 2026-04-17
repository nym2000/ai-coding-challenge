/**
 * Flashcards Study App - Main Application Logic
 * Features: Deck CRUD, Card CRUD, Study Mode, LocalStorage Persistence
 */

// ============================================
// State Management
// ============================================

const AppState = {
    decks: [],
    cardsByDeckId: {},
    activeDeckId: null,
    activeCardIndex: 0,
    isCardFlipped: false,
    filteredCards: [], // For search results
    isSearchActive: false,
    editingDeckId: null,
    editingCardId: null,
    confirmAction: null, // For delete confirmations
};

// ============================================
// Storage Utilities
// ============================================

const Storage = {
    STORAGE_KEY: 'flashcards_app_state',

    load() {
        try {
            const data = localStorage.getItem(Storage.STORAGE_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load state from localStorage:', e);
            return null;
        }
    },

    save(state) {
        try {
            localStorage.setItem(Storage.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state to localStorage:', e);
        }
    },

    clear() {
        localStorage.removeItem(Storage.STORAGE_KEY);
    },

    init() {
        const savedState = Storage.load();
        if (savedState) {
            Object.assign(AppState, savedState);
        }
    },
};

// ============================================
// Utility Functions
// ============================================

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

function persistState() {
    Storage.save(AppState);
}

// ============================================
// Modal Management
// ============================================

const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            // Focus first input
            const input = modal.querySelector('input, textarea');
            if (input) setTimeout(() => input.focus(), 100);
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    },

    closeAll() {
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('is-open');
            m.setAttribute('aria-hidden', 'true');
        });
    },
};

// ============================================
// Deck CRUD Operations
// ============================================

const DeckOps = {
    create(name) {
        const newDeck = {
            id: generateId(),
            name: name.trim(),
            createdAt: Date.now(),
        };
        AppState.decks.push(newDeck);
        AppState.cardsByDeckId[newDeck.id] = [];
        persistState();
        return newDeck;
    },

    update(deckId, name) {
        const deck = AppState.decks.find(d => d.id === deckId);
        if (deck) {
            deck.name = name.trim();
            persistState();
        }
        return deck;
    },

    delete(deckId) {
        AppState.decks = AppState.decks.filter(d => d.id !== deckId);
        delete AppState.cardsByDeckId[deckId];
        if (AppState.activeDeckId === deckId) {
            AppState.activeDeckId = AppState.decks.length > 0 ? AppState.decks[0].id : null;
            AppState.activeCardIndex = 0;
            AppState.isCardFlipped = false;
        }
        persistState();
    },

    select(deckId) {
        AppState.activeDeckId = deckId;
        AppState.activeCardIndex = 0;
        AppState.isCardFlipped = false;
        AppState.isSearchActive = false;
        AppState.filteredCards = [];
        persistState();
    },
};

// ============================================
// Card CRUD Operations
// ============================================

const CardOps = {
    create(deckId, front, back) {
        if (!AppState.cardsByDeckId[deckId]) {
            AppState.cardsByDeckId[deckId] = [];
        }
        const newCard = {
            id: generateId(),
            front: front.trim(),
            back: back.trim(),
            createdAt: Date.now(),
        };
        AppState.cardsByDeckId[deckId].push(newCard);
        persistState();
        return newCard;
    },

    update(deckId, cardId, front, back) {
        const cards = AppState.cardsByDeckId[deckId] || [];
        const card = cards.find(c => c.id === cardId);
        if (card) {
            card.front = front.trim();
            card.back = back.trim();
            persistState();
        }
        return card;
    },

    delete(deckId, cardId) {
        if (AppState.cardsByDeckId[deckId]) {
            AppState.cardsByDeckId[deckId] = AppState.cardsByDeckId[deckId].filter(c => c.id !== cardId);
            // Reset index if needed
            const cards = getCurrentCards();
            if (AppState.activeCardIndex >= cards.length) {
                AppState.activeCardIndex = Math.max(0, cards.length - 1);
            }
            persistState();
        }
    },
};

// ============================================
// Study Mode Navigation
// ============================================

const StudyMode = {
    getCurrentCardCount() {
        return AppState.isSearchActive ? AppState.filteredCards.length : getCurrentCards().length;
    },

    goToCard(index) {
        const count = StudyMode.getCurrentCardCount();
        if (count === 0) return;
        AppState.activeCardIndex = Math.max(0, Math.min(index, count - 1));
        AppState.isCardFlipped = false;
        persistState();
    },

    nextCard() {
        const count = StudyMode.getCurrentCardCount();
        if (count === 0) return;
        StudyMode.goToCard(AppState.activeCardIndex + 1);
    },

    prevCard() {
        StudyMode.goToCard(AppState.activeCardIndex - 1);
    },

    flipCard() {
        AppState.isCardFlipped = !AppState.isCardFlipped;
        persistState();
    },

    shuffle() {
        const cards = getCurrentCards();
        if (cards.length === 0) return;
        // Shuffle using Fisher-Yates
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        AppState.activeCardIndex = 0;
        AppState.isCardFlipped = false;
        persistState();
    },
};

// ============================================
// Search & Filter
// ============================================

const Search = {
    execute(query) {
        if (!query.trim()) {
            AppState.isSearchActive = false;
            AppState.filteredCards = [];
            AppState.activeCardIndex = 0;
            return;
        }

        const cards = getCurrentCards();
        const lowerQuery = query.toLowerCase();
        AppState.filteredCards = cards.filter(
            card =>
                card.front.toLowerCase().includes(lowerQuery) ||
                card.back.toLowerCase().includes(lowerQuery)
        );
        AppState.isSearchActive = true;
        AppState.activeCardIndex = 0;
    },

    clear() {
        AppState.isSearchActive = false;
        AppState.filteredCards = [];
        AppState.activeCardIndex = 0;
    },
};

// ============================================
// UI Rendering
// ============================================

const UI = {
    renderDeckList() {
        const deckList = document.getElementById('deckList');
        const emptyDecks = document.getElementById('emptyDecks');

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
                DeckOps.select(deck.id);
                UI.render();
            });

            deckList.appendChild(li);
        });
    },

    renderMainContent() {
        const emptyState = document.getElementById('emptyState');
        const deckView = document.getElementById('deckView');

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
        document.getElementById('deckTitle').textContent = deck.name;

        // Update card stats
        const cardCount = cards.length;
        document.getElementById('cardCount').textContent = `${cardCount} card${cardCount !== 1 ? 's' : ''}`;

        if (AppState.isSearchActive) {
            document.getElementById('filterCount').style.display = 'inline';
            document.getElementById('filterCountNum').textContent = AppState.filteredCards.length;
        } else {
            document.getElementById('filterCount').style.display = 'none';
        }

        // Render card
        UI.renderCard();

        // Update card nav
        const currentCount = StudyMode.getCurrentCardCount();
        document.getElementById('cardNav').textContent = `/ ${currentCount}`;
        document.getElementById('cardIndex').value = currentCount > 0 ? AppState.activeCardIndex + 1 : 0;
    },

    renderCard() {
        const card = getCurrentCard();
        const cardContainer = document.getElementById('cardContainer');
        const flashcard = document.getElementById('flashcard');

        if (!card) {
            document.getElementById('cardFront').textContent = 'No cards in this deck';
            document.getElementById('cardBack').textContent = 'Add a card to get started';
            flashcard.classList.remove('is-flipped');
            return;
        }

        document.getElementById('cardFront').textContent = card.front;
        document.getElementById('cardBack').textContent = card.back;

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

// ============================================
// Event Handlers
// ============================================

function onNewDeckClick() {
    AppState.editingDeckId = null;
    document.getElementById('deckModalTitle').textContent = 'New Deck';
    document.getElementById('deckNameInput').value = '';
    Modal.open('deckModal');
}

function onEditDeckClick() {
    const deck = getCurrentDeck();
    if (!deck) return;

    AppState.editingDeckId = deck.id;
    document.getElementById('deckModalTitle').textContent = 'Edit Deck';
    document.getElementById('deckNameInput').value = deck.name;
    Modal.open('deckModal');
}

function onDeleteDeckClick() {
    const deck = getCurrentDeck();
    if (!deck) return;

    AppState.confirmAction = () => {
        DeckOps.delete(deck.id);
        Modal.closeAll();
        AppState.confirmAction = null;
        UI.render();
    };

    document.getElementById('confirmModalTitle').textContent = 'Delete Deck?';
    document.getElementById('confirmModalMessage').textContent = `Are you sure you want to delete "${deck.name}"? This cannot be undone.`;
    Modal.open('confirmModal');
}

function onNewCardClick() {
    if (!AppState.activeDeckId) return;

    AppState.editingCardId = null;
    document.getElementById('cardModalTitle').textContent = 'New Card';
    document.getElementById('cardFrontInput').value = '';
    document.getElementById('cardBackInput').value = '';
    Modal.open('cardModal');
}

function onEditCardClick() {
    const card = getCurrentCard();
    if (!card) return;

    AppState.editingCardId = card.id;
    document.getElementById('cardModalTitle').textContent = 'Edit Card';
    document.getElementById('cardFrontInput').value = card.front;
    document.getElementById('cardBackInput').value = card.back;
    Modal.open('cardModal');
}

function onDeleteCardClick() {
    const card = getCurrentCard();
    if (!card || !AppState.activeDeckId) return;

    AppState.confirmAction = () => {
        CardOps.delete(AppState.activeDeckId, card.id);
        Modal.closeAll();
        AppState.confirmAction = null;
        UI.render();
    };

    document.getElementById('confirmModalTitle').textContent = 'Delete Card?';
    document.getElementById('confirmModalMessage').textContent = `Delete this card? This cannot be undone.`;
    Modal.open('confirmModal');
}

function onDeckFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('deckNameInput').value.trim();

    if (!name) {
        alert('Please enter a deck name');
        return;
    }

    if (AppState.editingDeckId) {
        DeckOps.update(AppState.editingDeckId, name);
    } else {
        DeckOps.create(name);
    }

    Modal.close('deckModal');
    AppState.editingDeckId = null;
    UI.render();
}

function onCardFormSubmit(e) {
    e.preventDefault();
    const front = document.getElementById('cardFrontInput').value.trim();
    const back = document.getElementById('cardBackInput').value.trim();

    if (!front || !back) {
        alert('Please fill in both front and back');
        return;
    }

    if (!AppState.activeDeckId) return;

    if (AppState.editingCardId) {
        CardOps.update(AppState.activeDeckId, AppState.editingCardId, front, back);
    } else {
        CardOps.create(AppState.activeDeckId, front, back);
    }

    Modal.close('cardModal');
    AppState.editingCardId = null;
    UI.render();
}

function onSearchInput(e) {
    const query = e.target.value;
    Search.execute(query);
    UI.renderMainContent();
}

function onCardIndexChange(e) {
    const index = parseInt(e.target.value, 10);
    if (!isNaN(index) && index > 0) {
        StudyMode.goToCard(index - 1);
        UI.renderCard();
    }
}

function onFlipBtnClick() {
    StudyMode.flipCard();
    UI.renderCard();
}

function onNextBtnClick() {
    StudyMode.nextCard();
    UI.renderCard();
}

function onPrevBtnClick() {
    StudyMode.prevCard();
    UI.renderCard();
}

function onShuffleBtnClick() {
    StudyMode.shuffle();
    UI.render();
}

// Keyboard shortcuts
function onKeyDown(e) {
    if (!AppState.activeDeckId) return;

    const modalOpen = document.querySelector('.modal.is-open');
    if (modalOpen) {
        if (e.key === 'Escape') {
            Modal.closeAll();
        }
        return;
    }

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

// Modal close buttons
function setupModalListeners() {
    // Deck modal
    document.getElementById('closeDeckModal').addEventListener('click', () => Modal.close('deckModal'));
    document.getElementById('cancelDeckBtn').addEventListener('click', () => Modal.close('deckModal'));
    document.getElementById('deckForm').addEventListener('submit', onDeckFormSubmit);

    // Card modal
    document.getElementById('closeCardModal').addEventListener('click', () => Modal.close('cardModal'));
    document.getElementById('cancelCardBtn').addEventListener('click', () => Modal.close('cardModal'));
    document.getElementById('cardForm').addEventListener('submit', onCardFormSubmit);

    // Confirm modal
    document.getElementById('confirmYesBtn').addEventListener('click', () => {
        if (AppState.confirmAction) AppState.confirmAction();
    });
    document.getElementById('confirmNoBtn').addEventListener('click', () => {
        Modal.close('confirmModal');
        AppState.confirmAction = null;
    });

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.closeAll();
        }
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                Modal.close(modal.id);
            }
        });
    });
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
    Storage.init();

    // Setup event listeners
    document.getElementById('newDeckBtn').addEventListener('click', onNewDeckClick);
    document.getElementById('editDeckBtn').addEventListener('click', onEditDeckClick);
    document.getElementById('deleteDeckBtn').addEventListener('click', onDeleteDeckClick);

    document.getElementById('newCardBtn').addEventListener('click', onNewCardClick);
    document.getElementById('editCardBtn').addEventListener('click', onEditCardClick);
    document.getElementById('deleteCardBtn').addEventListener('click', onDeleteCardClick);

    document.getElementById('flipBtn').addEventListener('click', onFlipBtnClick);
    document.getElementById('nextBtn').addEventListener('click', onNextBtnClick);
    document.getElementById('prevBtn').addEventListener('click', onPrevBtnClick);
    document.getElementById('shuffleBtn').addEventListener('click', onShuffleBtnClick);

    document.getElementById('searchInput').addEventListener('input', onSearchInput);
    document.getElementById('cardIndex').addEventListener('change', onCardIndexChange);

    setupModalListeners();
    document.addEventListener('keydown', onKeyDown);

    // Initial render
    if (AppState.decks.length > 0 && !AppState.activeDeckId) {
        AppState.activeDeckId = AppState.decks[0].id;
    }
    UI.render();

    // Make flashcard clickable to flip
    document.getElementById('flashcard').addEventListener('click', onFlipBtnClick);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
