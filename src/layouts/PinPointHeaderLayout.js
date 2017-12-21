import React from 'react';
import { Link } from 'dva/router';
import PageHeader from '../components/PageHeader';
import styles from './PageHeaderLayout.less';


const content = (
  <div className="content">content</div>
);

class PageHeaderLayout extends React.PureComponent {
  render() {
    return (
      <div>
        <PageHeader
          title={content}
          logo={<div className="logo">logo</div>}
          action={<div className="action">action</div>}
        />
      </div>
    );
  }
}

export default PageHeaderLayout;
