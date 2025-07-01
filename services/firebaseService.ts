import { firebaseConfig } from "../firebaseConfig";

// Firebase is loaded globally via script tags in index.html.
// To avoid Vite's "Failed to resolve import" error, we must not use
// 'import' statements for firebase. We declare it as a global 'any' type.
// This is a workaround for the persistent module resolution issues.
declare var firebase: any;

// Re-export the User type for other files to use. It's now 'any'
// to align with the global declaration above.
export type User = any;
type AuthError = any;

// Initialize Firebase using the global script.
// The compat script ensures it's only initialized once.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

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
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
        // Use the updateProfile method on the user object (v8 style)
        await userCredential.user.updateProfile({ displayName });
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
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error("Error signing in:", authError.code, authError);
    return { success: false, error: getAuthErrorMessage(authError.code) };
  }
};


const logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out: ", error);
    alert("Error signing out. Please check the console for more details.");
  }
};

const onAuthChange = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export { auth, onAuthChange, signUpWithEmail, signInWithEmail, logout };
