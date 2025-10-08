ShopEZ - Simple Shopping App (Expo + Firebase)

Applications needed
- Node.js
- Git Bash
- Expo Go app on your phone
- A Firebase project (console) with Email/Password Auth and Realtime Database enabled

Install & Run
-------------
1) Install dependencies

```bash
npm install
```

2) Add Firebase config

Open `firebase/firebase.ts` and replace the placeholder values:

```ts
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

How to find these: In Firebase Console → Project Settings → General → Your apps.

3) Start the app

```bash
npm run start
```

Scan the QR code with Expo Go.

What’s Included
---------------
- Email/password Register and Login screens with validation
- Persistent login using Firebase Auth + AsyncStorage
- Product list from Fake Store API with category filter
- Product detail screen with Add to Cart
- Cart saved per user in Firebase Realtime Database (read/update/delete)
- React Navigation (Expo Router) for screen navigation

Firebase Setup (Step-by-step)
-----------------------------
1) In Firebase Console → Build → Authentication → Sign-in method → enable Email/Password.
2) In Firebase Console → Build → Realtime Database → Create database → Start in locked mode.
3) Get the Database URL (looks like `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com`) and paste it into `databaseURL`.

Realtime Database Structure
---------------------------
- `carts/{userId}/{productId}` → `{ title, image, price, quantity }`

Security Rules (copy/paste)
---------------------------
In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "carts": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Basic Usage:
1) Create an account on the Register screen
2) Login
3) Browse products, filter by category, tap a product to see details
4) Add to Cart
5) Open Cart tab to change quantity or remove

Troubleshooting:
- If Auth errors like "email already in use" or "invalid password" appear, just read the message and adjust.
- Ensure your `firebase/firebase.ts` values are correct.
- If products don’t load, check your internet connection.
