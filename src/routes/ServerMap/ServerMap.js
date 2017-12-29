import React, { Component } from 'react';
import { connect } from 'dva';
import Dag from '../../components/Dag';

@connect(state => ({
  serverMap: state.serverMap,
}))
export default class ServerMap extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'serverMap/fetchServerMap',
    });
  }

  render() {
    const { serverMap } = this.props;
    return (
      <div>
        <Dag mapData={serverMap.data.applicationMapData} />
      </div>
    );
  }
}
