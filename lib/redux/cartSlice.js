import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const { product, variant, packaging, price } = action.payload;
      const productIndex = state.products.findIndex(
        (p) => 
          p.id === product.id && 
          p.variant?.id === variant?.id && 
          p.packaging?.id === packaging?.id
      );

      if (productIndex !== -1) {
        state.products[productIndex].quantity++;
      } else {
        state.products.push({ 
          ...product, 
          variant, 
          packaging, 
          unitPrice: price,
          quantity: 1 
        });
      }
    },
    removeProduct: (state, action) => {
      const { product, variant, packaging } = action.payload;
      const productIndex = state.products.findIndex(
        (p) => 
          p.id === product.id && 
          p.variant?.id === variant?.id && 
          p.packaging?.id === packaging?.id
      );

      if (productIndex !== -1) {
        if (state.products[productIndex].quantity > 1) {
          state.products[productIndex].quantity--;
        } else {
          state.products.splice(productIndex, 1);
        }
      }
    },
    updateQuantity: (state, action) => {
      const { product, variant, packaging, quantity } = action.payload;
      const productIndex = state.products.findIndex(
        (p) => 
          p.id === product.id && 
          p.variant?.id === variant?.id && 
          p.packaging?.id === packaging?.id
      );

      if (productIndex !== -1) {
        if (quantity <= 0) {
          state.products.splice(productIndex, 1);
        } else {
          state.products[productIndex].quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.products = [];
    },
  },
});

export const { addProduct, removeProduct, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
