
const initialState = {
    pincode: 760001,
    address:''
};

export function pinCode(state = initialState, action) {
    switch (action.type) {
        case "PIN_CODE": {
             console.log("inside reducer :" + JSON.stringify(action.payload))
            let pincode = action.payload.pincode;
            return { ...state, pincode }
        }
        case "ADDRESS": {
            console.log("inside reducer :" + JSON.stringify(action.payload))
           let address = action.payload.address;
           return { ...state, address }
       }
        default:
            return state;
    }
}