importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyDgtLKEiwZj2YBOLqETuB1rwnGP_Sqnbls',
    authDomain: 'projectctandroid.firebaseapp.com',
    projectId: 'projectctandroid',
    storageBucket: 'projectctandroid.appspot.com',
    messagingSenderId: '1079334863903',
    appId: '1:1079334863903:android:d400c83e24e8846a7d012a'
});

const messaging = firebase.messaging();