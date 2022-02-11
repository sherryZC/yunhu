var isOpen=false;
var chat_cti;//保存当前显示的座席组所属的CTI
var g_organizerId="";
/*var g_tenantsId="010B001E0B8ADD99A8801E78714286E68E690B";
var g_myId="010100E4DB824467219A2A";*/
var g_tenantsId="";
var g_myId="";
var g_url = "http://www.sandicloud.com:9812/ET3/";
var intercon={
	lastOrgId:"",
	lastGrpId:"",
	lastAgtId:"",
	lastCtiId:"",
	lastTabId:"",
	dialGroup:0,
	dialMode:0,
	dialPrefix:"",
	ctiId:"",
	userId:-1,
	userName:"",
	findGropId:"",
	findAgentId:"",
	framework:"",	//框架标识
	frameworkObj:null, //框架对象
	loadAllAgtList:false,//是否加载所有座席
	search:false,
	socket:null
};
$(function(){
	if(window.parent.phone.client=="CS"){
		intercon.initSocket();
	}
	g_tenantsId = window.parent.phone.tenantsId;
	g_myId = window.parent.phone.myId;
	if(g_myId==""||g_tenantsId==""){
		$("#remoteCTI iframe", parent.document).attr('src','404.html');
		return;
	}
	intercon.loadParams();
	if(intercon.loadCtiInfo()==false) return false;
	var pageMask=$("<div id=\"divMask\" class=\"datagrid-mask\"></div>").css({display:"none",width:"100%",height:"100%",zIndex:10000});
	pageMask.appendTo("body");
	var pageMaskMsg=$("<div id=\"divMaskMsg\" class=\"datagrid-mask-msg\"></div>").html("正在加载数据，请稍候。。。").css({display:"none",left:($(document.body).outerWidth(true) - 190) / 2,top:($(window).height() - 45) / 2,zIndex:10001});
	pageMaskMsg.appendTo("body");
	$("#tab_treeOrgSite").click(function(){
		$("#searchTreeOrgSite").hide();
		$("#treeOrgSite").show();
		$("#tab_treeOrgSite").addClass("selected");
		$("#tab_treeSearchSite").removeClass("selected");
	});
	$("#tab_treeSearchSite").click(function(){
		$("#treeOrgSite").hide();
		$("#searchTreeOrgSite").show();
		$("#tab_treeSearchSite").addClass("selected");
		$("#tab_treeOrgSite").removeClass("selected");
	});
	$("#txtFindKey").keyup(function(e){
		if(e.keyCode === 13){
			$("#searchTreeOrgSite").empty();
			$("#tab_treeSearchSite").addClass("selected");
			$("#tab_treeOrgSite").removeClass("selected");
			var value=$(this).val();
			intercon.searchAll(value);
		}
	});
	//$("#divAgent,#divGroupDept").hide();
	intercon.initTopTabs();
	intercon.initOrgSiteTree();
	
	$("#leftnav").click(function(){
		$("#divOrgSite").show(500);
		$("#leftnav,#divAgent,#divNodata").hide(500);
	});
});
intercon.initSocket = function(){
	var socketOne = new WebSocket("ws://127.0.0.1:"+window.parent.phone.connectPort);
	socketOne.onopen = function(){
		intercon.showMessage("连接客户端成功", "互联互通");
		intercon.socket = socketOne;
	}
	socketOne.onclose = function(){
		intercon.showMessage("与客户端连接已断开", "互联互通");
		intercon.socket = null;
	}
	socketOne.onerror = function(){
		alert("无法连接本地客户端，请检查客户端是否开启");
		return;
	}
}
intercon.loadParams=function(){
	//通过URL获取参数
	var searchStr = location.search;
	if($.trim(searchStr)=="") return;
	searchStr = searchStr.substr(1);
	var searchs = searchStr.split("&");
	for(var i=0;i<searchs.length;i++){
		var param=searchs[i].split("=");
		if(param[0].toLowerCase()=="tenantsid"){
			g_tenantsId = param[1];
		}else if(param[0].toLowerCase()=="organizerid"){
			g_organizerId = param[1];
		}else if(param[0].toLowerCase()=="myid"){
			g_myId = param[1];
		}
	}
}

//根据myId加载CTI信息
intercon.loadCtiInfo=function(){
	if(g_myId==""){
		$("body").empty();
		alert("非法访问");
		return false;
	}
	$.ajax({
		type: "get",
		async: false,
  		url:g_url+"webservice/cc/rest/agent/getOrganizerCtiInfo",
  		headers: {
            "organizerId" : g_myId,
            "tenantsId": g_tenantsId
        },
  		success: function(data){
  			if(typeof(data)=="string"){
  				$("body").empty();
  				alert(data);
  				return false;
  			}
  			if(data.length<=0 || data[0].ctiId==""){
  				$("body").empty();
  				alert("未配置CTIID");
  				return false;
  			}
  			intercon.ctiId=data[0].ctiId;
  			intercon.dialGroup=data[0].dialGrp;
  			intercon.dialMode=data[0].dialMode;
  			intercon.dialPrefix=data[0].dialPrefix;
  			return true;
  		},
  		error:function(req,state,err){
  			$("body").empty();
  			alert("加载数据失败");
  			return false;
  		}
	});
}



//初始化组织树
intercon.initOrgSiteTree=function(){
	//if(g_organizerId=='null') g_organizerId="";
	//if(g_tenantsId=='null') g_tenantsId="";
	intercon.showMask();
	$("#treeOrgSite").tree({
		url:g_url+"webservice/cc/rest/agent/getOrganizerCtiTree?organizerIds="+g_organizerId+"&tenantsIds="+g_tenantsId,
		method:'get',
		animate:true,
		rightOper:true,
		onExpand:function(node){
			$(node.target).find("span.tree-right-icon").removeClass().addClass("tree-right-icon icon-down");
		},
		onCollapse:function(node){
			$(node.target).find("span.tree-right-icon").removeClass().addClass("tree-right-icon icon-up");
			$("#ulAgtGroup").empty();
			$("#ulAgent").empty();
			//$("#imgAgtGroup").show();
			//$("#imgAgent").show();
		},
		onClick:function(node){
			intercon.orgTreeNodeClick(node);
		},
		onLoadSuccess:function(node, data){
			if(data.length<=0){
				$("#treeOrgSite").hide();
				intercon.hideMask();
				alert("暂无组织数据");
				return;
			}
			$("#divOrgSite span.tree-right-icon").bind("click",function(){
				var n = $("#treeOrgSite").tree("getNode",$(this).parent());
				if(n.state=='open'){
					$("#treeOrgSite").tree("collapse",n.target);
				}else{
					$("#treeOrgSite").tree("expand",n.target);
				}
			});
			intercon.hideMask();
			
			$("#treeOrgSite>li>div").addClass("treeroot");
		},
		onLoadError:function(arguments){
			alert(arguments.responseText);
			intercon.hideMask();
		}
	});
};

intercon.orgTreeNodeClick=function(node){
	/* if(intercon.lastOrgId==node.id){
		if(intercon.findGropId!=""){
			intercon.findGroup(intercon.findGropId);
		}
		return;
	} */
	intercon.lastOrgId=node.id;
	intercon.lastCtiId=node.attributes.CTI_ID;
	intercon.loadGrpupDept(node.id);
	if(node.children==undefined) return;
	if(node.state=='closed'){
		intercon.oneExpand(node);
		$("#treeOrgSite").tree("expand",node.target);
	}
}

//初始化选项卡
intercon.initTopTabs=function(){
	intercon.lastTabId="divAllTree";
	$("#divTopTabs div").click(function(){
		var id = $(this).attr("id");
		if(id=="searchTools") return;
		$("#divTopTabs div").removeClass("top-tabs-active");
		$(this).addClass("top-tabs-active");
		intercon.tabsClick(id);
	});
}

intercon.tabsClick=function(id){
	intercon.lastTabId=id;
	if(id=="orgAll"){	//全网页面
		$("#divAllTree").show();
		$("#divOrgFav").hide();
		$("#divOrgRecent").hide();
		$("#divSearchList").hide();
	}else if(id=="orgFav"){	//收藏夹页面
		$("#divAllTree").hide();
		$("#divOrgFav").show();
		$("#divOrgRecent").hide();
		$("#divSearchList").hide();
	}else if(id=="orgRecent"){	//最近页面
		$("#divAllTree").hide();
		$("#divOrgFav").hide();
		$("#divOrgRecent").show();
		$("#divSearchList").hide();
	}
}

//只展开一个同级节点
intercon.oneExpand=function(node){
	var pNode = $("#treeOrgSite").tree("getParent",node.target);
	if(pNode!=null){
		if(pNode.children!=null){
			for(var i=0;i<pNode.children.length;i++){
				var n = pNode.children[i];
				if(n.state=='open' && n.children!=null){
					if(n.target==undefined){
						n=$("#treeOrgSite").tree("find",n.id);
					}
					$("#treeOrgSite").tree("collapse",n.target);
				}
			}
		}
	}
}

//加载座席组及部门数据(这一版本不支持加载部门)
intercon.loadGrpupDept=function(organizerId){
	$("#divGroupDept").show(500);
	
	intercon.showMask();
	$("#divNodata").html("").hide();
	$.ajax({
		type: "get",
		async: false,
  		url:g_url+"webservice/cc/rest/agent/getOrganizerCtiGroup",
  		headers: {
            "organizerIds" : organizerId,
            "tenantsIds": g_tenantsId
        },
  		success: function(data){
  			if(typeof(data)=="string"){
  				alert(data);
  			}
  			if(data==null || data.length<=0){
  				//$("#divGroupDept").hide();
  				//$("#divNodata").html("该组织暂无座席组").show();
  				$("#ulAgtGroup").empty();
  				$("#imgAgtGroup").show();
  				$("#ulAgent").empty();
  				$("#imgAgent").show();
  			}else{
  				$("#imgAgtGroup").hide();
  				$("#divGroupDept").show();
  				$("#divNodata").html("").hide();
  				intercon.makeGroupHtml(data);
  			}
  			intercon.hideMask();
  		},
  		error:function(req,state,err){
  			$("#divGroupDept").hide();
  			$("#divNodata").html("加载该组织座席组列表失败").show();
  			intercon.hideMask();
  		}
	});
}

//生成座席组列表
intercon.makeGroupHtml=function(data){
	$("#ulAgtGroup").empty();
	var lihtml=[];
	var grpInfo="";
	chat_cti=intercon.lastCtiId;
	intercon.loadAllAgtList=true;
	$("#ulAgent").empty();
	for(var i=0;i<data.length;i++){
		//grpInfo=data[i].GROUPNAME+"("+data[i].GROUPID+")";
		if(i==data.length-1){
			lihtml.push('<li style="border:0px;height:32px;cursor: pointer;list-style-type:none;" groupId="'+data[i].GROUPID+'">');
		}else{
			lihtml.push('<li style="border:0px;height:32px;cursor: pointer;list-style-type:none;" groupId="'+data[i].GROUPID+'">');
		}
		lihtml.push('<div class="itemIcon icon-group"></div><div class="itemInfo abbr1" style="margin-left:0px;" title="'+data[i].GROUPNAME+'">');
		lihtml.push(data[i].GROUPNAME);
		lihtml.push('</div><div class="itemInfo abbr2">'+data[i].GROUPID+'</div>');
		lihtml.push('<div class="dialTools_agtGrp">');
		lihtml.push('<div class="icon-dial" title="外拨" groupId="'+data[i].GROUPID+'" orgId="'+data[i].ORGANIZER_ID+'"></div>');
		lihtml.push('<div class="icon-trans" style="display:block;" title="转接" groupId="'+data[i].GROUPID+'" orgId="'+data[i].ORGANIZER_ID+'"></div>');
		lihtml.push('</div></li>');
		var orgId=data[i].GROUPID;
		var grpId=$(this).attr("groupId");
		if(intercon.lastOrgId==orgId && intercon.lastGrpId==grpId){
			if(intercon.findAgentId!=""){
				intercon.findAgent(intercon.findAgentId);
			}
			return;
		}
		if(intercon.search==false){
			intercon.lastGrpId=data[i].GROUPID;
			intercon.lastGrpId=data[i].GROUPID;
			if(i==data.length-1){
				intercon.loadAllAgtList=false;
			}
			intercon.loadAgentList();
		}
	}
	$("#ulAgtGroup").append(lihtml.join(''));
	intercon.search=false;	
	$("#divGroupDept ul li").bind({
		click:function(){
			/* $("#divOrgSite").hide(500);
			$("#leftnav,#divAgent").show(500); */
			var orgId=$(this).attr("orgId");
			var grpId=$(this).attr("groupId");
			if(intercon.lastOrgId==orgId && intercon.lastGrpId==grpId){
				if(intercon.findAgentId!=""){
					intercon.findAgent(intercon.findAgentId);
				}
				return;
			}
			intercon.lastGrpId=grpId;
			$("#divGroupDept ul li").removeClass("accordion-li-selected");
			$(this).addClass("accordion-li-selected");
			
			//$("#divGroupDept").find("div.dialTools").hide();
			if(intercon.lastCtiId!=intercon.ctiId || intercon.dialMode==1){
				//$(this).find("div.itemInfo").css("width","55%");
				//$(this).find("div.dialTools").show();
			}
			intercon.loadAgentList();
		},
		mouseover:function(){
			if(intercon.lastCtiId!=intercon.ctiId || intercon.dialMode==1){
				//$(this).find("div.itemInfo").css("width","55%");
				//$(this).find("div.dialTools").show();
				$(this).addClass('tree-node-hover');
			}
		},
		mouseout:function(){
			if($(this).attr("class")=="accordion-li-selected") return;
			//$(this).find("div.itemInfo").css("width","");
			//$(this).find("div.dialTools").hide();
			$(this).removeClass('tree-node-hover');
		}
	});
	
	//外拨点击
	$("#ulAgtGroup li div.icon-dial").bind("click",function(event){
		intercon.runDial($(this).attr("groupId"),"grp");
		event.stopPropagation();
	});
	
	//转接点击
	$("#ulAgtGroup li div.icon-trans").bind("click",function(event){
		intercon.runTrans($(this).attr("groupId"),"grp");
		event.stopPropagation();
	});
	
	if(intercon.findGropId!=""){
		intercon.findGroup(intercon.findGropId);
	}
	intercon.loadAllAgtList=false;
}

//加载座席数据
intercon.loadAgentList=function(){
	$.ajax({
		type: "get",
		async: false,
  		url:g_url+"webservice/cc/rest/agent/getOrganizerCtiAgent",
  		headers: {
            "organizerIds" : intercon.lastOrgId,
            "tenantsIds": g_tenantsId,
            "groupId":intercon.lastGrpId
        },
  		success: function(data){
  			if(typeof(data)=="string"){
  				alert(data);
  			}
  			if(data==null || data.length<=0){
  				$("#divAgent").hide();
  				//$("#divNodata").html("该座席组暂无座席").show();
  				$("#ulAgent").empty();
  				$("#imgAgent").show();
  			}else{
  				$("#imgAgent").hide();
  				$("#divAgent").show();
  				$("#divNodata").html("").hide();
  				intercon.makeAgentHtml(data,true);//true表示从服务器下载数据生成的情况，而false表示通过搜索方式得到的数据展示
  			}
  		},
  		error:function(req,state,err){
  			$("#divAgent").hide();
  			$("#divNodata").html("加载该座席组座席列表失败").show();
  		}
	});
}

//修改---添加聊天图标
intercon.makeAgentHtml=function(data,flag){	
	if(intercon.loadAllAgtList==false){
		$("#ulAgent").empty();
	}
	var lihtml=[];
	var agtInfo = "";
	var chatId="";
	//chat_cti;
	for(var i=0;i<data.length;i++){
		if(flag==true){
			chatId=chat_cti+"_"+data[i].AGENTID;
		}
		else{
			chatId=data[i].ctiId+"_"+data[i].AGENTID;
		}
		//agtInfo = data[i].NAME+"(" + data[i].AGENTID + ")";
		if(i==data.length-1){
			lihtml.push('<li style="border:0px;height:32px;cursor: pointer;list-style-type:none;" agentId="'+data[i].AGENTID+'">');
		}else{
			lihtml.push('<li style="border:0px;height:32px;cursor: pointer;list-style-type:none;" agentId="'+data[i].AGENTID+'">');
		}
		lihtml.push('<div class="itemIcon icon-agt"></div><div class="itemInfo abbr1" style="margin-left:0px;" title="'+data[i].NAME+'">');
		lihtml.push(data[i].NAME);
		lihtml.push('</div><div class="itemInfo abbr2">'+data[i].AGENTID+'</div>');
		lihtml.push('<div class="itemInfo abbr3" style="margin-left:14%">'+data[i].GROUPS+'</div>')
		lihtml.push('<div class="dialTools_agtGrp">');
		if(!flag){
			lihtml.push('<div class="icon-dial" title="外拨" agentId="'+data[i].AGENTID+'" ctiId="'+data[i].ctiId+'"></div>');
			lihtml.push('<div class="icon-trans" style="display:block;" title="转接" agentId="'+data[i].AGENTID+'" ctiId="'+data[i].ctiId+'"></div>');
		}
		else{
			lihtml.push('<div class="icon-dial" title="外拨" agentId="'+data[i].AGENTID+'"></div>');
			lihtml.push('<div class="icon-trans" style="display:block;" title="转接" agentId="'+data[i].AGENTID+'"></div>');
		}
		
		//lihtml.push('<div class="icon-msg" title="聊天" xxim_onename="'+data[i].NAME+'" data-id="'+chatId+'"  agentId="'+data[i].AGENTID+'"></div>');
		lihtml.push('</div></li>');
	}
	$("#ulAgent").append(lihtml.join(''));	
	$("#divAgent ul li").bind({
		click:function(){
			$("#divAgent ul li").removeClass("accordion-li-selected");
			$(this).addClass("accordion-li-selected");
			$(this).find("div.dialTools").show();
		},
		mouseover:function(){
			$(this).addClass('tree-node-hover');
		},
		mouseout:function(){
			if($(this).attr("class")=="accordion-li-selected") return;
			$(this).removeClass('tree-node-hover');
		}
	});
	if(intercon.loadAllAgtList==false){
		//外拨点击
		$("#ulAgent li div.icon-dial").bind("click",function(){
			if($(this).attr("ctiId")!=undefined){
				intercon.lastCtiId = $(this).attr("ctiId");
			}
			intercon.runDial($(this).attr("agentId"),"agt");
		});
		//聊天点击
		/* $("#ulAgent li div.icon-msg").bind("click",function(){
			if(isOpen==true){
				xxim.popchatbox($(this));
				WebChat.getPresence($(this).attr('data-id'));
				WebChat.getHistory($(this).attr('data-id'),""); //获取聊天消息
				hismap[$(this).attr('data-id')]="";  //表示第一次获取
			}
			else{
				alert("暂无法使用聊天功能");
			}
		}); */
		//转接点击
		$("#ulAgent li div.icon-trans").bind("click",function(){
			if($(this).attr("ctiId")!=undefined){
				intercon.lastCtiId = $(this).attr("ctiId");
			}
			intercon.runTrans($(this).attr("agentId"),"agt");
		});
	}
	if(intercon.findAgentId!=""){
		intercon.findAgent(intercon.findAgentId);
	}
}

//显示加载层
intercon.showMask=function(){
	$("#divMask,#divMaskMsg").show();
}

//隐藏加载层
intercon.hideMask=function(){
	$("#divMask,#divMaskMsg").hide();
}

//外拨
intercon.runDial=function(dnis,type){
	if(window.parent.phone.client=="CS"){
		intercon.runCsAgentDial(dnis, type);
	}
	else{
		intercon.runSdAgentDial(dnis,type);
	}
}

//转接
intercon.runTrans=function(dnis,type){
	if(window.parent.phone.client=="CS"){
		intercon.runCsAgentTrans(dnis, type);
	}
	else{
		intercon.runSdAgentTrans(dnis,type);
	}
}

//SdAgent第三方框架外拨
intercon.runSdAgentDial=function(dnis,type){
	//本地CTI
	if(intercon.lastCtiId==intercon.ctiId){
		if(type=="agt"){
			intercon.dowithMessage({'act':'callRemote','dnis':dnis,'dialType':'X'},'*');
		}else{
			//允许外拨本地座席组
			if(intercon.dialMode==1){
				intercon.dowithMessage({'act':'callRemote','dnis':dnis,'dialType':'G'},'*');
			}
		}
	}else{
		var dialNumber = intercon.getDialNumber(dnis,window.parent[0].phone.userCode.split('@')[0],type);
		if(intercon.dialMode==1){
			intercon.dowithMessage({'act':'callRemote','dnis':dialNumber,'dialType':'R'},'*');
		}else{
			intercon.dowithMessage({'act':'callRemote','dnis':dialNumber,'dialType':'X'},'*');
		}
	}
}
//CS客户端外拨
intercon.runCsAgentDial=function(dnis,type){
	if(intercon.socket == null)
	{
		alert("客户端未打开！");
		return;
	}
	//本地CTI
	if(intercon.lastCtiId==intercon.ctiId){
		if(type=="agt"){
		    intercon.sendSocketMsg('call',dnis,'X');
		}else{
			if(intercon.dialMode==1){//允许外拨本地座席组
				intercon.sendSocketMsg('call',dnis,'G');
			}
		}
	}else{
		var dialNumber = intercon.getDialNumber(dnis,window.parent[0].phone.userCode.split('@')[0],type);
		if(intercon.dialMode==1){
			intercon.sendSocketMsg('call',dialNumber,'R');
		}else{
			intercon.sendSocketMsg('call',dialNumber,'X');
		}
	}
}
//SdAgent第三方框架转接
intercon.runSdAgentTrans=function(dnis,type){
	//本地CTI
	if(intercon.lastCtiId==intercon.ctiId){
		if(type=="agt"){
			intercon.dowithMessage({'act':'dialTrans','dnis':dnis},'*');
		}else{
			intercon.dowithMessage({'act':'dialTransGroup','dnis':dnis},'*');
		}
	}else{
		var dialNumber = intercon.getDialNumber(dnis,window.parent[0].phone.userCode.split('@')[0],type);
		var transNO = dialNumber.split("*")[0];
		intercon.dowithMessage({'act':'remoteCTITrans','dnis':transNO},'*');
	}
}
//CS客户端转接
intercon.runCsAgentTrans=function(dnis,type){
	if(intercon.socket == null)
	{
		alert("客户端未打开！");
		return;
	}
	//本地CTI
	if(intercon.lastCtiId==intercon.ctiId){
		if(type=="agt"){
			intercon.sendSocketMsg('dialTrans',dnis,'');
		}else{
			intercon.sendSocketMsg('dialTransGroup',dnis,'');
		}
	}else{
		var dialNumber = intercon.getDialNumber(dnis,window.parent[0].phone.userCode.split('@')[0],type);
		var transNO = dialNumber.split("*")[0];
		intercon.sendSocketMsg('remoteCTITrans',transNO,'');
	}
}
//CS客户端socket消息发送
intercon.sendSocketMsg = function(act,dnis,type){
	var msgObject = new Object();
	msgObject.act = act;
	msgObject.dnis = dnis;
	msgObject.type = type;
	if(intercon.socket!=null){
		intercon.socket.send(JSON.stringify(msgObject)+"\0");
	}
}
intercon.getDialNumber=function(dnis,agentId,type){
	var dialStr = "";
	if(type=="agt"){
		dialStr=intercon.lastCtiId+"2"+dnis+"*"+intercon.ctiId+"2"+agentId;
	}else{
		var grpNo=intercon.letterToNumber(dnis.substring(0,1))+dnis.substring(1);
		dialStr=intercon.lastCtiId+"3"+grpNo+"*"+intercon.ctiId+"2"+agentId;		
	}
	return dialStr;
}
//通过搜索展示的座席组列表
intercon.makeGroupHtmlBySearch=function(data){
	$("#ulAgtGroup").empty();
	var lihtml=[];
	var grpInfo="";
	intercon.loadAllAgtList=true;
	$("#ulAgent").empty();
	for(var i=0;i<data.length;i++){
		//grpInfo=data[i].GROUPNAME+"("+data[i].GROUPID+")";
		if(i==data.length-1){
			lihtml.push('<li style="border:0px;height:32px;cursor: pointer;list-style-type:none;" orgId="'+data[i].ORGANIZER_ID+'" groupId="'+data[i].GROUPID+'">');
		}else{
			lihtml.push('<li style="border:0px;height:32px;cursor: pointer;list-style-type:none;" orgId="'+data[i].ORGANIZER_ID+'" groupId="'+data[i].GROUPID+'">');
		}
		lihtml.push('<div class="itemIcon icon-group"></div><div class="itemInfo abbr1" style="margin-left:0px;" title="'+data[i].GROUPNAME+'">');
		lihtml.push(data[i].GROUPNAME);
		lihtml.push('</div><div class="itemInfo abbr2">'+data[i].GROUPID+'</div>');
		lihtml.push('<div class="dialTools_agtGrp">');
		lihtml.push('<div class="icon-dial" title="外拨" groupId="'+data[i].GROUPID+'" orgId="'+data[i].ORGANIZER_ID+'" ctiId="'+data[i].ctiId+'"></div>');
		lihtml.push('<div class="icon-trans" style="display:block;" title="转接" groupId="'+data[i].GROUPID+'" orgId="'+data[i].ORGANIZER_ID+'"  ctiId="'+data[i].ctiId+'"></div>');
		lihtml.push('</div></li>');
		var orgId=data[i].GROUPID;
		var grpId=$(this).attr("groupId");
		if(intercon.lastOrgId==orgId && intercon.lastGrpId==grpId){
			if(intercon.findAgentId!=""){
				intercon.findAgent(intercon.findAgentId);
			}
			return;
		}
		intercon.lastGrpId=grpId;
		//intercon.loadAgentList();
	}
	$("#ulAgtGroup").append(lihtml.join(''));	
	$("#divGroupDept ul li").bind({
		click:function(){
			intercon.search=true;
			$("#searchTreeOrgSite").hide();
			$("#treeOrgSite").show();
			$("#ulAgtGroup").empty();
			$("#ulAgent").empty();
			intercon.tabsClick("orgAll");
			//查找座席组标识
			intercon.findGropId = $(this).attr("groupId");
			var orgId = $(this).attr("orgId");
			//alert(intercon.findGropId+"   "+orgId);
			intercon.getOrgLevel(orgId,true);
		},
		mouseover:function(){
			if(intercon.lastCtiId!=intercon.ctiId || intercon.dialMode==1){
				//$(this).find("div.itemInfo").css("width","55%");
				//$(this).find("div.dialTools").show();
				$(this).addClass('tree-node-hover');
			}
		},
		mouseout:function(){
			if($(this).attr("class")=="accordion-li-selected") return;
			//$(this).find("div.itemInfo").css("width","");
			//$(this).find("div.dialTools").hide();
			$(this).removeClass('tree-node-hover');
		}
	});
	
	//外拨点击
	$("#ulAgtGroup li div.icon-dial").bind("click",function(event){
		//alert($(this).attr("groupId"));
		intercon.lastCtiId = $(this).attr("ctiId");
		intercon.runDial($(this).attr("groupId"),"grp");
		event.stopPropagation();
	});
	
	//转接点击
	$("#ulAgtGroup li div.icon-trans").bind("click",function(event){
		intercon.lastCtiId = $(this).attr("ctiId");
		intercon.runTrans($(this).attr("groupId"),"grp");
		event.stopPropagation();
	});
	
	if(intercon.findGropId!=""){
		intercon.findGroup(intercon.findGropId);
	}
	intercon.loadAllAgtList=false;
}
intercon.makeOrgHtmlBySearch=function(data){
	var lihtml=[];
	var dType = "";
	for(var i=0;i<data.length;i++){
		dType=data[i].dataType;
		lihtml.push('<dd dataType="'+dType+'" dataId="'+data[i].id+'" orgId="'+data[i].organizerId+'" grps="'+data[i].groups+'" ctiId="'+data[i].ctiId+'">');
		lihtml.push('<div id="_easyui_tree_2" class="tree-node"><span class="tree-indent"></span><span class="tree-hit tree-collapsed"></span><span class="tree-icon tree-folder "></span><span class="tree-title">');
		lihtml.push(data[i].name);
		lihtml.push('</span></div>');
		lihtml.push('</dd>');
	}
	$("#searchTreeOrgSite").append(lihtml.join(''));
	$('#searchTreeOrgSite dd').bind('click',function(){
		$("#searchTreeOrgSite").hide();
		$("#treeOrgSite").show();
		$("#tab_treeOrgSite").addClass("selected");
		$("#tab_treeSearchSite").removeClass("selected");
		$("#ulAgtGroup").empty();
		$("#ulAgent").empty();
		$('#searchTreeOrgSite dd').removeClass('tree-node-selected');
		$(this).addClass('tree-node-selected');
		intercon.tabsClick("orgAll");
		var orgId = $(this).attr("orgId");
		//alert(intercon.findGropId+"   "+orgId);
		intercon.getOrgLevel(orgId,true);
	});
	$('#searchTreeOrgSite dd').bind({
		mouseover:function(){
			$(this).addClass('tree-node-hover');
		},
		mouseout:function(){
			$(this).removeClass('tree-node-hover');
		}
	});
}
intercon.searchAll=function(key){
	if($.trim(key)==""){
		$("#"+intercon.lastTabId).show();
		$("#divSearchList").hide();
		$("#divSearchList").empty();
		return;
	}
	
	intercon.showMask();
	$.ajax({
		type: "get",
		async: false,
  		url:g_url+"webservice/cc/rest/agent/getAllOrgGrpAgt",
  		headers: {
            "tenantsIds": g_tenantsId,
            "findKey": encodeURIComponent(key)
        },
  		success: function(data){
  			if(typeof(data)=="string"){
  				$("body").empty();
  				intercon.hideMask();
  				alert(data);
  				return;
  			}
  			
  			intercon.makeSearchRlt(data);
  			intercon.hideMask();
  		},
  		error:function(req,state,err){
  			intercon.hideMask();
  			alert("查询数据失败");
  		}
	});
}
//对搜索结果进行处理
intercon.makeSearchRlt=function(data){
	var dType = "";
	var org=new Array(),agtGroup=new Array(),agent=new Array();
	var rowORG={};
	for(var i=0;i<data.length;i++){
		dType=data[i].dataType;
		data[i].ctiId = intercon.findCtiIdByOrgId(data[i].organizerId);
		if(dType=="ORG"){
			org[org.length]=data[i];
		}else if(dType=="GRP"){
			var rowGRP={};
			rowGRP.ctiId=data[i].ctiId;
			rowGRP.GROUPID=data[i].id;
			rowGRP.GROUPNAME=data[i].name;
			rowGRP.ORGANIZER_ID=data[i].organizerId;
			agtGroup[agtGroup.length]=rowGRP;
		}else if(dType=="AGT"){
			var rowAGT={};
			rowAGT.ctiId=data[i].ctiId;
			rowAGT.AGENTID=data[i].id;
			rowAGT.GROUPS=data[i].groups;
			rowAGT.NAME=data[i].name;
			rowAGT.ORGANIZERID=data[i].organizerId;
			agent[agent.length]=rowAGT;
		}else{
			org[org.length]=data[i];
		}
	}
	if(org.length==0){
		$("#treeOrgSite").hide();
		$("#searchTreeOrgSite").show();
	}
	else{
		$("#treeOrgSite").hide();
		$("#searchTreeOrgSite").show();
		intercon.makeOrgHtmlBySearch(org);
	}
	if(agtGroup.length==0){
		$("#ulAgtGroup").empty();
		$("#imgAgtGroup").show();
	}
	else{
		$("#imgAgtGroup").hide();
		intercon.makeGroupHtmlBySearch(agtGroup);
	}
	if(agent.length==0){
		$("#ulAgent").empty();
		$("#imgAgent").show();
	}
	else{
		$("#imgAgent").hide();
		intercon.makeAgentHtml(agent,false);
	}
	intercon.hideMask();
}

//获取组织架构层级
intercon.getOrgLevel=function(id,bSelect){
	var node = $("#treeOrgSite").tree("find",id);
	var obj=$('#_easyui_tree_'+id);
	if(node==null) return "-";
	var s = node.text;
	if(bSelect==true){
		$("#treeOrgSite").tree("select",node.target);
		intercon.orgTreeNodeClick(node);
		$("#treeOrgSite").tree("scrollTo",node.target);
	}
	
	for(var i=0;i<50;i++){
		node = $("#treeOrgSite").tree("getParent",node.target);
		if(node==null) break;
		if(bSelect==true){
			$("#treeOrgSite").tree("expand",node.target);
		}
		s = node.text + "-" + s;
	}
	return s;
}

intercon.findCtiIdByOrgId=function(orgId){
	var node = $("#treeOrgSite").tree("find",orgId);
	if(node==null) return "";
	return node.attributes.CTI_ID;
}

//定位座席组
intercon.findGroup=function(grpId){
	intercon.findGropId="";
	$("#divGroupDept ul li").each(function(i){
		if(grpId==$(this).attr("groupId")){
			$(this).click();
			return false;
		}
	});
}

intercon.findAgent=function(agtId){
	intercon.findAgentId = "";
	$("#divAgent ul li").each(function(i){
		if(agtId==$(this).attr("agentId")){
			$(this).click();
			return false;
		}
	});
}

intercon.letterToNumber = function(c){
	var letter=c.toUpperCase();
	switch(letter){
		case "A":
			return 21;
		case "B":
			return 22;
		case "C":
			return 23;
		case "D":
			return 31;
		case "E":
			return 32;
		case "F":
			return 33;
		case "G":
			return 41;
		case "H":
			return 42;
		case "I":
			return 43;
		case "J":
			return 51;
		case "K":
			return 52;
		case "L":
			return 53;
		case "M":
			return 61;
		case "N":
			return 62;
		case "O":
			return 63;
		case "P":
			return 71;
		case "Q":
			return 72;
		case "R":
			return 73;
		case "S":
			return 74;
		case "T":
			return 81;
		case "U":
			return 82;
		case "V":
			return 83;
		case "W":
			return 91;
		case "X":
			return 92;
		case "Y":
			return 93;
		case "Z":
			return 94;
	}
}

intercon.showMessage=function(msg,title){
	$.messager.show({
		title:title==undefined?"系统提示":title,
		msg:msg,
		iconCls:"icon-tip",
		timeout:3000
	});
}

intercon.dowithMessage = function(message,sender){
	if(window.parent[0].phone.agtStatus==3){
		intercon.showMessage("请先注册座席","错误消息");
		return;
	}
	
	if(message.act == 'callRemote'){
		if(window.parent[0].phone.callStatus!=0||window.parent[0].phone.occupy==1){
			intercon.showMessage("非空闲状态，无法外拨","错误消息");
			return;
		}
		if(window.parent[0].phone.callStatus!=0){
			$.confirm({
		        title: '确认',
		        content: '确定进行三方通话？',
		        type: 'green',
		        icon: 'glyphicon glyphicon-question-sign',
		        buttons: {
		            ok: {
		                text: '确认',
		                btnClass: 'btn-primary',
		                action: function() {
		                	window.parent[0].SdAgent.dialout(message.dnis,message.dialType,0);
		                }
		            },
		            cancel: {
		                text: '取消',
		                btnClass: 'btn-primary'
		            }
		        }
		    });
			return;
		}
		window.parent[0].SdAgent.dialout(message.dnis,message.dialType,0);
		return;
	}else if(message.act=='dialTrans'){
		if(window.parent[0].phone.callStatus != 2){
			intercon.showMessage("非通话状态，无法转接","错误消息");
			return;
		}
		if(window.parent[0].phone.agtId==message.dnis){
			intercon.showMessage("不能对您自己使用该功能","错误消息");
			return;
		}
		window.parent[0].SdAgent.agtReturnIVR("1",window.parent[0].phone.lastCall.callId,message.dnis+",");
		return;
	}else if(message.act=='dialTransGroup'){
		if(window.parent[0].phone.callStatus != 2){
			intercon.showMessage('非通话状态，无法转接','错误消息');
			return;
		}
		window.parent[0].SdAgent.agtReturnIVR("1",window.parent[0].phone.lastCall.callId,","+message.dnis);
		return;
	}else if(message.act=='remoteCTITrans'){
		if(window.parent[0].phone.callStatus != 2){
			intercon.showMessage('非通话状态，无法转接','错误消息');
			return;
		}
		window.parent[0].SdAgent.agtReturnIVR("9",window.parent[0].phone.lastCall.callId,",,"+message.dnis+"*"+ window.parent[0].phone.lastCall.ani);
		return;
	}
	
}