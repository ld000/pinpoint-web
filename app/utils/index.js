import { message, Modal } from 'antd'
import Loading from 'components/loading'
import WaitingToast from 'components/waitingToast';
// import { updateTabList } from './../actions/tabList'
import * as ajaxFun from './ajax'
import { clone } from 'lodash'
import { find, propEq, uniqBy, isNil, any } from 'lodash/fp'

export const ajax = ajaxFun
export function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}
// 导出按钮控制时间
global.EXPORT_TIME = 10

let currentAjaxNum = 0;
export const createAjaxAction = (api, startAction, endAction, showLoading = false) => (data, cb) =>
  (dispatch) => {
    let respon
    dispatch(startAction())
    if (showLoading) {
      currentAjaxNum++
      Loading.show()
    }
    // eslint-disable-next-line no-param-reassign
    data = isArray(data) ? data : [data]
    api(...data)
      .then(checkStatus) // eslint-disable-line no-use-before-define
      .then(response => response.json())
      .then((resp) => {
        respon = resp
        dispatch(endAction({ req: data, res: resp }))
      })
      .then(() => {
        if (showLoading) {
          currentAjaxNum--
          if (currentAjaxNum <= 0) {
            Loading.hide()
          }
        }
        if (respon.status === 1) {
          cb && cb(respon)
        }
      })
      .catch(e => {
        if (showLoading) {
          currentAjaxNum--
          if (currentAjaxNum <= 0) {
            Loading.hide()
          }
        }
        WaitingToast.hide(); // 部分页面会用到这个提示组件
        catchError(e) // eslint-disable-line no-use-before-define
      })
  }

export const createAjax = (url, param, callback) => {
  let respon;
  ajax.fetchJSONByPost(url)(param)
    .then(checkStatus) // eslint-disable-line no-use-before-define
    .then(response => response.json())
    .then((resp) => {
      respon = resp
    })
    .then(() => {
      if (respon.status === 1) {
        callback && callback(respon.data)
      }
    })
    .catch(catchError) // eslint-disable-line no-use-before-define
}

export const hasResponseError = (data, errorHandler) => {
  WaitingToast.hide(); // 部分页面会用到这个提示组件
  if (typeof data !== 'object') {
    try {
      // eslint-disable-next-line no-param-reassign
      data = JSON.parse(`${data}`);
    } catch (e) {
      message.error(`非法的响应数据格式，请联系管理员！[${data}]`,
        MESSAGE_DURATION) // eslint-disable-line no-undef
      return true;
    }
  }
  if (!data.status && data.msg) {
    message.error(data.msg, 3)
    return true
  }
  if (!data.status && errorHandler === undefined) {
    return true;
  }
  if (!data.status && data.httpError && errorHandler !== undefined) {
    return typeof errorHandler === 'function' ? errorHandler(data.httpError) : errorHandler
  }
  return false;
};

export const createApiCustomAjax = (api, startAction, endAction) => (data, apiParam, cb) =>
  (dispatch) => {
    let respon
    dispatch(startAction())
    // eslint-disable-next-line no-param-reassign
    data = isArray(data) ? data : [data]
    api(apiParam)(...data)
      .then(checkStatus) // eslint-disable-line no-use-before-define
      .then(response => response.json())
      .then((resp) => {
        respon = resp
        dispatch(endAction({ req: data, res: resp }))
      })
      .then(() => {
        if (respon.status === 1) {
          cb && cb(respon)
        }
      })
      .catch(catchError) // eslint-disable-line no-use-before-define
  }

export const fakeAjaxAction = (startAction, endAction, callBackAction) => (data, cb) => dispatch => {
  dispatch(startAction())
  dispatch(endAction({ req: {}, res: { data: data } }))
  callBackAction && dispatch(callBackAction())
}

let hasAlert = false;
function catchError(error) {
  const { response } = error
  if (!response) {
    console.log(error)
    return
  }
  if (response.status === 401) {
    if (!hasAlert) {
      hasAlert = true;
      Modal.warning({
        title: '提示',
        content: '用户信息过期，请重新登录！',
        onOk: () => {
          hasAlert = false
          // 线上环境，刷新页面以重定向到登录页面
          process.env.NODE_ENV === 'production' && location.reload()
        }
      })
    }
  } else if (response.status === 403) {
    if (!hasAlert) {
      hasAlert = true
      Modal.warning({
        title: '提示',
        content: '您缺少相关权限，部分功能无法使用,请联系管理员',
        onOk: () => {
          hasAlert = false
        }
      })
    }
  } else if (response.status === 404) {
    if (!hasAlert) {
      hasAlert = true
      Modal.error({
        title: '警告',
        content: '404，请检查网络连接或者联系技术人员',
        onOk: () => {
          hasAlert = false
        }
      })
    }
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new Error(response.statusText)
  error.response = response
  throw error
}
// eslint-disable-next-line no-extend-native
Date.prototype.format = function (fmt) { // author: meizz
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    // eslint-disable-next-line no-param-reassign
    fmt = fmt.replace(RegExp.$1,
      (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
  }
  for (const k in o) { // eslint-disable-line no-restricted-syntax
    if (new RegExp(`(${k})`).test(fmt)) {
      // eslint-disable-next-line no-param-reassign
      fmt = fmt.replace(RegExp.$1,
        (RegExp.$1.length === 1) ?
          (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
    }
  }
  return fmt;
};

// 这个算法以东北半球为标准
exports.circle2dodecagon = function (circle) {
  const sin = Math.sin
  const cos = Math.cos
  const PI = Math.PI;
  const center = circle.getCenter()
  // const radius = circle.getRadius()
  const bounds = circle.getBounds()
  const southWest = bounds.getSouthWest()
  const northEast = bounds.getNorthEast()

  const x = center.getLat()
  const y = center.getLng()
  const xMin = southWest.getLat()
  const yMin = southWest.getLng()
  const xMax = northEast.getLat()
  const yMax = northEast.getLng()
  const rx = x - xMin;
  const ry = y - yMin;
  const points = [];
  points[0] = [xMax, y];
  points[1] = [x + (rx * cos(PI / 6)), y + (ry * sin(PI / 6))];
  points[2] = [x + (rx * cos(PI / 3)), y + (ry * sin(PI / 3))];
  points[3] = [x, yMax];
  points[4] = [x + (rx * cos(2 * (PI / 3))), y + (ry * sin(2 * (PI / 3)))];
  points[5] = [x + (rx * cos(5 * (PI / 6))), y + (ry * sin(5 * (PI / 6)))];
  points[6] = [xMin, y];
  points[7] = [x + (rx * cos(7 * (PI / 6))), y + (ry * sin(7 * (PI / 6)))];
  points[8] = [x + (rx * cos(4 * (PI / 3))), y + (ry * sin(4 * (PI / 3)))];
  points[9] = [x, yMin];
  points[10] = [x + (rx * cos(5 * (PI / 3))), y + (ry * sin(5 * (PI / 3)))];
  points[11] = [x + (rx * cos(11 * (PI / 6))), y + (ry * sin(11 * (PI / 6)))];

  return points.map((p) => (new AMap.LngLat(p[1], p[0]))); // eslint-disable-line no-undef
}
export const getStepDate = (step) => {
  const date = new Date()
  date.setDate(date.getDate() + step)
  return date.format('yyyy-MM-dd')
}

// 获得现在时间戳
const _now = Date.now || function () {
  return new Date().getTime();
}

// 函数去抖（连续事件触发结束后只触发一次）
// sample 1: debounce(function(){}, 1000)
// 连续事件结束后的 1000ms 后触发
// sample 1: debounce(function(){}, 1000, true)
// 连续事件触发后立即触发（此时会忽略第二个参数）
/* eslint-disable */
export const debounce = function (func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    const last = _now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function () {
    context = this;
    args = arguments;
    timestamp = _now();
    const callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

// 函数节流（如果有连续事件响应，则每间隔一定时间段触发）
// 每间隔 wait(Number) milliseconds 触发一次 func 方法
// 如果 options 参数传入 {leading: false}
// 那么不会马上触发（等待 wait milliseconds 后第一次触发 func）
// 如果 options 参数传入 {trailing: false}
// 那么最后一次回调不会被触发
// **Notice: options 不能同时设置 leading 和 trailing 为 false**
// 示例：
// var throttled = throttle(updatePosition, 100);
// $(window).scroll(throttled);
// 调用方式（注意看 A 和 B console.log 打印的位置）：
// throttle(function, wait, [options])
// sample 1: throttle(function(){}, 1000)
// print: A, B, B, B ...
// sample 2: throttle(function(){}, 1000, {leading: false})
// print: B, B, B, B ...
// sample 3: throttle(function(){}, 1000, {trailing: false})
// print: A, A, A, A ...
// ----------------------------------------- //
export const throttle = function (func, wait, options = {}) {
  let context, args, result;
  let timeout = null;
  let previous = 0;

  const later = function () {
    previous = options.leading === false ? 0 : _now();
    timeout = null;
    result = func.apply(context, args);

    if (!timeout) context = args = null;
  };

  return function () {
    // 记录当前时间戳
    const now = _now();

    if (!previous && options.leading === false) previous = now;

    const remaining = wait - (now - previous);
    context = this;
    args = arguments;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        // 解除引用，防止内存泄露
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) { // 最后一次需要触发的情况
      timeout = setTimeout(later, remaining);
    }
    // 回调返回值
    return result;
  };
}

/**
 * 数值转千分位
 * @param {Number} num 需要转换的数值 
 * @param {Number} fixed 需要保留的小数位 
 * @return {String} 转换后的千分位
 */
export function thousandsFormat(num, fixed = 0) {
  if (fixed) num = num.toFixed(fixed)
  return (num + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
}

/**
 * 提取对象数组的单个数据，组成一个数组
 * @param {Array} data 需要提取数据的对象数组 
 * @param {String} key 需要提取的key 
 * @param {String} spare 备用key 
 */
export function getNewArrayFromData(data = [], key = '', spare = '') {
  return data.map(d => {
    return d[key]|| d[spare] || 0
  })
}

export function getNoCommaData(data = []) {
  return data.map(d => {
    return d.toString().replace(/,/g, '') 
  })
}

export function getFloatData(data = []) {
  return data.map(d => {
    return parseFloat(d)
  })
}

/**
 * 十六进制颜色变浅、加深
 * @param {String} col 十六进制颜色
 * @param {Number} amt 变化程度 
 * @return 十六进制颜色
 */
export function lightenDarkenColor(col, amt) {
  var usePound = false;
  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

// 根据路径验证有无权限
export function validateHasPower(path, navList = window.NEW_NAVIGATION) {
  for (const nav of navList) {
    const children = nav.children
    if (nav.url === path) {
      return true
    } else if (children && Array.isArray(children) && children.length > 0) {
      if (validateHasPower(path, children)) return true
    }
  }
  return false
}

// 根据 regionAId 获取 regionBId
export function getRegionBIdByRegionAId(sectionList = [], regionAId) {
  for (const section of sectionList) {
    if (Array.isArray(section.regionList)) {
      for (const region of section.regionList) {
        if (Number(region.regionId) === Number(regionAId)) {
          return Number(section.sectionId)
        }
      }
    }
  }
  return ''
}

// 秒 -> 时分秒
export function formatSeconds(value) {
  var theTime = parseInt(value);// 秒
  var theTime1 = 0;// 分
  var theTime2 = 0;// 小时
  // alert(theTime);
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    // alert(theTime1+"-"+theTime);
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
    }
  }
  var result = "" + parseInt(theTime) + "秒";
  result = "" + parseInt(theTime1) + "分" + result;
  result = "" + parseInt(theTime2) + "时" + result;
  return result;
}

export const roleList = [
  {id:10, name: 'AM'},
  {id:20, name: 'BD'},
  {id:30, name: 'BM'},
  {id:40, name: 'CM'},
  {id:50, name: 'OTHER'},
]
// // 检测不同城市不同权限
export function checkRole(city, role) {
  if (window.STAFF.isAdmin) {
    return ''
  } else {
    let roleId = '', code = ''
    roleList.map((item) =>{
      if(item.name == role) {
        roleId = item.id      
      }
    })
    window.CITY_ROLE.map((option) => {
      if(city == option.id) {
        if (role === 'AM' && option.name.indexOf(10) > -1 && option.name.indexOf(30) == -1 ) {
         return code = window.STAFF.code
        } else if(option.name.indexOf(roleId) > -1) {
         return  code = window.STAFF.code
        } else {
         return code = ''
        }
      }
    })
    return code
  }
}

export function checkAM(city, role) {
  if (window.STAFF.isAdmin) {
    return ''
  } else {
    let roleId = '', code = ''
    roleList.map((item) =>{
      if(item.name == role) {
        roleId = item.id      
      }
    })
    window.CITY_ROLE.map((option) => {
      if(city == option.id) {
        if (role === 'AM' && option.name.indexOf(10) > -1 && option.name.indexOf(30) == -1 ) {
         return code = window.STAFF.code
        } else {
         return code = ''
        }
      }
    })
    return code
  }
}

export function checkBD(city, role) {
  if (window.STAFF.isAdmin) {
    return ''
  } else {
    let roleId = '', code = ''
    roleList.map((item) =>{
      if(item.name == role) {
        roleId = item.id      
      }
    })
    window.CITY_ROLE.map((option) => {
      if(city == option.id) {
        if (role === 'BD' && option.name.indexOf(20) > -1 && option.name.indexOf(30) == -1 ) {
         return code = window.STAFF.code
        } else {
         return code = ''
        }
      }
    })
    return code
  }
}


/**
 *  这里处理菜单后端不给区分，前端写死做区分的逻辑, 超过5个，后端答应会给予处理
 *  暂时只区分驾驶舱和定时文件, 区分标志
 */
export function distinguishMenu(type) {
  let SecondMenu = []
  let cloneMenu = clone(global.NEW_NAVIGATION)
  for (let i = cloneMenu.length - 1; i >= 0; i--) {
    if (cloneMenu[i].name == '下载页' || cloneMenu[i].name == '配置页'){
      SecondMenu.push(cloneMenu[i])
      cloneMenu.splice(i, 1)
    }
  }
  if(type == 'firstMenu'){
    return cloneMenu
  } else {
    return SecondMenu.reverse()
  }
}

export const channelSpecial = [
  { id: 1, name: 'KA' },
  { id: 2, name: 'caterAll' },
  { id: 3, name: 'multiAll' },
  { id: 4, name: 'all' },
]

export const transferChannel = [
  { id: -1, name: 'KA' },
  { id: -2, name: 'caterAll' },
  { id: -3, name: 'multiAll' },
]

export function checkSpecialChannel(key) {
  let channel = ''
  transferChannel.map(d => {
     if (d.id === key) {
       return channel = d.name
     }
  })
  const otherValue = key ? key.toString() : ''
  return channel || otherValue || ''
}
// 核心指标的高管日报和重点指标的渠道在用
export const specialPlatformList = [
  {
    dealType: 0,
    typeName: '餐饮',
    platforms: [{
      platformId: 1,
      platformName: '点我吧'
      }, {
        platformId: 4,
        platformName: '点我达',
      }, {
        platformId: 5,
        platformName: '测试',
      }, {
        platformId: 7,
        platformName: '好吃来',
      }, {
        platformId: 8,
        platformName: '丫米',
      }, {
        platformId: 15,
        platformName: '减餐',
      }, {
        platformId: 16,
        platformName: '觅食',
      }, {
        platformId: 17,
        platformName: '回家吃饭',
      }, {
          platformId: 18,
          platformName: '饿了么',

      }, {
          platformId: 19,
          platformName: '餐道',

      }, {
          platformId: 24,
          platformName: '上海吉野家',

      }, {
          platformId: 25,
          platformName: '拼豆',

      }, {
          platformId: 28,
          platformName: '轶顺',

      }, {
          platformId: 29,
          platformName: '焦耳外卖',

      }, {
          platformId: 31,
          platformName: '优粮生活',

      }, {
          platformId: 35,
          platformName: '望湘园',

      }, {
          platformId: 37,
          platformName: '越打星&渣甸街',

      }, {
          platformId: 38,
          platformName: '棒约翰',

      }, {
          platformId: 41,
          platformName: '吾伴浓汤',

      }, {
          platformId: 43,
          platformName: 'Wagas & Baker Spice',

      }, {
          platformId: 44,
          platformName: '呷哺',

      }, {
          platformId: 45,
          platformName: '丰收日',

      }, {
          platformId: 46,
          platformName: '北京合拍',

      }, {
          platformId: 47,
          platformName: '科迹',

      }, {
          platformId: 48,
          platformName: '约饭',

      }, {
          platformId: 49,
          platformName: '饭这舟',

      }, {
          platformId: 50,
          platformName: '慕玛披萨',

      }, {
          platformId: 51,
          platformName: '同达',

      }, {
          platformId: 52,
          platformName: '菜大师',

      }, {
          platformId: 54,
          platformName: '乐外卖',

      }, {
          platformId: 55,
          platformName: '微客多',

      }, {
          platformId: 56,
          platformName: '掌柜的店',

      }, {
          platformId: 57,
          platformName: '大米&乡村基',

      }, {
          platformId: 58,
          platformName: '百度外卖',

      }, {
          platformId: 59,
          platformName: '有间厨房',

      }, {
          platformId: 60,
          platformName: '焦耳外卖（新）',

      }, {
          platformId: 61,
          platformName: '花+ 即时单',

      }, {
          platformId: 62,
          platformName: '茶尼玛',

      }, {
          platformId: 63,
          platformName: '食之秘',

      }, {
          platformId: 64,
          platformName: '花样菜场',

      }, {
          platformId: 65,
          platformName: '我呀厨房',

      }, {
          platformId: 66,
          platformName: '百联（前置仓）',

      }, {
          platformId: 67,
          platformName: '何师烧烤',

      }, {
          platformId: 68,
          platformName: '多点-物美',

      }, {
          platformId: 69,
          platformName: '食味佳',

      }, {
          platformId: 70,
          platformName: '尊宝比萨',

      }, {
          platformId: 71,
          platformName: '安鲜达B2C',

      }, {
          platformId: 73,
          platformName: '盒马鲜生',

      }]
  }, {
      dealType: 99,
      typeName: '其他',
      platforms: [{
        platformId: 2,
        platformName: '点点送',
      }]
    }, {
        dealType: 5,
        typeName: '水果',
        platforms: [{
          platformId: 3,
          platformName: '一米鲜',

         }, {
          platformId: 14,
          platformName: '每日优鲜',

         }, {
          platformId: 33,
          platformName: '易果',

         }, {
          platformId: 53,
          platformName: 'U掌柜',

         }]
      }, {
        dealType: 10,
        typeName: '超市',
        platforms: [{
          platformId: 6,
          platformName: '百联（门店）',

        }, {
          platformId: 22,
          platformName: '家得利',

        }, {
          platformId: 23,
          platformName: '闪电购',

        }]
      }, {
        dealType: 30,
        typeName: '药品',
        platforms: [{
          platformId: 9,
          platformName: '快方送药',

        }]
      }, {
        dealType: 20,
        typeName: '鲜花',
        platforms: [{
          platformId: 11,
          platformName: '花+',

         }, {
          platformId: 21,
          platformName: '花千束',

          }]
        }, {
        dealType: 15,
        typeName: '酒类',
        platforms: [{
          platformId: 13,
          platformName: '也买酒',

          }]
        }, {
        dealType: 25,
        typeName: '快递',
        platforms: [{
          platformId: 20,
          platformName: '菜鸟派件',

        }, {
          platformId: 26,
          platformName: '裹裹直送',

        }, {
          platformId: 34,
          platformName: '万象物流',

        }, {
          platformId: 36,
          platformName: '菜鸟揽件',
        }]
      }]

// 得到2个日期相差几天，需求是包含几天就加了个1
export function getDifferDays(strDateStart,strDateEnd){
   const strSeparator = "-"; //日期分隔符
   var oDate1;
   var oDate2;
   var iDays;
   oDate1= strDateStart.split(strSeparator);
   oDate2= strDateEnd.split(strSeparator);
   var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);
   var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
   iDays = parseInt(Math.abs(strDateS - strDateE ) / 1000 / 60 / 60 / 24)//把相差的毫秒数转换为天数 
   return iDays + 1 ;
}

// 得到在一个日期上加N天的日期
export function addDay(date, dayNumber) {
  const strSeparator = "-"; //日期分隔符
  let oDate1= date.split(strSeparator);
  let strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);

  var dayNumber = dayNumber ? dayNumber : 29;
  var ms = dayNumber * (1000 * 60 * 60 * 24)
  var newDate = new Date(strDateS.getTime() + ms);
  return newDate.format('yyyy-MM-dd');
}

// 获得本周的周一
export function getFirstDayOfWeek(date) {
    const day = date.getDay() || 7;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
}
// 获取本周的周日
export function getLastDayOfWeek(date) {
    const day = 7 - date.getDay() || 7;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + day);
}

/**
 * 递归便利数组，返回由符合条件的对象及其祖先对象构成的数组，以符合条件的对象结尾
 * @param {stirng} value 
 * @param {Array} arr 形如·NEW_NAVIGATION·的数组
 * @returns {Array} [parentObj的parentObj, parentObj, obj, childObj, ...] !→_→
 */
export function recursionArrByKey(value, arr, key = 'url') {
  const obj = find(propEq(key, value))(arr);
  let pathArr = [];
  if(obj) {
    pathArr.unshift(obj);
  } else {
    any(item => {
      const result = recursionArrByKey(value, item.children);
      if(result.length) {
        pathArr = pathArr.concat(item,result);
      }
      return result.length;
    })(arr.filter(item => isArray(item.children)))
  }
  return pathArr;
}

// 实时数据取消单量枚举
export const cancelCountEnum = () => {
  return [
    {
      code: '',
      mean: '全部',
      meaning: '截至现在的取消（除去拒单）订单量和异常订单量（去重）'
    },
    {
      code: '1',
      mean: '商户',
      meaning: '时段内由于商户原因取消（除去拒单）订单量和异常订单量（去重）'
    },
    {
      code: '2',
      mean: '用户',
      meaning: '时段内的由于用户原因取消（除去拒单）订单量和异常订单量（去重）'
    },
    {
      code: '3',
      mean: '平台',
      meaning: '时段内的由于点我达平台原因或骑手原因取消（除去拒单）订单量和异常订单量（去重）'
    },
  ]
}
