document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const signInBtn = document.getElementById('signIn');

    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });

    signInBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
});

function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('Please fill in all fields.', 'error');
        return false;
    }

    const user = {
        email: email,
        password: password
    };

    login(user);
    return false; // Prevent form submission
}

async function performFetch(url, method, data) {
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network error.');
    }

    return response.json();
}

async function login(user) {
    const loginBtn = document.querySelector('#login-form button[type="submit"]');
    loginBtn.disabled = true; // Disable button during request

    try {
        const data = await performFetch('http://localhost:8082/auth/login', 'POST', user);
        localStorage.setItem('authToken', data.data.token);
        showMessage('Logged in!', 'success');
        setTimeout(() => {
            window.location.href = '../Rooms/Rooms.html';
        }, 1000);
    } catch (error) {
        console.error('Error during login request:', error);
        showMessage(error.message, 'error');
    } finally {
        loginBtn.disabled = false; // Re-enable button after response
    }
}

async function registerUser() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
        showMessage('Please fill in all fields.', 'error');
        return false;
    }

    const newUser = {
        userName: username,
        email: email,
        password: password
    };

    try {
        const data = await performFetch('http://localhost:8082/auth/register', 'POST', newUser);
        showMessage(data.message, 'success');
        document.getElementById('container').classList.remove('active');
    } catch (error) {
        console.error('Error registering user:', error);
        showMessage(error.message, 'error');
    }

    return false; // Prevent form submission
}

function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = 'message-box ' + type; // Combine classes
        messageBox.style.display = 'block';
        
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    } else {
        console.warn('Element messageBox not found');
    }
}
