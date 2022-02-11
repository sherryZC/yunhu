import React from 'react';
import { Modal, Input, Checkbox, Table, Space, Button, Radio, message } from 'antd';
import { agtMonitorProps } from './phoneProps';
import styles from './commonModal.less';

//外拨弹窗
export class WaiboModal extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    state:any = {
        inputValue: undefined
    }

    inputOnChange = (e: any) => {
        var value:string = e.target.value;
        value = value.trim();
        value = value.replace(/[^\u0000-\u00FF]/ig,"");
        this.setState({inputValue: value});
    }

    //组件渲染
    render() {
        return(
            <>
                <Modal title="被叫号码" visible={this.props.show}
                    onCancel={this.props.onCancel}
                    onOk={(e)=>{this.props.onOk(e, this.state.inputValue)}} 
                    okText="确认" cancelText="取消"
                >
                    <Input placeholder="请输入被叫号码" value={this.state.inputValue} onChange={this.inputOnChange} >
                    </Input>
                </Modal>
            </>
        );
    }

}


//上班弹窗
export class ShangbanModal extends React.Component<any, any> {

    constructor(props: any){
        super(props);
    }

    state: any = {
        checkedValue: this.props.defaultValue
    }

    checkOnChange = (checkedValue: any) => {
        this.setState({checkedValue: checkedValue})
    }

    //组件渲染
    render() {
        return (
            <>
                <Modal visible={this.props.show} title="座席组"
                    onCancel={this.props.onCancel} 
                    onOk={(e)=>{this.props.onOk(e, this.state.checkedValue)}}
                    okText="确认" cancelText="取消"
                    destroyOnClose={true}
                >
                    <Checkbox.Group options={this.props.options} value={this.state.checkedValue} 
                        onChange={this.checkOnChange}
                    />
                </Modal>
            </>
        );
    }
}


//转接座席的弹窗
export class AgtMonitor extends React.Component<any, any>{

    //表格列头
    tableColumns = [
        {
            title: '坐席工号',
            dataIndex: 'agtid',
            key: 'agtid',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    //原有的是将agtid的display改为none
                    result = "";
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '座席姓名',
            dataIndex: 'agtname',
            key: 'agtname',
        },
        {
            title: "注册状态",
            dataIndex: 'login',
            key: 'login',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    result = "未注册";
                }else{
                    result="注册";
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '暂停状态',
            dataIndex: 'pause',
            key: 'pause',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    result = "未注册";
                }else{
                    result = record.pause == 1?"暂停":"恢复";
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '通话状态',
            dataIndex: 'status',
            key: 'status',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    result = "未注册";
                }else{
                    if(record.status ==  0){
                        if(record.occupy == 1){
                            result = "处理";
                        }else if(record.pause == 1){
                            result = "暂停";
                        }else{
                            result = "空闲";
                        }
                    }else{
                        var sInfo = this.getStatusInfo(record.status);
                        result = sInfo[0];
                    }
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '话机状态',
            dataIndex: 'hook',
            key: 'hook',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    result = "未注册";
                }else{
                    if(record.hook == 0){
                        result = "摘机";
                    }else if(record.hook == 1){
                        result = "挂机";
                    }else if(record.hook == 2){
                        result = "连接中";
                    }else if(record.hook == 3){
                        result = "未分配";
                    }else{
                        result = "未知";
                    }
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '占用状态',
            dataIndex: 'occupy',
            key: 'occupy',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    result = "未注册";
                }else{
                    result = record.occupy == 1?"占用":"未占用";
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '登录组',
            dataIndex: 'loginGroups',
            key: 'loginGroups',
            render: (text: any, record: any) => {
                let result = text;
                if(record.login == 0){
                    result = "未注册";
                }
                return (
                    <span>
                        {result}
                    </span>   
                );
            },
        },
        {
            title: '所属组',
            dataIndex: 'groups',
            key: 'groups',
        }
    ]


    //请求类型
    cbReqAgtTypeOptions = [
        {
            value: 0,
            label: "监听"
        },{
            value: 1,
            label: "拦截"
        },{
            value: 2,
            label: "加入通话"
        }
    ]


    constructor(props: any){
        super(props);
        this.init();
    }


    /**
     * 初始化
     */
    init = () => {
        let phoneObj = this.props.phone;            //将调用Modal时需要传入phone,
        
        if(phoneObj.state.phone.lastAllAgtInfoStr !== undefined && phoneObj.state.phone.lastAllAgtInfoStr !==null && phoneObj.state.phone.lastAllAgtInfoStr !== "") {
            //初始化不能setState,添加一个参数传入,判断是否初始化            
            this.onAllAgtInfo(phoneObj.state.phone.lastAllAgtInfoStr, phoneObj.state.phone.lastAllAgtInfoCnt, true);
        }

        //父组件事件注册
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onAllAgtInfo'] = this.onAllAgtInfo;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onListen'] = this.onListen;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onUnListen'] = this.onUnListen;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onJoinAgtTalk'] = this.onJoinAgtTalk;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onExitAgtTalk'] = this.onExitAgtTalk;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onDisconncall'] = this.onDisconncall;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onInterceptTalk'] = this.onInterceptTalk;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onAgtReqAct'] = this.onAgtReqAct;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onAcceptAgtReq'] = this.onAcceptAgtReq;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onRunAgtInfo'] = this.onRunAgtInfo;
        this.state.agtMonitor.phoneObj.state.phone.callBackList['onGetOrgAgtgrps'] = this.onGetOrgAgtgrps;

        if(this.props.show){    //显示的时候才加载的部分内容,每次打开都需要重新加载
            let iconStatus = this.state.iconStatus;
            if(!phoneObj.state.phone.rights.logoutAgt) {
                iconStatus.btnLogoutAgt = true;
            }
            if(!phoneObj.state.phone.rights.dialOut) {
                iconStatus.btnDialAgt = true;
            }
            if(!phoneObj.state.phone.rights.agtReq) {
                iconStatus.btnReqAgt = true;
            }
            if(!phoneObj.state.phone.rights.agtListen) {
                iconStatus.btnListen = true;
            }
            this.state.iconStatus = iconStatus
            phoneObj.state.sdAgent.getOrgAgtgrps();
        }
    }


    /**
     * 注销事件
     */
    componentWillUnmount(){
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onAllAgtInfo
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onListen
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onUnListen
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onJoinAgtTalk
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onExitAgtTalk
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onDisconncall
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onInterceptTalk
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onAgtReqAct
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onAcceptAgtReq
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onRunAgtInfo
        // delete this.state.agtMonitor.phoneObj.state.phone.callBackList.onGetOrgAgtgrps
    }


    state: {
        // phone: phoneProps,
        agtMonitor: agtMonitorProps,
        operType: "common" | "grp" | "agt" | undefined,     
        dialNo?: string,            //
        tableData: any[],
        selectedValue: any,
        iconStatus: {
            btnLogoutAgt: boolean,
            btnDialAgt: boolean,
            btnReqAgt: boolean,
            btnListen: boolean,
            btnJointalk: boolean,
            btnIntercept: boolean,
            btnDisconCall: boolean,
            btnSendReq: boolean,
        },
        reqAgtModalShow: boolean,
        recvAgtReqModalShow: boolean,
        lblReqAgtInfo: any,
        cbReqAgtTypeSelected: 0 | 1 | 2,
        txtReqAgtInfo: any,
        lblRecvReqAgtInfo: any,
        lblRecvReqAgtMemo: any,
        btnAcceptReq: any,
        btnListenStatus: 0 | 1,
        btnJointalkStatus: 0 | 1,
        tableDisabled: boolean,
    } = {
        // phone: this.props.phone,        //主页面的state里面的phone对象，此处用于进行一些回调事件的注册
        agtMonitor: {       //原有的全局初始化
            lastAllAgtInfo: undefined,
            lastAgtIdList: [],
            bindTrEvt: false,
            lastRemoteCallId: 0,
            agtInfo: undefined,
            phoneObj: this.props.phone,        //主页面的对象，即调用此窗口的this
            tmReqAgt: 0,
            reqAgtTmCnt: 30,
            tmRecvReqAgt: 0,
            reqRecvAgtTmCnt: 30,
            recvReqAgtId: undefined,
            recvReqActType: -1
        },
        operType: undefined,            //隐藏的txtTransAgtId的operType，用于记录转接动作的类型
        dialNo: undefined,              //隐藏的txtTransAgtId的value，待用，用于记录选中座席的座席号
        tableData: this.props.tableData,        //表格数据，后续的表格数据的交由自身控制
        selectedValue: undefined,       //转接座席的选中值,只记录单个的选中的agtid
        iconStatus:{                //控制班长工具条的按钮是否可以操作，设置在disabled属性里，所以true表示禁用
            btnLogoutAgt: true,        //注销座席
            btnDialAgt: false,          //呼叫座席
            btnReqAgt: false,           //请求
            btnListen: false,           //监听
            btnJointalk: true,          //加入通话
            btnIntercept: true,         //拦截
            btnDisconCall: true,         //强拆
            btnSendReq: false,
        },
        reqAgtModalShow: false,         //请求弹窗显示控制
        recvAgtReqModalShow: false,     //接收请求弹窗显示控制
        lblReqAgtInfo: "",              //请求弹窗的内容,
        cbReqAgtTypeSelected: 0,         //请求类型的选中值，初始化选中0
        txtReqAgtInfo: undefined,        //发送请求的备注的文本内容。
        lblRecvReqAgtInfo: "",           //接收请求的内容文本显示
        lblRecvReqAgtMemo: undefined,   //接收请求的备注内容显示
        btnAcceptReq: "接收",           //接收请求的接收按钮文本显示，打开接收弹窗时文本添加倒计时
        btnListenStatus: 0,             //监听按钮的显示状态，0为未监听状态，此时文本显示"监听"，1为监听状态，此时文本显示"取消监听"
        btnJointalkStatus: 0,           //加入通话按钮的显示状态，同上，0为未加入，1为已加入，加入通话，退出通话,
        tableDisabled: false,           //原有的遮罩的显示，控制样式
    }


    /*---------一些原有的agtMonitor.js的函数转移开始------------------- */
    /**
     * 注销座席
     */
    btnLogoutAgtOnClick = () => {
        // if(this.state.iconStatus.btnLogoutAgt === false) {   //disabled由antdButton的disabled属性控制
        //     return ;
        // } 
        if(this.state.agtMonitor.agtInfo == null || this.state.agtMonitor.agtInfo == undefined){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请选择一个座席");
            return;
        }

        //注销状态下该功能不可用
	    if(this.state.agtMonitor.phoneObj.state.phone.agtStatus == 3){
		    this.state.agtMonitor.phoneObj.ztoDialog("message","请先注册座席");
		    return;
	    }

        if(this.state.agtMonitor.agtInfo[3] != 0){
            this.state.agtMonitor.phoneObj.ztoDialog("message","只能注销空闲座席");
            return;
        }
        
        this.state.agtMonitor.phoneObj.state.sdAgent.logoutAgent(this.state.agtMonitor.agtInfo[0]);
    }

    
    /**
     * 呼叫座席
     */
    btnDialAgtOnClick = () => {
        //注销状态下该功能不可用
        if(this.state.agtMonitor.phoneObj.state.phone.agtStatus === 3){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请先注册座席");
            return;
        }

        if(this.state.agtMonitor.agtInfo===null || this.state.agtMonitor.agtInfo === undefined){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请选择一个座席");
            return;
        }
        
        this.state.agtMonitor.phoneObj.state.sdAgent.dialout(this.state.agtMonitor.agtInfo[0], "A", this.state.agtMonitor.phoneObj.state.phone.dialGrp);
    }


    /**
     * 请求
     */
    btnReqAgtOnClick = () => {
        if(this.state.agtMonitor.agtInfo === null || this.state.agtMonitor.agtInfo === undefined){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请选择一个座席");
            return;
        }
        
        //注销状态下该功能不可用
        if(this.state.agtMonitor.phoneObj.state.phone.agtStatus===3){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请先注册座席");
            return;
        }
        
        if(this.state.agtMonitor.phoneObj.state.phone.callStatus !== 3 && this.state.agtMonitor.phoneObj.state.phone.callStatus !== 2){
            this.state.agtMonitor.phoneObj.ztoDialog("message","非通话状态下无法使用请求功能");
            return;
        }
        
        if(this.state.agtMonitor.phoneObj.state.sdAgent.agtId == this.state.agtMonitor.agtInfo[0]){
            this.state.agtMonitor.phoneObj.ztoDialog("message","不能请求您自己");
            return;
        }
        
        let lblReqAgtInfo = "向["+this.state.agtMonitor.agtInfo[0]+"]发送请求。未发送";
        let iconStatus = this.state.iconStatus;
        iconStatus.btnSendReq = false;
        //新增的tableDisabled作为原有的遮罩层的控制，请求发送的时候锁定表格
        this.setState({reqAgtModalShow: true, lblReqAgtInfo: lblReqAgtInfo, iconStatus: iconStatus, tableDisabled: true});
    }


    /**
     * 发送请求
     * 发送请求弹窗的发送按钮的点击事件
     */
    btnSendReqOnClick = () => {
        var actType = this.state.cbReqAgtTypeSelected;              //请求类型的选择，0-监听，1-拦截，2-加入通话
        var content = this.state.txtReqAgtInfo;         //请求备注的文本内容
        this.state.agtMonitor.phoneObj.state.sdAgent.agtReqAgtCallAct(this.state.agtMonitor.agtInfo[0], actType, content);
    }


    /**
     * 发送请求的关闭对话框事件，可以直接绑定为onCancel事件
     */
    btnCloseReqOnClick = () => {
        this.setState({reqAgtModalShow: false, tableDisabled: false});
    }


    /**
     * 监听，或者取消监听
     * 监听和取消监听使用同一个按钮,禁用状态也相同
     */
    btnListenOnClick = () => {
        //取消监听 
        if(this.state.btnListenStatus == 1){
            this.state.agtMonitor.phoneObj.state.sdAgent.agtUnListen();
            return ;
        }

        if(this.state.agtMonitor.agtInfo == null || this.state.agtMonitor.agtInfo == undefined){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请选择一个座席");
            return;
        }

        //注销状态下该功能不可用
        if(this.state.agtMonitor.phoneObj.state.phone.agtStatus == 3){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请先注册座席");
            return;
        }
        
        if(this.state.agtMonitor.phoneObj.state.sdAgent.agtId == this.state.agtMonitor.agtInfo[0]){
            this.state.agtMonitor.phoneObj.ztoDialog("message","不能监听您自己");
            return;
        }
        
        if(this.state.agtMonitor.phoneObj.state.phone.callStatus != 0){
            this.state.agtMonitor.phoneObj.ztoDialog("message","非空闲状态，无法监控座席");
            return;
        }
        
        if(this.state.agtMonitor.agtInfo[3] != 2 && this.state.agtMonitor.agtInfo[3] != 3 && this.state.agtMonitor.agtInfo[3] != 20){
            this.state.agtMonitor.phoneObj.ztoDialog("message","该座席非通话中，无法监听");
            return;
        }
        
        this.state.agtMonitor.phoneObj.state.sdAgent.agtListen(this.state.agtMonitor.agtInfo[0]);
    }


    /**
     * 加入通话
     */
    btnJointalkOnClick = () => { 
        if(this.state.agtMonitor.agtInfo == null || this.state.agtMonitor.agtInfo == undefined){
            return ;
        }
        if(this.state.btnJointalkStatus == 0){
            if(this.state.agtMonitor.agtInfo[0] !== undefined && this.state.agtMonitor.lastRemoteCallId !== undefined){
                this.state.agtMonitor.phoneObj.state.sdAgent.agtJoinTalk(this.state.agtMonitor.agtInfo[0], this.state.agtMonitor.lastRemoteCallId);
            }else{
                
            }
        }else{
            this.state.agtMonitor.phoneObj.state.sdAgent.agtExitTalk();
        }
    }


    /**
     * 拦截
     */
    btnInterceptOnClick = () => { 
        if(this.state.agtMonitor.agtInfo == null || this.state.agtMonitor.agtInfo == undefined){
            return;
        }
        this.state.agtMonitor.phoneObj.state.sdAgent.agtIntercept(this.state.agtMonitor.agtInfo[0], this.state.agtMonitor.lastRemoteCallId);
    }


    /**
     * 强拆
     */
    btnDisconCallOnClick = () => {  
        if(this.state.agtMonitor.agtInfo == null || this.state.agtMonitor.agtInfo == undefined){
            return;
        }
        this.state.agtMonitor.phoneObj.state.sdAgent.agtDisconnectCall(this.state.agtMonitor.agtInfo[0],this.state.agtMonitor.lastRemoteCallId);
    }
    /**---------------班长工具条按钮点击事件结束-------------------------- */


    /**-------------------------转接工具条的相关事件----------------------------------- */
    /**
     * 呼叫座席
     * 预留，待定
     */
     btnTransAgtOnClick = () => {
        this.btnDialAgtOnClick();
    }

    
    /**
     * 转接座席组
     * 预留，待定
     */
    btnTransGrpOnClick = () => {
        //注销状态下该功能不可用
    }

    
    /**
     * 转接按钮的点击事件
     * 转接成功之后关闭弹窗
     */
    btnTransOnClick = () => {
        if(this.state.agtMonitor.phoneObj.state.phone.agtStatus == 3){
            this.state.agtMonitor.phoneObj.ztoDialog("message","请先注册座席");
            return ;
        }

        if(this.state.agtMonitor.phoneObj.state.phone.callStatus == 0){
            return;
        }

        if(this.state.dialNo == undefined || this.state.selectedValue == undefined || this.state.agtMonitor.agtInfo === undefined){
            return ;
        }
       
        var dialNo = this.state.dialNo;
        if(this.state.dialNo == this.state.agtMonitor.phoneObj.state.phone.agtId || 
            !(this.state.agtMonitor.agtInfo[1] == 1 && this.state.agtMonitor.agtInfo[2] == 0 && 
                (this.state.agtMonitor.agtInfo[3] == 0 || this.state.agtMonitor.agtInfo[3] == undefined || 
                    this.state.agtMonitor.agtInfo[3] == null || this.state.agtMonitor.agtInfo[3] == "NaN" ) 
                && this.state.agtMonitor.agtInfo[4] == 1 && this.state.agtMonitor.agtInfo[5]==0)){
            this.state.agtMonitor.phoneObj.ztoDialog("message","座席忙，无法转接");
            return;
        }
        if (this.state.agtMonitor.phoneObj.state.phone.callStatus == 2 || this.state.agtMonitor.phoneObj.state.phone.callStatus == 20) {
            if(this.state.operType == "agt"){
                dialNo = this.state.agtMonitor.agtInfo[0];
                this.state.agtMonitor.phoneObj.state.sdAgent.agtReturnIVR("1",this.state.agtMonitor.phoneObj.state.phone.lastCall.callId,dialNo+',');
                this.onCancel();
            }else if(this.state.operType =="grp"){
                this.btnTransGrpOnClick();      //位置预留
            }else{
                //同上，位置预留
                this.state.agtMonitor.phoneObj.state.sdAgent.agtReturnIVR("3", this.state.agtMonitor.phoneObj.phone.lastCall.callId,',,'+dialNo);
                this.onCancel();
            }
        }else{
            this.state.agtMonitor.phoneObj.state.sdAgent.dialTrans();
            this.onCancel();
        }
    }
    /*-----------------页面元素绑定事件结束--------------- */


    /**
     * 用于控制显示班长工具条还是转接工具条
     * 转移到getfooter判断，getfooter根据props的type内容确定班长工具条还是转接工具条
     */
    showTools = (type?: any) => { 

    }


    /**
     * 置空，原有动作为cbTransAgtGrp元素的内容设置，现在cbTransAgtGrp元素已经弃用
     * 转接座席组
     */
    onGetOrgAgtgrps = (data?: any) => {
        
    }
    
    
    /**
     * 监听事件。班长的工具条的事件
     * 初始化弹窗的时候绑定在phone的回调函数
     */
    onListen = (remoteCallId?: any) => { 
        this.state.agtMonitor.lastRemoteCallId = remoteCallId;
        let iconStatus = this.state.iconStatus;
        iconStatus.btnLogoutAgt = true;
        iconStatus.btnDialAgt = true;
        iconStatus.btnReqAgt = true;
        if(this.state.agtMonitor.phoneObj.state.phone.rights.agtJoinTalk){
            iconStatus.btnJointalk = false;
        }
        if(this.state.agtMonitor.phoneObj.state.phone.rights.agtIntercept){
            iconStatus.btnIntercept = false;
        }
        if(this.state.agtMonitor.phoneObj.state.phone.rights.agtDisconnectCall){
            iconStatus.btnDisconCall = false;
        }

        this.setState({iconStatus: iconStatus, btnListenStatus: 1, tableDisabled: true});

        //拦截请求
        if(this.state.agtMonitor.recvReqActType != undefined && this.state.agtMonitor.recvReqActType > 0){
            this.setState({recvAgtReqModalShow: false});
            if(this.state.agtMonitor.recvReqActType == 1){
                this.btnInterceptOnClick();
            }else if(this.state.agtMonitor.recvReqActType == 2){
                this.btnJointalkOnClick();
            }
            this.state.agtMonitor.recvReqActType = -1;
        }else{

        }
    }  


    /**
     * 取消监听事件
     */
    onUnListen = () => { 
        let iconStatus = this.state.iconStatus;
        iconStatus.btnJointalk = true;
        iconStatus.btnIntercept = true;
        iconStatus.btnDisconCall = true;

        if(this.state.agtMonitor.phoneObj.state.phone.rights.logoutAgt){
            iconStatus.btnLogoutAgt = true;
        }
        if(this.state.agtMonitor.phoneObj.state.phone.rights.dialOut){
            iconStatus.btnDialAgt = true;
        }
        if(this.state.agtMonitor.phoneObj.state.phone.rights.agtReq){
            iconStatus.btnReqAgt = true;
        }
        if(this.state.agtMonitor.phoneObj.state.phone.rights.agtListen){
            iconStatus.btnListen = true;
        }

        this.setState({btnListenStatus: 0, iconStatus: iconStatus, tableDisabled: false})
    }  


    /**
     * 加入通话事件
     */
    onJoinAgtTalk = () => { 
        let iconStatus = this.state.iconStatus;
        iconStatus.btnListen = true;
        iconStatus.btnIntercept = true;
        iconStatus.btnDisconCall = true;
        this.setState({iconStatus: iconStatus, btnJointalkStatus: 1});
    }   


    /**
     * 退出通话事件
     */
    onExitAgtTalk = () => { 
        this.setState({btnJointalkStatus: 0});
        this.onUnListen();
    }
    
    
    /**
     * 强拆事件
     */
    onDisconncall = () => { 
        this.onListen();
	    this.state.agtMonitor.phoneObj.ztoDialog("message","强拆成功");
    }


    /**
     * 拦截事件
     */
    onInterceptTalk = () => { 
        this.onUnListen();
    	this.state.agtMonitor.phoneObj.ztoDialog("message","拦截成功");
    }     


    /**
     * 请求成功事件
     */
    onAgtReqAct = () => {  
        this.state.agtMonitor.reqAgtTmCnt = 30;

        let iconStatus = this.state.iconStatus;
        iconStatus.btnSendReq = true;
        var reqText = "向["+this.state.agtMonitor.agtInfo[0]+"]发送请求。等待应答:";

        let lblReqAgtInfo = reqText + this.state.agtMonitor.reqAgtTmCnt;
        this.setState({lblReqAgtInfo: lblReqAgtInfo, iconStatus: iconStatus})

        if(this.state.agtMonitor.tmReqAgt !== undefined && this.state.agtMonitor.tmReqAgt > 0) {
            clearInterval(this.state.agtMonitor.tmReqAgt);
        }

        this.state.agtMonitor.tmReqAgt = setInterval(() => {
            this.state.agtMonitor.reqAgtTmCnt = this.state.agtMonitor.reqAgtTmCnt! - 1;
            let lblReqAgtInfo = reqText + this.state.agtMonitor.reqAgtTmCnt;
            this.setState({lblReqAgtInfo: lblReqAgtInfo})
            if(this.state.agtMonitor.reqAgtTmCnt<=0){
                lblReqAgtInfo = "向["+this.state.agtMonitor.agtInfo[0]+"]发送请求。未应答";
                clearInterval(this.state.agtMonitor.tmReqAgt);
                let iconStatus = this.state.iconStatus;
                iconStatus.btnSendReq = false;
                this.setState({lblReqAgtInfo: lblReqAgtInfo, iconStatus: iconStatus})
            }
        },1000);
    }   


    /**
     * 接收请求事件
     */
    onAcceptAgtReq = () => { 
        if(this.state.agtMonitor.tmReqAgt > 0) {
            clearInterval(this.state.agtMonitor.tmReqAgt);
        }
        this.state.agtMonitor.tmReqAgt = 0;
        var reqText = "向["+this.state.agtMonitor.agtInfo[0]+"]发送请求。已接受";
        this.setState({lblReqAgtInfo: reqText});
    }      
    

    /**************************接收请求对话框开始***************************/
    //接收到请求
    onRecvAgtReq = (srcAgtId?: any, srcAgtName?: any, tmTime?: any, actType?: any, callId?: any, content?: any) => {
        this.state.agtMonitor.recvReqAgtId = srcAgtId;
        this.state.agtMonitor.recvReqActType = actType;
        
        let lblRecvReqAgtInfo = "接收到"+srcAgtId+"的["+this.getReqActType(actType)+"]请求！";
        let lblRecvReqAgtMemo = "备注：" + content;
        this.state.agtMonitor.reqRecvAgtTmCnt = 30;
        let btnAcceptReq = "接收("+this.state.agtMonitor.reqRecvAgtTmCnt+")";
        this.setState({lblRecvReqAgtInfo: lblRecvReqAgtInfo, lblRecvReqAgtMemo: lblRecvReqAgtMemo, recvAgtReqModalShow: true, selectedValue: [srcAgtId], btnAcceptReq: btnAcceptReq, tableDisabled: true });
        
        if(this.state.agtMonitor.tmRecvReqAgt !== undefined && this.state.agtMonitor.tmRecvReqAgt > 0){
            clearInterval(this.state.agtMonitor.tmRecvReqAgt);
        }

        this.state.agtMonitor.tmRecvReqAgt = setInterval(()=>{
            this.state.agtMonitor.reqRecvAgtTmCnt = this.state.agtMonitor.reqRecvAgtTmCnt! - 1;
            let btnAcceptReq = "接收("+this.state.agtMonitor.reqRecvAgtTmCnt+")";
            this.setState({btnAcceptReq: btnAcceptReq });
            if(this.state.agtMonitor.reqRecvAgtTmCnt<=0){
                clearInterval(this.state.agtMonitor.tmRecvReqAgt);
                this.btnCloseRecvReqOnClick();
            }
        }, 1000);
    }


    /**
     * 
     * @param actType 
     * @returns 
     */
    getReqActType = (actType?: any) => {
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


    /**
     * 接收请求,对话框的接收按钮确认事件
     */
    btnAcceptReqOnClick = () => { 
        this.state.agtMonitor.phoneObj.state.sdAgent.acceptAgtReq(this.state.agtMonitor.recvReqAgtId);
        if(this.state.agtMonitor.tmRecvReqAgt > 0) {
            clearInterval(this.state.agtMonitor.tmRecvReqAgt);
        }
        this.btnCloseRecvReqOnClick();
        this.btnListenOnClick();
    }

    
    /**
     * 关闭接收请求对话框,对话框的关闭按钮确认事件
     */
    btnCloseRecvReqOnClick = () => { 
        this.setState({recvAgtReqModalShow: false, tableDisabled: false});
    }


    /**************************接收请求对话框结束***************************/
    /**
     * btnRetrieve按钮（拉回按钮）弃用
     */
    onRunAgtInfo = (status?: any, hook?: any, occupy?: any) => {
        
    }
    
    
    /**
     * 监控事件返回
     * 原有的调用的setTableData，bindTrClick，checkAgtIdList等方法只有在这个方法内使用到，
     * 因此将setTableData原有的方法改造(原有的方法一次只进行一行数据的设置)
     * 获取所有的座席状态信息
     */
    onAllAgtInfo = (allAgtInfo?: any, count?: any, init?: boolean) => { 
        if(allAgtInfo === null || allAgtInfo === "" || allAgtInfo === undefined){
            return;
        }
        if(allAgtInfo == this.state.agtMonitor.lastAllAgtInfo) {
            return;
        }
        this.state.agtMonitor.lastAllAgtInfo = allAgtInfo;

        //新的表格数据的动作为直接进行原有数据的覆盖
        var agtIdList = [], infos = [];
        // var status, login, pause, occupy, hook, loginGroups, agtid, agtname, groups;
        var agents = allAgtInfo.split(String.fromCharCode(3));
        let targetTableData: any[] = [];           //目标表格数据,创建一个新的数据进行覆盖
        //state里面的表格数据使用tableData记录
        for(var i = 0; i < agents.length; i++){
            let tableItem: any = {};
            infos = agents[i].split(String.fromCharCode(2));
            tableItem.agtid = infos[0];
            tableItem.agtname = infos[1];
            tableItem.login = infos[2];
            tableItem.pause = infos[3];
            tableItem.status = infos[4].substring(0, 1) == "0" ? parseInt(infos[4].substr(1)) : parseInt(infos[4]);
            tableItem.hook = infos[5];
            tableItem.occupy = infos[6];
            tableItem.loginGroups = infos[7];
            tableItem.groups = infos[8];
            agtIdList.push(tableItem.agtid);
            if(tableItem.login == 0){
                //过滤一些数据
            }else{
                targetTableData.push(tableItem);
            }
            
        }
        
        if(init){
            this.state.tableData = targetTableData ;
        }else{
            this.setState({tableData: targetTableData});
        }

        for(let tableItem of targetTableData){
            //原有设置表格数据的一些动作
            if(this.state.agtMonitor?.agtInfo !== undefined && this.state.agtMonitor.agtInfo[0] == tableItem.agtid){
                this.state.operType = "agt";
                var sAgtInfo = tableItem.agtid+','+tableItem.login+','+tableItem.pause+','+tableItem.status+','+tableItem.hook+','+tableItem.occupy;
                this.state.agtMonitor.agtInfo = sAgtInfo.split(",");
                if(init){
                    this.state.selectedValue = tableItem.agtid ;
                    this.state.dialNo = tableItem.agtid ;
                }else{
                    this.setState({selectedValue: [tableItem.agtid], dialNo: tableItem.agtid});
                }
            }
        }
        
        //修改初始化选中
        if(this.state.agtMonitor.recvReqAgtId !== "" && this.state.agtMonitor.recvReqAgtId !== null && this.state.agtMonitor.recvReqAgtId !== undefined){
            for(let tableItem of targetTableData){
                //选中的动作，设置agtInfo的值，此处在接收到请求的时候的自动弹窗的触发
                if(this.state.agtMonitor.recvReqAgtId == tableItem.agtid){
                    var sAgtInfo = tableItem.agtid+','+tableItem.login+','+tableItem.pause+','+tableItem.status+','+tableItem.hook+','+tableItem.occupy;
                    this.state.agtMonitor.agtInfo = sAgtInfo.split(",");
                }
            }
            //其他的原有的选中值设置
            if(init){
                this.state.selectedValue = this.state.agtMonitor.recvReqAgtId ;
                this.state.dialNo = this.state.agtMonitor.recvReqAgtId ;
            }else{
                this.setState({selectedValue: [this.state.agtMonitor.recvReqAgtId], dialNo:this.state.agtMonitor.recvReqAgtId});
            }
            this.state.agtMonitor.recvReqAgtId = "";
        }
        //原有的内容是进行选中表格数据的动作绑定
        //选中表格数据的方法交由antd的Table属性进行处理

        this.state.agtMonitor.lastAgtIdList = agtIdList;
    }


    /**
     * 设置表格数据,废弃,方法转移到tableColumns渲染
     * 将表格数据的设置改为调用弹窗的时候传入data
     * 原有方法为一次只进行一行数据的写入
     */
    setTableData = (agtid?: any, agtname?: any, status?: any, hook?: any, login?: any, pause?: any, occupy?: any, loginGroups?: any, groups?: any) => {
        
    }

    
    /**
     * 绑定表格行的选中事件,转移到rowSelection的onChange方法
     */
    bindTrClick = () => { }


    /**
     * 数据行选中修改的事件绑定
     */
    onTrClickChange = (selectedRowKeys: any, selectedRows: any) => {
        // selectedRows
        this.state.operType = "agt";
        var sAgtInfo = selectedRows[0].agtid+','+selectedRows[0].login+','+selectedRows[0].pause+','+selectedRows[0].status+','+selectedRows[0].hook+','+selectedRows[0].occupy;
        this.state.agtMonitor.agtInfo = sAgtInfo.split(",");
        this.setState({selectedValue: selectedRowKeys, dialNo: selectedRowKeys});
    }


    //获取话机状态
    getStatusInfo = (status?: any) => {
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
    /*---------一些原有的agtMonitor.js的函数转移结束------------------- */


    /**
     * 位置预留，根据banzhang或者zhuanjie的类型不同，确认不同的页脚
     */
    getFooter = () => {
        return (
            <>
                {this.props.type==="banzhang"?
                <Space>
                    <Button type="primary" onClick={this.btnDialAgtOnClick} disabled={this.state.iconStatus.btnDialAgt}>呼叫座席</Button>
                    <Button type="primary" onClick={this.btnListenOnClick} disabled={this.state.iconStatus.btnListen}>{this.state.btnListenStatus===0?"监听":"取消监听"}</Button>
                    <Button type="primary" onClick={this.btnJointalkOnClick} disabled={this.state.iconStatus.btnJointalk}>{this.state.btnJointalkStatus===0?"加入通话":"退出通话"}</Button>
                    <Button type="primary" onClick={this.btnInterceptOnClick} disabled={this.state.iconStatus.btnIntercept}>拦截</Button>
                    <Button type="primary" onClick={this.btnDisconCallOnClick} disabled={this.state.iconStatus.btnDisconCall}>强拆</Button>
                    <Button onClick={this.onCancel}>
                        取消
                    </Button>
                </Space>
                :
                <Space>
                    <Button onClick={this.onCancel}>
                        取消
                    </Button>
                    <Button onClick={this.btnTransOnClick} type="primary">
                        转接
                    </Button>
                </Space> 
                }
            </>
        );
    }


    //关闭弹窗的事件
    //自定义添加内容
    //如果关闭弹窗的时候处于监听状态，则发送提醒
    onCancel = () => {
        //取消监听 
        if(this.state.btnListenStatus == 1){
            message.info("座席处于监听状态，请先取消监听座席");
            return ;
        }
        this.props.onCancel();
    }


    /**
     * 请求的弹窗
     */
    ReqAgtModal = () => {
        return (
            <>
                <Modal visible={this.state.reqAgtModalShow} onCancel={this.btnCloseReqOnClick} cancelText="关闭"
                    okText="发送" onOk={this.btnSendReqOnClick}  >
                    <div className={styles['text-center']}>
                        <span >{this.state.lblReqAgtInfo}</span>
                    </div>
                    <br/>
                    <div>
                        <Space>
                            <span className={styles['input-label']}>请求类型: </span>
                            <Radio.Group options={this.cbReqAgtTypeOptions} value={this.state.cbReqAgtTypeSelected} onChange={(e)=>{this.setState({cbReqAgtTypeSelected: e.target.value})}}/>
                        </Space>
                    </div>
                    <br/>
                    <div>
                        <Space>
                            <span className={styles['input-label']}>请求备注:</span>
                            <Input className={styles['input']} value={this.state.txtReqAgtInfo} onChange={(e)=>{this.setState({txtReqAgtInfo: e.target.value})}}/>
                        </Space>
                    </div>
                </Modal>
            </>
        );
    }


    /**
     * 接收请求的弹窗
     */
    RecvAgtReqModal = () => {
        return (
            <>
                <Modal visible={this.state.recvAgtReqModalShow} cancelText="关闭" okText={this.state.btnAcceptReq}
                    onOk={this.btnAcceptReqOnClick} onCancel={this.btnCloseRecvReqOnClick}>
                    <div className={styles['text-center']}>
                        <span>{this.state.lblRecvReqAgtInfo}</span>
                    </div>
                    <br />
                    <div className={styles['text-center']}>
                        <span className={styles['recv-memo']}>{this.state.lblRecvReqAgtMemo}</span>
                    </div>
                </Modal>
            </>
        );
    }


    //渲染
    render(){
        return (
            <>
                <Modal visible={this.props.show} width={1024} footer={this.getFooter()} onCancel={this.onCancel}>
                    <Table dataSource={this.state.tableData} columns={this.tableColumns} rowKey={record => record.agtid}        //agentId作为key
                        rowSelection={{
                            type: 'radio',
                            selectedRowKeys: this.state.selectedValue,
                            onChange: this.onTrClickChange,
                        }}
                        rowClassName={(record)=>{
                            return this.state.tableDisabled?styles['row-disabled']:"";
                        }}
                    >
                    </Table>
                </Modal>
                <this.RecvAgtReqModal />
                <this.ReqAgtModal />
            </>
        );
    }
}