import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";

// Firebase config
const firebaseConfig = {
    apiKey: 'AIzaSyDgtLKEiwZj2YBOLqETuB1rwnGP_Sqnbls',
    authDomain: 'projectctandroid.firebaseapp.com',
    projectId: 'projectctandroid',
    storageBucket: 'projectctandroid.appspot.com',
    messagingSenderId: '1079334863903',
    appId: '1:1079334863903:android:d400c83e24e8846a7d012a'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const messaging = getMessaging(app);


export const uploadFileToFirebase = async (file) => {
    try {
        const fileRef = ref(storage, `media/${Date.now()}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        return {
            fileUrl,
            fileName: file.name,
            fileSize: file.size
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("File upload failed");
    }
};

export const askNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // console.log('Notification permission granted.');
            return true;
        } else {
            console.warn('Notification permission denied.');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

export const requestToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Notification permission denied. You will not receive notifications.');
            return;
        }

        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            const swRegistration = await navigator.serviceWorker.ready;

            const fcmToken = await getToken(messaging, {
                vapidKey: 'BB48p0qbFZ7OHdWoSWaHP3hKUvO-WYz85gv5K6v4BiedaS4FJYzgUoEdOA_lJwy_V-s3vwXAxIlTZyspnJ--zM4',
                serviceWorkerRegistration: swRegistration,
            });

            if (fcmToken) {
                // console.log('✅ FCM Token:', fcmToken);
                return fcmToken;
            } else {
                console.warn('⚠️ No FCM token retrieved.');
            }
        } else {
            console.error('Service workers are not supported in this browser.');
        }
    } catch (error) {
        console.error('❌ An error occurred while getting FCM token:', error);
    }
};


export const refreshFcmToken = async () => {
    try {
        await deleteToken(messaging);

        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
        }

        indexedDB.deleteDatabase('firebase-messaging-database');
        indexedDB.deleteDatabase('firebase-installations-database');
    } catch (error) {
        console.error("Error during token refresh:", error);
    }
};

export const onMessageListener = (callback) => {
    return onMessage(messaging, callback);
};