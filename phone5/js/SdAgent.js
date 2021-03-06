var SdAgent={
  topics:{},
  reconnect:false,
  url:"",
  userCode:"",
  userPwd:"",
  forceConnect:0,
  agtId:"",
  agtPwd:"",
  lastRunCmdTm:0,
  ctiId:"",
  isConnected:false,
  socket:null
};

SdAgent.run=function(cmd){
	this.socket.emit("message",{"cmd":cmd,"agentId":SdAgent.agtId});
};

//事件发布
SdAgent.event=function(id){
  var callbacks,topic = id && this.topics[id];
  if ( !topic ) {
    callbacks = jQuery.Callbacks();
    topic = {
      publish: callbacks.fire,
      subscribe: callbacks.add,
      unsubscribe: callbacks.remove
    };
    if (id) {
      this.topics[id] = topic;
    }
  }
  return topic;
};

//初始化前后端socket连接
SdAgent.connect=function(agentId,agentPwd,force,url){
  //this.socket = io("http://127.0.0.1:9802",{query:{agentId:agentId,force:force}});
  if(this.socket!=null){
  	this.socket.close();
  }
  
  if(phone.agtConfig.asUrl!=undefined && phone.agtConfig.asUrl!=""){
  	url = phone.agtConfig.asUrl;
  }
  console.log("座席服务地址："+url);
  
  this.socket = io(url,{query:{agentId:agentId,force:force}});
  this.agtId = agentId;
  this.agtPwd = agentPwd;
  this.forceConnect = force;
  this.url = url;

  SdAgent.socket.emit("message", {"cmd":"connectCTI","agentId": SdAgent.agtId, "agentPwd": SdAgent.agtPwd});

  //座席动作回调事件
  this.socket.on("onMessage",function(data){
    if(data==undefined||data==null) return;
    //writeLog(JSON.stringify(data));
    var cmd = data.cmd;
    delete data.cmd;
    SdAgent.agtEvt(cmd,data);
  });
};

SdAgent.disconnect=function(){
  this.run("disconnectCTI");
};

SdAgent.alive=function(){
  this.run("Alive");
};

SdAgent.logon=function(groupid,station){
  var data = {"cmd":"logon","agentId":SdAgent.agtId,"agentPwd":SdAgent.agtPwd};
  if(groupid!=undefined && groupid!="") data.groups=groupid;
  if(station!=undefined && station!="") data.station=station;
  this.socket.emit("message",data);
};

SdAgent.logout=function(reason){
  if(reason==null || reason==undefined || $.trim(reason)==""){
    this.run("logout");
  }else{
	this.socket.emit("message",{"cmd":"logout","reason":reason,"agentId":SdAgent.agtId});
  }
};

SdAgent.pause=function(reason){
  if(reason==null || reason==undefined || $.trim(reason)==""){
    this.run("pause");
  }else{
	  this.socket.emit("message",{"cmd":"pause","reason":reason,"agentId":SdAgent.agtId});
  }
};

SdAgent.restore=function(){
  this.run("restore");
};

SdAgent.offHook=function(){
  this.run("offHook");
};

SdAgent.onHook=function(){
  this.run("onHook");
};

SdAgent.agtWorkAfterCall=function(){
  this.run("agtWorkAfterCall");
};

SdAgent.agtWorkAfterCallOver=function(){
  this.run("agtWorkAfterCallOver");
};

SdAgent.agtHold=function(){
  this.run("agtHold");
};

SdAgent.agtRetrieve=function(){
  this.run("agtRetrieve");
};

SdAgent.dialout=function(dnis,type,grpId){
  var data = {"cmd":"dial","dnis":dnis,"dialType":type,"grpId":grpId,"extDnis":dnis,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.dialTrans=function(){
  this.run("dialTrans");
};

SdAgent.talkingDialJoin=function(){
  this.run("talkingDialJoin");
};

SdAgent.agtGetAgtInfo=function(agentid){
  var data = {"cmd":"agtGetAgtInfo","destAgt":agentid,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.getAllAgtInfo=function(orgIds){
  if(orgIds==null || orgIds==undefined || $.trim(orgIds)==""){
    this.run("getAllAgtInfo");
  }else{
    var data = {"cmd":"getAllAgtInfo","orgIds":orgIds,"agentId":SdAgent.agtId};
    this.socket.emit("message",data);
  }
};

SdAgent.dialTransIVR=function(callid, agentid, grpid, ivrstr){
  var data = {"cmd":"agtReturnIVR","ivrRet":1,"callId":callid,"array": agentid +","+grpid+",,,," +ivrstr,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtReturnIVR=function(ivrRet,callId,ivrList){
  var data = {"cmd":"agtReturnIVR","ivrRet":ivrRet,"callId":callId,"array":ivrList,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.getOrgTreeJson=function(){
  this.run("getOrgTreeJson");
};

SdAgent.logoutAgent=function(agentId){
  var data = {"cmd":"logoutAgent","destAgt":agentId,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtListen=function(destAgt){
  var data = {"cmd":"agtListen","destAgt":destAgt,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtUnListen=function(){
  this.run("agtUnListen");
};

SdAgent.agtDisconnectCall=function(destAgt,callId){
  var data = {"cmd":"agtDisconnectCall","destAgt":destAgt,"callId":callId,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtIntercept=function(destAgt,callId){
  var data = {"cmd":"agtIntercept","destAgt":destAgt,"callId":callId,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtJoinTalk=function(destAgt,callId){
  var data = {"cmd":"agtJoinTalk","destAgt":destAgt,"callId":callId,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtExitTalk=function(){
  this.run("agtExitTalk");
};

SdAgent.agtReqAgtCallAct=function(destAgt,actType,content){
  var data = {"cmd":"agtReqAgtCallAct","destAgt":destAgt,"actType":actType,"content":content,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.acceptAgtReq=function(destAgt){
  var data = {"cmd":"acceptAgtReq","destAgt":destAgt,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.getOrgAgtgrps=function(orgIds){
  if(orgIds==null || orgIds==undefined || $.trim(orgIds)==""){
    this.run("getOrgAgtgrps");
  }else{
    var data = {"cmd":"getOrgAgtgrps","orgIds":orgIds,"agentId":SdAgent.agtId};
    this.socket.emit("message",data);
  }
};

SdAgent.getAgentRights=function(){
  this.run("getAgentRights");
};

SdAgent.getAgtGroups=function(){
  this.run("getAgtGroups");
};

SdAgent.getAgtConfig=function(){
  this.run("getAgtConfig");
};

SdAgent.sendDTMF=function(dtmf){
  var data = {"cmd":"sendDTMF","dtmf":dtmf,"agentId":SdAgent.agtId};
  this.socket.emit("message",data);
};

SdAgent.agtEvt=function(cmd,data){
  var json;
  if(data!=null && data!="" && data!=undefined){
    if(typeof(data)=="object"){
      json=data;
    }else{
      try{json=eval("(" + data + ")");}catch(e){}
    }
  }
  switch(cmd){
    case "onConnect":
      this.event(cmd).publish(json.result,json.description);
      break;
    case "onDisconnect":
      this.event(cmd).publish();
      break;
    case "onAgtReqReturn":
      this.event(cmd).publish(json.cmdItem,json.retCode,json.description);
      break;
    case "onAlive":
      this.event(cmd).publish();
      break;
    case "onRing":
      this.event(cmd).publish(json.callId,json.subId,json.area,json.ani,json.grpId,json.srcAgt,json.ivrList);
      break;
    case "onRunAgtInfo":
      this.event("onRunAgtInfo").publish(json.status,json.hook,json.occupy);
      break;
    case "onStopRing":
      this.event(cmd).publish();
      break;
    case "onRingStop":
      this.event(cmd).publish();
      break;
    case "onRunDialDialed":
      this.event("onRunDialDialed").publish(json.callId,json.subId,json.area,json.dnis);
      break;
    case "onRunDialOver":
      this.event("onRunDialOver").publish(json.rlt,json.rltDesc);
      break;
    case "onQueueInfo":
      this.event(cmd).publish(json.grpId,json.waitCall);
      break;
    case "onRunTalkingDialCallIn":
      this.event("onRunTalkingDialCallIn").publish(json.callerId,json.callId,json.subId,json.area,json.ani,json.grpId,json.description);
      break;
    case "onRunTalkingDialDialed":
      this.event("onRunTalkingDialDialed").publish(json.dnis);
      break;
    case "onAgtInfo":
      this.event(cmd).publish(json.ret,json.agtId,json.info,json.errMsg);
      break;
    case "onAgtDetailInfo":
      this.event(cmd).publish(json.agtId,json.name,json.agtStatus,json.callStatus,json.hook,json.occupy,json.lastCall,json.webServiceUrl,json.isDALogin);
      break;
    case "onAllAgtInfo":
      this.event(cmd).publish(json.ret,json.errMsg,json.allAgtInfo,json.cnt);
      break;
    case "onASConnected":
      this.socket.disconnect();
      setTimeout(function(){SdAgent.event(cmd).publish();},100);
      break;
    case "onForceConnect":
      this.socket.disconnect();
      setTimeout(function(){SdAgent.event(cmd).publish();},100);
      break;
    case "onTreeJsonInfo":
      this.event(cmd).publish(data);
      break;
    case "onCallerHangup":
      this.event(cmd).publish(data);
      break;
    case "onIntercept":
      this.event(cmd).publish(json.ret,json.callId,json.subId,json.area,json.ani,json.grpId,json.srcAgt,json.errMsg,json.ivrList);
      break;
    case "onIntercepted":
      this.event(cmd).publish(json.agtId,json.agtName,json.callId);
      break;
    case "onCallDisconnected":
      this.event(cmd).publish(json.agtId,json.agtName);
      break;
    case "onReqAgtCallAct":
      this.event(cmd).publish(json.srcAgtId,json.srcAgtName,json.tmTime,json.actType,json.callId,json.content);
      break;
    case "onAcceptAgtReq":
      this.event(cmd).publish();
      break;
    case "onGetOrgAgtgrps":
      this.event(cmd).publish(json);
      break;
    case "onGetAgentRights":
      this.event(cmd).publish(json);
      break;
    case "onGetAgtGroups":
      this.event(cmd).publish(json);
      break;
    case "onGetAgtConfig":
      this.event(cmd).publish(json);
      break;
    case "onRunDialRing":
        this.event("onRunDialRing").publish(json.callId,json.subId,json.area,json.dnis);
        break;
    case "onTalkingDialError":
      this.event(cmd).publish(json);
    default:
      break;
  }
};

SdAgent.getCallStatusName = function(status){
    switch(status){
        case 0:
            return "空闲";
        case 1:
            return "振铃";
        case 2:
            return "通话";
        case 3:
            return "外拨";
        case 4:
            return "监听";
        case 5:
            return "保持";
        case 6:
            return "创建会议";
        case 7:
            return "参与会议";
        case 8:
            return "参与通话";
        case 9:
            return "会议外拨";
        case 10:
            return "正在呼叫第三方";
        case 11:
            return "正在与第三方通话";
        case 12:
            return "三方通话";
        case 13:
            return "三方呼入";
        case 14:
            return "会议振铃";
        case 15:
            return "会议摘机";
        case 16:
            return "会议";
        case 20:
            return "外拨座席";
        case 21:
            return "播工号";
        case 26:
            return "硬座席外拨";
        case 27:
            return "忙音";
        case 28:
            return "话机连接中";
        case 29:
            return "外拨座席组";
        default:
            return "未知";
    }
};