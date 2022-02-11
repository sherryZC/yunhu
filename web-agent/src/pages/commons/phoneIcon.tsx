import { Image } from 'antd';
import Icon from '@ant-design/icons';
import classnames from 'classnames';
import React from 'react';
import styles from './phoneIcon.less';
import Background from '../resources/images/allbgs.png';
import BackgroundGray from '../resources/images/allbgs_gray.png';
/**
 * 参数定义
 */
declare const phoneIconName:
  | 'shangban'
  | 'xiaban'
  | 'banzhang'
  | 'waibo'
  | 'zhuanjie'
  | 'xiaoxiu'
  | 'gongzuo'
  | 'guaduan'
  | 'jingyin'
  | 'quxiaojingyin'
  | 'jieshuchuli'
  | 'zhaiji';

interface phoneIconProps {
  name: typeof phoneIconName;

  // selected?: boolean,

  disabled?: boolean;
}

const commonPosition = {
  shangban: {
    x: 168,
    y: 0,
    text: '上班',
  },
  xiaban: {
    x: 55,
    y: 0,
    text: '下班',
  },
  banzhang: {
    x: 110,
    y: 0,
    text: '班长',
  },
  waibo: {
    x: 0,
    y: 0,
    text: '外拨',
  },
  zhuanjie: {
    x: 645,
    y: 0,
    text: '转接',
  },
  xiaoxiu: {
    x: 587,
    y: 0,
    text: '小休',
  },
  gongzuo: {
    x: 560,
    y: 0,
    text: '工作',
  },
  guaduan: {
    x: 504,
    y: 0,
    text: '挂断',
  },
  jingyin: {
    x: 476,
    y: 0,
    text: '静音',
  },
  quxiaojingyin: {
    x: 447,
    y: 0,
    text: '取消静音',
  },
  jieshuchuli: {
    x: 0,
    y: 0,
    text: '结束处理',
  },
  zhaiji: {
    x: 0,
    y: 0,
    text: '摘机',
  },
};

const grayPosition = {
  shangban: {
    x: 166,
    y: 0,
  },
  xiaban: {
    x: 55,
    y: 0,
  },
  waibo: {
    x: 0,
    y: 0,
  },
  banzhang: {
    x: 110,
    y: 0,
  },
  zhuanjie: {
    x: 645,
    y: 0,
  },
  xiaoxiu: {
    x: 587,
    y: 0,
  },
  gongzuo: {
    x: 560,
    y: 0,
  },
  guaduan: {
    x: 504,
    y: 0,
  },
  jingyin: {
    x: 476,
    y: 0,
  },
  quxiaojingyin: {
    x: 447,
    y: 0,
  },
  jieshuchuli: {
    x: 0,
    y: 0,
  },
  zhaiji: {
    x: 0,
    y: 0,
  },
};

const selectedPosition = {
  shangban: {
    x: 141,
    y: 0,
  },
  xiaban: {
    x: 29,
    y: 0,
  },
  banzhang: {
    x: 85,
    y: 0,
  },
  waibo: {
    x: 419,
    y: 0,
  },
  zhuanjie: {
    x: 392,
    y: 0,
  },
  xiaoxiu: {
    x: 337,
    y: 0,
  },
  gongzuo: {
    x: 310,
    y: 0,
  },
  guaduan: {
    x: 252,
    y: 0,
  },
  jingyin: {
    x: 224,
    y: 0,
  },
  quxiaojingyin: {
    x: 196,
    y: 0,
  },
  jieshuchuli: {
    x: 0,
    y: 0,
  },
  zhaiji: {
    x: 0,
    y: 0,
  },
};

/**
 * 一些图标,按钮的图标
 * 接受两个参数，selected为true的时候显示黄色的选中图标，
 * disabled为true的时候显示灰色的图标，
 * 其他情况显示白的图标
 * 其他图标的参数也一致
 */
//上班的图标
export class PhoneIcon extends React.PureComponent<phoneIconProps, any> {
  constructor(props: phoneIconProps) {
    super(props);
    this.state.name = this.props.name;
    // this.state.selected = this.props.selected
    this.state.disabled = this.props.disabled;
  }

  state: {
    name: phoneIconProps['name'];
    // selected: phoneIconProps['selected'],
    disabled: phoneIconProps['disabled'];
    hover: boolean;
  } = {
    name: 'shangban', //默认的名称
    // selected: false,
    disabled: false,
    hover: false,
  };


  toggleHover = () => {
    this.setState({ hover: !this.state.hover });
  };

  render() {
    return (
      <>
        {/* {this.props.selected?
            (
            <>
                <div className={classnames(styles['selected'],styles['container'])}>
                    <Icon className={styles['icon']} component={()=>{   
                        return (
                        <div className={styles['image']} style={{
                            backgroundPositionX: selectedPosition[this.props.name].x,
                            backgroundPositionY: selectedPosition[this.props.name].y,
                            backgroundImage: "url(" + Background + ")",
                        }}></div>
                        );
                    }}/>
                    <span className={styles['text-selected']}>{commonPosition[this.props.name].text}</span>
                </div>
            </>
            )
            :( */}
        {
          this.props.disabled ? (
            <div className={styles['container']}>
              <Icon
                className={styles['icon']}
                component={() => {
                  return (
                    <div
                      className={styles['image']}
                      style={{
                        backgroundPositionX: grayPosition[this.props.name].x,
                        backgroundPositionY: grayPosition[this.props.name].y,
                        backgroundImage: 'url(' + BackgroundGray + ')',
                      }}
                    ></div>
                  );
                }}
              />
              <span className={styles['text-gray']}>
                {commonPosition[this.props.name].text}
              </span>
            </div>
          ) : (
            <div
              className={
                !this.state.hover
                  ? styles['container']
                  : classnames(styles['selected'], styles['container'])
              }
              onMouseEnter={()=>{this.setState({ hover: true });}}
              onMouseLeave={()=>{this.setState({ hover: false });}}
            >
              <Icon
                className={styles['icon']}
                component={() => {
                  return (
                    <div
                      className={styles['image']}
                      style={{
                        backgroundPositionX: !this.state.hover
                          ? commonPosition[this.props.name].x
                          : selectedPosition[this.props.name].x,
                        backgroundPositionY: !this.state.hover
                          ? commonPosition[this.props.name].y
                          : selectedPosition[this.props.name].y,
                        backgroundImage: 'url(' + Background + ')',
                      }}
                    ></div>
                  );
                }}
              />
              <span
                className={
                  !this.state.hover ? styles['text'] : styles['text-selected']
                }
              >
                {commonPosition[this.props.name].text}
              </span>
            </div>
          )
          // )
        }
      </>
    );
  }
}