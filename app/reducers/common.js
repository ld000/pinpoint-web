import { handleActions } from 'redux-actions'

/* bd reducer */
const bdListState = () => ({ list: [] })
export const bdList = handleActions({
  'request bd list'(state, action) {
    return { ...state, loading: true }
  },
}, bdListState())
