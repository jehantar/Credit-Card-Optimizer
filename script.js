// Array to store credit card information
let creditCards = [];

// Function to add a new card
function addCard(event) {
    event.preventDefault();
    
    const card = {
        name: document.getElementById('cardName').value,
        groceryPoints: parseFloat(document.getElementById('groceryPoints').value),
        diningPoints: parseFloat(document.getElementById('diningPoints').value),
        travelPoints: parseFloat(document.getElementById('travelPoints').value),
        otherPoints: parseFloat(document.getElementById('otherPoints').value),
        pointValue: parseFloat(document.getElementById('pointValue').value)
    };
    
    creditCards.push(card);
    updateCardList();
    saveCards();
    document.getElementById('cardForm').reset();
}

// Function to update the card list display
function updateCardList() {
    const cardList = document.getElementById('cardList');
    let cardListHTML = '<h2>Your Cards</h2>';
    
    if (creditCards.length === 0) {
        cardListHTML += '<p>No cards added yet. Use the form to add a card.</p>';
    } else {
        creditCards.forEach((card, index) => {
            cardListHTML += `
                <div class="card-item">
                    <h3>${card.name}</h3>
                    <p>Grocery: ${card.groceryPoints}x | Dining: ${card.diningPoints}x</p>
                    <p>Travel: ${card.travelPoints}x | Other: ${card.otherPoints}x</p>
                    <p>Point Value: ${card.pointValue} cents</p>
                    <button onclick="removeCard(${index})">Remove</button>
                </div>
            `;
        });
    }
    
    cardList.innerHTML = cardListHTML;
}

// Function to remove a card
function removeCard(index) {
    creditCards.splice(index, 1);
    updateCardList();
    saveCards();
}

// Function to calculate the best card
function calculateBestCard() {
    const store = document.getElementById('store').value;
    const category = document.getElementById('category').value;
    
    let bestCard = null;
    let bestValue = 0;
    
    creditCards.forEach(card => {
        let points;
        switch(category) {
            case 'grocery':
                points = card.groceryPoints;
                break;
            case 'dining':
                points = card.diningPoints;
                break;
            case 'travel':
                points = card.travelPoints;
                break;
            default:
                points = card.otherPoints;
        }
        
        const value = points * card.pointValue;
        
        if (value > bestValue) {
            bestValue = value;
            bestCard = card;
        }
    });
    
    const resultDiv = document.getElementById('result');
    if (bestCard) {
        resultDiv.innerHTML = `
            <h3>Best Card for ${store} (${category}):</h3>
            <p><strong>${bestCard.name}</strong></p>
            <p>Value: ${bestValue.toFixed(2)} cents per dollar spent</p>
        `;
    } else {
        resultDiv.innerHTML = '<p>No cards available. Please add a card first.</p>';
    }
}

// Function to save cards to local storage
function saveCards() {
    localStorage.setItem('creditCards', JSON.stringify(creditCards));
}

// Function to load cards from local storage
function loadCards() {
    const savedCards = localStorage.getItem('creditCards');
    if (savedCards) {
        creditCards = JSON.parse(savedCards);
        updateCardList();
    }
}

// Event listener for form submission
document.getElementById('cardForm').addEventListener('submit', addCard);

// Load cards from local storage on page load
window.onload = loadCards;

// Function to update the card list display
function updateCardList() {
    const cardList = document.getElementById('cardList');
    let cardListHTML = '<h2>Your Cards</h2>';
    
    if (creditCards.length === 0) {
        cardListHTML += '<p>No cards added yet. Use the form to add a card.</p>';
    } else {
        creditCards.forEach((card, index) => {
            cardListHTML += `
                <div class="card-item">
                    <h3>${card.name}</h3>
                    <p><strong>Grocery Points:</strong> ${card.groceryPoints}x</p>
                    <p><strong>Dining Points:</strong> ${card.diningPoints}x</p>
                    <p><strong>Travel Points:</strong> ${card.travelPoints}x</p>
                    <p><strong>Other Points:</strong> ${card.otherPoints}x</p>
                    <p><strong>Point Value:</strong> ${card.pointValue} cents</p>
                    <button onclick="removeCard(${index})">Remove</button>
                </div>
            `;
        });
    }
    
    cardList.innerHTML = cardListHTML;
}

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Function to load dark mode preference
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Event listener for dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

// Load dark mode preference on page load
window.addEventListener('load', loadDarkModePreference);