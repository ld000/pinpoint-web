import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { routerActions } from 'react-router-redux'
import { connect } from 'react-redux'

import { updateTabList } from '../../actions/tabList'

// 跳转/切换标签页
// 引入后，直接 @goTab, 之后可以从 props.goTab 直接调用
// this.props.goTab(名称, 路径, 内容 )
export default ComponsedComponent => {
  @connect(
    state => ({ config: state.config, tabList: state.tabListResult }),
    dispatch => ({ actions: bindActionCreators(routerActions, dispatch), dispatch: dispatch })
  )
  class NewComponent extends Component {
    goTab = (name, path, cnt) => {
      let content = cnt
      // 为每个tab页带上父页面的id
      if (!content) {
        const parentPage = this.props.tabList.list.filter(tab => tab.key === this.props.route.path)
        if (parentPage[0]) {
          content = parentPage[0].content
        }
      }
      this.props.actions.push(path)
      this.props.dispatch(updateTabList({ title: name, content: content, key: path }))
    }
    render() {
      return <ComponsedComponent goTab={this.goTab} {...this.props} />
    }
  }
  return NewComponent
}
