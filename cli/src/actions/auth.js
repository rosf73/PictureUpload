import { SET_TOKEN, SET_MEMBER_ID } from './types';

export const setToken = (token) => {
  //console.log("뀨뀨뀨꺄꺄꺄");
  //console.log(token);
  return {
    type: SET_TOKEN,
    payload: { token }  
  }
}

export const setMemberID = (memberID) => {
  //console.log("뀨뀨뀨꺄꺄꺄");
  //console.log(isAuth);
  return {
    type: SET_MEMBER_ID,
    payload: { memberID }  
  }
}
