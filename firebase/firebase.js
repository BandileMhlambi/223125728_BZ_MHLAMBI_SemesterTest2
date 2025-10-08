import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase config (from your message)
const firebaseConfig = {
  apiKey: 'AIzaSyB4KXqtNG3Bs2syED6D_n7qUWoNEFB7hqs',
  authDomain: 'shopez-5060d.firebaseapp.com',
  projectId: 'shopez-5060d',
  storageBucket: 'shopez-5060d.firebasestorage.app',
  messagingSenderId: '1048151749095',
  appId: '1:1048151749095:web:e5c99ee12644f666b30d42',
  databaseURL: 'https://shopez-5060d-default-rtdb.firebaseio.com',
 
};

// Try to ensure databaseURL exists for Realtime Database usage
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getDatabase(app);
export default app;


