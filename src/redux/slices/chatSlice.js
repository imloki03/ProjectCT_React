import {createSlice} from "@reduxjs/toolkit";


const chatSlice = createSlice({
    name: "chat",
    initialState: {
        finding: {
            id: 0,
            timestamp: null,
        },
        shouldReloadPin: null,
        shouldMediaReload: null,
    },
    reducers: {
        setFinding: (state, action) => {
            state.finding.id = action.payload.id;
            state.finding.timestamp = action.payload.timestamp || Date.now();
        },
        setShouldReloadPin: (state, action) => {
            state.shouldReloadPin = action.payload || Date.now();
        },
        setShouldMediaReload: (state, action) => {
            state.shouldMediaReload = action.payload || Date.now();
        }
    }
});

export const {setFinding, setShouldReloadPin, setShouldMediaReload} = chatSlice.actions;

export default chatSlice.reducer;