export const changePinCodeState = (pincode) => {
    return {
        type: 'PIN_CODE',
        payload: { pincode }
    }
};

export const changeAddressState = (address) => {
    return {
        type: 'ADDRESS',
        payload: { address }
    }
};

