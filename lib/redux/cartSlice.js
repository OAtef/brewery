import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const productIndex = state.products.findIndex(
        (p) => p.id === action.payload.id
      );
      if (productIndex !== -1) {
        state.products[productIndex].quantity++;
      } else {
        state.products.push({ ...action.payload, quantity: 1 });
      }
    },
    removeProduct: (state, action) => {
      const productIndex = state.products.findIndex(
        (p) => p.id === action.payload.id
      );
      if (productIndex !== -1) {
        if (state.products[productIndex].quantity > 1) {
          state.products[productIndex].quantity--;
        } else {
          state.products.splice(productIndex, 1);
        }
      }
    },
    clearCart: (state) => {
      state.products = [];
    },
  },
});

export const { addProduct, removeProduct, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
