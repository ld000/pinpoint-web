import React from 'react';
import { connect } from 'dva';
import { Route, Switch, Redirect } from 'dva/router';
import { Select, DatePicker, Dropdown, Button } from 'antd';
import PageHeader from '../components/PageHeader';
import DepthSelect from '../components/DepthSelect';
import styles from './PinPointHeaderLayout.less';
import logoPng from '../assets/logo.png';
import bidirectOn from '../assets/bidirect_on.png';
import bidirectOff from '../assets/bidirect_off.png';
import inBound from '../assets/inbound.png';
import outBound from '../assets/outbound.png';

const icons = require.context('../assets/icons', true);

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

const logo = (
  <div>
    <img style={{ width: '100%' }} alt="" src={logoPng} />
  </div>
);

@connect(state => ({
  common: state.common,
}))
export default class PageHeaderLayout extends React.Component {
  componentWillMount() {
    this.props.dispatch({
      type: 'common/fetchApplications',
    });
  }

  render() {
    const { getRouteData, common } = this.props;

    const menu = (
      <div className={styles.dropdown} selectable="true">
        <ul className={styles.inbound}>
          <li className={styles['inbound-title']}>
            <img src={inBound} alt="inBound" width="20px" height="20px" /> Inbound
          </li>
          <li className={styles.selected}>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        <ul className={styles.outbound}>
          <li className={styles['outbound-title']}>
            <img src={outBound} alt="outBound" width="20px" height="20px" /> Outbound
          </li>
          <li>1</li>
          <li className={styles.selected}>2</li>
          <li>3</li>
        </ul>
        <div style={{ clear: 'both', padding: '6px 2px 4px 2px' }}>
          <img
            src={bidirectOn}
            width="22px"
            height="22px"
            style={{ float: 'left', marginLeft: '4px', cursor: 'pointer' }}
            alt="Bidirectional Search"
          />
          <Button className="btn btn-default btn-xs" style={{ float: 'right', width: '60px' }} ng-click="setDepth()">OK</Button>
          <Button className="btn btn-default btn-xs" style={{ float: 'right', width: '60px', marginRight: '4px' }} ng-click="cancelDepth( true )">Cancel</Button>
        </div>
      </div>
    );

    const content = (
      <div className={styles.content}>
        <Select
          showSearch
          className={styles.param}
          placeholder="Select application"
          optionFilterProp="children"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            common.applications.map((obj) => {
              const label = icons(`./${obj.serviceType}.png`);
              return (
                <Option value={obj.applicationName} key={obj.applicationName}>
                  <div style={{ display: 'inline-block', paddingRight: '5px' }}>
                    <img src={label} alt={obj.applicationName} width="20px" height="20px" />
                  </div>
                  <div style={{ display: 'inline-block' }}>
                    {obj.applicationName}
                  </div>
                </Option>
              );
            })
          }
        </Select>
        <Dropdown overlay={menu}>
          <Button style={{ display: 'inline-block' }}>
            <div style={{ display: 'inline-block' }}>
              <img src={bidirectOn} alt="bidirect" width="18px" height="18px" style={{ marginRight: '4px' }} />
              <img src={inBound} alt="inBound" width="18px" height="18px" /> 1
              <img src={outBound} alt="outBound" width="18px" height="18px" /> 2
            </div>
            <div className={styles['angle-icon']}><i className="fa fa-angle-down" aria-hidden="true" /></div>
          </Button>
        </Dropdown>
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          placeholder={['Start Time', 'End Time']}
          onChange={onChange}
          onOk={onOk}
        />
      </div>
    );

    return (
      <div>
        <PageHeader
          className={styles.header}
          title={content}
          logo={logo}
          action={<div className="action">action</div>}
        />
        <div>
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
      </div>
    );
  }
}

