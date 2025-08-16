export const changeLoadingState = (isLoading) => {
    return {
        type: 'LOADING',
        payload: { isLoading }
    }
};
