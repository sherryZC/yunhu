(function($) {
	$.date = {};		//日期函数
	$.validate = {};	//验证函数
	$.sdcommon = {};	//通用函数
	$.cookies = {};		//cookies管理
	
	$.extend(jQuery.date,{
		//两个日期的时间差
		dateDiff:function(strInterval,dtStart,dtEnd){ 
		    if (typeof dtStart == 'string' ){    
		    	dtStart = StringToDate(dtStart);   
		    } 
			return dtStart.DateDiff(strInterval,dtEnd);
		},
		dateAdd:function(strInterval,Number,dt){
			if (typeof dt == 'string' ){    
		    	dt = StringToDate(dt);   
		    }
			return dt.DateAdd(strInterval, Number);
		},
		dateFormat:function(dt,formatStr){
			if (typeof dt == 'string' ){
		    	dt = StringToDate(dt);   
		    }else if(typeof dt == 'number'){
		    	var str = formatStr;
		    	var ss = (dt%60);
		    	ss = ss>9?ss:'0' + ss;
		    	var mm = parseInt(dt/60);
		    	var hh = parseInt(mm/60);
		    	mm = mm%60;
		    	mm = mm>9?mm:'0'+mm;
		    	hh = hh>9?hh:'0'+hh;
		    	
		    	str = str.replace(/hh|HH/,hh);
		    	str = str.replace(/mm/,mm);
		    	str = str.replace(/ss/,ss);
		    	return str;
		    }
			return dt.Format(formatStr);
		},
		weekNumOfYear:function(dt){
			if (typeof dt == 'string' ){    
		    	dt = StringToDate(dt);   
		    }
			return dt.WeekNumOfYear();
		},
		stringToDate:function(DateStr){
			return StringToDate(DateStr);
		}
	});
	
	$.extend(jQuery.validate, {
		 isEmail: function(email) {
		     return /^.+@.+\..{2,3}$/g.test(email);
		 },
		 isInt: function(str) {
		     return /^\d+$/img.test(str);
		 },
	    //是否为日期
	    isDate: function(strDate) {
	        var ls_regex = "^((((((0[48])|([13579][26])|([2468][048]))00)|([0-9][0-9]((0[48])|([13579][26])|([2468][048]))))-02-29)|(((000[1-9])|(00[1-9][0-9])|(0[1-9][0-9][0-9])|([1-9][0-9][0-9][0-9]))-((((0[13578])|(1[02]))-31)|(((0[1,3-9])|(1[0-2]))-(29|30))|(((0[1-9])|(1[0-2]))-((0[1-9])|(1[0-9])|(2[0-8]))))))$";
	        var exp = new RegExp(ls_regex, "i");
	        return exp.test(strDate);
	    },
	    //是否为时间
	    isTime: function(strTime) {
	        var a = strTime.match(/^(\d{2,2})(:)?(\d{2,2})\2(\d{2,2})$/);
	        if (!a || a[1] > 23 || a[3] > 59 || a[4] > 59) return false;
	        return true;
	    },
	    //是否为手机号码
	    isMobilePhone:function(phone){
	    	return /^1[3|4|5|8][0-9]\d{8}$/.test(phone);
	    }
	});
	
	$.extend(jQuery.sdcommon, {
		getStrInStrList:function(strListPara, nIdx, strDelimit){
			return getStrInStrList(strListPara, nIdx, strDelimit);
		},
		secondToTime:function(s){
			if(s===undefined) return "";
			var mathSecond=Math.round(s);
			var hours=Math.floor(mathSecond/3600);
			var minutes=Math.floor((mathSecond % 3600)/60);
			var seconds=((mathSecond % 3600)%60)%60;
			return (hours>9?hours:"0"+hours)+":" 
				+ (minutes>9?minutes:"0"+minutes) +":" 
				+ (seconds>9?seconds:"0"+seconds);
		},
		formatMoney:function(s,type){
			return formatMoney(s,type);
		}
	});
	
	
	$.extend(jQuery.cookies,{
		get:function(name){
			return cookies(name);
		},
		set:function(name,value,options){
			return cookies(name,value,options);
		},
		del:function(name){
			return cookies(name,null);
		}
	});


	
	
	//---------------------------------------------------   
	// 判断闰年   
	//---------------------------------------------------   
	Date.prototype.isLeapYear = function(){    
	    return (0==this.getYear()%4&&((this.getYear()%100!=0)||(this.getYear()%400==0)));    
	};    
	   
	//---------------------------------------------------   
	// 日期格式化   
	// 格式 YYYY/yyyy/YY/yy 表示年份   
	// MM/M 月份   
	// W/w 星期   
	// dd/DD/d/D 日期   
	// hh/HH/h/H 时间   
	// mm/m 分钟   
	// ss/SS/s/S 秒   
	//---------------------------------------------------   
	Date.prototype.Format = function(formatStr){    
	    var str = formatStr;    
	    var Week = ['日','一','二','三','四','五','六'];   
	   
	    str=str.replace(/yyyy|YYYY/,this.getFullYear());    
	    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));    
	    str=str.replace(/MM/,this.getMonth()+1>9?(this.getMonth()+1).toString():'0' + (this.getMonth()+1));
	    str=str.replace(/M/g,this.getMonth());    
	    str=str.replace(/w|W/g,Week[this.getDay()]);    
	    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());    
	    str=str.replace(/d|D/g,this.getDate());
	    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());    
	    str=str.replace(/h|H/g,this.getHours());    
	    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());    
	    str=str.replace(/m/g,this.getMinutes());    
	    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());    
	    str=str.replace(/s|S/g,this.getSeconds());    
	    return str;    
	};

	//+---------------------------------------------------   
	//| 日期计算   
	//+---------------------------------------------------   
	Date.prototype.DateAdd = function(strInterval, Number) {    
		var dtTmp = this.Format("MM/dd/yyyy hh:mm:ss");
		var dtObj =  StringToDate(this.Format("MM/dd/yyyy hh:mm:ss"));
	    switch (strInterval) {    
	        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));   
	        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number));   
	        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));   
	        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));   
	        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));   
	        case 'q' :return new Date(dtObj.getFullYear(), (dtObj.getMonth()) + Number*3, dtObj.getDate(), dtObj.getHours(), dtObj.getMinutes(), dtObj.getSeconds());   
	        case 'm' :
	        	var resultDate = new Date(dtObj.getFullYear(), (dtObj.getMonth()) + Number, dtObj.getDate(), dtObj.getHours(), dtObj.getMinutes(), dtObj.getSeconds());
	        	if (dtObj.getMonth() == resultDate.getMonth()) resultDate.setDate(0);
	        	return resultDate;   
	        case 'y' :return new Date((dtObj.getFullYear() + Number), dtObj.getMonth(), dtObj.getDate(), dtObj.getHours(), dtObj.getMinutes(), dtObj.getSeconds());   
	    }   
	};   
	   
	//+---------------------------------------------------   
	//| 比较日期差 dtEnd 格式为日期型或者 有效日期格式字符串   
	//+---------------------------------------------------   
	Date.prototype.DateDiff = function(strInterval, dtEnd) {    
	    var dtStart = this;   
	    //如果是字符串转换为日期型   
	    if (typeof dtEnd == 'string' ){    
	        dtEnd = StringToDate(dtEnd);   
	    }
	    
	    switch (strInterval) {    
	        case 's' :return parseInt((dtEnd - dtStart) / 1000);   
	        case 'n' :return parseInt((dtEnd - dtStart) / 60000);   
	        case 'h' :return parseInt((dtEnd - dtStart) / 3600000);   
	        case 'd' :return parseInt((dtEnd - dtStart) / 86400000);   
	        case 'w' :return parseInt((dtEnd - dtStart) / (86400000 * 7));   
	        case 'm' :return (dtEnd.getMonth()+1)+((dtEnd.getFullYear()-dtStart.getFullYear())*12) - (dtStart.getMonth()+1);   
	        case 'y' :return dtEnd.getFullYear() - dtStart.getFullYear();   
	    }   
	};
	   
	//+---------------------------------------------------   
	//| 日期输出字符串，重载了系统的toString方法   
	//+---------------------------------------------------   
	Date.prototype.toString = function(showWeek){    
	    var myDate= this;   
	    var str = myDate.toLocaleDateString();   
	    if (showWeek){    
	        var Week = ['日','一','二','三','四','五','六'];   
	        str += ' 星期' + Week[myDate.getDay()];   
	    }   
	    return str;   
	};
	   
	//+---------------------------------------------------   
	//| 日期合法性验证   
	//| 格式为：YYYY-MM-DD或YYYY/MM/DD   
	//+---------------------------------------------------   
	function IsValidDate(DateStr){    
	    var sDate=DateStr.replace(/(^\s+|\s+$)/g,''); //去两边空格;    
	    if(sDate=='') return true;    
	    //如果格式满足YYYY-(/)MM-(/)DD或YYYY-(/)M-(/)DD或YYYY-(/)M-(/)D或YYYY-(/)MM-(/)D就替换为''    
	    //数据库中，合法日期可以是:YYYY-MM/DD(2003-3/21),数据库会自动转换为YYYY-MM-DD格式    
	    //var s = sDate.replace(/[\d]{ 4,4 }[\-/]{ 1 }[\d]{ 1,2 }[\-/]{ 1 }[\d]{ 1,2 }/g,'');    
	    if (s=='') //说明格式满足YYYY-MM-DD或YYYY-M-DD或YYYY-M-D或YYYY-MM-D    
	    {    
	        var t=new Date(sDate.replace(/\-/g,'/'));    
	        //var ar = sDate.split(/[-/:]/);    
	        if(ar[0] != t.getYear() || ar[1] != t.getMonth()+1 || ar[2] != t.getDate())    
	        {    
	            //alert('错误的日期格式！格式为：YYYY-MM-DD或YYYY/MM/DD。注意闰年。');    
	            return false;    
	        }    
	    }    
	    else    
	    {    
	        //alert('错误的日期格式！格式为：YYYY-MM-DD或YYYY/MM/DD。注意闰年。');    
	        return false;    
	    }    
	    return true;    
	}    
	   
	//+---------------------------------------------------   
	//| 日期时间检查   
	//| 格式为：YYYY-MM-DD HH:MM:SS   
	//+---------------------------------------------------   
	function CheckDateTime(str){    
	    var reg = /^(\d+)-(\d{ 1,2 })-(\d{ 1,2 }) (\d{ 1,2 }):(\d{ 1,2 }):(\d{ 1,2 })$/;    
	    var r = str.match(reg);    
	    if(r==null)return false;    
	    r[2]=r[2]-1;    
	    var d= new Date(r[1],r[2],r[3],r[4],r[5],r[6]);    
	    if(d.getFullYear()!=r[1])return false;    
	    if(d.getMonth()!=r[2])return false;    
	    if(d.getDate()!=r[3])return false;    
	    if(d.getHours()!=r[4])return false;    
	    if(d.getMinutes()!=r[5])return false;    
	    if(d.getSeconds()!=r[6])return false;    
	    return true;    
	}    
	   
	//+---------------------------------------------------   
	//| 把日期分割成数组   
	//+---------------------------------------------------   
	Date.prototype.toArray = function(){    
	    var myDate = this;   
	    var myArray = Array();   
	    myArray[0] = myDate.getFullYear();   
	    myArray[1] = myDate.getMonth();   
	    myArray[2] = myDate.getDate();   
	    myArray[3] = myDate.getHours();   
	    myArray[4] = myDate.getMinutes();   
	    myArray[5] = myDate.getSeconds();   
	    return myArray;   
	};
	   
	//+---------------------------------------------------   
	//| 取得日期数据信息   
	//| 参数 interval 表示数据类型   
	//| y 年 m月 d日 w星期 ww周 h时 n分 s秒   
	//+---------------------------------------------------   
	Date.prototype.DatePart = function(interval){
	    var myDate = this;   
	    var partStr='';   
	    var Week = ['日','一','二','三','四','五','六'];   
	    switch (interval){
	        case 'y' :partStr = myDate.getFullYear();break;   
	        case 'm' :partStr = myDate.getMonth()+1;break;   
	        case 'd' :partStr = myDate.getDate();break;   
	        case 'w' :partStr = Week[myDate.getDay()];break;   
	        case 'ww' :partStr = myDate.WeekNumOfYear();break;   
	        case 'h' :partStr = myDate.getHours();break;   
	        case 'n' :partStr = myDate.getMinutes();break;   
	        case 's' :partStr = myDate.getSeconds();break;   
	    }   
	    return partStr;   
	};
	   
	//+---------------------------------------------------   
	//| 取得当前日期所在月的最大天数   
	//+---------------------------------------------------   
	Date.prototype.MaxDayOfDate = function(){    
	    var myDate = this;   
	    var ary = myDate.toArray();   
	    var date1 = (new Date(ary[0],ary[1]+1,1));   
	    var date2 = date1.dateAdd(1,'m',1);   
	    var result = dateDiff(date1.Format('yyyy-MM-dd'),date2.Format('yyyy-MM-dd'));   
	    return result;   
	};
	   
	//+---------------------------------------------------   
	//| 取得当前日期所在周是一年中的第几周   
	//+---------------------------------------------------   
	Date.prototype.WeekNumOfYear = function(){    
	    var myDate = this;   
	    var ary = myDate.toArray();   
	    var year = ary[0];   
	    var month = ary[1]+1;   
	    var day = ary[2];   
	    document.write('< script language=VBScript\> \n');   
	    document.write('myDate = DateValue('+month+'-'+day+'-'+year+') \n');   
	    document.write('result = DatePart("ww", '+myDate+') \n');   
	    document.write(' \n');   
	    return result;   
	};
	   
	//+---------------------------------------------------   
	//| 字符串转成日期类型    
	//| 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd   
	//+---------------------------------------------------   
	function StringToDate(DateStr){
		/*
		debugger;
	    var converted = Date.parse(DateStr);   
	    var myDate = new Date(converted);   
	    if (isNaN(myDate)){       
	        var arys= DateStr.split('-');   
	        myDate = new Date(arys[0],--arys[1],arys[2]);   
	    }
	    */
		var myDate = new Date(Date.parse(DateStr.replace(/-/g,"/")));
	    return myDate;   
	}
	
	function getStrInStrList(strListPara, nIdx, strDelimit) {
	    var nPos;
	    var nTag;
	    var i;
	    var strResult;
	    var strList = strListPara;
	    strResult = strList;
	    strList += strDelimit;
	    nPos = 0;
	    for (i = 0; i <= nIdx; i++) {
	        nTag = strList.toString().indexOf(strDelimit, nPos);
	        if (nTag == 0) {
	            strResult = "";
	            break;
	        }
	        strResult = strList.toString().substr(nPos, nTag - nPos);
	        nPos = nTag + strDelimit.toString().length;
	    }
	    return strResult;
	}
	
	function cookies(name, value, options){
		if (typeof value != 'undefined') {
			options = options || {};
			if (value === null) {
				value = '';
				options = $.extend({}, options);
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [ name, '=', encodeURIComponent(value), expires,path, domain, secure ].join('');
		} else {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for ( var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	}
	
	function formatMoney(s, type) {
	    if (/[^0-9\.]/.test(s)) return "0";
	    if (s == null || s == "") return "0";
	    s = s.toString().replace(/^(\d*)$/, "$1.");
	    s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
	    s = s.replace(".", ",");
	    var re = /(\d)(\d{3},)/;
	    while (re.test(s))
	        s = s.replace(re, "$1,$2");
	    s = s.replace(/,(\d\d)$/, ".$1");
	    if (type == 0) {// 不带小数位(默认是有小数位)
	        var a = s.split(".");
	        if (a[1] == "00") {
	            s = a[0];
	        }
	    }
	    return s;
	}
})(jQuery);