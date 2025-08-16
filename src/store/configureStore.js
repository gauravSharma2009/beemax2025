import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducer';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

const configureStore = ()=> {
    let store = createStore(reducer,applyMiddleware(thunkMiddleware));
    return store;
}

const store = configureStore();

export default store;