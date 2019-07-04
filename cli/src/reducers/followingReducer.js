import { SET_FOLLOWING_MEMBER, SET_FOLLOWING_POST } from '../actions/types';

const initialState = {
    memberList:[],
    postList:[],
}

export default function(state = initialState, action ) {
  switch(action.type) {
    case SET_FOLLOWING_MEMBER:
        return {
            ...state,
            memberList: action.payload.memberList,
        }
    case SET_FOLLOWING_POST:
        return {
            ...state,
            postList: action.payload.postList,
        }
      default:
          return state;
  }
}

