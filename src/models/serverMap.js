import { queryServerMap } from '../services/serverMap';

export default {
  namespace: 'serverMap',

  state: {
    data: {},
  },

  effects: {
    *fetchServerMap(_, { call, put }) {
      const response = yield call(queryServerMap);
      yield put({
        type: 'changeServerMapData',
        payload: response,
      });
    },
  },

  reducers: {
    changeServerMapData(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
