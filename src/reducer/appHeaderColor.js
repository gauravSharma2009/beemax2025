const initialState = {
    // appHeaderColor: "#3c006a",
    appHeaderColor: "#FFFFFF",

};

export function appHeaderColor(state = initialState, action) {
    switch (action.type) {
        case "APP_HEADER_COLOR": {
            let appHeaderColor = action.payload.appHeaderColor;
            return { ...state, appHeaderColor }
        }
        default:
            return state;
    }
}