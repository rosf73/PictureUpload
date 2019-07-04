import { SET_TOKEN, SET_MEMBER_ID } from '../actions/types';

const initialState = {
    token: '',
    memberID: '',
}

export default function(state = initialState, action ) {
  switch(action.type) {
      case SET_TOKEN:
          return {
              ...state,
              token: action.payload.token,
          }
      case SET_MEMBER_ID:
        return {
            ...state,
            memberID: action.payload.memberID,
        }
      default:
          return state;
  }
}

