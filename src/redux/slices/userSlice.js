import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    token: localStorage.getItem("token") || null,
    oAuthUpdated: localStorage.getItem("updated") !== "false",
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
        updateToken: (state, action) => {
            state.token = action.payload;
        },
        updateUser: (state, action) => {
            state.currentUser = action.payload;
        },
        updateOauth: (state, action) => {
            state.oAuthUpdated = action.payload;
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

export const { loginSuccess, logout , updateToken, updateUser, updateOauth, addMessage} = userSlice.actions;
export default userSlice.reducer;