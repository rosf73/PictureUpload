import { SET_POST_INFO, SET_TAG } from '../actions/types';

const initialState = {
    postInfo: {},
    tag: ''
}

export default function(state = initialState, action ) {
  switch(action.type) {
      case SET_POST_INFO:
          return {
              ...state,
              postInfo: action.payload.postInfo,
          }
      case SET_TAG:
        return {
            ...state,
            tag: action.payload.tag,
        } 
      default:
          return state;
  }
}

