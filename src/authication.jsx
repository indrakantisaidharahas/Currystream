// src/authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Import the initialized auth instance

// Function to sign up a new user
export async function signUpUser(email, password) { // Exported as named export
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed up:", user);
    return { success: true, user }; // Return success and user data
  } catch (error) {
    console.error("Error signing up:", error.message);
    return { success: false, error: error.message, errorCode: error.code }; // Return failure with error info
  }
}

// Function to sign in an existing user
export async function signInUser(email, password) { // Exported as named export
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user);
    return { success: true, user }; // Return success and user data
  } catch (error) {
    console.error("Error signing in:", error.message);
    return { success: false, error: error.message, errorCode: error.code }; // Return failure with error info
  }
}
