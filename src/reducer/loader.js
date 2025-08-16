
const initialState = {
    isLoading: false,
};

export function loader(state = initialState, action) {
    console.log("inside reducer 1:" + JSON.stringify(state))
    switch (action.type) {
        case "LOADING": {
             console.log("inside reducer 2:" + JSON.stringify(action.payload))
            let isLoading = action.payload.isLoading;
            return { ...state, isLoading }
        }

        default:
            return state;
    }
}