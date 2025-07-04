import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
  type AuthError,
} from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";

// Re-export the User type for other files to use.
export type User = FirebaseUser;

// Initialize Firebase only once to avoid re-initialization errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'No account found with this email and password combination.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'The password must be at least 6 characters long.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // After user is created, update their profile with the display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error signing up:", authError.code, authError);
    return { success: false, error: getAuthErrorMessage(authError.code) };
  }
};

const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error signing in:", authError.code, authError);
    return { success: false, error: getAuthErrorMessage(authError.code) };
  }
};


const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    alert("Error signing out. Please check the console for more details.");
  }
};

const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { onAuthChange, signUpWithEmail, signInWithEmail, logout };