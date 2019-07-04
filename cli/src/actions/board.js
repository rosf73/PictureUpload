import { SET_POST_INFO, SET_TAG } from './types';

export const setPostInfo = (postInfo) => {
  return {
    type: SET_POST_INFO,
    payload: { postInfo }  
  }
}

export const setTag = (tag) => {
  return {
    type: SET_TAG,
    payload: { tag }  
  }
}