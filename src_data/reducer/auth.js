
const initialState = {
    isLoggedIn: false,
};

export function auth(state = initialState, action) {
    //console.log("inside reducer :" + state.isLoggedIn)
    switch (action.type) {
        case "LOG_IN": {
            // console.log("inside reducer :" + JSON.stringify(action.payload))
            let isLoggedIn = action.payload.isLoggedIn;
            return { ...state, isLoggedIn }
        }

        default:
            return state;
    }
}