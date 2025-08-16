import { SET_POPUP } from '../reducer/message'

export const setPopup = ({message, status, open}) => ({
    type: SET_POPUP,
    payload: { message, status, open },
});
