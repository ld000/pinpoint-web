import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux'

import routes from './routes';
import configure from './store/configureStore';
import myhistory from './history'

const store = configure({ config: global })
const history = syncHistoryWithStore(myhistory, store)
history.listen(location => console.log('location:', location))

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} >
        { routes }
    </Router>
  </Provider>,
  document.getElementById('root')
);
