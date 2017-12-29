import React, { PureComponent } from 'react';
import go from 'gojs';
import styles from './index.less';
import { propsEqual } from '../../utils/utils';

const images = require.context('../../assets/dag', true);

const defaultOption = {
  sContainerId: '',
  sOverviewId: 'overview',
  sBigFont: '11pt avn85,NanumGothic,ng,dotum,AppleGothic,sans-serif',
  sSmallFont: '10pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif',
  sImageDir: '../../assets/dag/',
  sBoldKey: null,
  htNodeTheme: {
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#C5C5C5',
      borderWidth: 1,
      fontColor: '#000000',
    },
    bold: {
      backgroundColor: '#f2f2f2',
      borderColor: '#666975',
      borderWidth: 2,
      fontColor: '#000000',
    },
  },
  htLinkType: {
    sRouting: 'AvoidsNodes', // Normal, Orthogonal, AvoidNodes
    sCurve: 'JumpGap', // Bezier, JumpOver, JumpGap
  },
  htLinkTheme: {
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#c5c5c5',
      fontFamily: '11pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif',
      fontColor: '#000000',
      fontAlign: 'center',
      margin: 1,
      strokeWidth: 1,
    },
    bad: {
      backgroundColor: '#ffc9c9',
      borderColor: '#7d7d7d',
      fontFamily: '11pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif',
      fontColor: '#FF1300',
      fontAlign: 'center',
      margin: 1,
      strokeWidth: 1,
    },
  },
  htHighlightNode: {
    borderColor: '#53069B',
    backgroundColor: '#289E1D',
    fontColor: '#53069B',
    textBackgroundColor: '#D9EDF7',
  },
  htHighlightLink: {
    fontFamily: 'bold 12pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif',
    borderColor: '#53069B',
    strokeWidth: 2,
  },
  htPadding: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  unknownGroupName: 'UNKNOWN_GROUP',
};

export default class Dag extends PureComponent {
  state = {
    $: go.GraphObject.make,
    myDiagram: null,
    calcuResponseSummaryCircleMaxSize: 360,
    calcuResponseSummaryCircleminPercentage: 5,
  }

  componentDidMount() {
    this.initDiagram();
    this.initNodeTemplate();
    this.initLinkTemplate();
    this.initOverview();
    this.renderData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!propsEqual(this.props, nextProps)) {
      this.renderData(nextProps);
    }
  }

  initDiagram = () => {
    this.state.myDiagram = this.state.$(go.Diagram, 'myDiagramDiv',
      {
        padding: new go.Margin(10, 10, 10, 10),
        initialContentAlignment: go.Spot.Center,
        maxSelectionCount: 1,
        allowDelete: false,
        scrollMode: go.Diagram.InfiniteScroll,
        allowDrop: false,
        initialAutoScale: go.Diagram.Uniform,
        layout: this.state.$(go.LayeredDigraphLayout, {
          isOngoing: false,
          layerSpacing: 100,
          columnSpacing: 30,
          setsPortSpots: false,
        }),
      }
    );

    // this.nodeClickEventOnce = false;

    this.state.myDiagram.animationManager.isEnabled = false;

    this.state.myDiagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom;
    this.state.myDiagram.toolManager.dragSelectingTool.isEnabled = false;
    this.state.myDiagram.toolManager.draggingTool.doCancel();
    this.state.myDiagram.toolManager.draggingTool.doDeactivate();
  }

  initNodeTemplate = () => {
    const infoTableTemplate = this.state.$(
      go.Panel,
      go.Panel.TableRow,
      {},
      this.state.$(
        go.TextBlock,
        {
          margin: new go.Margin(0, 2),
          column: 1,
          stroke: '#848484',
          font: defaultOption.sSmallFont,
        },
        new go.Binding('text', 'k')
      ),
      this.state.$(
        go.TextBlock,
        {
          margin: new go.Margin(0, 2),
          column: 2,
          stroke: '#848484',
          font: defaultOption.sSmallFont,
        },
        new go.Binding('text', 'v')
      )
    );

    const calcuResponseSummaryCircleSize = (sum, value) => {
      const maxSize = this.state.calcuResponseSummaryCircleMaxSize;
      const minPercentage = this.state.calcuResponseSummaryCircleminPercentage;

      let size = 0;
      if (value === 0) return 0;
      const percentage = (100 * value) / sum;
      if (percentage < minPercentage) {
        size = parseInt((maxSize * minPercentage) / 100, 10);
      } else {
        size = parseInt((maxSize * percentage) / 100, 10);
      }
      return size;
    };

    const getNodeTemplate = () => {
      return this.state.$(
        go.Node,
        new go.Binding('category', 'serviceType'),
        go.Panel.Auto,
        {
          selectionAdorned: false,
          cursor: 'pointer',
          name: 'NODE',
          click: (e, obj) => {
            // self._onNodeClicked(e, obj);
          },
          doubleClick: (e, obj) => {
            // self._onNodeDoubleClicked(e, obj);
          },
          contextClick: (e, obj) => {
            // dd
          },
        },
        this.state.$(
          go.Shape,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: go.Spot.TopLeft,
            figure: 'RoundedRectangle',
            strokeWidth: 1,
            //                            margin: new go.Margin(10, 10, 10, 10),
            margin: 0,
            isPanelMain: true,
            //                            maxSize: new go.Size(150, NaN),
            minSize: new go.Size(120, NaN),
            name: 'NODE_SHAPE',
            portId: '',
          },
          new go.Binding('strokeWidth', 'key', (key) => {
            let type = 'default';
            if (defaultOption.sBoldKey && defaultOption.sBoldKey === key) {
              type = 'bold';
            }
            return defaultOption.htNodeTheme[type].borderWidth;
          }),
          new go.Binding('stroke', 'key', (key) => {
            let type = 'default';
            if (defaultOption.sBoldKey && defaultOption.sBoldKey === key) {
              type = 'bold';
            }
            return defaultOption.htNodeTheme[type].borderColor;
          }),
          new go.Binding('fill', 'key', (key) => {
            let type = 'default';
            if (defaultOption.sBoldKey && defaultOption.sBoldKey === key) {
              type = 'bold';
            }
            return defaultOption.htNodeTheme[type].backgroundColor;
          }),
          new go.Binding('key', 'key')
        ),
        this.state.$(
          go.Shape, {
            stroke: 'red',
            strokeWidth: 4,
            opacity: 0.8,
            margin: new go.Margin(-28, 0, 0, 0),
            visible: true,
          },
          new go.Binding('visible', '', (data) => {
            return data.isAuthorized && data.isWas;
          }),
          new go.Binding('geometry', 'histogram', (histogram) => {
            return go.Geometry.parse('M30 0 B270 360 30 30 30 30');
          })
        ),
        this.state.$(
          go.Shape, {
            stroke: 'orange',
            strokeWidth: 4,
            margin: new go.Margin(-28, 0, 0, 0),
            visible: true,
          },
          new go.Binding('visible', '', (data) => {
            return data.isAuthorized && data.isWas;
          }),
          new go.Binding('geometry', 'histogram', (histogram) => {
            if (histogram.Slow === 0) return go.Geometry.parse('M30 0');
            let sum = 0;
            for (const key in histogram) {
              if (Object.prototype.hasOwnProperty.call(histogram, key)) {
                sum += histogram[key];
              }
            }
            const size = this.state.calcuResponseSummaryCircleMaxSize -
              calcuResponseSummaryCircleSize(sum, histogram.Error);
            return go.Geometry.parse(`M30 0 B270 ${size} 30 30 30 30`);
          })
        ),
        this.state.$(
          go.Shape, {
            stroke: this.state.$(go.Brush, go.Brush.Linear, { '0.0': 'lightgreen', '1.0': 'green' }),
            strokeWidth: 4,
            margin: new go.Margin(-28, 0, 0, 0),
            visible: true,
          },
          new go.Binding('visible', '', (data) => {
            return data.isAuthorized && data.isWas;
          }),
          new go.Binding('geometry', 'histogram', (histogram) => {
            let sum = 0;
            for (const key in histogram) {
              if (Object.prototype.hasOwnProperty.call(histogram, key)) {
                sum += histogram[key];
              }
            }
            const size = this.state.calcuResponseSummaryCircleMaxSize -
              calcuResponseSummaryCircleSize(sum, histogram.Slow) -
              calcuResponseSummaryCircleSize(sum, histogram.Error);
            if (size >= 180) {
              return go.Geometry.parse(`M30 0 B270 ${size} 30 30 30 30`);
            } else {
              return go.Geometry.parse(`M30 -60 B270 ${size} 30 -30 30 30`);
            }
          })
        ),
        this.state.$(
          go.Panel,
          go.Panel.Spot,
          {
            name: 'NODE_PANEL',
            alignment: go.Spot.TopLeft,
            alignmentFocus: go.Spot.TopLeft,
          },
          this.state.$(
            go.Panel,
            go.Panel.Vertical,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: go.Spot.TopLeft,
              minSize: new go.Size(120, NaN),
            },
            this.state.$(
              go.Picture,
              {
                margin: new go.Margin(18, 0, 5, 0),
                desiredSize: new go.Size(80, 40),
                imageStretch: go.GraphObject.Uniform,
              },
              new go.Binding('source', 'serviceType', (serviceType) => {
                return images(`./${serviceType}.png`);
              })
            ),
            this.state.$(
              go.TextBlock,
              new go.Binding('text', 'applicationName').makeTwoWay(),
              {
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.BottomCenter,
                name: 'NODE_TEXT',
                margin: 6,
                font: defaultOption.sBigFont,
                editable: false,
              }
            ),

            this.state.$(
              go.Panel,
              go.Panel.Table,
              {
                padding: 2,
                minSize: new go.Size(100, 10),
                defaultStretch: go.GraphObject.Horizontal,
                itemTemplate: infoTableTemplate,
              },
              new go.Binding('itemArray', 'infoTable')
            )
          ),
          this.state.$(
            go.Panel,
            go.Panel.Horizontal,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: go.Spot.TopLeft,
              margin: 0,
            },
            this.state.$(
              go.Picture,
              {
                source: images('./ERROR.png'),
                desiredSize: new go.Size(20, 20),
                //                                    visible: false,
                imageStretch: go.GraphObject.Uniform,
                margin: new go.Margin(1, 5, 0, 1),
              },
              new go.Binding('visible', '', (data) => {
                return data.isAuthorized && data.hasAlert;
              })
            ),
            this.state.$(
              go.Picture,
              {
                source: images('./FILTER.png'),
                desiredSize: new go.Size(17, 17),
                visible: false,
                imageStretch: go.GraphObject.Uniform,
              },
              new go.Binding('visible', 'isFiltered')
            )
          ),
          this.state.$(
            go.Panel,
            go.Panel.Auto,
            {
              alignment: go.Spot.TopRight,
              alignmentFocus: go.Spot.TopRight,
              visible: false,
            },
            new go.Binding('visible', 'instanceCount', (v) => {
              return v > 1;
            }),
            this.state.$(
              go.Shape,
              {
                figure: 'RoundedRectangle',
                fill: '#848484',
                strokeWidth: 1,
                stroke: '#848484',
              }
            ),
            this.state.$(
              go.Panel,
              go.Panel.Auto,
              {
                margin: new go.Margin(0, 3, 0, 3),
              },
              this.state.$(
                go.TextBlock,
                new go.Binding('text', 'instanceCount'),
                {
                  stroke: '#FFFFFF',
                  textAlign: 'center',
                  height: 16,
                  font: defaultOption.sSmallFont,
                  editable: false,
                }
              )
            )
          )
        )
      );
    };

    this.state.myDiagram.nodeTemplate = getNodeTemplate();
  }

  initLinkTemplate = () => {
    const getLinkTemplate = () => {
      const defaultTheme = defaultOption.htLinkTheme.default;
      const option = {
        selectionAdorned: false,
        // selectionAdornmentTemplate: this._oDefaultAdornmentForLink,
        //                    click: this._onLinkClicked.bind(this),
        contextClick: () => {},
        layerName: 'Foreground',
        reshapable: false, // to disable reshape on links

        // fromSpot: go.Spot.RightSide,
        // toSpot: go.Spot.LeftSide,

        // routing: go.Link[htLinkType.sRouting],
        // routing : go.Link.Normal,
        // routing: go.Link.Orthogonal,
        // routing: go.Link.AvoidsNodes,

        corner: 10,
        cursor: 'pointer',

        // curve: go.Link[htLinkType.sCurve],
        // curve: go.Link.JumpOver
        // curve: go.Link.JumpGap
        // curve: go.Link.Bezier
      };

      return this.state.$(
        go.Link,
        // { routing: go.Link.Normal, curve: go.Link.Bezier, toShortLength: 2 },
        option,
        new go.Binding('routing', 'routing', (val) => {
          return go.Link[val];
        }),
        new go.Binding('curve', 'curve', (val) => {
          return go.Link[val];
        }),
        new go.Binding('curviness', 'curviness'),
        this.state.$(
          go.Shape,
          {
            name: 'LINK',
            isPanelMain: true,
            stroke: defaultTheme.borderColor,
            strokeWidth: 1.5,
          }
        ),
        this.state.$(
          go.Shape,
          {
            name: 'ARROW',
            toArrow: 'standard', // toArrow : kite, standard, OpenTriangle
            fill: defaultTheme.borderColor,
            stroke: null,
            scale: 1.5,
          }
        ),
        this.state.$(
          go.Panel,
          go.Panel.Auto,
          this.state.$(
            go.Shape, // the link shape
            'RoundedRectangle',
            {
              name: 'LINK2',
              fill: '#ffffff',
              stroke: '#ffffff',
              portId: '',
              fromLinkable: true,
              toLinkable: true,
            }
          ),
          this.state.$(
            go.Panel,
            go.Panel.Horizontal,
            {
              margin: 4,
            },
            this.state.$(
              go.Picture,
              {
                source: images('./FILTER.png'),
                width: 14,
                height: 14,
                margin: 1,
                visible: false,
                imageStretch: go.GraphObject.Uniform,
              },
              new go.Binding('visible', 'isFiltered')
            ),
            this.state.$(
              go.TextBlock, // the label
              {
                name: 'LINK_TEXT',
                textAlign: defaultTheme.fontAlign,
                font: defaultTheme.fontFamily,
                margin: defaultTheme.margin,
              },
              new go.Binding('text', 'totalCount', (val) => {
                return Number(val, 10).toLocaleString();
              }),
              new go.Binding('stroke', 'hasAlert', (hasAlert) => {
                return (hasAlert) ? defaultOption.htLinkTheme.bad.fontColor :
                  defaultTheme.fontColor;
              })
            )
          )
        )
      );
    };

    this.state.myDiagram.linkTemplate = getLinkTemplate();
  }

  initOverview = () => {
    const oOverview = this.state.$(go.Overview,
      defaultOption.sOverviewId,
      { observed: this.state.myDiagram }
    );
    oOverview.box.elt(0).figure = 'RoundedRectangle';
    oOverview.box.elt(0).stroke = '#53069B';
    oOverview.box.elt(0).strokeWidth = 4;
  }

  renderData = (props) => {
    const { mapData } = props;

    if (!mapData || !mapData.applicationMapData) {
      return;
    }

    this.state.myDiagram.model = new go.GraphLinksModel(
      mapData.applicationMapData.nodeDataArray,
      mapData.applicationMapData.linkDataArray
    );
  }

  render() {
    return (
      <div>
        <div id="myDiagramDiv" className={styles.chart} />
        <div id="overview" className={styles.overview} />
      </div>
    );
  }
}
