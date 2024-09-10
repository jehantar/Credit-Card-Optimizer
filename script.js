// Array to store credit card information
let creditCards = [];
let map, marker;

// Function to add a new card
function addCard(event) {
    event.preventDefault();
    console.log("Add Card function called");
    
    const card = {
        name: document.getElementById('cardName').value,
        groceryPoints: parseFloat(document.getElementById('groceryPoints').value),
        diningPoints: parseFloat(document.getElementById('diningPoints').value),
        travelPoints: parseFloat(document.getElementById('travelPoints').value),
        otherPoints: parseFloat(document.getElementById('otherPoints').value),
        pointValue: parseFloat(document.getElementById('pointValue').value)
    };

    console.log("New card object:", card);
    
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
                    <div class="card-content">
                        <div class="card-column">
                            <p><i class="fas fa-shopping-cart"></i> <strong>Grocery Points:</strong> ${card.groceryPoints}x</p>
                            <p><i class="fas fa-utensils"></i> <strong>Dining Points:</strong> ${card.diningPoints}x</p>
                        </div>
                        <div class="card-column">
                            <p><i class="fas fa-plane"></i> <strong>Travel Points:</strong> ${card.travelPoints}x</p>
                            <p><i class="fas fa-star"></i> <strong>Other Points:</strong> ${card.otherPoints}x</p>
                        </div>
                    </div>
                    <p><i class="fas fa-coins"></i> <strong>Point Value:</strong> ${card.pointValue} cents</p>
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
async function calculateBestCard() {
    console.log('Calculate Best Card function called');
    let category;
    let locationBased = false;
    let address = '';

    const useCurrentLocation = document.getElementById('useCurrentLocation').checked;

    try {
        let position;
        if (useCurrentLocation) {
            console.log('Attempting to get current location...');
            position = await getCurrentLocation();
            position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } else {
            const enteredAddress = document.getElementById('addressInput').value;
            console.log('Using entered address:', enteredAddress);
            if (!enteredAddress) {
                throw new Error('Please enter an address');
            }
            position = await getCoordinatesFromAddress(enteredAddress);
        }

        console.log('Position:', position);
        updateMap(position.latitude, position.longitude);
        console.log('Fetching place details...');
        const placeDetails = await getPlaceDetails(position.latitude, position.longitude);
        console.log('Place details:', placeDetails);
        category = mapPlaceDetailsToCategory(placeDetails);
        console.log('Mapped category:', category);
        address = formatAddress(placeDetails);
        locationBased = true;
    } catch (error) {
        console.error('Error in calculateBestCard:', error);
        alert(error.message || 'An error occurred while calculating the best card. Please try again.');
        category = document.getElementById('category').value;
    }

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
            <h3>Best Card for ${category}${locationBased ? ' (based on location)' : ''}:</h3>
            <p><strong>${bestCard.name}</strong></p>
            <p>Value: ${bestValue.toFixed(2)} cents per dollar spent</p>
            ${locationBased ? `
                <p>Address: ${address}</p>
                <p>Determined Category: ${category}</p>
            ` : ''}
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

// Function to get current location
function getCurrentLocation() {
    console.log('Getting current location...');
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
}

// Function to get coordinates from an address
async function getCoordinatesFromAddress(address) {
    console.log(`Getting coordinates for address: ${address}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'CreditCardOptimizerApp/1.0'
            }
        });
        const data = await response.json();
        console.log('Nominatim response:', data);
        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        }
        throw new Error('No coordinates found for the given address');
    } catch (error) {
        console.error('Error getting coordinates from address:', error);
        throw error;
    }
}

// Function to get place details from coordinates using OpenStreetMap
async function getPlaceDetails(latitude, longitude) {
    console.log(`Fetching place details for lat: ${latitude}, lon: ${longitude}`);
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'CreditCardOptimizerApp/1.0'
            }
        });
        const data = await response.json();
        console.log('Place details response:', data);
        if (data && data.address) {
            return data;  // Return the entire data object, not just address
        }
        throw new Error('No place details found');
    } catch (error) {
        console.error('Error fetching place details:', error);
        throw error;
    }
}

// Function to map place details to card categories
function mapPlaceDetailsToCategory(placeDetails) {
    console.log('Mapping place details to category:', placeDetails);
    const categoryMappings = {
        restaurant: 'dining',
        cafe: 'dining',
        fast_food: 'dining',
        bar: 'dining',
        pub: 'dining',
        supermarket: 'grocery',
        grocery: 'grocery',
        convenience: 'grocery',
        hotel: 'travel',
        hostel: 'travel',
        motel: 'travel',
        airport: 'travel',
        train_station: 'travel',
        bus_station: 'travel',
        // Add more mappings as needed
    };

    // Check amenity first
    if (placeDetails.address.amenity && categoryMappings[placeDetails.address.amenity]) {
        return categoryMappings[placeDetails.address.amenity];
    }

    // Then check shop
    if (placeDetails.address.shop && categoryMappings[placeDetails.address.shop]) {
        return categoryMappings[placeDetails.address.shop];
    }

    // Then check tourism
    if (placeDetails.address.tourism && categoryMappings[placeDetails.address.tourism]) {
        return categoryMappings[placeDetails.address.tourism];
    }

    // If no specific category is found, return 'other'
    console.log('No specific category mapped, defaulting to "other"');
    return 'other';
}

// Function to format address
function formatAddress(placeDetails) {
    const components = [];
    if (placeDetails.address.road) components.push(placeDetails.address.road);
    if (placeDetails.address.city) components.push(placeDetails.address.city);
    if (placeDetails.address.state) components.push(placeDetails.address.state);
    if (placeDetails.address.country) components.push(placeDetails.address.country);
    return components.join(', ');
}

// Function to initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Function to update the map with new coordinates
function updateMap(latitude, longitude) {
    if (!map) {
        initMap();
    }
    map.setView([latitude, longitude], 13);
    if (marker) {
        marker.setLatLng([latitude, longitude]);
    } else {
        marker = L.marker([latitude, longitude]).addTo(map);
    }
}

// Function to toggle address input visibility
function toggleAddressInput() {
    const addressInputContainer = document.getElementById('addressInputContainer');
    const useEnteredAddress = document.getElementById('useEnteredAddress').checked;
    addressInputContainer.style.display = useEnteredAddress ? 'block' : 'none';
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded");

    loadCards();
    
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.addEventListener('submit', addCard);
        console.log("Form submit event listener added");
    } else {
        console.error("Card form not found");
    }

    // Add event listener for location-based calculation
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateBestCard);
        console.log("Calculate button event listener added");
    } else {
        console.error("Calculate button not found");
    }

    // Add event listeners for location type radio buttons
    document.getElementById('useCurrentLocation').addEventListener('change', toggleAddressInput);
    document.getElementById('useEnteredAddress').addEventListener('change', toggleAddressInput);

    initMap();
});