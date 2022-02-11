import { Layout, message, Modal, Space, Select } from 'antd';
import React from 'react';
import {
    mainProps, phoneProps, webrtcProps, mainInfo
} from '../commons/phoneProps';
import styles from './index.less';
import {PhoneIcon} from '../commons/phoneIcon';
import {SdAgent, getSdAgent} from '../commons/sdAgent';
import {Cookies} from 'react-cookie';
import format from 'date-fns/format';
import umiRequest from 'umi-request';
import { WaiboModal, ShangbanModal, AgtMonitor } from '../commons/commonModal';

const { Header, Content } = Layout;

//declare两个类型
declare type IconName = "shangban" | "xiaban" | "banzhang" | "waibo" | "zhuanjie" | "xiaoxiu" | "gongzuo" | "guaduan" | "jingyin" | "quxiaojingyin" | "jieshuchuli" | "zhaiji";
declare type IconNameKey = "shangbanIconStatus" | "xiabanIconStatus" | "banzhangIconStatus" | "waiboIconStatus" | "zhuanjieIconStatus" | "xiaoxiuIconStatus" | "gongzuoIconStatus" | "guaduanIconStatus" | "jingyinIconStatus" | "quxiaojingyinIconStatus" | "jieshuchuliIconStatus" | "zhaijiIconStatus";

/**
 * 
 */
class App extends React.Component<any, any>{

    //接听方式
    callModelList = [{
            key: "sip",
            value: "sip",
            text: "SIP电话"
        },{
            key: "pstn",
            value: "pstn",
            text: "PSTN电话",
            disabled: true
        },{
            key: "webcall",
            value: "webcall",
            text: "WebCall",
            disabled: true
        },

    ]

    //初始构造
    constructor(props: any){
        super(props);

        //配置信息加载位置迁移，初始化先按顺序加载全局变量的信息
        var phoneConfig: phoneProps = require('../resources/phone.json');
        this.state.phone = phoneConfig ;

        //注册事件，将原有的JQ的回调事件注册到sdAgent里面
        //原有位置是phone.js的全局变量加载
        this.setSdAgentCallBack();

        //页面初始化事件
        this.init();
    }

    //变量
    state: {
        //state类型定义
        mainProps:mainProps,
        phone: phoneProps ,
        webrtc: webrtcProps | undefined,
        sdAgent: SdAgent,           
        shangbanIconStatus: any,
        xiabanIconStatus: any,
        banzhangIconStatus: any,
        waiboIconStatus: any,
        zhuanjieIconStatus: any,
        xiaoxiuIconStatus: any,
        gongzuoIconStatus: any,
        guaduanIconStatus: any,
        jingyinIconStatus: any,
        quxiaojingyinIconStatus: any,
        jieshuchuliIconStatus: any,
        zhaijiIconStatus: any,
        callModelSelected: "sip" | "pstn" | "webcall",
        callStatus: any,
        queueInfo: any,
        callModelDisabled: boolean,
        waiboModalShow: boolean,
        shangbanModalShow: boolean,
        agtGroupgOptions: {label:string,value:string}[],
        agtGroupCheckedValue: any[],
        mainInfo: mainInfo,
        agtMonitorShow: boolean,
        agtMonitorType: "zhuanjie" | "banzhang",
        agtMonitorShowTime: number,
    } = {
        mainProps: {        //原有的主页面的一些全局变量
            digStatus: 0,
            toolsType: "zhuanjie",
            isMonitorOpen: false,
        },          
        phone: require('../resources/phone.json'),       //phone全局变量
        webrtc: undefined,      //webrtc全局变量
        sdAgent: getSdAgent(),        //sdAgent返回的封装的对象，需要添加自定义的回调函数

        //所以将所有的iconStatus进行拆分
        shangbanIconStatus:{
            show: true,
            disabled: true,
        },
        xiabanIconStatus:{
            show: false,
            disabled: true,
        },
        banzhangIconStatus:{
            show: true,
            disabled: true,
        },
        waiboIconStatus:{
            show: true,
            disabled: true,
        },
        zhuanjieIconStatus:{
            show: true,
            disabled: true,
        },
        xiaoxiuIconStatus:{
            show: true,
            disabled: true,
        },
        gongzuoIconStatus:{
            show: false,
            disabled: true,
        },
        guaduanIconStatus:{
            show: true,
            disabled: true,
        },
        jingyinIconStatus:{
            show: true,
            disabled: true,
        },
        quxiaojingyinIconStatus:{
            show: false,
            disabled: true,
        },
        jieshuchuliIconStatus:{
            show: true,
            disabled: true,
        },
        zhaijiIconStatus:{
            show: false,
            disabled: true,
        },//所以将所有的iconStatus进行拆分-------------位置结束
        
        callModelSelected: "sip",   //初始化选中sip,接听方式的选中值

        callStatus: "未连接",           //原有的状态栏的状态的文本显示
        queueInfo: "0人",               //原有状态栏的排队的文本显示
        
        callModelDisabled: false,       //接听方式的选择框是否禁用

        waiboModalShow: false,        //外拨弹窗的显示，以下的为一些弹窗是否显示,初始化全部为false,每个弹窗的控制显示分离

        shangbanModalShow: false,       //上班的点击弹窗的显示

        agtGroupgOptions: [],     //上班的点击按钮的弹窗的座席组的可选内容

        agtGroupCheckedValue: [],       //座席组预选中内容

        mainInfo: {             //通话内容显示
            barAgentId: undefined,  
            barWorkTime: undefined,
            barLoginGroups: undefined,
            barTalkTime: "00:00:00",
            barCallCnt: "0/0",
            barTotalTalkTime: "00:00:00",
        },

        agtMonitorShow: false,          //转接座席组弹窗控制
        agtMonitorType: "zhuanjie",     //转接和班长公用一个弹窗，用此属性确定类型，，默认为转接
        agtMonitorShowTime: 0,          //弹窗的显示次数

    }//state结束


    /**
     * 设置回调事件，初始化的时候设置
     */
     setSdAgentCallBack = () => {
        let sdAgent = getSdAgent();
        sdAgent.setCallBack("onConnect", this.sdAgentOnConnect);
        sdAgent.setCallBack("onDisconnect", this.sdAgentOnDisconnect);
        sdAgent.setCallBack("onAlive", this.sdAgentOnAlive);
        sdAgent.setCallBack("onASConnected", this.sdAgentOnASConnected);
        sdAgent.setCallBack("onForceConnect", this.sdAgentOnForceConnect);
        sdAgent.setCallBack("onAgtReqReturn", this.sdAgentOnAgtReqReturn);
        sdAgent.setCallBack("onRunAgtInfo", this.sdAgentOnRunAgtInfo);
        sdAgent.setCallBack("onRing", this.sdAgentOnRing);
        sdAgent.setCallBack("onAgtDetailInfo", this.sdAgentOnAgtDetailInfo);
        sdAgent.setCallBack("onRunDialDialed", this.sdAgentOnRunDialDialed);
        sdAgent.setCallBack("onRunDialOver", this.sdAgentOnRunDialOver);
        sdAgent.setCallBack("onTreeJsonInfo", this.sdAgentOnTreeJsonInfo);
        sdAgent.setCallBack("onAllAgtInfo", this.sdAgentOnAllAgtInfo);
        sdAgent.setCallBack("onCallerHangup", this.sdAgentOnCallerHangup);
        sdAgent.setCallBack("onQueueInfo", this.sdAgentOnQueueInfo);
        sdAgent.setCallBack("onIntercept", this.sdAgentOnIntercept);
        sdAgent.setCallBack("onRunDialRing", this.sdAgentOnRunDialRing);
        sdAgent.setCallBack("onIntercepted", this.sdAgentOnIntercepted);
        sdAgent.setCallBack("onCallDisconnected", this.sdAgentOnCallDisconnected);
        sdAgent.setCallBack("onReqAgtCallAct", this.sdAgentOnReqAgtCallAct);
        sdAgent.setCallBack("onAcceptAgtReq", this.sdAgentOnAcceptAgtReq);
        sdAgent.setCallBack("onGetOrgAgtgrps", this.sdAgentOnGetOrgAgtgrps);
        sdAgent.setCallBack("onGetAgentRights", this.sdAgentOnGetAgentRights);
        sdAgent.setCallBack("onGetAgtGroups", this.sdAgentOnGetAgtGroups);
    }


    //初始化执行的函数
    init = () => {
        this.state.xiabanIconStatus.show = false;
        this.state.gongzuoIconStatus.show = false;
        this.state.quxiaojingyinIconStatus.show = false;
        
        //原有的loadParam的内容
        if(this.state.phone === undefined){
            this.state.phone = {}
        }

        var searchStr = location.search;
        if(searchStr !== undefined && searchStr !== null && searchStr !== ""){
            //有参数的情况
            searchStr = searchStr.substr(1);
            var searchs = searchStr.split("&");
            for(var i=0;i<searchs.length;i++){
                var param=searchs[i].split("=");
                if(param[0].toLowerCase()=="usercode"){
        //			定义座席工号及账号
                    this.state.phone.userCode = param[1];
                    var temp = param[1].split("@");
                    this.state.phone.agtId = temp[0];
                }else if(param[0].toLowerCase()=="userpwd"){
        //			定义座席密码
                    //phone.agtPwd = param[1];
                }else if(param[0].toLowerCase()=="groupid"){
                    this.state.phone.groupId = param[1];
                }else if(param[0].toLowerCase()=="station"){
                    this.state.phone.station = param[1];
                }else if(param[0].toLowerCase()=="weburl"){
        //			定义云端服务端地址
                    this.state.phone.webUrl = param[1];
                }else if(param[0].toLowerCase()=="url"){
        //			定义呼叫中心服务端地址
                    this.state.phone.url = param[1];
                }else if(param[0].toLowerCase()=="afterworkstatus"){
        //			定义是否开启后处理
                    this.state.phone.afterWorkStatus = Number(param[1]);
                }else if(param[0].toLowerCase()=="redirecttag"){
                    this.state.phone.redirectTag = Number(param[1]);
                }else if(param[0].toLowerCase()=="initsetcallmodel"){
        //			定义初始化默认模式
                    this.state.phone.initSetCallModel = Number(param[1]);
                }else if(param[0].toLowerCase()=="publicurl"){
        //			定义webCall服务端地址
                    this.state.phone.publicUrl = param[1];
                }
            }
        }// end of searchStr， loadparam 结束
        
        //phone.js document.ready
        this.state.phone.isLoaded=1;
        if(this.state.phone.afterWorkStatus===1){
            //结束处理按钮显示
            this.state.jieshuchuliIconStatus.show=true;
        }else{
            //结束处理按钮隐藏
            this.state.jieshuchuliIconStatus.show=false
        }
        if(this.state.phone !== undefined ){
            if(this.state.phone.webUrl !== undefined && !this.state.phone.webUrl.endsWith('/')){
                this.state.phone.webUrl = this.state.phone.webUrl + "/";
            }
        }

        let cookie = new Cookies();
        var cookStation = cookie.get("SDLogonStation");
        if(cookStation === undefined || cookStation === null){
            cookStation = ""
        }

        var words = cookStation.split("_");

        if(words[0] !== this.state.phone.agtId){
            if(this.state.phone.initSetCallModel === 0){
                cookStation = this.state.phone.agtId + "";
                //接听方式选中sip
                this.state.callModelSelected = 'sip'
            }else if(this.state.phone.initSetCallModel==1){
                cookStation = this.state.phone.agtId + "_WR";
                this.state.callModelSelected = 'webcall'
            }

            cookie.remove('SDLogonStation');
            cookie.remove("SDLogonGroups");
        } else{
            if(cookStation === this.state.phone.agtId + "_PSTN"){
                this.state.callModelSelected = 'pstn'
            }else if(cookStation === this.state.phone.agtId+""){
                this.state.callModelSelected = 'sip'
            }else if(cookStation === this.state.phone.agtId+"_WR"){
                this.state.callModelSelected = 'webcall'
            }
        }

        var modelVal = this.state.callModelSelected;
        this.state.phone.onHookMode = modelVal;
        if(modelVal === "webcall"){
            //显示摘机按钮
            this.state.zhaijiIconStatus.show = true
        }else{
            //隐藏摘机按钮
            this.state.zhaijiIconStatus.show = false
        }
        if(this.state.phone.agtId === ""){
            this.writeLog("缺少参数：userCode");
            this.ztoDialog('message',"登录失败：缺少参数[userCode]");
            return;
        }
        if(this.state.phone.agtPwd === ""){
            this.writeLog("缺少参数：userPwd");
            this.ztoDialog('message',"登录失败：缺少参数[userPwd]");
            return;
        }
        this.initConnect('0');     
        //phone.js的docReady事件动作完毕
        
        //初始化结束

    }


    /**
     * 原有初始化连接的方法
     * @param force 
     */
    initConnect = (force: any) => {
        setTimeout(()=>{this.state.sdAgent.connect(this.state.phone.agtId, this.state.phone.agtPwd, force, this.state.phone.url)}, 500)
    }


    /**
     * sdAgent发布的onConnect事件
     * @param result 
     * @param desc 
     */
    sdAgentOnConnect = (result?: any, desc?: any) => {
        if(result===1 || result===2){
            this.writeLog("onConnect：" + desc);
    
            this.state.phone.lastAliveTm = (new Date()).getTime();
            if(this.state.phone.aliveClock !== undefined && this.state.phone.aliveClock > 0) {
                clearInterval(this.state.phone.aliveClock);
            }

            this.state.phone.aliveClock = setInterval(() => {
                var nowTm = (new Date()).getTime();
                if (this.state.phone.lastAliveTm !== undefined && (nowTm - this.state.phone.lastAliveTm) / 1000 > 120) {        //经过120秒之后?
                    this.state.phone.lastAliveTm = nowTm;
                    this.initConnect('1');
                }
                if(this.state.phone.aliveTmCnt !== undefined && this.state.phone.aliveTmCnt > 10){   //超过十次
                    this.state.phone.aliveTmCnt = 0;
                    this.state.sdAgent.alive();
                  }
                  this.state.phone.aliveTmCnt = (this.state.phone.aliveTmCnt || 0) + 1;
            }, 3000);
            
            setTimeout(()=>{this.state.sdAgent.getAgentRights();},10);
            setTimeout(()=>{this.state.sdAgent.getAgtGroups();},50);
        }else{
            this.setState({callStatus: "未连接"});
            this.ztoDialog("message", desc);
        }
    }


    /**
     * 断开连接
     * 原有的代码迁移
     * 原有的phone绑定的setLogOff函数转移到this
     */
    sdAgentOnDisconnect = () => {
        this.writeLog("onDisConnect");
        this.setLogOff();
        this.state.phone.lastAliveTm = 0;
        if(this.state.phone.aliveClock > 0){
            clearInterval(this.state.phone.aliveClock);
        }

        this.state.phone.aliveClock = setInterval(()=>{
            var nowTm = (new Date()).getTime();
            if((nowTm- this.state.phone.lastAliveTm!)/1000>60){
                this.state.phone.lastAliveTm=nowTm;
                this.initConnect('1');
            }
        }, 3000);
        this.setState({callStatus: '断开连接'});
    }
    

    /**
     * 心跳检测事件
     * 原有SdAgent的event的Alive
     */
    sdAgentOnAlive = () => {
        this.state.sdAgent.alive();
        this.state.phone.lastAliveTm = (new Date()).getTime();
        this.writeLog("onAlive");
    }


    /**
     * 已连接事件，可利用此事件进行强制连接操作
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnASConnected = () => {
        this.writeLog("onASConnected");
        this.setState({callStatus: "已连接"});
        setTimeout(()=>{this.initConnect('1')},1000)
    }


    /**
     * 强制连接事件返回
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnForceConnect = () => {
        this.writeLog("onForceConnect");
        this.state.phone.isLogin = true;
        this.setLogOff();
        this.state.phone.onDisConnectTag = 0;
        if(this.state.phone.aliveClock > 0) {
            clearInterval(this.state.phone.aliveClock);
        }
        alert("您的账号已在别的地方被登录使用");
    }


    /**
     * 座席动作事件
     * 原有SdAgent的event的发布事件
     * 原有的setAgtReqReturn为phone的绑定事件，转交this
     */
    sdAgentOnAgtReqReturn = (cmd?: any, ret?: any, desc?: any) => {
        this.writeLog("座席动作[cmd："+cmd+"，ret："+ret+"，desc："+desc+"]");
	    this.setAgtReqReturn(cmd, ret, desc);
    }

    
    /**
     * 座席状态变化事件
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnRunAgtInfo = (status?: any, hook?: any, occupy?: any) => {
        this.setAgtStatus(status, hook, occupy);
        if(this.state.phone.callBackList["onRunAgtInfo"] !== undefined){
            this.state.phone.callBackList["onRunAgtInfo"](status, hook, occupy); 
        }
    }


    /**
     * 来电振铃事件
     * 原有SdAgent的event的发布事件
     * @param callId 
     * @param subId 
     * @param area 
     * @param ani 
     * @param grpId 
     * @param srcAgt 
     * @param ivrList 
     */
    sdAgentOnRing = (callId?: any, subId?: any, area?: any, ani?: any, grpId?: any, srcAgt?: any, ivrList?: any) => {
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }
        this.state.phone.lastCall.callId = callId;
        this.state.phone.lastCall.ani = ani;
        this.state.phone.lastCall.subId = subId;
        this.state.phone.lastCall.areaCode = area;
        this.state.phone.callOutWR = 0;
        this.setRing(callId, subId, area, ani, grpId, srcAgt, ivrList);
    }


    /**
     * 座席详细信息
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnAgtDetailInfo = (agtId?: any, name?: any, agtStatus?: any, callStatus?: any, hook?: any, occupy?: any, lastCall?: any, webServiceUrl?: any) => {
        this.writeLog("onAgtDetailInfo[agtStatus："+agtStatus+"，status："+callStatus+"，hook："+hook+"，occupy："+occupy+"]"+
			" lastCall：{callId:"+lastCall.callId+",subId:"+lastCall.subId+",area:"+lastCall.area+",ani:"+lastCall.ani+",grpId:"+lastCall.grpId+",srcAgt:"+lastCall.srcAgt+",ivrList:"+lastCall.ivrList+"}");
        this.setAgtDetailInfo(agtId, name, agtStatus, callStatus, hook, occupy, lastCall);
        this.state.phone.webServiceUrl = webServiceUrl;
    }


    /**
     * 拨号完成
     * 原有SdAgent的event的发布事件
     * @param callid 
     * @param subid 
     * @param area 
     * @param dnis 
     */
    sdAgentOnRunDialDialed = (callid?: any, subid?: any, area?: any, dnis?: any) => {
        this.writeLog("onRunDialDialed[callid:"+callid+",subid:"+subid+",area:"+area+",dnis:"+dnis+"]");
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }
        this.state.phone.lastCall.callId = callid;
        this.state.phone.lastCall.ani = dnis;
        this.state.phone.lastCall.subId = subid;
        this.state.phone.lastCall.areaCode = area;
        this.state.phone.dialOutCnt = (this.state.phone.dialOutCnt || 0 ) +1;
        this.setCallIn();
        if(this.state.phone.afterWorkStatus === 1 && this.state.phone.occupy === 0){
            this.writeLog("开启后处理状态");
            this.state.sdAgent.agtWorkAfterCall();
        } 
        this.state.phone.openOnHookEvent = 1;
        if(this.state.phone.occupy === 0 && this.state.phone.offHookEventTag === 1){
            this.offHookEvent(this.state.phone.agtId, this.state.phone.lastCall.ani, this.state.phone.lastCall.callId, this.state.phone.lastCall.subId);
            this.state.phone.offHookEventTag = 0;
        }
        
        //预留位置
        try{
            this.setAgtCountInfo(this.state.sdAgent.agtId, this.state.phone.workTime, this.state.phone.groupId,
                this.dateFormat(this.state.phone.talkTime!, 'HH:mm:ss'),
                this.state.phone.callCnt+"/"+this.state.phone.dialOutCnt,
                this.dateFormat(this.state.phone.totalTalkTime!,'hh:mm:ss'));
        }catch(e){
            
        }
    }


    /**
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnRunDialOver = (rlt?: any, desc?: any) => {
        this.writeLog("onRunDialOver[rlt:"+rlt+",desc:"+desc+"]");
        if(rlt===16){
            this.callOutNoAnswerByAgtEvent();
        }
    }


    /**
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnTreeJsonInfo = (data?: any) => {
        this.writeLog("onTreeJsonInfo："+data);
    }


    /**
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnAllAgtInfo = (result?: any, errMsg?: any, allAgentsInfo?: any, count?: any) => {
        try{
            if(allAgentsInfo==this.state.phone.lastAllAgtInfoStr) {
                return;
            }
            this.state.phone.lastAllAgtInfoStr = allAgentsInfo;
            this.state.phone.lastAllAgtInfoCnt = count;
            if(result==0) {
                if(this.state.phone.callBackList.onAllAgtInfo != undefined){
                    this.state.phone.callBackList["onAllAgtInfo"](allAgentsInfo, count);
                }
            }
        }catch(e){
            this.writeLog("未找到上级页面中的[phone.event]方法");
        }
    }


    /**
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnCallerHangup = (callId?: any) => {
        this.writeLog("onCallerHangup：[callid:"+callId+"]");
    }


    /**
     * 排队事件
     * 原有SdAgent的event的发布事件
     * @param grpId 
     * @param waitCall 
     */
    sdAgentOnQueueInfo = (grpId?: any, waitCall?: any) => {
        this.setState({queueInfo: waitCall + "人"});
	    this.writeLog("onQueueInfo[grpId:"+grpId+",waitCall:"+waitCall+"]");
    }


    /**
     * 拦截事件
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnIntercept = (ret?: any, callId?: any, subId?: any, area?: any, ani?: any, grpId?: any, srcAgt?: any, errMsg?: any, ivrList?: any) => {
        this.writeLog("拦截事件:[ret:"+ret+",callId:"+callId+",subId:"+subId+",area:"+area+",ani:"+ani+",grpId:"+grpId+",srcAgt:"+srcAgt+",errMsg:"+errMsg+",ivrList:"+ivrList+"]");
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }
        this.state.phone.lastCall.areaCode = area;
        this.state.phone.lastCall.subId = subId;
        if(ret===true){
            var orderNo = "";
            if(ivrList!==null && ivrList!==undefined){
                var arrIvr = ivrList.split(",");
                if(arrIvr.length>=4) {
                    orderNo = arrIvr[3];
                }
                if(arrIvr.length>=5){
                    this.state.phone.tenantsId = arrIvr[4];
                }
                if(arrIvr.length>=6){
                    this.state.phone.organizerId = arrIvr[5];
                }
            }
        }else{
            this.ztoDialog("message","拦截失败；"+errMsg);
        }
    }


    /**
     * 呼出振铃
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnRunDialRing = (callId?: any, subId?: any, area?: any, dnis?: any) => {
        if(this.state.phone.lastCall===undefined){
            this.state.phone.lastCall = {};
        }
        this.state.phone.lastCall.callId=callId;
        // this.state.phone.lastCall.dnis=dnis;    //可能会弃用的代码(实际并没有使用到的代码),猜测为this.state.phone.lastCall.ani = dnis
        this.state.phone.lastCall.areaCode = area;
        this.state.phone.callOutRing = 1;
        this.setState({callStatus: "振铃中"});
        this.writeLog("座席外拨振铃中");
        if(this.state.phone.callOutEventTag===1){
            this.callOutEvent(this.state.phone.agtId, this.state.phone.lastCall.ani, this.state.phone.lastCall.callId, this.state.phone.lastCall.subId);
            this.state.phone.callOutEventTag = 0;
        }
    }


    /**
     * 被拦截事件
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnIntercepted = (agtId?:any, agtName?: any, callId?: any) => {
        this.writeLog("onIntercepted[agtId:"+agtId+",agtName:"+agtName+",callId:"+callId+"]");
	    this.ztoDialog("message", "当前通话被["+agtName+"("+agtId+")]拦截");
    }


    /**
     * 强拆事件
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnCallDisconnected = (agtId?: any, agtName?: any) => {
        this.writeLog("onCallDisconnected[agtId:"+agtId+",agtName:"+agtName+"]");
	    this.ztoDialog("message","当前通话被["+agtName+"("+agtId+")]强制挂断");
    }


    /**
     * 收到请求
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnReqAgtCallAct = (srcAgtId?: any, srcAgtName?: any, tmTime?: any, actType?: any, callId?: any, content?: any) => {
        this.writeLog("onReqAgtCallAct[srcAgtId:"+srcAgtId+",srcAgtName:"+srcAgtName+",tmTime:"+tmTime+",actType:"+actType+",callId:"+callId+",content:"+content+"]");
        try{
            this.openMonitor("banzhang");
            setTimeout(()=>{
                this.state.phone.agtMonitorObj.onRecvAgtReq(srcAgtId,srcAgtName,tmTime,actType,callId,content);
            }, 200);
        }catch(e){
            this.writeLog("调用AgtMonitor.html中的onRecvAgtReq方法出错");
        }
    }

    
    /**
     * 接收请求事件
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnAcceptAgtReq = () => {
        this.writeLog("onAcceptAgtReq");
        if(this.state.phone.callBackList.onAcceptAgtReq !== undefined){
            this.state.phone.callBackList["onAcceptAgtReq"]();
        }
        
    }


    /**
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnGetOrgAgtgrps = (data?: any) => {
        this.writeLog("onGetOrgAgtgrps");
        if(this.state.phone.callBackList.onGetOrgAgtgrps !== undefined){
            this.state.phone.callBackList["onGetOrgAgtgrps"](data);
        }
        
    }


    /**
     * 原有SdAgent的event的发布事件
     */
    sdAgentOnGetAgentRights = (data?: any) => {
        this.writeLog("onGetAgentRights");
	    this.setAgentRights(data);
    }


    /**
     * 原有SdAgent的event的发布事件
     */
     sdAgentOnGetAgtGroups = (data?: any) => {
        this.writeLog("onGetAgtGroups");
	    this.initAgtGroups(data);
    }

    
    /*------------------phone 的部分绑定函数的转移开始-------------------------- */
    /**
     * 原有的phone绑定的函数setLogOff
     * 方法体内的clearCall方法为原有的phone绑定的函数，转移this
     */
    setLogOff = () => {
        this.setState({callStatus: "离线"});
        this.state.phone.agtStatus = 3;
        this.clearCall();

        this.iconStatusChange("shangban", true, undefined, false);

        this.iconStatusChange("xiaban", false, undefined, undefined);
        this.iconStatusChange("gongzuo", false, undefined, undefined);
        this.iconStatusChange("quxiaojingyin", false, undefined, undefined);

        this.iconStatusChange("banzhang", undefined, false, true);
        this.iconStatusChange("waibo", undefined, false, true);
        this.iconStatusChange("zhuanjie", undefined, false, true);
        this.iconStatusChange("xiaoxiu", undefined, false, true);
        // this.iconStatusChange("sanfang", undefined, false, true);
        this.iconStatusChange("guaduan", undefined, false, true);
        this.iconStatusChange("waibo", undefined, false, true);
        this.iconStatusChange("jieshuchuli", undefined, false, true);
        this.iconStatusChange("zhaiji", undefined, false, true);

        this.iconStatusChange("xiaoxiu", true, false, true);
        this.iconStatusChange("jingyin", true, false, true);

        this.setState({
            queueInfo: "0人"
        });

    }


    /**
     * 在线状态
     * 原有的phone绑定的函数
     * 事件转交
     */
    setLogOn = () => {

        this.setState({callStatus: "在线"});
        this.iconStatusChange("shangban", false, undefined, undefined);
        this.iconStatusChange("xiaban", true, false, false);

        this.iconStatusChange("zhuanjie", undefined, undefined, false);
        this.iconStatusChange("xiaoxiu", undefined, undefined, false);
        this.iconStatusChange("guaduan", undefined, undefined, false);
        this.iconStatusChange("gongzuo", undefined, undefined, false);
        this.iconStatusChange("jingyin", undefined, undefined, false);

        this.setState({callModelDisabled: true});

        if(this.state.phone.rights?.dialOut){
            this.iconStatusChange("waibo", undefined, undefined, false);
            // this.iconStatusChange("sanfang", undefined, undefined, false);
        }

        if(this.state.phone.rights!.isMonitor) {
            this.iconStatusChange("banzhang", undefined, undefined, false);
        }

        // if(this.state.phone.rights!.remoteCti) {
        //     this.iconStatusChange("zhijian", undefined, undefined, false);
        // }

        this.state.phone.workTime = format(new Date(), 'HH:mm:ss');

        //预留的位置，修改content的内容显示
        try{
            this.setAgtCountInfo(this.state.sdAgent.agtId,
                this.state.phone.workTime,
                this.state.phone.groupId,
                this.dateFormat(this.state.phone.talkTime!,'hh:mm:ss'),
                this.state.phone.callCnt+"/"+this.state.phone.dialOutCnt,
                this.dateFormat(this.state.phone.totalTalkTime!,'hh:mm:ss'));
        }catch(e){

        }
    }


    /**
     * 原有的phone.setPause
     * 暂停状态
     */
    setPause = () => {
        this.state.phone.isPause = true;
        if(this.state.phone.occupy === 0 ){
            this.setState({callStatus: "暂停中"});
        }
    }


    /**
     * 原有的phone.setRestore
     * 恢复状态（工作状态）
     */
    setRestore = () => {
        this.state.phone.isPause=false;
        this.setOnHk();
    }


    /**
     * 原有的phone.setOnHk
     * 空闲状态
     */
    setOnHk = () => {
        if(this.state.phone.isPause === false) {
            this.setState({callStatus: "空闲中"});
        }else{
            this.setState({callStatus: "暂停中"});
        }

        // $("#trans_tools1,#sanfang_tools1").show();
	    // $("#trans_tools2,#sanfang_tools2").hide();
        
        this.iconStatusChange("guaduan", undefined, undefined, true);
        this.iconStatusChange("jingyin", undefined, undefined, true);
        this.iconStatusChange("zhuanjie", undefined, undefined, true);

        this.iconStatusChange("xiaban", undefined, undefined, false);
        this.iconStatusChange("waibo", undefined, undefined, false);
        this.iconStatusChange("xiaoxiu", undefined, undefined, false);

        //是否可以呼叫的状态，默认可以呼叫，空闲可以呼叫，通话状态不能呼叫，通过外拨按钮的禁用与否控制一层
        // $("#hujiao_submit").removeAttr("disabled").removeClass("esc").addClass("btn");      

        if(this.state.phone.tmrDur !== undefined) {
            clearInterval(this.state.phone.tmrDur);
        }
        
        this.clearCall();
    }


    /**
     * 原有的phone.setWorkAfterCall
     * 转为示忙状态
     */
    setWorkAfterCall = () => {
        this.setState({callStatus: "处理中"});
        //设置可用的结束后处理按钮
        this.iconStatusChange("jieshuchuli", true, false, false);
        if(this.state.phone.tmrDur !== undefined && this.state.phone.tmrDur !== null && this.state.phone.tmrDur > 0){
            clearInterval(this.state.phone.tmrDur);
        }
    }


    /**
     * 原有的phone.setMangXian
     */
    setMangXian = () => {
        if(this.state.phone.callStatus === 0 && this.state.phone.occupy === 1){
            this.setState({callStatus: "处理中"});
        }

        if(this.state.phone.agtStatus === 7){
            this.iconStatusChange("xiaoxiu", false, undefined, undefined);
            this.iconStatusChange("gongzuo", true, undefined, undefined);

            if(this.state.phone.isMSClick === true){
                this.state.phone.isMSClick = false;
                this.iconStatusChange("gongzuo", undefined, true, undefined);
            }
            if(this.state.phone.firstMX === false){
                this.ztoDialog("message", "暂停成功！");
            }else{
                this.state.phone.firstMX = false;
            }
        }else if (this.state.phone.agtStatus === 8){

            this.iconStatusChange("xiaoxiu", true, undefined, undefined);
            this.iconStatusChange("gongzuo", false, undefined, undefined);

            if(this.state.phone.isMSClick === true){
                this.state.phone.isMSClick = false;
                this.iconStatusChange("xiaoxiu", undefined, true, undefined);
            }
            if(this.state.phone.firstMX === false){
                this.ztoDialog("message", "恢复成功！");
            }else{
                this.state.phone.firstMX = false;
            }
        }
    }//setMangXian function end


    /**
     * 振铃状态
     * 原有的phone绑定的函数
     */
    setRing = (callId?: any, subId?: any, area?: any, ani?: any, grpId?: any, srcAgt?: any, ivrList?: any) => {
        this.iconStatusChange("zhaiji", undefined, undefined, false);
        this.setState({callStatus: "振铃中"});

        var orderNo = "";
        var uniquedId = "";
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }
        this.state.phone.lastCall.areaCode = area;
        this.state.phone.lastCall.subId = subId;
        this.state.phone.lastCall.callId = callId;
        if(ivrList!=null && ivrList!=undefined && ivrList.length>=4) {
            orderNo = ivrList[3];
        }
        if(ivrList!=null && ivrList!=undefined && ivrList.length>=5) {
            this.state.phone.tenantsId = ivrList[4];
        }
        if(ivrList!=null && ivrList!=undefined && ivrList.length>=6) {
            this.state.phone.organizerId = ivrList[5];
        }
        this.state.phone.callCnt = (this.state.phone.callCnt || 0) + 1;

        //位置预留
        try{
            this.setAgtCountInfo(this.state.sdAgent.agtId,
                this.state.phone.workTime,this.state.phone.groupId,
                this.dateFormat(this.state.phone.talkTime!,'hh:mm:ss'),
                this.state.phone.callCnt+"/"+this.state.phone.dialOutCnt,
                this.dateFormat(this.state.phone.totalTalkTime!,'hh:mm:ss'));
        }catch(e){

        }
    }


    /**
     * 播放工号
     * 原有的phone绑定的函数
     */
    setPlayAgtId = () => {
        this.setState({callStatus: "播工号"});
    }


    /**
     * 原有的phone绑定的函数
     * 呼入通话状态
     */
    setCallIn = () => {
        this.setState({callStatus: "通话中"});

        this.iconStatusChange("jingyin", true, false, undefined);
        this.iconStatusChange("quxiaojingyin", false, false, undefined);

        // $("#trans_tools1,#sanfang_tools1").show();
	    // $("#trans_tools2,#sanfang_tools2").hide();
        this.iconStatusChange("guaduan", undefined, undefined, false);
        this.iconStatusChange("jingyin", undefined, undefined, false);
        this.iconStatusChange("zhuanjie", undefined, undefined, false);

        this.iconStatusChange("xiaban", undefined, undefined, true);
        this.iconStatusChange("waibo", undefined, undefined, true);
        this.iconStatusChange("xiaoxiu", undefined, undefined, true);

        //外拨按钮的确认按钮状态控制
        // $("#hujiao_submit").attr("disabled","disabled").removeClass("btn").addClass("esc");

        //拦截成功
        if(this.state.phone.agtStatus===2){
            if(this.state.phone.isPause===true){
                this.state.phone.agtStatus=7;
            }else{
                this.state.phone.agtStatus=8;
            }
            if(this.state.phone.callBackList.onInterceptTalk !== undefined){
                this.state.phone.callBackList["onInterceptTalk"]();
            }
        }
        
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }

        if(this.state.phone.lastCall.offHookTime === undefined || this.state.phone.lastCall.offHookTime === null || this.state.phone.lastCall.offHookTime === ""){
            var objDate = new Date();
            this.state.phone.lastCall.offHookTime = format(objDate, "yyyy-MM-dd HH:mm:ss");
        }
        
        if(this.state.phone.tmrDur !== undefined && this.state.phone.tmrDur !== null && this.state.phone.tmrDur > 0){
            clearInterval(this.state.phone.tmrDur);
        }
        this.state.phone.tmrDur = setInterval(() => {
            var now = new Date();
            var offHookTime = new Date(Date.parse((this.state.phone.lastCall!.offHookTime!).replace(/-/g,"/")));
            var nSecond = parseInt(((now.getTime() - offHookTime.getTime())/1000).toFixed(0));
            this.state.phone.talkTime = nSecond;        //设置通话的事件，单位为秒，通话时一直刷新

            //预留的位置
            try{
                this.setAgtCountInfo(this.state.sdAgent.agtId,this.state.phone.workTime,this.state.phone.groupId,this.dateFormat(this.state.phone.talkTime,'hh:mm:ss'),
                this.state.phone.callCnt+"/"+this.state.phone.dialOutCnt,this.dateFormat(this.state.phone.totalTalkTime!,'hh:mm:ss'));
            }catch(e){

            }
        }, 1000);
    }


    /**
     * 原有的phone绑定的函数
     * 呼出状态
     */
    setCallOut = () => {
        if(this.state.phone.callStatus === 20){
            this.setState({callStatus: "呼座席"});
        }else if(this.state.phone.callStatus === 29){
            this.setState({callStatus: "呼座席组"});
        }else{
            this.setState({callStatus: "呼出中"});
        }
    }


    /**
     * 原有的phone绑定的函数
     * 转交this
     * 函数体内的部分方法也转交this
     * @param cmd 
     * @param ret 
     * @param desc 
     */
    setAgtReqReturn = (cmd?: any, ret?: any, desc?: any) => {
        if(ret === 0){
            this.state.phone.agtStatus = cmd;
            switch(cmd){
            case 0:		//保持通话
                break;
            case 2:		//监听
                this.setListen();       //绑定事件转交
                if(this.state.phone.callBackList.onListen !== undefined){
                    this.state.phone.callBackList["onListen"](desc);
                }else{

                }
                break;
            case 3:		//注销
                this.setLogOff();
                break;
            case 4:		//注册
                this.setLogOn();
                break;
            case 5:		//逻辑摘机
                break;
            case 6:		//逻辑挂机
                break;
            case 7:		//暂停
                this.state.phone.isPause = true;
                if(this.state.phone.isMSClick === false) {
                    this.state.phone.firstMX = true;
                }
                this.setPause();
                this.setMangXian();
                break;
            case 8:		//恢复
                this.state.phone.isPause = false;
                if(this.state.phone.isMSClick === false) {
                    this.state.phone.firstMX=true;
                }
                this.setLogOn();
                this.setRestore();
                this.setMangXian();
                break;
            case 9:		//拉回通话
                break;
            case 10:	//返回IVR
                break;
            case 11:	//连接
                break;
            case 12:	//取消监听
                if(this.state.phone.callBackList.onUnListen !== undefined){
                    this.state.phone.callBackList["onUnListen"]();
                }
                break;
            case 13:	//后处理开始
                this.iconStatusChange("jieshuchuli", true, false, true);
                break;
            case 14:	//后处理结束
                break;
            case 15:	//预订座席
                break;
            case 16:	//强拆
                if(this.state.phone.callBackList.onDisconncall !== undefined){
                    this.state.phone.callBackList["onDisconncall"]();
                }
                break;
            case 17:	//开始外拨
                break;
            case 18:	//返回指定座席的当前呼叫流水号
                break;
            case 19:	//加入通话
                if(this.state.phone.callBackList.onJoinAgtTalk !== undefined){
                    this.state.phone.callBackList["onJoinAgtTalk"]();
                }
                break;
            case 20:	//退出通话
                if(this.state.phone.callBackList.onExitAgtTalk){
                    this.state.phone.callBackList["onExitAgtTalk"]();
                }
                break;
            case 21:	//向指定座席发消息
                if(this.state.phone.callBackList.onAgtReqAct !== undefined){
                    this.state.phone.callBackList["onAgtReqAct"]();
                }
                break;
            case 22:	//请求指定座席执行呼叫动作
                break;
            default:
                break;
            }
        }else{		//座席动作失败事件
            switch(cmd){
                case 0:	//保持失败
                    this.ztoDialog('message', "电话保持失败：" + desc);
                    break;
                default:
                    this.ztoDialog('message', desc);
                    break;
            }
        }
    }


    /**
     * 设置座席状态
     * @param status 
     * @param hook 
     * @param occupy 
     */
    setAgtStatus = (status?: any, hook?: any, occupy?: any) => {
        this.writeLog("onRunAgtInfo[status："+status+"，hook："+hook+"，occupy："+occupy+"]");
        this.state.phone.lastCallStatus = this.state.phone.callStatus;
        this.state.phone.callStatus = status;
        this.state.phone.occupy = occupy;
        this.state.phone.hook = hook;

        //自定义空值检查添加
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }

        switch(status){
            case 0:
                if(this.state.phone.openOnHookEvent === 1){
                    this.onHookEvent(this.state.phone.agtId, this.state.phone.lastCall.ani, this.state.phone.lastCall.callId, this.state.phone.lastCall.subId);
                    this.state.phone.offHookEventTag = 1;
                    this.state.phone.openOnHookEvent = 0;
                }
                
                if(occupy === 0){		//空闲
                    this.setOnHk();
                    if(this.state.phone.loginCmd === 1){
                        this.loginSuccessEvent();
                        this.state.phone.loginCmd = 0;
                    }
                    this.state.phone.callOutEventTag = 1;
                    this.state.phone.callOutWR = 0;
                    this.iconStatusChange("zhaiji", undefined, undefined, true);
                }else{					//忙
                    this.setWorkAfterCall();
                    this.iconStatusChange("jieshuchuli", true, false, false);
                }
                break;
            case 1:					//振铃
                if(this.state.phone.lastCallStatus !== this.state.phone.callStatus) {
                    this.callInEvent(this.state.phone.agtId, this.state.phone.lastCall.ani, this.state.phone.lastCall.callId, this.state.phone.lastCall.subId);
                }
                break;
            case 2:					//通话
                if(this.state.phone.callOutRing === 0){
                    this.setCallIn();
                    if(this.state.phone.afterWorkStatus===1 && occupy === 0){
                        this.writeLog("开启后处理状态");
                        this.state.sdAgent.agtWorkAfterCall();
                    } 
                    this.state.phone.openOnHookEvent = 1;
                    if(occupy===0&&this.state.phone.offHookEventTag==1){
                        this.offHookEvent(this.state.phone.agtId, this.state.phone.lastCall.ani, this.state.phone.lastCall.callId, this.state.phone.lastCall.subId);
                        this.state.phone.offHookEventTag=0;
                    }
                }else{
                    this.state.phone.callOutRing = 0;
                }
                
                break;
            case 3:					//外拨
                this.setCallOut();
                break;
            case 5:					//保持
                this.setHold();
                break;
            case 8:			//加入通话
            case 10:		//三方外拨中
            case 11:		//三方会议外拨接通
                // this.setMeeting11();
                break;
            case 12:		//三方会议中
                // this.setMeeting12();
                break;
            case 14:
                this.setState({callStatus: "振铃中"});
                break;
            case 15:		//三方呼入摘机
                // this.setTalkingOffHook();
                break;
            case 16:
                // this.setMeeting16();
                break;
            case 20:		//拨座席
                this.setCallOut();
                break;
            case 21:		//播放工号
                this.setPlayAgtId();
                break;
            case 28:		//动态分配连接话机中
                break;
            case 29:		//呼叫座席组
                this.setCallOut();
                break;
            default:
                break;
        }
    }//setAgtStatus function end


    /**
     * 保持状态
     * 原有的phone绑定的函数
     */
    setHold = () => {
        this.setState({callStatus: "保持中"});

        this.iconStatusChange("quxiaojingyin", true, true, false);
        this.iconStatusChange("jingyin", false, false, undefined);
    }


    /**
     * 加载在服务器上保存的呼叫信息
     * 原有的phone绑定的函数
     */
    setAgtDetailInfo = (agtId?: any, name?: any, agtStatus?: any, callStatus?: any, hook?: any, occupy?: any, lastCall?: any) => {
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {}
        }

        this.state.phone.callStatus = callStatus;
        this.state.phone.agtStatus = agtStatus;
        this.state.phone.occupy = occupy;
        this.state.phone.lastCall.callId = lastCall.callId;
        this.state.phone.lastCall.subId = lastCall.subId;
        this.writeLog("当前座席状态：" + this.state.phone.agtStatus);
        switch(agtStatus){
        case 1:
            break;
        case 2:
            this.setLogOff();
    //		自动注册
            if(this.state.phone.onDisConnectTag===1){
                var start = (new Date()).getTime(); 
                while ((new Date()).getTime() - start < 2000) {
                    continue;
                }

                let cookies = new Cookies();
                this.state.phone.station = cookies.get("SDLogonStation");
                let grpsSplit = cookies.get("SDLogonGroups");

                if(this.state.phone.station === undefined || this.state.phone.station === null) {
                    this.state.phone.station = "";
                }
                if(grpsSplit === undefined || grpsSplit === undefined) {
                    grpsSplit = "";
                }
                var reg = new RegExp( '\\|' , "g" )
                this.state.phone.groupId = grpsSplit.replace(reg, "");
                if(this.state.phone.station===""){
                    if(this.state.phone.initSetCallModel===0){
                        this.state.sdAgent.logon("", this.state.phone.agtId+"");
                    }else if(this.state.phone.initSetCallModel===1){
                        this.state.sdAgent.logon("", this.state.phone.agtId+"_WR");
                    }
                }else{
                    this.state.sdAgent.logon(this.state.phone.groupId, this.state.phone.station);
                }
                this.state.phone.loginCmd = 1;
            } 
            break;
        case 3:
            this.state.phone.agtStatus = 7;
            this.setLogOn();
            this.setPause();
            this.setAgtStatus(callStatus, hook, occupy);
            //振铃
            if(callStatus===1){
                this.setRing(lastCall.callId,lastCall.subId,lastCall.area,lastCall.ani,lastCall.grpId,lastCall.srcAgt,lastCall.ivrList);
            }else if(callStatus===4){
                this.setListen();
            }else if(callStatus!==0 || occupy===1){
                //phone.setLastCall(lastCall);      
            }
            break;
        case 4:
            this.state.phone.agtStatus = 8;
            this.setLogOn();
            this.setRestore();
            this.setAgtStatus(callStatus,hook,occupy);
            //振铃
            if(callStatus===1){
                this.setRing(lastCall.callId,lastCall.subId,lastCall.area,lastCall.ani,lastCall.grpId,lastCall.srcAgt,lastCall.ivrList);
            }else if(callStatus===4){
                this.setListen();
            }else if(callStatus!==0 || occupy===1){
                //phone.setLastCall(lastCall);          
            }
            break;
        default:
            break;
        }
    }


    /**
     * 三方外拨成功
     */
    setMeeting11 = () => [
        this.setState({callStatu: "呼三方"})

    	// $("#trans_tools1,#sanfang_tools1").hide();
	    // $("#trans_tools2,#sanfang_tools2").show();
	    // $("#sanfang_join").show();
    ]


    /**
     * 三方通话
     */
    setMeeting12 = () => {
        this.setState({callStatus: "三方通话"});

        // $("#trans_tools1,#sanfang_tools1").hide();
        // $("#trans_tools2,#sanfang_tools2").show();
        // $("#sanfang_join").hide();
    }


    /**
     * 转为三方会议摘机状态
     */
    setTalkingOffHook = () => {
        this.setState({callStatus: "通话"});
    }


    /**
     * 三方通话
     */
    setMeeting16 = () => {
        this.setState({callStatus: "三方通话"});
    }


    /**
     * 监听
     * 原有的phone绑定的函数
     */
    setListen = () => {
        this.setState({callStatus: "监听"})
    }


    /**
     * 设置座席权限
     * 原有的phone绑定的函数
     */
    setAgentRights = (data?: any) => {
        if(data===null || data===undefined) {
            return;
        }
        if(this.state.phone.rights === undefined){
            this.state.phone.rights = {};
        }
        this.state.phone.rights.agtReq = data.agtReq;
        this.state.phone.rights.dialOut = data.dialOut;
        this.state.phone.rights.agtDisconnectCall = data.agtDisconnectCall;
        this.state.phone.rights.agtIntercept = data.agtIntercept;
        this.state.phone.rights.agtJoinTalk = data.agtJoinTalk;
        this.state.phone.rights.agtListen = data.agtListen;
        this.state.phone.rights.isMonitor = data.isMonitor;
        this.state.phone.rights.logoutAgt = data.logoutAgt;
        this.state.phone.rights.remoteCti = (data.remoteCti===undefined?true:data.remoteCti);
    }


    /**
     * 初始化座席组
     * data为数组，数组的元素的结构为{groupId: string, groupName: string}
     */
    initAgtGroups = (data?: any) => {
        let agtGroupgOptions:{label: string, value:string}[] = [];      ///每次都进行清空操作
        if (data===null || data===undefined || data.agtGroups===null || data.agtGroups===undefined) {
            this.setState({agtGroupgOptions: agtGroupgOptions});        //数据为空的话也要清空
            return;
        }
        //初始化上班弹窗的座席组的checkbox的信息
        for(var item of data.agtGroups){
            agtGroupgOptions.push({
                value: item.groupId,
                label: item.groupName
            })
        }

        this.setState({agtGroupgOptions: agtGroupgOptions});
    }


    /**
     * 原有的phone绑定的clearCall函数
     * 转交给this
     */
    clearCall = () => {
        if(this.state.phone.lastCall === undefined){
            this.state.phone.lastCall = {};
        }
        this.state.phone.lastCall.callId = 0;
        this.state.phone.lastCall.subId = 0;
        this.state.phone.lastCall.areaCode = "";
        this.state.phone.lastCall.ani = "";
        this.state.phone.lastCall.groupId = "";
        this.state.phone.lastCall.ivrList = "";

        if(this.state.phone.tmrDur !== undefined && this.state.phone.tmrDur !== null && this.state.phone.tmrDur > 0){
            clearInterval(this.state.phone.tmrDur);
        }

        if(this.state.phone.lastCall.offHookTime === undefined || this.state.phone.lastCall.offHookTime === null){
            return ;
        }

        if(this.state.phone.totalTalkTime === undefined){
            this.state.phone.totalTalkTime = 0
        }
        this.state.phone.totalTalkTime += this.state.phone.talkTime! ;
        
        //预留的位置
        try{
            this.setAgtCountInfo(this.state.sdAgent.agtId,this.state.phone.workTime,this.state.phone.groupId,
                this.dateFormat(this.state.phone.talkTime!,'hh:mm:ss'),this.state.phone.callCnt+"/"+this.state.phone.dialOutCnt,
                this.dateFormat(this.state.phone.totalTalkTime,'hh:mm:ss'));
        }catch(e){

        }
        this.state.phone.lastCall.offHookTime = "";
    }


    /**
     * 座席监控方法
     * 原有的phone绑定的函数
     * @param type banzhang | zhuanjie
     */
    openMonitor = (type?: "banzhang" | "zhuanjie") => {
        this.state.phone.toolsType = type;
        this.state.sdAgent.getAllAgtInfo();
        if(!this.state.agtMonitorShow){
            this.state.agtMonitorShowTime = this.state.agtMonitorShowTime + 1;
        }
        this.setState({agtMonitorShow: true, agtMonitorType: type});
        try{
            this.state.phone.agtMonitorObj.showTools(type);
        }catch(e){

        }

        if(this.state.phone.tmMonitor!==undefined && this.state.phone.tmMonitor > 0) {
            clearInterval(this.state.phone.tmMonitor);
        }

        this.state.phone.tmMonitor = setInterval(() => {
            this.state.sdAgent.getAllAgtInfo();
            if(this.state.agtMonitorShow === false) {      //getMonitorDlgStatus原有方法为检查agtMonitor对话框打开状态1－打开，0－关闭，此处直接检查state
                clearInterval(this.state.phone.tmMonitor);
            }
        }, 5000);

    }


    /**
     * 请求归属地
     */
    getArea = (phoneNum?: any) => {
        let res = (async ()=>{
            let area = "";
            await umiRequest(this.state.phone.webUrl + "agent/getPhoneArea/" + phoneNum, {
                method: 'post',
                // requestType: 'json',
                timeout: 3000,
                headers: {
                    "Content-Type": "application/json"
                },
                mode: 'cors',
                credentials: "include",
            }).then(async function(data){
                if(data===null || data === undefined || data === ""){
                    area = "未知地区";
                }else{
                    area = data.REGIONNAME+"-"+data.PROVINCENAME+"-"+data.CITYNAME
                }
            }).catch(async function(error){
                area = "未知地区";
            });
            return await area;
        })();
        return res;
    }


    /**
     * 位置预留
     */
    updateDaLogin = (isDaLogin?: any) => {

    }


    /**
     * 原有的phone的encrypt函数
     * ajax的同步请求通过async以及await的方式另作处理，未测试
     */
    encrypt = async (phoneNum?: any) => {
        var result = "";
        await umiRequest(this.state.phone.webUrl + "agent/encryptText/" + phoneNum, {
            method: 'get',
            requestType: 'json',
            timeout: 3000,
            mode: 'cors',
        }).then(function(data){
            result = data;
        }).catch(function(error){
            result = "";
        });
        return await result;
    }
    /*------phone 的部分绑定函数的转移结束------- */


    /*---------phone.js以及index的部分独立函数的转移------------- */
    //原有事件迁移
    //用来写调试日志（正式使用时可注释掉里面的代码）
    writeLog = (msg: any) => {
        var date=new Date();
        var hours=date.getHours()<10?"0"+date.getHours():date.getHours();
        var minutes=date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes();
        var seconds=date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds();
        var ms;
        if(date.getMilliseconds()<10){
            ms="00"+date.getMilliseconds();
        }else if(date.getMilliseconds()<100){
            ms="0"+date.getMilliseconds();
        }else{
            ms=date.getMilliseconds();
        }
        
        msg=hours+":"+minutes+":"+seconds+"."+ms +"    " + msg;
        if(console!=null && console!=undefined){
            console.log(msg);
        }
    }


    /**
     * phone.js的独立函数
     */
    offHookEvent = async (agtId?: any, dnis?: any, callId?: any, subId?: any) => {
        if(this.state.phone.redirectTag!==0) {
            return;
        }
        var areaInfo: any = this.getArea(dnis);
        await areaInfo.then(function(data:any){
            areaInfo = data;
        })
        var text = this.encrypt(dnis);
        await text.then(function(data:any){
            text = data;
        })
        //var text = "";
        var newCallId = callId + "_" + subId;
        if(this.state.phone.callType===0){
            this.writeLog("呼入接通后[加密号码内容：" + text  + "，来电归属地：" + areaInfo +  "，座席ID："+agtId+"，呼叫ID："+callId+ "，呼叫子ID：" + subId+"]");
            this.writeLog("呼入接通时业务触发入口");
        }else{
            this.writeLog("呼出接通后[加密号码内容：" + text  + "，来电归属地：" + areaInfo +  "，座席ID："+agtId+"，呼叫ID："+callId+ "，呼叫子ID：" + subId+"]");
            this.writeLog("呼出接通时业务触发入口");
        }
    }


    /**
     * phone.js的独立函数
     */
    onHookEvent = async (agtId?: any, dnis?: any, callId?: any, subId?: any) => {
        if(this.state.phone.redirectTag !== 0) {
            return;
        }
        var areaInfo: any = this.getArea(dnis);
        await areaInfo.then(function(data:any){
            areaInfo = data;
        })
        var text = this.encrypt(dnis);
        await text.then(function(data:any){
            text = data;
        })
        //var text = "";
        if(this.state.phone.callType === 0){
            this.writeLog("呼入挂机后[加密号码内容：" + text  + "，来电归属地：" + areaInfo +  "，座席ID："+agtId+"，呼叫ID："+callId+ "，呼叫子ID：" + subId+"]");
            this.writeLog("呼入挂机时业务触发入口");
        }else{
            this.writeLog("呼出挂机后[加密号码内容：" + text  + "，来电归属地：" + areaInfo +  "，座席ID："+agtId+"，呼叫ID："+callId+ "，呼叫子ID：" + subId+"]");
            this.writeLog("呼出挂机时业务触发入口");
        }
        this.state.phone.redirectTag = 0;
    }


    /**
     * phone.js的独立函数
     */
    callInEvent = async (agtId?: any, dnis?: any, callId?: any, subId?: any) => {
        if(this.state.phone.redirectTag !== 0) {
            return;
        }
        var areaInfo: any = this.getArea(dnis);
        await areaInfo.then(function(data:any){
            areaInfo = data;
        })
        var text = this.encrypt(dnis);
        await text.then(function(data:any){
            text = data;
        })
        //var text = "";
        this.state.phone.callType = 0;
        this.writeLog("呼入时[加密号码内容：" + text  + "，来电归属地：" + areaInfo +  "，座席ID："+agtId+"，呼叫ID："+callId+ "，呼叫子ID：" + subId+"]");
        this.writeLog("呼入时业务触发入口");
    }


    /**
     * phone.js的独立函数
     */
    callOutEvent = async (agtId?: any, dnis?: any, callId?: any, subId?: any) => {
        if(this.state.phone.redirectTag!==0) {
            return;
        } 
        var areaInfo: any = this.getArea(dnis);
        await areaInfo.then(function(data:any){
            areaInfo = data;
        })
        var text = this.encrypt(dnis);
        await text.then(function(data:any){
            text = data;
        })
        this.state.phone.callType = 1;
        this.writeLog("呼出时[加密号码内容：" + text  + "，来电归属地：" + areaInfo +  "，座席ID："+agtId+"，呼叫ID："+callId+ "，呼叫子ID：" + subId+"]");
        this.writeLog("呼出时业务触发入口");
    }


    /**
     * phone.js的独立函数
     */
    callOutNoAnswerByAgtEvent = () => {
        this.writeLog("呼出时座席端未摘机或挂机，触发入口");
    }


    /**
     * phone.js的独立函数
     */
    loginSuccessEvent = () => {
        this.writeLog("注册成功时业务触发入口");
    }


    /**
     * 原有函数迁移
     * index.html的页面定义的函数
     */
    ztoDialog = (type: string, data: string) =>{
        message.info( type + " : " + data);
    }


    /**
     * 原有的index.html的函数
     * 获取cookies的历史登录信息，然后根据历史信息进行内容的选中
     */
    setLogonGrps = () => {
        let cookies = new Cookies();
        let grpsSplit = cookies.get("SDLogonGroups");
        let checkedValue = [];
        if(grpsSplit !== undefined && grpsSplit !== null && grpsSplit !== ""){
            let arrGrps = grpsSplit.split("|");
            for(var i=0;i<arrGrps.length;i++){
                checkedValue.push(arrGrps[i]);
            }
        }
        this.setState({agtGroupCheckedValue: checkedValue});

    }
    /*---------phone.js以及index的部分独立函数的转移结束------------- */


    /**------------------原有的test.html的页面内的部分函数开始--------------------- */
    /**
     * 获取班长对话框iframe对象
     * 原有的test.html的页面函数
     * 由于班长功能未确定，预留位置，注释动作主体
     */
    getAgtMonitorFrame = () => {
        // return document.getElementById("frmAgtMonitor");
    }


    /**
     * 获取index工具条iframe对象
     * 原有的test.html的页面函数
     */
    getPhoneFrame = () => {
        return document.getElementById("frmPhone");
    }

    setAgtCountInfo = (agentId?: any, workTime?: any, loginGroups?: any, talkTime?: any, callCnt?: any, totalTalkTime?: any) => {
        let data = {
            barAgentId: agentId,
            barWorkTime: workTime,
            barLoginGroups: loginGroups,
            barTalkTime: talkTime,
            barCallCnt: callCnt,
            barTotalTalkTime: totalTalkTime,
        }
        this.setState({mainInfo: data});
    }
    /**------------------原有的test.html的页面内的部分函数结束--------------------- */


    /*--------------------原有的页面元素的绑定事件开始------------------------- */
    /**
     * 上班(zhuce)按钮的点击事件
     */
    shangbanOnClick = () => {
        if(this.state.shangbanIconStatus.disabled === true){
            return ;
        }
        //弹窗内容填充，以及初始化选中
        this.setLogonGrps();
        
        //显示弹窗
        this.setState({shangbanModalShow: true})
    }


    /**
     * 上班弹窗的点击确认事件
     * 使用data参数接收弹窗的返回数据
     */
    shangbanSubmit = (e: any, data: any) => {
        if(data === undefined || data === null || data === ""){
            return ;
        }
        var grps = "",grpsSplit="";			//记录groupid
        for(var item of data){
            grps = grps + item;
            if(grpsSplit !== "") {
                grpsSplit = grpsSplit + "|";	//使用分隔符将groupid进行组合
            }
            grpsSplit = grpsSplit + item
        }
        if(grps===""){		//空值返回
            this.ztoDialog("message","请选择一个座席组");
            return;
        }

        let model = "";
        let modelVal = this.state.callModelSelected;
        for(let item of this.callModelList){
            if(item.key === modelVal){
                model = item.text;
            }
        }

        let isDaLogin = "N";
        Modal.confirm({
            content: "确定注册"+grps+"组并以"+model+"方式接听？",
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
                if(modelVal==="pstn"){			//三种类型的不同动作部分
					this.state.phone.station = this.state.phone.agtId + "_PSTN";
					isDaLogin = "Y";
					this.iconStatusChange("zhaiji", false, undefined, undefined);   //$("#zhaiji").hide();
				}else if(modelVal==="sip"){
					this.state.phone.station = this.state.phone.agtId + "";
					isDaLogin = "N";
					this.iconStatusChange("zhaiji", false, undefined, undefined);   //$("#zhaiji").hide();
				}else{
					this.state.phone.station = this.state.phone.agtId + "_WR";
					isDaLogin = "N";
					this.iconStatusChange("zhaiji", true, undefined, undefined);    // $("#zhaiji").show();
				}
				this.state.phone.groupId = grps;			//全局变量phone的groupId设置
                let cookies = new Cookies();
                cookies.set("SDLogonGroups", grpsSplit, {expires: new Date(new Date().getTime() + 7*24*60*60*1000)});  //7*24*60*60*1000
                cookies.set("SDLogonStation",  this.state.phone.station, {expires: new Date(new Date().getTime() + 7*24*60*60*1000)});  //7*24*60*60*1000
				this.state.phone.onDisConnectTag=1;		//全局变量phone的groupId设置
				this.state.sdAgent.logon(this.state.phone.groupId, this.state.phone.station);		//传入groupId以及station调用SdAgent.logon
				this.state.phone.loginCmd = 1;			//全局变量phone的loginCmd设置
                this.setState({shangbanModalShow: false});
            }
        });
    }   //上班弹窗的确认事件


    /**
     * 下班(logout)按钮点击事件
     */
    xiabanOnClick = () => {
        if(this.state.xiabanIconStatus.disabled === true){
            return ;
        }
        this.setState({callModelDisabled: false});      //$5("#onHookMode").removeAttr("disabled");	//移除接听方式选择的禁用状态
        this.state.phone.onDisConnectTag=0;	                //phone.onDisConnectTag=0;		//全局变量的设置
		this.state.sdAgent.logout();                                    //SdAgent.logout();				//调用接口进行注销
    }


    /**
     * 
     */
    banzhangOnClick = () => {
        if(this.state.banzhangIconStatus.disabled === true){
            return ;
        }
        this.openMonitor("banzhang");		//调用座席监控方法
    }


    /**
     * 外拨(hujiao)按钮的点击事件
     */
    waiboOnClick = () => {
        if(this.state.waiboIconStatus.disabled === true){
            return false;
        }
        this.setState({waiboModalShow: true});
    }


    /**
     * 外拨的号码的提交事件
     * @param e event
     * @param data 目标号码
     */
    waiboSubmit = (e: any, data: any) => {
        // SdAgent.dialout(dialNo,"X",0);			//调用接口

        if(data===undefined || data === null || data === ""){
            message.info("号码不能为空");
        }
        if(this.state.phone.agtStatus===3){			//全局变量状态检查
            this.ztoDialog("message","请先注册座席");		//alert提示信息
            return;
        }
        if(this.state.phone.callStatus !== 0 || this.state.phone.occupy !== 0){		//全局变量状态检查
            this.ztoDialog("message","非空闲状态，无法呼叫");
            return;
        }
        this.state.phone.lastCall!.ani = data;		//全局变量设置
        var modelVal = this.state.callModelSelected;
        if(modelVal === "webcall") {
            this.state.phone.callOutWR = 1;	//webcall连接下的全局变量设置
        }
        
        this.state.sdAgent.dialout(data, "X" , 0);      //调用接口

        this.setState({waiboModalShow: false});         //关闭弹窗
    }


    /**
     * 转接(zhuuanjie)按钮的点击事件
     */
    zhuanjieOnClick = () => {
        if(this.state.zhuanjieIconStatus.disabled === true){
            return ;
        }
        this.openMonitor("zhuanjie");		//调用座席监控方法
    }


    /**
     * 小休(shimang)的点击事件
     */
    xiaoxiuOnClick = () => {
        if(this.state.xiaoxiuIconStatus.disabled === true){
            return ;
        }
        this.state.phone.isMSClick = true;
        this.state.sdAgent.pause();
    }


    /**
     * 工作(shixian)的点击事件
     */
    gongzuoOnClick = () => {
        if(this.state.gongzuoIconStatus.disabled === true){
            return ;
        }
        this.state.phone.isMSClick = true;
        this.state.sdAgent.restore();
    }


    /**
     * 挂断(guanduan)按钮的点击事件 
     */
    guaduanOnClick = () => {
        if(this.state.guaduanIconStatus.disabled === true){
            return ;
        }
        this.state.sdAgent.onHook();
    }


    /**
     * 静音(baochi)按钮的点击事件
     */
    jingyinOnClick = () => {
        if(this.state.jingyinIconStatus.disabled === true){
            return ;
        }
        this.state.sdAgent.agtHold();				//通过socket将agtHold的指令发送给服务端
        this.iconStatusChange("guaduan", undefined, undefined, true);			
        this.iconStatusChange("zhuanjie", undefined, undefined, true);
        this.iconStatusChange("jingyin", undefined, true, undefined);
    }


    /**
     * 取消静音按钮(jietong)的点击事件
     */
    quxiaojingyinOnClick = () => {
        if(this.state.quxiaojingyinIconStatus.disabled === true){
            return ;
        }
        this.state.sdAgent.agtRetrieve();	
        this.iconStatusChange("guaduan", undefined, undefined, false);			
        this.iconStatusChange("zhuanjie", undefined, undefined, false);
        this.iconStatusChange("quxiaojingyin", undefined, true, undefined);
    }


    /**
     * 结束处理的动作
     */
    jieshuchuliOnClick = () => {
        if(this.state.jieshuchuliIconStatus.disabled === true){
            return ;
        }
        //调用接口
        this.state.sdAgent.agtWorkAfterCallOver()
    }
    /*--------------------原有的页面元素的绑定事件结束------------------------- */


    /**------------新增动作----------------- */
    dateFormat = function(dt: number, formatStr: string){
        var str = formatStr;
        var ss: any = (dt%60);
        ss = ss > 9?ss : ('0' + ss);
        var mm: any = Math.floor((dt/60)); 
        var hh: any = Math.floor((mm/60));
        mm = mm%60;
        mm = mm>9?mm:'0'+mm;
        hh = hh>9?hh:'0'+hh;
        
        str = hh + ":" + mm + ":" + ss;
        return str;
    }


    /**
     * 修改icon的渲染状态
     */
    iconStatusChange = (name: IconName, show: boolean | undefined, selected: boolean | undefined, disabled: boolean | undefined) => {
        let key = (name + "IconStatus") as IconNameKey;
        let data: any = this.state[key] || {};
        if(show !== undefined){
            data.show = show
        }
        if(selected !== undefined){
            data.selected = selected
        }
        if(disabled !== undefined){
            data.disabled = disabled
        }
        this.setState({
            [name + 'IconStatus']: data
        });
    }


    render(){
        // 接听方式的选择
        const callModelOptions = this.callModelList.map((d: any) => {
            return (
              <Select.Option value={d.value} key={d.value} disabled={d.disabled}>
                <span>{d.text}</span>
              </Select.Option>
            );
          });
        return (
            <>
                <Layout >
                    <Header className={styles['header']}>
                        <Space className={styles['container']}>
                            {this.state.shangbanIconStatus.show?
                                <div onClick={this.shangbanOnClick}>
                                    <PhoneIcon name="shangban" disabled={this.state.shangbanIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.xiabanIconStatus.show?
                                <div onClick={this.xiabanOnClick}>
                                    <PhoneIcon name="xiaban" disabled={this.state.xiabanIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.banzhangIconStatus.show?
                                <div onClick={this.banzhangOnClick}>
                                    <PhoneIcon name="banzhang" disabled={this.state.banzhangIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.waiboIconStatus.show?
                                <div onClick={this.waiboOnClick}>
                                    <PhoneIcon name="waibo" disabled={this.state.waiboIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.zhuanjieIconStatus.show?
                                <div onClick={this.zhuanjieOnClick}>
                                    <PhoneIcon name="zhuanjie" disabled={this.state.zhuanjieIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.xiaoxiuIconStatus.show?
                                <div onClick={this.xiaoxiuOnClick}>
                                    <PhoneIcon name="xiaoxiu" disabled={this.state.xiaoxiuIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.gongzuoIconStatus.show?
                                <div onClick={this.gongzuoOnClick}>
                                    <PhoneIcon name="gongzuo" disabled={this.state.gongzuoIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.guaduanIconStatus.show?
                                <div onClick={this.guaduanOnClick}>
                                    <PhoneIcon name="guaduan" disabled={this.state.guaduanIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.jingyinIconStatus.show?
                                <div onClick={this.jingyinOnClick}>
                                    <PhoneIcon name="jingyin" disabled={this.state.jingyinIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.quxiaojingyinIconStatus.show?
                                <div onClick={this.quxiaojingyinOnClick}>
                                    <PhoneIcon name="quxiaojingyin" disabled={this.state.quxiaojingyinIconStatus.disabled} />
                                </div>
                                :null
                            }
                            {this.state.jieshuchuliIconStatus.show?
                                <div onClick={this.jieshuchuliOnClick}>
                                    <PhoneIcon name="jieshuchuli" disabled={this.state.jieshuchuliIconStatus.disabled} />
                                </div>
                                :null
                            }
                            <div className={styles['selector-container']}>
                                <Select value={this.state.callModelSelected} showArrow={true} className={styles['selector']} size="small"
                                    onSelect={(value)=>{this.setState({callModelSelected: value})}} disabled={this.state.callModelDisabled}>
                                    {callModelOptions}
                                </Select>
                                <span className={styles['selector-text']}>接听方式</span>
                            </div>
                            <div className={styles['status-box']} style={{ backgroundImage: "url(" + require("../resources/images/tbg.png") + ") ", backgroundRepeat: "no-repeat", backgroundPositionY: 10 }}>
                                <span className={styles['status-item']}>状态：{this.state.callStatus}</span>
                                <span className={styles['status-item']}>排队：{this.state.queueInfo}</span>
                            </div>
                        </Space>
                    </Header>
                    <Content>
                        <Space>
                            <span>工号：{this.state.mainInfo.barAgentId}</span>
                            <span>注册时间：{this.state.mainInfo.barWorkTime}</span>
                            <span>登录组：{this.state.mainInfo.barLoginGroups}</span>
                            <span>通话时长：{this.state.mainInfo.barTalkTime}</span>
                            <span>呼入/呼出数：{this.state.mainInfo.barCallCnt}</span>
                            <span>累计通话时长：{this.state.mainInfo.barTotalTalkTime}</span>
                        </Space>
                    </Content>
                </Layout>
                <ShangbanModal show={this.state.shangbanModalShow} onOk= {this.shangbanSubmit} onCancel={(e: any) => {this.setState({shangbanModalShow: false})}} 
                        options={this.state.agtGroupgOptions} checkedValue={this.state.agtGroupCheckedValue}/>
                <WaiboModal show={this.state.waiboModalShow} onOk={this.waiboSubmit} onCancel={(e: any) => {this.setState({waiboModalShow: false})}}/>
                <AgtMonitor key={this.state.agtMonitorShowTime} renderTime={this.state.agtMonitorShowTime} phone={this} 
                    type={this.state.agtMonitorType} ref={(agtMonitor) => {this.state.phone.agtMonitorObj = agtMonitor}}
                    show={this.state.agtMonitorShow} onCancel={(e: any) => {this.setState({agtMonitorShow: false})}} />
            </>
        );
    }

}

export default function(){
    return <App />;
}