import { createStore } from 'redux';
import rootReducer from './reducers';

const inititalState = {};

// 스토어를 준비한다. 루트 컴포넌트는 createStore()를 이용해서 스토어를 생성하고 무슨 리듀서를 사용할지 알려준다.
const store = createStore(
  rootReducer,
  inititalState,
);

export default store;