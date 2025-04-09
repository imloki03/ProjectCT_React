import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        project: projectReducer,
        chat: chatReducer,
    },
});

export default store;