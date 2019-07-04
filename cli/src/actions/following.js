import { SET_FOLLOWING_MEMBER, SET_FOLLOWING_POST } from './types';

export const setFollowingMemberList = (memberList) => {
  return {
    type: SET_FOLLOWING_MEMBER,
    payload: { memberList }  
  }
}

export const setFollowingPostList = (postList) => {
  return {
    type: SET_FOLLOWING_POST,
    payload: { postList }  
  }
}