export const changeCartCount = (cartCount) => {
    return {
        type: 'CART_COUNT',
        payload: { cartCount }
    }
};
