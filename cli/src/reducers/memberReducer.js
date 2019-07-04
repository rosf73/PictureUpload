import { SET_MEMBER_INFO } from '../actions/types';

const initialState = {
    memberInfo: {numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:''},
}

export default function(state = initialState, action ) {
  switch(action.type) {
      case SET_MEMBER_INFO:
          return {
              ...state,
              memberInfo: action.payload.memberInfo,
          }
      default:
          return state;
  }
}

