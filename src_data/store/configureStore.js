import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducer';
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';

const configureStore = ()=> {
    let store = createStore(reducer,applyMiddleware(thunk, logger));
    return store;
}

const store = configureStore();

export default store;