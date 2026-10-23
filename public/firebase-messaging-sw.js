// Firebase Cloud Messaging Service Worker for Soukna
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "gen-lang-client-0821487033",
  appId: "1:722135323125:web:366559a5e7ea8cfa1f90bc",
  apiKey: "AIzaSyD2z6yhXTI5sGHynkzGoiDRxSQ36yG4alM",
  authDomain: "gen-lang-client-0821487033.firebaseapp.com",
  messagingSenderId: "722135323125",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification?.title || 'إشعار جديد من سوقنا';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك تحديث جديد في متجر سوقنا.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    dir: 'rtl',
    lang: 'ar',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
