import { PropTypes } from 'react'
import Charts from 'components/chart'
import { lightenDarkenColor } from 'utils'

//  引入饼图
import 'echarts/lib/chart/pie';

const getRandomColor = function () {
  return '#' + (Math.random() * 0xffffff << 0).toString(16);  // eslint-disable-line
}

const BASE_COLORS = ['#1d6ff1', '#fe751a', '#c12e34', '#6E7074']
let INNER_COLORS = [] // 内圈的颜色
let WRAPPER_COLORS = [] // 外圈颜色

export default class CancelPie extends Charts {
  static propTypes = {
    dataSource: PropTypes.array.isRequired, // 数据源
    innerLabel: PropTypes.string.isRequired,
    wrapLabel: PropTypes.string.isRequired
  }
  static defaultProps = {
    dataSource: [],
    innerLabel: '取消原因',
    wrapLabel: '取消理由'
  }
  getOption() {
    const { dataSource, innerLabel, wrapLabel } = this.props
    const legends = [], dataInner = [], dataWrap = []
    const calcData = [] // 除去 value: 0 之后的数据

    INNER_COLORS = []   // 内圈颜色
    WRAPPER_COLORS = [] // 外圈颜色

    dataSource.forEach(data => {
      if (data.value) {
        calcData.push(data)
      }
    })

    calcData.forEach((data, i) => {
      // 头部legends
      legends.push(data.personLiableMean)

      // 内圈颜色
      const baseColor = BASE_COLORS[i]
      let randomColor
      if (baseColor) {
        INNER_COLORS.push(baseColor)
      } else {
        randomColor = getRandomColor()
        INNER_COLORS.push(randomColor)
      }
      // 内部大类数据
      dataInner.push({
        name: data.personLiableMean,
        value: data.value
      })
      // 外部小分类数据
      data.classifyResponseDTOS.forEach((d, j) => {
        dataWrap.push({
          name: d.classifyName,
          value: d.classifyOrders
        })
        // 外圈颜色
        WRAPPER_COLORS.push(lightenDarkenColor((baseColor || randomColor), 16 * (j + 1)))
      })
    })
    return {
      color: INNER_COLORS.concat(WRAPPER_COLORS),
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        x: 'right',
        data: legends,
        align: 'left'
      },
      series: [
        {
          name: innerLabel,
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '45%'],
          label: {
            normal: {
              position: 'inner'
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: dataInner
        },
        {
          name: wrapLabel,
          type: 'pie',
          radius: ['55%', '75%'],
          label: {
            normal: {
              show: false
            }
          },
          data: dataWrap
        }
      ]
    }
  }
}
