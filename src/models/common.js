import { queryApplications } from '../services/api';

export default {
  namespace: 'common',

  state: {
    applications: [],
  },

  effects: {
    *fetchApplications(_, { call, put }) {
      const response = yield call(queryApplications);
      yield put({
        type: 'changeApplications',
        payload: response,
      });
    },
  },

  reducers: {
    changeApplications(state, action) {
      return {
        ...state,
        applications: action.payload,
      };
    },
  },
};
