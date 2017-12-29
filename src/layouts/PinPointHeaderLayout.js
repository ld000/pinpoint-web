import React from 'react';
import { Route, Switch, Redirect } from 'dva/router';
import { Select, DatePicker } from 'antd';
import PageHeader from '../components/PageHeader';
import styles from './PinPointHeaderLayout.less';
import logoPng from '../assets/logo.png';

const { Option } = Select;
const { RangePicker } = DatePicker;


function handleChange(value) {
  console.log(`selected ${value}`);
}

function handleBlur() {
  console.log('blur');
}

function handleFocus() {
  console.log('focus');
}

function onChange(value, dateString) {
  console.log('Selected Time: ', value);
  console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
  console.log('onOk: ', value);
}

const content = (
  <div className="content">
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select application"
      optionFilterProp="children"
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
      <Option value="jack">Jack</Option>
      <Option value="lucy">Lucy</Option>
      <Option value="tom">Tom</Option>
    </Select>
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select topo depth"
    >
      <Option value="jack">1</Option>
      <Option value="lucy">2</Option>
      <Option value="tom">3</Option>
    </Select>
    <RangePicker
      showTime={{ format: 'HH:mm' }}
      format="YYYY-MM-DD HH:mm"
      placeholder={['Start Time', 'End Time']}
      onChange={onChange}
      onOk={onOk}
    />
  </div>
);

const logo = (
  <div>
    <img style={{ width: '100%' }} alt="" src={logoPng} />
  </div>
);

class PageHeaderLayout extends React.PureComponent {
  render() {
    const { getRouteData } = this.props;

    return (
      <div>
        <PageHeader
          className={styles.header}
          title={content}
          logo={logo}
          action={<div className="action">action</div>}
        />
        <Switch>
          {
            getRouteData('PinPointHeaderLayout').map(item =>
              (
                <Route
                  exact={item.exact}
                  key={item.path}
                  path={item.path}
                  component={item.component}
                />
              )
            )
          }
          <Redirect exact from="/" to="/server-map" />
        </Switch>
      </div>
    );
  }
}

export default PageHeaderLayout;
