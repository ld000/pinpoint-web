import React, { PureComponent } from 'react';
import { Button } from 'antd';
import bidirectOn from '../../assets/bidirect_on.png';
import bidirectOff from '../../assets/bidirect_off.png';
import inBound from '../../assets/inbound.png';
import outBound from '../../assets/outbound.png';
import styles from './index.less';

export default class DepthSelect extends PureComponent {
  render() {
    return (
      <div className={styles.main}>
        <Button style={{ display: 'inline-block' }}>
          <div style={{ display: 'inline-block' }}>
            <img src={bidirectOn} alt="bidirect" width="18px" height="18px" style={{ marginRight: '4px' }} />
            <img src={inBound} alt="inBound" width="18px" height="18px" /> 1
            <img src={outBound} alt="outBound" width="18px" height="18px" /> 2
          </div>
          <div className={styles['angle-icon']}><i className="fa fa-angle-down" aria-hidden="true" /></div>
        </Button>
        {/* <div class="dropdown-menu" role="menu">
          <ul class="inbound">
            <li class="inbound-title">
              <img src="images/inbound.png" width="20px" height="20px" /> Inbound</li>
            <li class="depth" ng-repeat="r in rangeList" ng-class="{selected: r === callee}" ng-click="setCallee(r)">{{ r }}</li>
          </ul>
          <ul class="outbound">
            <li class="outbound-title">
              <img src="images/outbound.png" width="20px" height="20px" /> Outbound</li>
            <li class="depth" ng-repeat="r in rangeList" ng-class="{selected: r === caller}" ng-click="setCaller(r)">{{ r }}</li>
          </ul>
          <div style="clear: both;padding: 6px 2px 4px 2px">
            <img ng-src="images/bidirect_{{bidirectional ? 'on' : 'off'}}.png" width="22px" height="22px" style="float:left;margin-left:4px;cursor:pointer;"
              alt="Bidirectional Search" ng-click="checkBidirectional()" />
            <button type="button" class="btn btn-default btn-xs" style="float:right;width:60px;" ng-click="setDepth()">OK</button>
            <button type="button" class="btn btn-default btn-xs" style="float:right;width:60px;margin-right:4px;" ng-click="cancelDepth( true )">Cancel</button>
          </div>
        </div> */}
      </div>
    );
  }
}
