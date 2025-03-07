import { createSlice} from '@reduxjs/toolkit';

const projectSlice = createSlice({
    name: 'project',
    initialState: {
        currentProject: null,
    },
    reducers: {
        updateCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
    },
});

export const { clearCurrentProject, updateCurrentProject } = projectSlice.actions;

export default projectSlice.reducer;