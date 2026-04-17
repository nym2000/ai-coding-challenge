// app.js
// Minimal, robust flashcards UI logic. Hooks to common element IDs/classes if present.

(() => {
    const LS_KEY = 'flashcards';
    let cards = [];
    let current = 0;

    // Query helpers (no-op if element missing)
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));

    // Elements (optional)
    const el = {
        cardContainer: $('#card-container'),
        indexDisplay: $('#current-index'),
        prevBtn: $('#prev-btn'),
        nextBtn: $('#next-btn'),
        addToggle: $('#show-add-card'),
        clearBtn: $('#clear-btn'),
        addForm: $('#add-card-form'),
        qInput: $('#question'),
        aInput: $('#answer'),
        saveBtn: $('#save-card-btn'),
        cardsList: $('#cards-list') // optional list view
    };

    // Storage
    function load() {
        try {
            const data = localStorage.getItem(LS_KEY);
            cards = data ? JSON.parse(data) : [];
        } catch (e) {
            cards = [];
        }
        if (current >= cards.length) current = Math.max(0, cards.length - 1);
    }
    function save() {
        localStorage.setItem(LS_KEY, JSON.stringify(cards));
    }

    // Rendering a single active card in cardContainer (flip on click)
    function renderActiveCard() {
        const container = el.cardContainer;
        if (!container) return;
        container.innerHTML = '';

        if (cards.length === 0) {
            container.textContent = 'No cards yet.';
            updateIndexDisplay();
            return;
        }

        const card = cards[current];
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.style.cursor = 'pointer';
        cardEl.tabIndex = 0;

        const front = document.createElement('div');
        front.className = 'front';
        front.textContent = card.question;

        const back = document.createElement('div');
        back.className = 'back';
        back.textContent = card.answer;
        back.style.display = 'none';

        // flip toggle
        function toggleFlip() {
            const showingBack = back.style.display !== 'none';
            back.style.display = showingBack ? 'none' : 'block';
            front.style.display = showingBack ? 'block' : 'none';
        }

        cardEl.addEventListener('click', toggleFlip);
        cardEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleFlip();
        });

        // delete button
        const del = document.createElement('button');
        del.className = 'delete-card';
        del.textContent = 'Delete';
        del.style.marginTop = '8px';
        del.addEventListener('click', (ev) => {
            ev.stopPropagation();
            deleteCard(current);
        });

        cardEl.appendChild(front);
        cardEl.appendChild(back);
        cardEl.appendChild(del);
        container.appendChild(cardEl);

        updateIndexDisplay();
    }

    function renderCardsList() {
        const list = el.cardsList;
        if (!list) return;
        list.innerHTML = '';
        cards.forEach((c, i) => {
            const li = document.createElement('li');
            li.className = 'cards-list-item';
            li.innerHTML = `<strong>${i + 1}.</strong> ${escapeHtml(c.question)}`;
            li.addEventListener('click', () => {
                current = i;
                renderActiveCard();
            });
            list.appendChild(li);
        });
    }

    // Utilities
    function updateIndexDisplay() {
        const idx = el.indexDisplay;
        if (!idx) return;
        if (cards.length === 0) {
            idx.textContent = '0 / 0';
        } else {
            idx.textContent = `${current + 1} / ${cards.length}`;
        }
    }

    function prevCard() {
        if (cards.length === 0) return;
        current = (current - 1 + cards.length) % cards.length;
        renderActiveCard();
    }
    function nextCard() {
        if (cards.length === 0) return;
        current = (current + 1) % cards.length;
        renderActiveCard();
    }

    function addCard(q, a) {
        if (!q || !a) return;
        cards.push({ question: q, answer: a });
        current = cards.length - 1;
        save();
        renderActiveCard();
        renderCardsList();
    }

    function deleteCard(index) {
        if (index < 0 || index >= cards.length) return;
        cards.splice(index, 1);
        if (current >= cards.length) current = Math.max(0, cards.length - 1);
        save();
        renderActiveCard();
        renderCardsList();
    }

    function clearAll() {
        if (!confirm('Clear all cards?')) return;
        cards = [];
        current = 0;
        save();
        renderActiveCard();
        renderCardsList();
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    // Hook up controls if present
    function attachControls() {
        if (el.prevBtn) el.prevBtn.addEventListener('click', prevCard);
        if (el.nextBtn) el.nextBtn.addEventListener('click', nextCard);
        if (el.clearBtn) el.clearBtn.addEventListener('click', clearAll);

        if (el.addToggle && el.addForm) {
            el.addToggle.addEventListener('click', () => {
                el.addForm.style.display = el.addForm.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (el.addForm && el.qInput && el.aInput) {
            el.addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const q = el.qInput.value.trim();
                const a = el.aInput.value.trim();
                if (!q || !a) return;
                addCard(q, a);
                el.qInput.value = '';
                el.aInput.value = '';
                if (el.addForm.style) el.addForm.style.display = 'none';
            });
        } else if (el.saveBtn && el.qInput && el.aInput) {
            el.saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const q = el.qInput.value.trim();
                const a = el.aInput.value.trim();
                if (!q || !a) return;
                addCard(q, a);
                el.qInput.value = '';
                el.aInput.value = '';
            });
        }

        // keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (e.key === 'ArrowLeft') prevCard();
            if (e.key === 'ArrowRight') nextCard();
            if (e.key === 'Delete') {
                if (cards.length > 0 && confirm('Delete current card?')) deleteCard(current);
            }
        });
    }

    // Init
    function init() {
        load();
        attachControls();
        renderActiveCard();
        renderCardsList();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();