import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const authAction = document.getElementById('authAction');
    const authText = authAction?.querySelector('.auth-text');
    const authIcon = authAction?.querySelector('.material-icons, .material-icons-sharp');
    const authLink = authAction?.querySelector('a');

    if (!authAction) return;

    onAuthStateChanged(auth, (user) => {
        const rsName = document.querySelector('.rs-user-info h4');
        const rsPlan = document.querySelector('.rs-user-info span');
        const rsImg = document.querySelector('.rs-profile img');

        if (user) {
            if (authText) authText.textContent = 'Logout';
            if (authIcon) authIcon.textContent = 'logout';
            if (authLink) {
                authLink.href = '#';
                authLink.onclick = (e) => {
                    e.preventDefault();
                    signOut(auth).then(() => window.location.reload());
                };
            }

            // Update sidebar profile
            if (rsName) rsName.textContent = user.displayName || user.email.split('@')[0];
            if (rsImg && user.photoURL) rsImg.src = user.photoURL;
            if (rsPlan) rsPlan.textContent = 'Pro Plan'; // Mocking a pro plan for authed users

            console.log("Logged in as: " + user.email);
        } else {
            if (authText) authText.textContent = 'Login';
            if (authIcon) authIcon.textContent = 'login';
            if (authLink) {
                authLink.href = 'assets/pages/login.html';
                authLink.onclick = null;
            }

            if (rsName) rsName.textContent = 'Guest';
            if (rsPlan) rsPlan.textContent = 'Free Plan';
            if (rsImg) rsImg.src = 'assets/images/favicons/Musify.png';
        }
    });
});
