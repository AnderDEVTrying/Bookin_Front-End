// Function to fetch and display rooms
async function fetchRooms() {
    try {
        const response = await fetch('http://localhost:8081/hotelz/rooms'); 
        const rooms = await response.json();
        const roomsContainer = document.getElementById('roomsContainer');

        roomsContainer.innerHTML = ''; 

        rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room';
            roomDiv.innerHTML = `
                <img src="images/room ${room.roomNumber}.jpg" alt="${room.type}" onerror="this.onerror=null; this.src='images/default.jpg';">
                <div class="room-info">
                    <h3>${room.type} - ${room.roomNumber}</h3>
                    <p>Price: ${room.price.toFixed(2)} Mzn</p>
                    <button id="booking_btn" onclick="bookRoom('${room.roomNumber}')">Book Now</button>
                </div>
            `;
            roomsContainer.appendChild(roomDiv);
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
}

// Check if there is an authentication token stored
const authToken = localStorage.getItem("authToken");

// Function to open the reservation modal when "Book Now" is clicked
function bookRoom(roomNumber) {
    if (!authToken) {
        displayMessage("You need to be logged in to make a reservation.", "error");
        window.location.href = '../registration/login.html';
        return;
    }

    const reservationModal = document.getElementById('reservationModal');
    const roomNumberInput = document.getElementById('roomNumber');

    roomNumberInput.value = roomNumber;
    reservationModal.style.display = 'block';
}

// Function to close the reservation modal
document.getElementById('closeModal').onclick = function() {
    clearReservationForm();
    document.getElementById('reservationModal').style.display = 'none';
}

// Function to clear the reservation form
function clearReservationForm() {
    document.getElementById('roomNumber').value = '';
    document.getElementById('checkIn').value = '';
    document.getElementById('checkOut').value = '';
    document.getElementById('confirmationMessage').style.display = 'none'; // Hide confirmation message
}

// Function to display messages in the confirmation box
function displayMessage(message, type = "success") {
    const confirmationMessage = document.getElementById('confirmationMessage');
    confirmationMessage.textContent = message;
    confirmationMessage.style.display = 'block';

    // Set message color and style based on type
    if (type === "error") {
        confirmationMessage.style.color = "#dc3545";
        confirmationMessage.style.borderColor = "#dc3545";
        confirmationMessage.style.backgroundColor = "#f8d7da";
    } else {
        confirmationMessage.style.color = "#28a745";
        confirmationMessage.style.borderColor = "#28a745";
        confirmationMessage.style.backgroundColor = "#d4edda";
    }
}

// Function to submit the reservation form
document.getElementById('reservationForm').onsubmit = async function(event) {
    event.preventDefault();

    const checkInDate = document.getElementById('checkIn').value;
    const checkOutDate = document.getElementById('checkOut').value;
    const spinner = document.getElementById('loadingSpinner');

    // Check if the token is present
    if (!authToken) {
        displayMessage("You need to be logged in to make a reservation.", "error");
        window.location.href = '../registration/login.html';
        return;
    }

    // Check if the check-in date is valid
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        displayMessage("Invalid check-in date.", "error");
        return;
    }

    // Show the spinner and hide the confirmation message
    spinner.style.display = 'block';
    document.getElementById('confirmationMessage').style.display = 'none';

    const formData = {
        roomNumber: document.getElementById('roomNumber').value,
        checkIn: checkInDate,
        checkOut: checkOutDate
    };

    try {
        const response = await fetch('http://localhost:8081/hotelz/reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });

        // Hide the spinner after the response
        spinner.style.display = 'none';

        const responseData = await response.json();

        // Check if the token has expired (status 401) and redirect to the login screen
        if (response.status === 401) {
            displayMessage("Session expired. You need to log in again.", "error");
            localStorage.removeItem("authToken");
            setTimeout(() => {
                window.location.href = '../registration/login.html';
            }, 3000);
            return;
        }

        if (response.ok) {
            displayMessage(responseData.message, "success");
            
            // Hide the modal after a few seconds and refresh the room list
            setTimeout(() => {
                clearReservationForm(); // Clear the form upon closing
                document.getElementById('reservationModal').style.display = 'none';
                fetchRooms(); // Refresh the list of rooms
            }, 3000);
        } else {
            displayMessage(responseData.message || "Error making the reservation.", "error");
        }
    } catch (error) {
        console.error('Error submitting reservation:', error);
        displayMessage("Error making the reservation. Please try again.", "error");
        spinner.style.display = 'none';
    }
};

// Call fetchRooms when the page loads
window.onload = fetchRooms;
