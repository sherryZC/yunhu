/**
 * phone的全局变量参数中的lastCall的参数定义设置
 */
export interface phoneLastCallProps {
  callId?: number;

  subId?: number;

  areaCode?: string | undefined;

  ani?: string | undefined;

  groupId?: string | undefined;

  ivrList?: string | undefined;

  offHookTime?: string | undefined;
}

/**
 * phone的全局变量参数中的right的参数定义设置
 */
export interface phoneRightsProps {
  agtReq?: boolean;

  dialOut?: boolean;

  agtDisconnectCall?: boolean;

  agtIntercept?: boolean;

  agtJoinTalk?: boolean;

  agtListen?: boolean;

  isMonitor?: boolean;

  logoutAgt?: boolean;

  remoteCti?: boolean;
}

/**
 * 原有的phone.js的全局变量的参数定义设置
 */
export interface phoneProps {
  webUrl?: string;

  url?: string;

  publicUrl?: string;

  agtId?: string;

  userCode?: string;

  agtPwd?: string;

  groupId?: string | undefined;

  station?: string | undefined;

  agtStatus?: number;

  callStatus?: number;

  lastCallStatus?: number;

  occupy?: number;

  hook?: number;

  aliveClock?: any;

  lastAliveTm?: number;

  isLogin?: boolean;

  isMSClick?: boolean;

  isPause?: boolean;

  tmMonitor?: any;

  dialGrp?: number;

  lastCall?: phoneLastCallProps;

  rights?: phoneRightsProps;

  firstMX?: boolean;

  agtMonitorObj?: any | undefined;

  toolsType?: string | undefined;

  topics?: any | undefined;

  subscribeCnt?: any | undefined;

  lastAllAgtInfoStr?: string | undefined;

  lastAllAgtInfoCnt?: number;

  webServiceUrl?: string | undefined;

  tmrDur?: any;

  workTime?: string | undefined;

  callCnt?: number;

  dialOutCnt?: number;

  talkTime?: number;

  totalTalkTime?: number | undefined;

  tenantsId?: string | undefined;

  organizerId?: string | undefined;

  myId?: string | undefined;

  client?: string | undefined;

  agtConfig?: any | undefined;

  afterWorkStatus?: number;

  aliveTmCnt?: number;

  openOnHookEvent?: number;

  onDisConnectTag?: number;

  offHookEventTag?: number;

  callOutEventTag?: number;

  callType?: number;

  redirectTag?: number;

  loginCmd?: number;

  callOutWR?: number;

  onHookMode?: string | undefined;

  callOutRing?: number;

  isLoaded?: number;

  initSetCallModel?: number; //初始化默认模式配置，0代表初始化默认SIP模式，1代表初始化默认WebCall模式

  callBackList?: any | undefined; //自定义添加的回调函数列表，用于绑定原有的JQueryCallBack的发布事件
}

/**
 * webrtc原有全局变量
 */
export interface webrtcProps {
  displayName?: string;

  publicUrl?: string;

  realm?: string;

  publicIdentity?: string;

  password?: string;

  websocketServerUrl?: string;

  failCnt?: number;

  sTransferNumber?: any;

  oRingTone?: any;

  oRingbackTone?: any;

  oSipStack?: any;

  oSipSessionRegister?: any;

  oSipSessionCall?: any;

  oSipSessionTransferCall?: any;

  videoRemote?: any;

  videoLocal?: any;

  audioRemote?: any;

  bFullScreen?: boolean;

  oNotifICall?: any;

  bDisableVideo?: boolean;

  viewVideoLocal?: any;

  viewVideoRemote?: any;

  viewLocalScreencast?: any;

  oConfigCall?: any;

  oReadyStateTimer?: any;
}

/**
 * sdagent原有全局变量
 */
export interface sdAgentProps {
  topics?: any | undefined;

  reconnect?: boolean;

  url?: string | undefined;

  userCode?: string | undefined;

  userPwd?: string | undefined;

  forceConnect?: number;

  agtId?: string | undefined;

  agtPwd?: string | undefined;

  lastRunCmdTm?: number;

  ctiId?: string | undefined;

  isConnected?: boolean;

  socket?: any | undefined;
}

/**
 * 主页面的原有参数配置
 */
export interface mainProps{
  digStatus?: number,       //原有的主页面的digStatus全局变量,初始化为0

  toolsType?: string,         //原有的主页面的phone.toolsType,初始化为"zhuanjie"

  isMonitorOpen?: boolean,    //原有的主页面的phone.isMonitorOpen,初始化为false

}

/**
 * 主页面的一些显示内容
 * 所有的内容都只用于显示
 */
export interface mainInfo {
  barAgentId?: any,     //原有的Bar_AgentId，

  barWorkTime?: any,    //原有的Bar_WorkTime，

  barLoginGroups?: any,    //Bar_LoginGroups

  barTalkTime?: any,     //Bar_TalkTime，初始化00:00:00

  barCallCnt?: any,    //Bar_CallCnt，初始化0/0

  barTotalTalkTime?: any,    //Bar_totalTalkTime,初始化00:00:00

}

/**
 * agtMonitor.js的一些全局变量的定义
 */
export interface agtMonitorProps {
  lastAllAgtInfo?: any,

  lastAgtIdList?: any[],

  bindTrEvt?: boolean,

  lastRemoteCallId?: number,

  agtInfo?: any,

  phoneObj?: any,

  tmReqAgt?: any,

  reqAgtTmCnt?: number,

  tmRecvReqAgt?: any,

  reqRecvAgtTmCnt?: number,

  recvReqAgtId?: string,

  recvReqActType?: number

}

