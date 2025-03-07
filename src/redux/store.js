import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        project: projectReducer,
    },
});

export default store;