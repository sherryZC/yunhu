var lastAllAgtInfo = "",lastAgtIdList=[],bindTrEvt=false,lastRemoteCallId=0;
var agtInfo = null;
var phoneObj = null;
var tmReqAgt = 0,reqAgtTmCnt = 30,tmRecvReqAgt = 0,reqRecvAgtTmCnt = 30;
var recvReqAgtId="",recvReqActType=-1;

$(document).ready(function(){
	phoneObj = parent.getPhoneFrame().contentWindow;
	
	if(phoneObj.phone.lastAllAgtInfoStr!="") onAllAgtInfo(phoneObj.phone.lastAllAgtInfoStr,phoneObj.phone.lastAllAgtInfoCnt);
	
	phoneObj.phone.event("onAllAgtInfo").subscribe(onAllAgtInfo);
	phoneObj.phone.event("onListen").subscribe(onListen);
	phoneObj.phone.event("onUnListen").subscribe(onUnListen);
	phoneObj.phone.event("onJoinAgtTalk").subscribe(onJoinAgtTalk);
	phoneObj.phone.event("onExitAgtTalk").subscribe(onExitAgtTalk);
	phoneObj.phone.event("onDisconncall").subscribe(onDisconncall);
	phoneObj.phone.event("onInterceptTalk").subscribe(onInterceptTalk);
	phoneObj.phone.event("onAgtReqAct").subscribe(onAgtReqAct);
	phoneObj.phone.event("onAcceptAgtReq").subscribe(onAcceptAgtReq);
	phoneObj.phone.event("onRunAgtInfo").subscribe(onRunAgtInfo);
	phoneObj.phone.event("onGetOrgAgtgrps").subscribe(onGetOrgAgtgrps);
	
	if(!phoneObj.phone.rights.logoutAgt) $("#btnLogoutAgt").addClass("btn-disabled");
	if(!phoneObj.phone.rights.dialOut) $("#btnDialAgt").addClass("btn-disabled");
	if(!phoneObj.phone.rights.agtReq) $("#btnReqAgt").addClass("btn-disabled");
	if(!phoneObj.phone.rights.agtListen) $("#btnListen").addClass("btn-disabled");
	
	showTools(phoneObj.phone.toolsType);
	phoneObj.SdAgent.getOrgAgtgrps();
});

$(window).unload(function () {
	phoneObj.phone.event("onAllAgtInfo").unsubscribe(onAllAgtInfo);
	phoneObj.phone.event("onListen").unsubscribe(onListen);
	phoneObj.phone.event("onUnListen").unsubscribe(onUnListen);
	phoneObj.phone.event("onJoinAgtTalk").unsubscribe(onJoinAgtTalk);
	phoneObj.phone.event("onExitAgtTalk").unsubscribe(onExitAgtTalk);
	phoneObj.phone.event("onDisconncall").unsubscribe(onDisconncall);
	phoneObj.phone.event("onInterceptTalk").unsubscribe(onInterceptTalk);
	phoneObj.phone.event("onAgtReqAct").unsubscribe(onAgtReqAct);
	phoneObj.phone.event("onAcceptAgtReq").unsubscribe(onAcceptAgtReq);
	phoneObj.phone.event("onRunAgtInfo").unsubscribe(onRunAgtInfo);
	phoneObj.phone.event("onGetOrgAgtgrps").unsubscribe(onGetOrgAgtgrps);
});

/***************班长工具条按钮开始*****************/
//注销座席
$("#btnLogoutAgt").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
	if(agtInfo==null){
		phoneObj.ztoDialog("message","请选择一个座席");
		return;
	}
	
	//注销状态下该功能不可用
	if(phoneObj.phone.agtStatus==3){
		phoneObj.ztoDialog("message","请先注册座席");
		return;
	}
	
	if(agtInfo[3]!=0){
		phoneObj.ztoDialog("message","只能注销空闲座席");
		return;
	}
	
	phoneObj.SdAgent.logoutAgent(agtInfo[0]);
});

//呼叫座席
$("#btnDialAgt,#btnTransAgt").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
	//注销状态下该功能不可用
	if(phoneObj.phone.agtStatus==3){
		phoneObj.ztoDialog("message","请先注册座席");
		return;
	}
	
	if(agtInfo==null){
		phoneObj.ztoDialog("message","请选择一个座席");
		return;
	}
	
	phoneObj.SdAgent.dialout(agtInfo[0], "A", phoneObj.phone.dialGrp);
});

//请求
$("#btnReqAgt").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
	if(agtInfo==null){
		phoneObj.ztoDialog("message","请选择一个座席");
		return;
	}
	
	//注销状态下该功能不可用
	if(phoneObj.phone.agtStatus==3){
		phoneObj.ztoDialog("message","请先注册座席");
		return;
	}
	
	if(phoneObj.phone.callStatus!=3 && phoneObj.phone.callStatus!=2){
		phoneObj.ztoDialog("message","非通话状态下无法使用请求功能");
		return;
	}
	
	if(phoneObj.SdAgent.agtId==agtInfo[0]){
		phoneObj.ztoDialog("message","不能请求您自己");
		return;
	}
	
	var width = document.body.clientWidth;
	var height = document.body.clientHeight;
	$(".reqAgt").css({"top":height/2-60,"left":width/2-120,width:240,height:150});
	if(tmReqAgt<=0){
		$("#lblReqAgtInfo").html("向["+agtInfo[0]+"]发送请求。未发送");
	}
	$("#doing").show();
	$(".reqAgt").show();
	$("#btnSendReq").removeAttr("disabled");
});

//发送请求
$("#btnSendReq").click(function(){
	var actType = $("#cbReqAgtType").val();
	var content = $.trim($("#txtReqAgtInfo").val());
	phoneObj.SdAgent.agtReqAgtCallAct(agtInfo[0],actType,content);
});

//关闭请求对话框
$("#btnCloseReq").click(function(){
	$("#doing").hide();
	$(".reqAgt").hide();
});

//监听
$("#btnListen").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
	if($(this).html()=="取消监听"){
		phoneObj.SdAgent.agtUnListen();
		return;
	}
	if(agtInfo==null){
		phoneObj.ztoDialog("message","请选择一个座席");
		return;
	}
	
	//注销状态下该功能不可用
	if(phoneObj.phone.agtStatus==3){
		phoneObj.ztoDialog("message","请先注册座席");
		return;
	}
	
	if(phoneObj.SdAgent.agtId==agtInfo[0]){
		phoneObj.ztoDialog("message","不能监听您自己");
		return;
	}
	
	if(phoneObj.phone.callStatus!=0){
		phoneObj.ztoDialog("message","非空闲状态，无法监控座席");
		return;
	}
	
	if(agtInfo[3]!=2 && agtInfo[3]!=3 && agtInfo[3]!=20){
		phoneObj.ztoDialog("message","该座席非通话中，无法监听");
		return;
	}
	
	phoneObj.SdAgent.agtListen(agtInfo[0]);
});

//加入通话
$("#btnJointalk").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	if($(this).html()=="加入通话"){
		phoneObj.SdAgent.agtJoinTalk(agtInfo[0],lastRemoteCallId);
	}else{
		phoneObj.SdAgent.agtExitTalk();
	}
});

//拦截
$("#btnIntercept").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	phoneObj.SdAgent.agtIntercept(agtInfo[0],lastRemoteCallId);
});

//强拆
$("#btnDisconCall").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	phoneObj.SdAgent.agtDisconnectCall(agtInfo[0],lastRemoteCallId);
});
/***************班长工具条按钮结束*****************/

/***************转接工具条按钮开始*****************/
//呼叫座席
$("#btnTransAgt").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
});

//转接座席组
$("#btnTransGrp").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
	//注销状态下该功能不可用
	if(phoneObj.phone.agtStatus==3){
		phoneObj.ztoDialog("message","请先注册座席");
		return;
	}
	
	if(phoneObj.phone.callStatus!=2){
		phoneObj.ztoDialog("message","非通话状态下无法使用此功能");
		return;
	}
	
	var transGrp = $("#cbTransAgtGrp").val();
	if(transGrp==""){
		phoneObj.ztoDialog("message","请选择一个座席座席组");
		return;
	}
	
//	三方转组
//	phoneObj.SdAgent.dialTransIVR(phoneObj.phone.lastCall.callId,"",transGrp,"");
//	直接转组
	phoneObj.SdAgent.agtReturnIVR("1",phoneObj.phone.lastCall.callId,','+transGrp);
	
});

$("#cbTransAgtGrp").bind({
	change:function(){
		$("#txtTransAgtId").attr("operType","grp").val($(this).children('option:selected').text());
	},
	click:function(){
		$("#txtTransAgtId").attr("operType","grp").val($(this).children('option:selected').text());
	}
});

$("#txtTransAgtId").keypress(function(){
	$("#txtTransAgtId").attr("operType","common");
});

//转接
$("#btnTrans").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	
	//注销状态下该功能不可用
	if(phoneObj.phone.agtStatus==3){
		phoneObj.ztoDialog("message","请先注册座席");
		return;
	}
	
	if(phoneObj.phone.callStatus==0){
		return;
	}
	
	var operType = $("#txtTransAgtId").attr("operType");
	var dialNo = $.trim($("#txtTransAgtId").val());
	if(dialNo==phoneObj.phone.agtId||!(agtInfo[1]==1&&agtInfo[2]==0&&(agtInfo[3]==0||agtInfo[3]=="NaN")&&agtInfo[4]==1&&agtInfo[5]==0)){
		phoneObj.ztoDialog("message","座席忙，无法转接");
		return;
	}
	if (phoneObj.phone.callStatus == 2 || phoneObj.phone.callStatus == 20) {
		if(operType=="agt"){
			dialNo = agtInfo[0];
//			三方转接
//			phoneObj.SdAgent.dialout(dialNo,"A",0);
//			直接转接
			phoneObj.SdAgent.agtReturnIVR("1",phoneObj.phone.lastCall.callId,dialNo+',');
		}else if(operType=="grp"){
			$("#btnTransGrp").click();
		}else{
//			三方转外
//			phoneObj.SdAgent.dialout(dialNo,"X",0);
//			直接转外
			phoneObj.SdAgent.agtReturnIVR("3",phoneObj.phone.lastCall.callId,',,'+dialNo);
		}
	}else{
		phoneObj.SdAgent.dialTrans();
	}
});

//拉回
$("#btnRetrieve").click(function(){
	if($(this).hasClass("btn-disabled")) return;
	phoneObj.SdAgent.onHook();
});
/***************转接工具条按钮结束*****************/

function showTools(type){
	if(type.toLowerCase()=="zhuanjie"){
		$("#zhuanjieTools").show();
		$("#banzhangTools").hide();
	}else{
		$("#zhuanjieTools").hide();
		$("#banzhangTools").show();
	}
}

function onGetOrgAgtgrps(data){
	$("#cbTransAgtGrp").empty();
	if(data!=null && data!=undefined){
		var optHtml = [];
		for(var i=0;i<data.length;i++){
			optHtml.push('<option value="'+data[i].groupId+'">'+data[i].groupId+'('+data[i].groupName+')</option>');
		}
		$("#cbTransAgtGrp").append(optHtml.join(''));
	}
}

//监听事件
function onListen(remoteCallId){
	lastRemoteCallId = remoteCallId;
	$("#doing").show();
	$("#btnLogoutAgt,#btnDialAgt,#btnReqAgt").addClass("btn-disabled");
	$("#btnListen").html("取消监听");
	
	if(phoneObj.phone.rights.agtJoinTalk) $("#btnJointalk").removeClass("btn-disabled");
	if(phoneObj.phone.rights.agtIntercept) $("#btnIntercept").removeClass("btn-disabled");
	if(phoneObj.phone.rights.agtDisconnectCall) $("#btnDisconCall").removeClass("btn-disabled");
	
	//拦截请求
	if(recvReqActType>0){
		$(".recvAgtReq").hide();
		if(recvReqActType==1){
			$("#btnIntercept").click();
		}else if(recvReqActType==2){
			$("#btnJointalk").click();
		}
		recvReqActType=-1;
	}
}

//取消监听事件
function onUnListen(){
	$("#doing").hide();
	$("#btnJointalk,#btnIntercept,#btnDisconCall").addClass("btn-disabled");
	$("#btnListen").html("监听");
	
	if(phoneObj.phone.rights.logoutAgt) $("#btnLogoutAgt").removeClass("btn-disabled");
	if(phoneObj.phone.rights.dialOut) $("#btnDialAgt").removeClass("btn-disabled");
	if(phoneObj.phone.rights.agtReq) $("#btnReqAgt").removeClass("btn-disabled");
	if(phoneObj.phone.rights.agtListen) $("#btnListen").removeClass("btn-disabled");
}

//加入通话事件
function onJoinAgtTalk(){
	$("#btnJointalk").html("退出通话");
	$("#btnListen,#btnIntercept,#btnDisconCall").addClass("btn-disabled");
}

//退出通话事件
function onExitAgtTalk(){
	$("#btnJointalk").html("加入通话");
	onUnListen();
}

//强拆事件
function onDisconncall(){
	onListen();
	phoneObj.ztoDialog("message","强拆成功");
}

//拦截事件
function onInterceptTalk(){
	onUnListen();
	phoneObj.ztoDialog("message","拦截成功");
}

//请求成功事件
function onAgtReqAct(){
	reqAgtTmCnt = 30;
	$("#btnSendReq").attr("disabled","disabled");
	var reqText = "向["+agtInfo[0]+"]发送请求。等待应答:";
	$("#lblReqAgtInfo").html(reqText+reqAgtTmCnt);
	if(tmReqAgt>0) clearInterval(tmReqAgt);
	tmReqAgt = setInterval(function(){
		reqAgtTmCnt = reqAgtTmCnt - 1;
		$("#lblReqAgtInfo").html(reqText+reqAgtTmCnt);
		if(reqAgtTmCnt<=0){
			$("#lblReqAgtInfo").html("向["+agtInfo[0]+"]发送请求。未应答");
			clearInterval(tmReqAgt);
			$("#btnSendReq").removeAttr("disabled");
		}
	},1000);
}

//接受请求事件
function onAcceptAgtReq(){
	if(tmReqAgt>0) clearInterval(tmReqAgt);
	tmReqAgt = 0;
	var reqText = "向["+agtInfo[0]+"]发送请求。已接受";
	$("#lblReqAgtInfo").html(reqText);
}

/**************************接收请求对话框开始***************************/
//接收到请求
function onRecvAgtReq(srcAgtId,srcAgtName,tmTime,actType,callId,content){
	recvReqAgtId = srcAgtId;
	recvReqActType = actType;
	var width = document.body.clientWidth;
	var height = document.body.clientHeight;
	$(".recvAgtReq").css({"top":height/2-40,"left":width/2-120,width:240,height:140});
	if(tmReqAgt<=0){
		$("#lblRecvReqAgtInfo").html("接收到"+srcAgtId+"的["+getReqActType(actType)+"]请求！");
		$("#lblRecvReqAgtMemo").html("备注："+content);
	}
	$("#doing").show();
	$(".recvAgtReq").show();
	$("#tr_"+recvReqAgtId).click();
	
	reqRecvAgtTmCnt = 30;
	$("#btnAcceptReq").val("接收("+reqRecvAgtTmCnt+")");
	if(tmRecvReqAgt>0) clearInterval(tmRecvReqAgt);
	tmRecvReqAgt = setInterval(function(){
		reqRecvAgtTmCnt = reqRecvAgtTmCnt-1;
		$("#btnAcceptReq").val("接收("+reqRecvAgtTmCnt+")");
		if(reqRecvAgtTmCnt<=0){
			clearInterval(tmRecvReqAgt);
			$("#btnCloseRecvReq").click();
		}
	},1000);
}

function getReqActType(actType){
	switch(actType){
		case 0:
			return "监听";
		case 1:
			return "拦截";
		case 2:
			return "加入通话";
		default:
			return "未知";
	}
}


//接收请求
$("#btnAcceptReq").click(function(){
	phoneObj.SdAgent.acceptAgtReq(recvReqAgtId);
	if(tmRecvReqAgt>0) clearInterval(tmRecvReqAgt);
	$("#btnCloseRecvReq").click();
	
	$("#btnListen").click();
});

//关闭接收请求对话框
$("#btnCloseRecvReq").click(function(){
	$("#doing").hide();
	$(".recvAgtReq").hide();
});

/**************************接收请求对话框结束***************************/

function onRunAgtInfo(status, hook, occupy){
	switch (status) {
        case 9:
        case 10:
        case 11:
            $("#btnRetrieve").removeClass("btn-disabled");
            break;
        default:
        	$("#btnRetrieve").addClass("btn-disabled");
            break;
    }
}

//监控事件返回
function onAllAgtInfo(allAgtInfo,count){
	if(allAgtInfo==null || allAgtInfo=="" || allAgtInfo==undefined){
		return;
	}
	if(allAgtInfo==lastAllAgtInfo) return;
	lastAllAgtInfo=allAgtInfo;
	
	var agtIdList = [],infos=[];
	var status,login,pause,occupy,hook,loginGroups,agtid,agtname,groups;
	var agents=allAgtInfo.split(String.fromCharCode(3));
	for(var i=0;i<agents.length;i++){
		infos=agents[i].split(String.fromCharCode(2));
		agtid=infos[0];
		agtname=infos[1];
		login=infos[2];
		pause=infos[3];
		status=infos[4].substring(0,1)=="0"?parseInt(infos[4].substr(1)):parseInt(infos[4]);
		hook=infos[5];
		occupy=infos[6];
		loginGroups=infos[7];
		groups=infos[8];
		agtIdList.push(agtid);
		setTableData(agtid,agtname,status,hook,login,pause,occupy,loginGroups,groups);
	}
	
	if(bindTrEvt==true){
		bindTrEvt=false;
		bindTrClick();
	}
	
	checkAgtIdList(agtIdList);
	
	if(recvReqAgtId!=""){
		$("#tr_"+recvReqAgtId).click();
		recvReqAgtId = "";
	}
}

function setTableData(agtid,agtname,status,hook,login,pause,occupy,loginGroups,groups){
	var sIcon,sLogin,sPause,sStatus,sOccupy,sHook,sLoginGrps,sTrDisplay;
	if(login==0){
		sIcon = "status-offline";
		sLogin=sPause=sStatus=sOccupy=sHook=sLoginGrps="未注册";
		sTrDisplay = "none";
	}else{
		sTrDisplay = "";
		sLogin="注册";
		sPause=pause==1?"暂停":"恢复";
		if(hook==0){
			sHook="摘机";
		}else if(hook==1){
			sHook="挂机";
		}else if(hook==2){
			sHook="连接中";
		}else if(hook==3){
			sHook="未分配";
		}else{
			sHook="未知";
		}
		sOccupy=occupy==1?"占用":"未占用";
		if(status==0){
			if(occupy==1){
				sStatus="处理";
				sIcon="status-work";
			}else if(pause==1){
				sStatus="暂停";
				sIcon="status-pause";
			}else{
				sStatus = "空闲";
				sIcon = "status-onhook";
			}
		}else{
			var sInfo = getStatusInfo(status);
			sStatus = sInfo[0];
			sIcon = sInfo[1];
		}
		sLoginGrps=loginGroups;
	}
	var sAgtInfo = agtid+','+login+','+pause+','+status+','+hook+','+occupy;
	if($("#tr_"+agtid).length>0){
		$("#tr_"+agtid).css("display",sTrDisplay);
		$("#td_icon_"+agtid).removeClass().addClass("ico "+sIcon);
		$("#td_login_"+agtid).html(sLogin);
		$("#td_pause_"+agtid).html(sPause);
		$("#td_status_"+agtid).html(sStatus);
		$("#td_hook_"+agtid).html(sHook);
		$("#td_occupy_"+agtid).html(sOccupy);
		$("#td_lgrps_"+agtid).html(sLoginGrps);
		$("#tr_"+agtid).attr("agtInfo",sAgtInfo);
		if(agtid==agtInfo[0]){
			agtInfo = sAgtInfo.split(",");
		}
	}else{
		var tr = [];
		tr.push('<tr style="display:'+sTrDisplay+'" id="tr_'+agtid+'" agtid="'+agtid+'" agtInfo="'+sAgtInfo+'">');
		tr.push('<td width="30"><input type="checkbox" name="checkbox" id="chk_'+agtid+'"></td>');
		tr.push('<td width="60" style="vertical-align:middle"><div><i id="td_icon_'+agtid+'" class="ico '+sIcon+'"></i>'+agtid+'</div></td>');
		tr.push('<td width="60"><div>'+agtname+'</div></td>');
		tr.push('<td width="60"><div id="td_login_'+agtid+'">'+sLogin+'</div></td>');
		tr.push('<td width="60"><div id="td_pause_'+agtid+'">'+sPause+'</div></td>');
		tr.push('<td width="60"><div id="td_status_'+agtid+'">'+sStatus+'</div></td>');
		tr.push('<td width="60"><div id="td_hook_'+agtid+'">'+sHook+'</div></td>');
		tr.push('<td width="60"><div id="td_occupy_'+agtid+'">'+sOccupy+'</div></td>');
		tr.push('<td width="60"><div id="td_lgrps_'+agtid+'">'+sLoginGrps+'</div></td>')
		tr.push('<td width="60"><div id="td_grps_'+agtid+'">'+groups+'</div></td>');
		tr.push('</tr>');
		$("#tbMonitor").append(tr.join(''));
		
		bindTrEvt=true;
	}
	
	//更新被选中的数据
	if(agtInfo!=null && agtid==agtInfo[0]){
		agtInfo = sAgtInfo.split(",");
	}
}

function bindTrClick(){
	$("#tbMonitor tr").bind({
		click:function(){
			var agtid = "";
			$("tr.tr-selected").each(function(i){
				$(this).removeClass("tr-selected");
				agtid=$(this).attr("agtid");
				$("#chk_"+agtid).removeAttr("checked");
			});
			$(this).addClass("tr-selected");
			agtid=$(this).attr("agtid");
			$("#chk_"+agtid).attr("checked","checked");
			agtInfo = $(this).attr("agtInfo").split(",");
			$("#txtTransAgtId").attr("operType","agt").val(agtid);
		}
	});
}

function getStatusInfo(status){
	switch (status) {
		case 0:
			return ["空闲","status-onhook"];
		case 1:
			return ["振铃","status-ring"];
		case 2:
			return ["通话","status-talk"];
		case 3:
			return ["外拨","status-dialout"];
		case 4:
			return ["监听","status-listen"];
		case 5:
			return ["保持","status-hold"];
		case 6:
			return ["创建会议","status-sanfang"];
		case 7:
			return ["参与会议","status-sanfang"];
		case 8:
			return ["参与通话","status-sanfang"];
		case 9:
			return ["三方外拨","status-sanfang"];
		case 10:
			return ["三方外拨","status-sanfang"];
		case 11:
			return ["三方外拨","status-sanfang"];
		case 12:
			return ["三方通话","status-sanfang"];
		case 13:
			return ["三方呼入","status-sanfang"];
		case 14:
			return ["三方振铃","status-ring"];
		case 15:
			return ["三方摘机","status-sanfang"];
		case 16:
			return ["三方通话","status-sanfang"];
		case 20:
			return ["外拨座席","status-dialout"];
		case 21:
			return ["播放工号","status-talk"];
		case 25:
			return ["发送DTMF","status-talk"];;
		case 26:
			return ["硬座席外拨","status-dialout"];
		case 27:
			return ["忙音","status-work"];
		default:
			return ["未知","status-work"];
	}
}

//检查列表中的座席数是否有变化
function checkAgtIdList(agtIdList){
	if(agtIdList.join(",")==lastAgtIdList.join(",")) return;
	
	var strAgtIds = ","+agtIdList.join(",")+",";

	for(var i=0;i<lastAgtIdList.length;i++){
		if(strAgtIds.indexOf(","+lastAgtIdList[i]+",")<0){
			$("#tr_"+lastAgtIdList[i]).remove();
			if(lastAgtIdList[i]==agtInfo[i]){
				$("#txtTransAgtId").val("");
				agtInfo=null;
			}
		}
	}
	lastAgtIdList = agtIdList;
}