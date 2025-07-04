
// NOTE: Firebase configuration is loaded from environment variables.
// You must create a `.env.local` file in the root of your project
// and add your Firebase project configuration there.
//
// Example .env.local:
// VITE_FIREBASE_API_KEY="AIza..."
// VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
// VITE_FIREBASE_PROJECT_ID="your-project"
// VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
// VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
// VITE_FIREBASE_APP_ID="1:1234567890:web:abc..."

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// This strict check prevents the app from crashing with an obscure error from Firebase
// if the environment is configured correctly but the .env.local file is missing keys.
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  const missingEnvVars = missingKeys.map(k => {
    // Converts camelCase key to SNAKE_CASE for the variable name
    const upperCaseKey = k.replace(/([A-Z])/g, '_$1').toUpperCase();
    return `VITE_FIREBASE_${upperCaseKey}`;
  });

  // We throw an error to halt execution and provide a clear, actionable message.
  throw new Error(
    `FATAL: Firebase configuration is incomplete. The application cannot start.
Please create or check your .env.local file in the project's root directory and add the following missing environment variables:
- ${missingEnvVars.join('\n- ')}

You can get these values from your Firebase project's settings page.`
  );
}
