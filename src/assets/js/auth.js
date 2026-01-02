import { auth } from "./firebase-init.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * Service to handle Authentication logic.
 * Follows Single Responsibility Principle by being the sole handler of Auth API calls.
 */
export class AuthService {
    constructor() {
        this.auth = auth;
        this.googleProvider = new GoogleAuthProvider();
    }

    /**
     * Log in a user with email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{user: object, error: string}>}
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return { user: userCredential.user, error: null };
        } catch (error) {
            console.error("Login Error:", error);
            return { user: null, error: this._formatErrorMessage(error) };
        }
    }

    /**
     * Sign up a new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} displayName 
     * @returns {Promise<{user: object, error: string}>}
     */
    async signup(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }
            return { user: userCredential.user, error: null };
        } catch (error) {
            console.error("Signup Error:", error);
            return { user: null, error: this._formatErrorMessage(error) };
        }
    }

    /**
     * Log in with Google
     * @returns {Promise<{user: object, error: string}>}
     */
    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(this.auth, this.googleProvider);
            return { user: result.user, error: null };
        } catch (error) {
            console.error("Google Login Error:", error);
            return { user: null, error: this._formatErrorMessage(error) };
        }
    }

    /**
     * Send a password reset email
     * @param {string} email 
     * @returns {Promise<{success: boolean, error: string}>}
     */
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
            return { success: true, error: null };
        } catch (error) {
            console.error("Reset Password Error:", error);
            return { success: false, error: this._formatErrorMessage(error) };
        }
    }

    /**
     * Log out the current user
     * @returns {Promise<{error: string}>}
     */
    async logout() {
        try {
            await signOut(this.auth);
            return { error: null };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Subscribe to auth state changes
     * @param {function} callback 
     */
    onAuthStateChanged(callback) {
        onAuthStateChanged(this.auth, callback);
    }

    /**
     * Helper to format Firebase error messages
     * @param {object} error 
     * @returns {string}
     */
    _formatErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Invalid email address format.';
            case 'auth/user-disabled':
                return 'This user has been disabled.';
            case 'auth/user-not-found':
                return 'No user found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'Email is already registered.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in cancelled by user.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            case 'auth/missing-email':
                return 'Please enter your email address.';
            default:
                return error.message;
        }
    }
}
