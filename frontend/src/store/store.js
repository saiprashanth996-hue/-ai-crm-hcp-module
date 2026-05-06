import { configureStore, createSlice } from '@reduxjs/toolkit';

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: { list: [], loading: false, error: null, chatMessages: [] },
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    addInteraction: (state, action) => { state.list.unshift(action.payload); },
    setInteractions: (state, action) => { state.list = action.payload; },
    addChatMessage: (state, action) => { state.chatMessages.push(action.payload); },
    setError: (state, action) => { state.error = action.payload; },
    updateInteraction: (state, action) => {
      const index = state.list.findIndex(i => i.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
    },
  },
});

export const { setLoading, addInteraction, setInteractions, addChatMessage, setError, updateInteraction } = interactionSlice.actions;
export default configureStore({ reducer: { interactions: interactionSlice.reducer } });