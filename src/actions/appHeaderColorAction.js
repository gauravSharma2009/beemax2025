export function changeAppHeaderColorState(appHeaderColor) {
    return (dispatch) => {
        dispatch({
            type: "APP_HEADER_COLOR",
            payload: { appHeaderColor }
        })
    }
}