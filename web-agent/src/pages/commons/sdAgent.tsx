// import io from 'socket.io-client';

const io = require('socket.io-client');


/**
 * 接口定义
 * 以及doc接口文本显示编辑
 */
export interface SdAgent {
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
  callBackList?: {
    [key: string]: Function;
  };
  setCallBack: (name: string, fn: Function) => void;
  run: (cmd: string) => void;
  connect: (
    agentId: any,
    agentPwd: any,
    force: any,
    url: any,
    asUrl?: any,
  ) => void;
  disconnect: () => void;
  alive: () => void;
  logon: (groupid?: any, station?: any) => void;
  logout: (reason?: string) => void;
  pause: (reason?: string) => void;
  restore: () => void;
  offHook: () => void;
  onHook: () => void;
  agtWorkAfterCall: () => void;
  agtWorkAfterCallOver: () => void;
  agtHold: () => void;
  agtRetrieve: () => void;
  dialout: (dnis: any, type: any, grpId: any) => void;
  dialTrans: () => void;
  talkingDialJoin: () => void;
  agtGetAgtInfo: (agentid: any) => void;
  getAllAgtInfo: (orgIds?: string) => void;
  dialTransIVR: (callid: any, agentid: any, grpid: any, ivrstr: any) => void;
  agtReturnIVR: (ivrRet: any, callId: any, ivrList: any) => void;
  getOrgTreeJson: () => void;
  logoutAgent: (agentId: any) => void;
  agtListen: (destAgt: any) => void;
  agtUnListen: () => void;
  agtDisconnectCall: (destAgt: any, callId: any) => void;
  agtIntercept: (destAgt: any, callId: any) => void;
  agtJoinTalk: (destAgt: any, callId: any) => void;
  agtExitTalk: () => void;
  agtReqAgtCallAct: (destAgt: any, actType: any, content: any) => void;
  acceptAgtReq: (destAgt: any) => void;
  getOrgAgtgrps: (orgIds?: string) => void;
  getAgentRights: () => void;
  getAgtGroups: () => void;
  getAgtConfig: () => void;
  sendDTMF: (dtmf: any) => void;
  agtEvt: (cmd: string, data: any) => void;
  getCallStatusName: (status: any) => string;
}

//初始化部分变量的构建
let sdAgent: SdAgent = {
  reconnect: false,
  url: undefined,
  userCode: undefined,
  userPwd: undefined,
  forceConnect: 0,
  agtId: undefined, //一些原有的变量存储
  agtPwd: undefined,
  lastRunCmdTm: 0,
  ctiId: undefined,
  isConnected: false,
  socket: undefined, //socket

  callBackList: {
    //回调列表保存变量
  },
  setCallBack: function (this, name: string, fn: Function) {
    //添加一个回调列表,对应原有的event函数，原有的event函数是返回一个包含jQuery.Callbacks的三个属性的对象
    this.callBackList![name] = fn;
  },
  run: function (this, cmd: string) {
    //原有run方法
    this.socket!.emit('message', { cmd: cmd, agentId: this.agtId });
  },

  /**
   * 原有的connect函数，参数比原有的多了一个asUrl,为原有的phone.agtConfig.asUrl
   * @param this
   * @param agentId agentId
   * @param agentPwd agentPwd
   * @param force force
   * @param url url
   * @param asUrl phone.agtConfig.asUrl
   */
  connect: function ( this, agentId: any, agentPwd: any, force: any, url: any, asUrl?: any,) {
    //原有connect方法
    if (this.socket !== undefined) {
      this.socket.close();
    }

    if (asUrl !== undefined && asUrl !== null && asUrl !== '') {
      url = asUrl;
    }
    console.log('座席服务地址：' + url);

    this.socket = io(url, { query: { agentId: agentId, force: force } });
    this.agtId = agentId;
    this.agtPwd = agentPwd;
    this.forceConnect = force;
    this.url = url;

    this.socket.on("connection", (data?:any)=>{ console.log(data)});
    this.socket.connect();

    this.socket.emit('message', {
      cmd: 'connectCTI',
      agentId: agentId,
      agentPwd: agentPwd,
    });

    let that = this;
    this.socket.on('onMessage', function (data: any) {
      if (data == undefined || data == null) {
        return;
      }
      var cmd = data.cmd;
      delete data.cmd;
      that.agtEvt(cmd, data);
    });
    
  },

  disconnect: function (this) {
    //原有disconnect方法
    this.run('disconnectCTI');
  },

  alive: function (this) {
    //原有alive方法
    this.run('Alive');
  },

  logon: function (this, groupid?: any, station?: any) {
    //原有的logon方法
    var data: any = {
      cmd: 'logon',
      agentId: this.agtId,
      agentPwd: this.agtPwd,
    };
    if (groupid !== undefined && groupid !== null && groupid !== '') {
      data.groups = groupid;
    }
    if (station !== undefined && station !== null && station !== '') {
      data.station = station;
    }
    this.socket!.emit('message', data);
  },

  logout: function (this, reason?: string) {
    //原有的logout方法
    if ( reason === null || reason === undefined || reason?.trim() === '' ) {
      this.run('logout');
    } else {
      this.socket!.emit('message', {
        cmd: 'logout',
        reason: reason,
        agentId: this.agtId,
      });
    }
  },

  pause: function (this, reason?: string) {
    //原有的pause方法
    if ( reason === null || reason === undefined || reason?.trim() === '' ) {
      this.run('pause');
    } else {
      this.socket!.emit('message', {
        cmd: 'pause',
        reason: reason,
        agentId: this.agtId,
      });
    }
  },

  restore: function (this) {
    //原有的restore方法
    this.run('restore');
  },

  offHook: function (this) {
    //原有的offHook方法
    this.run('offHook');
  },

  onHook: function (this) {
    //原有的onHook方法
    this.run('onHook');
  },

  agtWorkAfterCall: function (this) {
    //原有的agtWorkAfterCall方法
    this.run('agtWorkAfterCall');
  },

  agtWorkAfterCallOver: function (this) {
    //原有的agtWorkAfterCallOver方法
    this.run('agtWorkAfterCallOver');
  },

  agtHold: function (this) {
    //原有的agtHold方法
    this.run('agtHold');
  },

  agtRetrieve: function (this) {
    //原有的agtRetrieve方法
    this.run('agtRetrieve');
  },

  dialout: function (this, dnis: any, type: any, grpId: any) {
    //原有的dialout方法
    var data = { cmd: 'dial', dnis: dnis, dialType: type, grpId: grpId, extDnis: dnis, agentId: this.agtId};
    this.socket!.emit('message', data);
  },

  dialTrans: function (this) {
    //原有的dialTrans方法
    this.run('dialTrans');
  },

  talkingDialJoin: function (this) {
    //原有的talkingDialJoin方法
    this.run('talkingDialJoin');
  },

  agtGetAgtInfo: function (this, agentid: any) {
    //原有的agtGetAgtInfo方法
    var data = { cmd: 'agtGetAgtInfo', destAgt: agentid, agentId: this.agtId };
    this.socket!.emit('message', data);
  },

  getAllAgtInfo: function (this, orgIds?: string) {
    //原有的getAllAgtInfo方法
    if ( orgIds === null || orgIds === undefined || orgIds?.trim() === '' ) {
      this.run('getAllAgtInfo');
    } else {
      var data = { cmd: 'getAllAgtInfo', orgIds: orgIds, agentId: this.agtId };
      this.socket!.emit('message', data);
    }
  },

  dialTransIVR: function ( this, callid: any, agentid: any, grpid: any, ivrstr: any) {
    //原有的dialTransIVR的方法
    var data = {
      cmd: 'agtReturnIVR',
      ivrRet: 1,
      callId: callid,
      array: agentid + ',' + grpid + ',,,,' + ivrstr,
      agentId: this.agtId,
    };
    this.socket!.emit('message', data);
  },

  agtReturnIVR: function (this, ivrRet: any, callId: any, ivrList: any) {
    //原有的agtReturnIVR方法
    var data = {
      cmd: 'agtReturnIVR',
      ivrRet: ivrRet,
      callId: callId,
      array: ivrList,
      agentId: this.agtId,
    };
    this.socket!.emit('message', data);
  },

  getOrgTreeJson: function (this) {
    //原有的getOrgTreeJson方法
    this.run('getOrgTreeJson');
  },

  logoutAgent: function (this, agentId: any) {
    //原有的logoutAgent方法
    var data = { cmd: 'logoutAgent', destAgt: agentId, agentId: this.agtId };
    this.socket!.emit('message', data);
  },

  agtListen: function (this, destAgt: any) {
    //原有的agtListen方法
    var data = { cmd: 'agtListen', destAgt: destAgt, agentId: this.agtId };
    this.socket.emit('message', data);
  },

  agtUnListen: function (this) {
    //原有的agtUnListen方法
    this.run('agtUnListen');
  },

  agtDisconnectCall: function (this, destAgt: any, callId: any) {
    //原有的agtDisconnectCall方法
    var data = {
      cmd: 'agtDisconnectCall',
      destAgt: destAgt,
      callId: callId,
      agentId: this.agtId,
    };
    this.socket!.emit('message', data);
  },

  agtIntercept: function (this, destAgt: any, callId: any) {
    //原有的agtIntercept方法
    var data = {
      cmd: 'agtIntercept',
      destAgt: destAgt,
      callId: callId,
      agentId: this.agtId,
    };
    this.socket!.emit('message', data);
  },

  agtJoinTalk: function (this, destAgt: any, callId: any) {
    //原有的agtJoinTalk方法
    var data = { cmd: 'agtJoinTalk', destAgt: destAgt, callId: callId, agentId: this.agtId};
    this.socket!.emit('message', data);
  },

  agtExitTalk: function (this) {
    //原有的agtExitTalk方法
    this.run('agtExitTalk');
  },

  agtReqAgtCallAct: function (this, destAgt: any, actType: any, content: any) {
    //原有的agtReqAgtCallAct方法
    var data = {
      cmd: 'agtReqAgtCallAct',
      destAgt: destAgt,
      actType: actType,
      content: content,
      agentId: this.agtId,
    };
    this.socket!.emit('message', data);
  },

  acceptAgtReq: function (this, destAgt: any) {
    //原有的acceptAgtReq方法
    var data = { cmd: 'acceptAgtReq', destAgt: destAgt, agentId: this.agtId };
    this.socket!.emit('message', data);
  },

  getOrgAgtgrps: function (this, orgIds?: string) {
    //原有的getOrgAgtgrps方法
    if ( orgIds === null || orgIds === undefined || orgIds?.trim() === '' ) {
      this.run('getOrgAgtgrps');
    } else {
      var data = { cmd: 'getOrgAgtgrps', orgIds: orgIds, agentId: this.agtId };
      this.socket!.emit('message', data);
    }
  },

  getAgentRights: function (this) {
    //原有的getAgentRights方法
    this.run('getAgentRights');
  },

  getAgtGroups: function (this) {
    //原有的getAgtGroups方法
    this.run('getAgtGroups');
  },

  getAgtConfig: function (this) {
    //原有的getAgtConfig方法
    this.run('getAgtConfig');
  },

  sendDTMF: function (this, dtmf: any) {
    //原有的sendDTMF方法
    var data = { cmd: 'sendDTMF', dtmf: dtmf, agentId: this.agtId };
    this.socket!.emit('message', data);
  },

  agtEvt: function (this, cmd: string, data: any) {
    //原有的agtEvt方法
    var json;
    let that = this;
    if (data !== null && data !== '' && data !== undefined) {
      if (typeof data == 'object') {
        json = data;
      } else {
        try {
          json = eval('(' + data + ')');
        } catch (e) {}
      }
    }
    switch (cmd) {
      case 'onConnect':
        this.callBackList![cmd](json.result, json.description);
        break;
      case 'onDisconnect':
        this.callBackList![cmd]();
        break;
      case 'onAgtReqReturn':
        this.callBackList![cmd](json.cmdItem, json.retCode, json.description);
        break;
      case 'onAlive':
        this.callBackList![cmd]();
        break;
      case 'onRing':
        this.callBackList![cmd]( json.callId, json.subId, json.area, json.ani, json.grpId, json.srcAgt, json.ivrList);
        break;
      case 'onRunAgtInfo':
        this.callBackList![cmd](json.status, json.hook, json.occupy);
        break;
      case 'onStopRing':
        this.callBackList![cmd]();
        break;
      case 'onRingStop':
        this.callBackList![cmd]();
        break;
      case 'onRunDialDialed':
        this.callBackList![cmd](json.callId, json.subId, json.area, json.dnis);
        break;
      case 'onRunDialOver':
        this.callBackList![cmd](json.rlt, json.rltDesc);
        break;
      case 'onQueueInfo':
        this.callBackList![cmd](json.grpId, json.waitCall);
        break;
      case 'onRunTalkingDialCallIn':
        this.callBackList![cmd]( json.callerId, json.callId, json.subId, json.area, json.ani, json.grpId, json.description);
        break;
      case 'onRunTalkingDialDialed':
        this.callBackList![cmd](json.dnis);
        break;
      case 'onAgtInfo':
        this.callBackList![cmd](json.ret, json.agtId, json.info, json.errMsg);
        break;
      case 'onAgtDetailInfo':
        this.callBackList![cmd]( json.agtId, json.name, json.agtStatus, json.callStatus, json.hook, json.occupy, json.lastCall, json.webServiceUrl, json.isDALogin);
        break;
      case 'onAllAgtInfo':
        this.callBackList![cmd]( json.ret, json.errMsg, json.allAgtInfo, json.cnt);
        break;
      case 'onASConnected':
        this.socket!.disconnect();
        setTimeout(function () {
          that.callBackList![cmd]();
        }, 100);
        break;
      case 'onForceConnect':
        this.socket!.disconnect();
        setTimeout(function () {
          that.callBackList![cmd]();
        }, 100);
        break;
      case 'onTreeJsonInfo':
        this.callBackList![cmd](data);
        break;
      case 'onCallerHangup':
        this.callBackList![cmd](data);
        break;
      case 'onIntercept':
        this.callBackList![cmd]( json.ret, json.callId, json.subId, json.area, json.ani, json.grpId, json.srcAgt, json.errMsg, json.ivrList);
        break;
      case 'onIntercepted':
        this.callBackList![cmd](json.agtId, json.agtName, json.callId);
        break;
      case 'onCallDisconnected':
        this.callBackList![cmd](json.agtId, json.agtName);
        break;
      case 'onReqAgtCallAct':
        this.callBackList![cmd]( json.srcAgtId, json.srcAgtName, json.tmTime, json.actType, json.callId, json.content);
        break;
      case 'onAcceptAgtReq':
        this.callBackList![cmd]();
        break;
      case 'onGetOrgAgtgrps':
        this.callBackList![cmd](json);
        break;
      case 'onGetAgentRights':
        this.callBackList![cmd](json);
        break;
      case 'onGetAgtGroups':
        this.callBackList![cmd](json);
        break;
      case 'onGetAgtConfig':
        // this.callBackList![cmd](json);     //原本的代码就没有订阅的事件
        break;
      case 'onRunDialRing':
        this.callBackList![cmd](json.callId, json.subId, json.area, json.dnis);
        break;
      case 'onTalkingDialError':
        this.callBackList![cmd](json);
      default:
        break;
    }
  },

  getCallStatusName: function (this, status: any) {
    //原有的getCallStatusName方法
    switch (status) {
      case 0:
        return '空闲';
      case 1:
        return '振铃';
      case 2:
        return '通话';
      case 3:
        return '外拨';
      case 4:
        return '监听';
      case 5:
        return '保持';
      case 6:
        return '创建会议';
      case 7:
        return '参与会议';
      case 8:
        return '参与通话';
      case 9:
        return '会议外拨';
      case 10:
        return '正在呼叫第三方';
      case 11:
        return '正在与第三方通话';
      case 12:
        return '三方通话';
      case 13:
        return '三方呼入';
      case 14:
        return '会议振铃';
      case 15:
        return '会议摘机';
      case 16:
        return '会议';
      case 20:
        return '外拨座席';
      case 21:
        return '播工号';
      case 26:
        return '硬座席外拨';
      case 27:
        return '忙音';
      case 28:
        return '话机连接中';
      case 29:
        return '外拨座席组';
      default:
        return '未知';
    }
  },
};


/**
 * 获取一个sdAgent的对象
 * 需要使用setCallBack往对象里面设置回调函数
 * @returns typeof sdAgent
 */
export function getSdAgent() {
  let target: SdAgent = Object.assign({}, sdAgent);
  return target;
}
