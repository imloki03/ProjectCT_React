import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    token: localStorage.getItem("token") || null,
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
    },
});

export const { loginSuccess, logout ,updateUser} = userSlice.actions;
export default userSlice.reducer;