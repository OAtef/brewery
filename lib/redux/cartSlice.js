import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const { product, variant } = action.payload;
      const productIndex = state.products.findIndex(
        (p) => p.id === product.id && p.variant?.id === variant?.id
      );

      if (productIndex !== -1) {
        state.products[productIndex].quantity++;
      } else {
        state.products.push({ ...product, variant, quantity: 1 });
      }
    },
    removeProduct: (state, action) => {
      const { product, variant } = action.payload;
      const productIndex = state.products.findIndex(
        (p) => p.id === product.id && p.variant?.id === variant?.id
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
