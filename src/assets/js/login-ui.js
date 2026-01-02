import { AuthService } from './auth.js';

const authService = new AuthService();

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const authTabs = document.getElementById('authTabs');
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.form-view');
    const authTitle = document.querySelector('.auth-title');
    const authSubtitle = document.querySelector('.auth-subtitle');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLogin');
    const socialSeparator = document.getElementById('socialSeparator');
    const googleBtn = document.getElementById('googleBtn');

    // Forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetForm = document.getElementById('resetForm');

    // UI State Helpers
    const setUIState = (view) => {
        // Hide all forms
        forms.forEach(f => f.classList.remove('active'));

        // Reset Auth Title default
        authTitle.textContent = 'Welcome';
        authSubtitle.textContent = 'Join the rhythm of your life.';
        socialSeparator.classList.remove('hidden');
        googleBtn.classList.remove('hidden');
        authTabs.classList.remove('hidden');

        if (view === 'login') {
            document.getElementById('loginForm').classList.add('active');
            updateActiveTab('login');
        }
        else if (view === 'signup') {
            document.getElementById('signupForm').classList.add('active');
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Start your musical journey.';
            updateActiveTab('signup');
        }
        else if (view === 'reset') {
            document.getElementById('resetForm').classList.add('active');
            authTitle.textContent = 'Reset Password';
            authSubtitle.textContent = 'Get back into the groove.';
            socialSeparator.classList.add('hidden');
            googleBtn.classList.add('hidden');
            authTabs.classList.add('hidden');
        }

        clearErrors();
    };

    const updateActiveTab = (target) => {
        tabs.forEach(t => t.classList.remove('active'));
        const tab = document.querySelector(`.auth-tab[data-target="${target}"]`);
        if (tab) tab.classList.add('active');
    };

    const clearErrors = () => {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    };

    // Tab Event Listeners
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            setUIState(target);
        });
    });

    // Forgot Password & Back Links
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        setUIState('reset');
    });

    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        setUIState('login');
    });

    // --- FORM HANDLERS ---

    // Login Handle
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('loginError');

        setLoading(btn, 'Logging in...');
        errorDiv.textContent = '';

        const result = await authService.login(email, password);

        if (result.error) {
            errorDiv.textContent = result.error;
            resetLoading(btn, 'Log In');
        } else {
            btn.textContent = 'Success!';
            redirectHome();
        }
    });

    // Signup Handle
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const btn = document.getElementById('signupBtn');
        const errorDiv = document.getElementById('signupError');

        setLoading(btn, 'Creating Account...');
        errorDiv.textContent = '';

        const result = await authService.signup(email, password, name);

        if (result.error) {
            errorDiv.textContent = result.error;
            resetLoading(btn, 'Sign Up');
        } else {
            btn.textContent = 'Account Created!';
            redirectHome();
        }
    });

    // Google Login Handle
    googleBtn.addEventListener('click', async () => {
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = '<span>Connecting...</span>';
        googleBtn.style.opacity = '0.7';

        const result = await authService.loginWithGoogle();

        if (result.error) {
            // Show error in the active form's error box
            const activeErrorDiv = document.querySelector('.form-view.active .error-message') || document.getElementById('loginError');
            activeErrorDiv.textContent = result.error;
            googleBtn.innerHTML = originalText;
            googleBtn.style.opacity = '1';
        } else {
            googleBtn.innerHTML = '<span>Success!</span>';
            redirectHome();
        }
    });

    // Password Reset Handle
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const btn = document.getElementById('resetBtn');
        const errorDiv = document.getElementById('resetError');

        setLoading(btn, 'Sending...');
        errorDiv.textContent = '';
        errorDiv.style.color = '#ff4444'; // Reset error color just in case

        const result = await authService.resetPassword(email);

        if (!result.success) {
            errorDiv.textContent = result.error;
            resetLoading(btn, 'Send Reset Link');
        } else {
            btn.textContent = 'Link Sent!';
            errorDiv.style.color = '#00ff88';
            errorDiv.textContent = 'Check your email for instructions.';
            setTimeout(() => {
                setUIState('login');
            }, 3000);
        }
    });

    // --- HELPERS ---

    const setLoading = (btn, text) => {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = text;
        btn.disabled = true;
    };

    const resetLoading = (btn, text) => {
        btn.textContent = text || btn.dataset.originalText;
        btn.disabled = false;
    };

    const redirectHome = () => {
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1000);
    };

    // Auth State Check (Redirect if already logged in)
    authService.onAuthStateChanged(user => {
        if (user) {
            console.log('User is logged in:', user.email);
            // window.location.href = '../../index.html';
        }
    });
});
