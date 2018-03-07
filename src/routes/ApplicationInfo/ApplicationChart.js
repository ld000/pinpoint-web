import React, { Component } from 'react';
import { connect } from 'dva';
import echarts from 'echarts';
import { Card } from 'antd';


import styles from './ApplicationChart.less';

@connect(state => ({
  applicationChart: state.applicationChart,
}))
export default class ApplicationChart extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
    });
    const treeMapDiv = echarts.init(this.treeMap);
    treeMapDiv.setOption(
      {
        series: [{
          type: 'treemap',
          data: [{
            name: 'nodeA',
            value: 10,
            children: [{
              name: 'nodeAa',
              value: 4,
            }, {
              name: 'nodeAb',
              value: 6,
            }],
          }, {
            name: 'nodeB',
            value: 20,
            children: [{
              name: 'nodeBa',
              value: 20,
              children: [{
                name: 'nodeBa1',
                value: 20,
              }],
            }],
          }],
        }],
      }
    );
  }

  render() {
    return (
      <Card bordered={false}>
        <div>
          <div ref={(c) => { this.treeMap = c; }} className={styles.treeMap} />
        </div>
      </Card>
    );
  }
}
