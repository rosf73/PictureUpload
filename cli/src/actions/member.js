import { SET_MEMBER_INFO } from './types';

export const setMemberInfo = (memberInfo) => {
  return {
    type: SET_MEMBER_INFO,
    payload: { memberInfo }  
  }
}