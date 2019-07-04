import { combineReducers } from 'redux';

import authReducer from './authReducer';
import boardReducer from './boardReducer';
import memberReducer from './memberReducer';
import followingReducer from './followingReducer';

const rootReducer =  combineReducers({
  auth: authReducer, // authReducer가 auth 상태를 담당
  board: boardReducer, // boardReducer가 post 정보를 담당
  member: memberReducer, // memberReducer가 member 정보를 담당
  follow: followingReducer,
});

export default rootReducer;