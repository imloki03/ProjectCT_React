import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    token: localStorage.getItem("token") || null,
    assistantMsg: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.currentUser = action.payload.userData;
            state.token = action.payload.token;
        },
        updateUser: (state, action) => {
            state.currentUser = action.payload;
        },
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
        },
        addMessage: (state, action) => {
            state.assistantMsg = [...state.assistantMsg, action.payload];
        }
    },
});

export const { loginSuccess, logout ,updateUser, addMessage} = userSlice.actions;
export default userSlice.reducer;