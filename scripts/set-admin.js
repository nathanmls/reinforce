const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, setDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { USER_ROLES } = require('../app/config/roles.js');

const firebaseConfig = {
  apiKey: "AIzaSyA4WNpKyPKuZTGcFFvhJaqs-z97ILDcz0k",
  authDomain: "reinforce-338b3.firebaseapp.com",
  databaseURL: "https://reinforce-338b3-default-rtdb.firebaseio.com",
  projectId: "reinforce-338b3",
  storageBucket: "reinforce-338b3.firebasestorage.app",
  messagingSenderId: "706280654033",
  appId: "1:706280654033:web:c661fe657313912d4ab1f0",
  measurementId: "G-WFWBW7L73G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setUserAsAdmin(email) {
  try {
    // First, sign in to get the user ID
    const userCredential = await signInWithEmailAndPassword(auth, email, process.env.USER_PASSWORD || 'your-password-here');
    const uid = userCredential.user.uid;

    // Create or update user document
    await setDoc(doc(db, 'users', uid), {
      email,
      role: USER_ROLES.ADMINISTRATOR,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Successfully set user ${email} as Administrator`);
  } catch (error) {
    console.error('Error setting user as admin:', error);
    if (error.code === 'permission-denied') {
      console.log('\nIMPORTANT: You need to enable Firestore API first:');
      console.log('1. Go to https://console.firebase.google.com/project/reinforce-338b3/firestore');
      console.log('2. Click "Create Database"');
      console.log('3. Choose "Start in production mode"');
      console.log('4. Select a location closest to your users');
      console.log('5. Click "Enable"');
      console.log('\nAfter enabling, wait a few minutes and try running this script again.');
    }
  }
}

// Set nathanmls@hotmail.com as administrator
setUserAsAdmin('nathanmls@hotmail.com');
