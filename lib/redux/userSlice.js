import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: null,
  role: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    clearUser: (state) => {
      state.id = null;
      state.name = null;
      state.role = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
