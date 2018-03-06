import mockjs from 'mockjs';
import { getRule, postRule } from './mock/rule';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getFakeChartData } from './mock/chart';
import { imgMap } from './mock/utils';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
import { format, delay } from 'roadhog-api-doc';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  // 支持值为 Object 和 Array
  'GET /api/currentUser': {
    $desc: "获取当前用户接口",
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: {
      name: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      notifyCount: 12,
    },
  },
  // GET POST 可省略
  'GET /api/users': [{
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  }, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  }, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  }],
  'GET /api/project/notice': getNotice,
  'GET /api/activities': getActivities,
  'GET /api/rule': getRule,
  'POST /api/rule': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postRule,
  },
  'POST /api/forms': (req, res) => {
    res.send({ message: 'Ok' });
  },
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 150, 'type|0-2': 1 }]
  }),
  'GET /api/fake_list': getFakeList,
  'GET /api/fake_chart_data': getFakeChartData,
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/login/account': (req, res) => {
    const { password, userName, type } = req.body;
    res.send({
      status: password === '888888' && userName === 'admin' ? 'ok' : 'error',
      type,
    });
  },
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok' });
  },
  'GET /api/notices': getNotices,
  'GET /api/server-map': {
    "applicationMapData": {
        "range": {
            "from": 1514466871000,
            "to": 1514467171000,
            "fromDateTime": "2017-12-28 21:14:31",
            "toDateTime": "2017-12-28 21:19:31",
            "range": 300000
        },
        "nodeDataArray": [
            {
                "key": "alliance-recharge-service_SPRING_BOOT^USER",
                "applicationName": "USER",
                "category": "USER",
                "serviceType": "USER",
                "serviceTypeCode": "2",
                "isWas": false,
                "isQueue": false,
                "isAuthorized": true,
                "totalCount": 26,
                "errorCount": 0,
                "slowCount": 0,
                "hasAlert": false,
                "histogram": {
                    "1s": 26,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                2
                            ],
                            [
                                1514466900000,
                                6
                            ],
                            [
                                1514466960000,
                                7
                            ],
                            [
                                1514467020000,
                                3
                            ],
                            [
                                1514467080000,
                                6
                            ],
                            [
                                1514467140000,
                                2
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "instanceCount": 0,
                "instanceErrorCount": 0,
                "agentIds": [ ]
            },
            {
                "key": "mapi.alipay.com^UNKNOWN",
                "applicationName": "mapi.alipay.com",
                "category": "UNKNOWN",
                "serviceType": "UNKNOWN",
                "serviceTypeCode": "1",
                "isWas": false,
                "isQueue": false,
                "isAuthorized": true,
                "totalCount": 15,
                "errorCount": 0,
                "slowCount": 0,
                "hasAlert": false,
                "histogram": {
                    "1s": 15,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                4
                            ],
                            [
                                1514466960000,
                                5
                            ],
                            [
                                1514467020000,
                                1
                            ],
                            [
                                1514467080000,
                                4
                            ],
                            [
                                1514467140000,
                                1
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "instanceCount": 0,
                "instanceErrorCount": 0,
                "agentIds": [ ]
            },
            {
                "key": "alliance-recharge-service^SPRING_BOOT",
                "applicationName": "alliance-recharge-service",
                "category": "SPRING_BOOT",
                "serviceType": "SPRING_BOOT",
                "serviceTypeCode": "1210",
                "isWas": true,
                "isQueue": false,
                "isAuthorized": true,
                "totalCount": 28,
                "errorCount": 0,
                "slowCount": 0,
                "hasAlert": false,
                "histogram": {
                    "1s": 28,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                2
                            ],
                            [
                                1514466900000,
                                6
                            ],
                            [
                                1514466960000,
                                7
                            ],
                            [
                                1514467020000,
                                3
                            ],
                            [
                                1514467080000,
                                6
                            ],
                            [
                                1514467140000,
                                4
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "instanceCount": 2,
                "instanceErrorCount": 0,
                "agentIds": [
                    "10.10.10.104_alliance-recharge-service",
                    "10.10.10.105_alliance-recharge-service"
                ]
            },
            {
                "key": "alliance-spider^SPRING_BOOT",
                "applicationName": "alliance-spider",
                "category": "SPRING_BOOT",
                "serviceType": "SPRING_BOOT",
                "serviceTypeCode": "1210",
                "isWas": true,
                "isQueue": false,
                "isAuthorized": true,
                "totalCount": 393,
                "errorCount": 0,
                "slowCount": 0,
                "hasAlert": false,
                "histogram": {
                    "1s": 393,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                77
                            ],
                            [
                                1514466900000,
                                88
                            ],
                            [
                                1514466960000,
                                82
                            ],
                            [
                                1514467020000,
                                51
                            ],
                            [
                                1514467080000,
                                59
                            ],
                            [
                                1514467140000,
                                36
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "instanceCount": 2,
                "instanceErrorCount": 0,
                "agentIds": [
                    "10.10.10.104_alliance-spider",
                    "10.10.10.105_alliance-spider"
                ]
            }
        ],
        "linkDataArray": [
            {
                "key": "alliance-recharge-service_SPRING_BOOT^USER~alliance-recharge-service^SPRING_BOOT",
                "from": "alliance-recharge-service_SPRING_BOOT^USER",
                "to": "alliance-recharge-service^SPRING_BOOT",
                "toAgent": [
                    "10.10.10.104_alliance-recharge-service",
                    "10.10.10.105_alliance-recharge-service"
                ],
                "sourceInfo": {
                    "applicationName": "alliance-recharge-service_SPRING_BOOT",
                    "serviceType": "USER",
                    "serviceTypeCode": 2,
                    "isWas": false
                },
                "targetInfo": {
                    "applicationName": "alliance-recharge-service",
                    "serviceType": "SPRING_BOOT",
                    "serviceTypeCode": 1210,
                    "isWas": true
                },
                "filterApplicationName": "alliance-recharge-service",
                "filterApplicationServiceTypeCode": 1210,
                "filterApplicationServiceTypeName": "SPRING_BOOT",
                "totalCount": 26,
                "errorCount": 0,
                "slowCount": 0,
                "histogram": {
                    "1s": 26,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                2
                            ],
                            [
                                1514466900000,
                                6
                            ],
                            [
                                1514466960000,
                                7
                            ],
                            [
                                1514467020000,
                                3
                            ],
                            [
                                1514467080000,
                                6
                            ],
                            [
                                1514467140000,
                                2
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "hasAlert": false
            },
            {
                "key": "alliance-spider^SPRING_BOOT~alliance-recharge-service^SPRING_BOOT",
                "from": "alliance-spider^SPRING_BOOT",
                "to": "alliance-recharge-service^SPRING_BOOT",
                "fromAgent": [
                    "10.10.10.104_alliance-spider",
                    "10.10.10.105_alliance-spider"
                ],
                "toAgent": [
                    "10.10.10.104_alliance-recharge-service",
                    "10.10.10.105_alliance-recharge-service"
                ],
                "sourceInfo": {
                    "applicationName": "alliance-spider",
                    "serviceType": "SPRING_BOOT",
                    "serviceTypeCode": 1210,
                    "isWas": true
                },
                "targetInfo": {
                    "applicationName": "alliance-recharge-service",
                    "serviceType": "SPRING_BOOT",
                    "serviceTypeCode": 1210,
                    "isWas": true
                },
                "filterApplicationName": "alliance-spider",
                "filterApplicationServiceTypeCode": 1210,
                "filterApplicationServiceTypeName": "SPRING_BOOT",
                "filterTargetRpcList": [ ],
                "totalCount": 2,
                "errorCount": 0,
                "slowCount": 0,
                "histogram": {
                    "1s": 2,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                2
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "hasAlert": false
            },
            {
                "key": "alliance-recharge-service^SPRING_BOOT~mapi.alipay.com^UNKNOWN",
                "from": "alliance-recharge-service^SPRING_BOOT",
                "to": "mapi.alipay.com^UNKNOWN",
                "fromAgent": [
                    "10.10.10.104_alliance-recharge-service",
                    "10.10.10.105_alliance-recharge-service"
                ],
                "sourceInfo": {
                    "applicationName": "alliance-recharge-service",
                    "serviceType": "SPRING_BOOT",
                    "serviceTypeCode": 1210,
                    "isWas": true
                },
                "targetInfo": {
                    "applicationName": "mapi.alipay.com",
                    "serviceType": "UNKNOWN",
                    "serviceTypeCode": 1,
                    "isWas": false
                },
                "filterApplicationName": "alliance-recharge-service",
                "filterApplicationServiceTypeCode": 1210,
                "filterApplicationServiceTypeName": "SPRING_BOOT",
                "totalCount": 15,
                "errorCount": 0,
                "slowCount": 0,
                "histogram": {
                    "1s": 15,
                    "3s": 0,
                    "5s": 0,
                    "Slow": 0,
                    "Error": 0
                },
                "timeSeriesHistogram": [
                    {
                        "key": "1s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                4
                            ],
                            [
                                1514466960000,
                                5
                            ],
                            [
                                1514467020000,
                                1
                            ],
                            [
                                1514467080000,
                                4
                            ],
                            [
                                1514467140000,
                                1
                            ]
                        ]
                    },
                    {
                        "key": "3s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "5s",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Slow",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    },
                    {
                        "key": "Error",
                        "values": [
                            [
                                1514466840000,
                                0
                            ],
                            [
                                1514466900000,
                                0
                            ],
                            [
                                1514466960000,
                                0
                            ],
                            [
                                1514467020000,
                                0
                            ],
                            [
                                1514467080000,
                                0
                            ],
                            [
                                1514467140000,
                                0
                            ]
                        ]
                    }
                ],
                "hasAlert": false
            }
        ]
    }
  },
  'GET /applications': [
    {
       "applicationName":"a-areaservice",
       "serviceType":"SPRING_BOOT",
       "code":1210
    },
    {
       "applicationName":"a-customerservice",
       "serviceType":"SPRING_BOOT",
       "code":1210
    },
    {
       "applicationName":"a-dispatch",
       "serviceType":"DUBBO_PROVIDER",
       "code":1110
    }
  ]
};

export default noProxy ? {} : delay(proxy, 1000);
