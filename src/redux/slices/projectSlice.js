import { createSlice} from '@reduxjs/toolkit';

const projectSlice = createSlice({
    name: 'project',
    initialState: {
        currentProject: null,
        currentCollab: null,
    },
    reducers: {
        updateCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        updateCurrentCollab: (state, action) => {
            state.currentCollab  = action.payload;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
    },
});

export const { clearCurrentProject, updateCurrentProject, updateCurrentCollab } = projectSlice.actions;

export default projectSlice.reducer;