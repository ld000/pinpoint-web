import { PropTypes } from 'react'
import Charts from 'components/chart'
import { getNewArrayFromData, formatSeconds } from 'utils'

//  引入线状图
import 'echarts/lib/chart/line'

export default class ChartLine extends Charts {
  static propTypes = {
    dataSource: PropTypes.array.isRequired,
    labels: PropTypes.array,
    labelProp: PropTypes.array,
  }

  static defaultProps = {
    labels: ['平均派单时长', '平均到店时长', '平均店内时长', '平均配送时长'],
    labelProp: ['averageDispachTime', 'averageToshopTime', 'averageInshopTime', 'averageTransferTime']
  }

  getSeries() {
    const { labels, labelProp, dataSource } = this.props
    const calcData = dataSource.map(data => ({
      pt: data.pt,
      averageDispachTime: data.averageDispachTime / 60,
      averageToshopTime: data.averageToshopTime / 60,
      averageInshopTime: data.averageInshopTime / 60,
      averageTransferTime: data.averageTransferTime / 60,
    }))
    return labels.map((l, i) => ({
      name: l,
      type: 'line',
      data: getNewArrayFromData(calcData, labelProp[i])
    }))
  }

  getOption = () => (
    {
      color: ['#fe751a', '#9012fe', '#417505', '#f54643', '#4990e2'],
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          const date = params[0].name
          let innerHtml = date
          params.forEach(p => {
            innerHtml += `<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${p.color}"></span>
            ${p.seriesName}：${formatSeconds(p.value * 60)}`
          })
          return innerHtml
        }
      },
      legend: {
        data: this.props.labels
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          interval: 0
        },
        data: getNewArrayFromData(this.props.dataSource, 'pt')
      },
      yAxis: {
        type: 'value',
        name: 'min'
      },
      series: this.getSeries()
    }
  )
}
