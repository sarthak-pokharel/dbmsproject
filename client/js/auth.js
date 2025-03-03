class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        $('#loginForm').on('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Show registration modal
        $('#showRegisterBtn').on('click', (e) => {
            e.preventDefault();
            $('#registerModal').modal('show');
        });

        // Register button click
        $('#registerBtn').on('click', (e) => {
            e.preventDefault();
            this.register();
        });

        // Logout button click
        $('#logoutBtn').on('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    async login() {
        try {
            const username = $('#username').val();
            const password = $('#password').val();

            const response = await axios.post(`${config.apiBaseUrl}${config.endpoints.login}`, {
                username,
                password
            });

            if (response.data.user) {
                this.user = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
                
                // Update user display
                $('#userDisplay').text(this.user.name || this.user.username);
                
                // Hide login, show dashboard
                $('#loginContainer').addClass('d-none');
                $('#dashboardContainer').removeClass('d-none');
                
                // Clear form
                $('#loginForm')[0].reset();
                
                // Trigger initial data load
                $(document).trigger('auth:login');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(error.response?.data?.message || 'Invalid username or password');
        }
    }

    async register() {
        try {
            const username = $('#registerForm [name="username"]').val();
            const password = $('#registerForm [name="password"]').val();
            const name = $('#registerForm [name="name"]').val();

            if (!username || !password || !name) {
                alert('Please fill in all fields');
                return;
            }

            await axios.post(`${config.apiBaseUrl}${config.endpoints.register}`, {
                username,
                password,
                name
            });

            // Clear form and hide modal
            $('#registerForm')[0].reset();
            $('#registerModal').modal('hide');

            // Show success message
            alert('Registration successful! You can now login.');

        } catch (error) {
            console.error('Registration error:', error);
            alert(error.response?.data?.message || 'Error during registration. Please try again.');
        }
    }

    logout() {
        // Clear stored data
        localStorage.removeItem('user');
        this.user = null;
        
        // Show login, hide dashboard
        $('#dashboardContainer').addClass('d-none');
        $('#loginContainer').removeClass('d-none');
        
        // Trigger logout event
        $(document).trigger('auth:logout');
    }

    isAuthenticated() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }

    // Initialize the auth state
    init() {
        if (this.isAuthenticated()) {
            // Update user display
            $('#userDisplay').text(this.user.name || this.user.username);
            
            $('#loginContainer').addClass('d-none');
            $('#dashboardContainer').removeClass('d-none');
            $(document).trigger('auth:login');
        } else {
            $('#dashboardContainer').addClass('d-none');
            $('#loginContainer').removeClass('d-none');
        }
    }
}

// Create and initialize auth instance
const auth = new Auth();
$(document).ready(() => auth.init());

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('/api/user/login-validate', {
            username,
            password
        });

        if (response.status === 200) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        alert(error.response?.data?.message || 'Login failed. Please try again.');
    }
});

// Show registration modal
document.getElementById('showRegisterBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
});

// Handle registration form submission
document.getElementById('registerBtn').addEventListener('click', async () => {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        name: formData.get('name')
    };

    try {
        const response = await axios.post('/api/user/register', userData);
        
        if (response.status === 201) {
            alert('Registration successful! Please login.');
            // Hide the modal
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            // Clear the form
            form.reset();
        }
    } catch (error) {
        alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
}); 