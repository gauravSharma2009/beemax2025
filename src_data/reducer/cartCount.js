
const initialState = {
    count: 0,
};

export function cartCount(state = initialState, action) {
    switch (action.type) {
        case "CART_COUNT": {
            console.log("inside reducer :" + JSON.stringify(action.payload))
            let cartCount = action.payload.cartCount;
            return { ...state, count: cartCount }
        }

        default:
            return state;
    }
}