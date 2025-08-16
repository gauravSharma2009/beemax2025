// popupReducer.js

// Action Types
export const SET_POPUP = 'SET_POPUP';

// Initial State
const initialState = {
    message: '',
    status: '',
    open: false,
};

// Reducer
export function message(state = initialState, action) {
    switch (action.type) {
        case SET_POPUP:
            return {
                ...state,
                message: action.payload.message,
                status: action.payload.status,
                open: action.payload.open,
            };

        default:
            return state;
    }
};


