import {
  routerReducer as routing,
} from 'react-router-redux'
import {
  combineReducers,
} from 'redux'

import * as common from './common'  // 通用 reducers

const rootReducer = combineReducers({
  routing,
  config: (state = {}) => state,
  ...common
});

export default rootReducer;
