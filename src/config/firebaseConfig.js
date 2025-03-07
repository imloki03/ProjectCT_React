import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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


export const uploadFileToFirebase = async (file) => {
    try {
        const fileRef = ref(storage, `media/${Date.now()}_${file.name}`);
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
