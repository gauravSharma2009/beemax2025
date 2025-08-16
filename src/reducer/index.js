import { combineReducers } from 'redux'
import { auth } from './auth';
import { loader } from './loader';
import { pinCode } from './pincode';
import { cartCount } from './cartCount';
import { message } from './message';

const rootReducer = combineReducers({
  auth, loader, pinCode, cartCount, message
})

export default rootReducer;