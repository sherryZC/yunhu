var displayName = phone.agtId+"_WR"; 
var publicUrl = phone.publicUrl+":";
var realm = publicUrl+"5097";
var publicIdentity = "sip:"+displayName+"@"+realm;
var password = "sd02062320622";
var websocketServerUrl = "wss://"+publicUrl+"7443";
var failCnt = 0;

var sTransferNumber;
        var oRingTone, oRingbackTone;
        var oSipStack, oSipSessionRegister, oSipSessionCall, oSipSessionTransferCall;
        var videoRemote, videoLocal, audioRemote;
        var bFullScreen = false;
        var oNotifICall;
        var bDisableVideo = false;
        var viewVideoLocal, viewVideoRemote, viewLocalScreencast; // <video> (webrtc) or <div> (webrtc4all)
        var oConfigCall;
        var oReadyStateTimer;
 
        C =
        {
            divKeyPadWidth: 220
        };

        window.onload = function () {
//         while(phone.onHookMode==""){
        	while(phone.isLoaded==0){
        		var start = (new Date()).getTime();
                while ((new Date()).getTime() - start < 500) {
                        continue;
                }
        	}
//        	if(phone.onHookMode=="webcall"){
                displayName = phone.agtId+"_WR";
                publicUrl = phone.publicUrl+":";
                websocketServerUrl = "wss://"+publicUrl+"7443";
                realm = publicUrl+"5097";
                publicIdentity = "sip:"+displayName+"@"+realm;
        	settingsSave();
            window.console && window.console.info && window.console.info("location=" + window.location);

            videoLocal = document.getElementById("video_local");
            videoRemote = document.getElementById("video_remote");
            audioRemote = document.getElementById("audio_remote");

            document.onkeyup = onKeyUp;
            document.body.onkeyup = onKeyUp;
            //divCallCtrl.onmousemove = onDivCallCtrlMouseMove;

            // set debug level
            SIPml.setDebugLevel((window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_debug') == "true") ? "error" : "info");

            loadCallOptions();

            // Initialize call button
            uiBtnCallSetText("Call");

            var getPVal = function (PName) {
                var query = window.location.search.substring(1);
                var vars = query.split('&');
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    if (decodeURIComponent(pair[0]) === PName) {
                        return decodeURIComponent(pair[1]);
                    }
                }
                return null;
            }

            var preInit = function () {
                // set default webrtc type (before initialization)
                var s_webrtc_type = getPVal("wt");
                var s_fps = getPVal("fps");
                var s_mvs = getPVal("mvs"); // maxVideoSize
                var s_mbwu = getPVal("mbwu"); // maxBandwidthUp (kbps)
                var s_mbwd = getPVal("mbwd"); // maxBandwidthUp (kbps)
                var s_za = getPVal("za"); // ZeroArtifacts
                var s_ndb = getPVal("ndb"); // NativeDebug

                if (s_webrtc_type) SIPml.setWebRtcType(s_webrtc_type);

                // initialize SIPML5
                SIPml.init(postInit);

                // set other options after initialization
                if (s_fps) SIPml.setFps(parseFloat(s_fps));
                if (s_mvs) SIPml.setMaxVideoSize(s_mvs);
                if (s_mbwu) SIPml.setMaxBandwidthUp(parseFloat(s_mbwu));
                if (s_mbwd) SIPml.setMaxBandwidthDown(parseFloat(s_mbwd));
                if (s_za) SIPml.setZeroArtifacts(s_za === "true");
                if (s_ndb == "true") SIPml.startNativeDebug();

                //var rinningApps = SIPml.getRunningApps();
                //var _rinningApps = Base64.decode(rinningApps);
                //tsk_utils_log_info(_rinningApps);
            }

            oReadyStateTimer = setInterval(function () {
                if (document.readyState === "complete") {
                    clearInterval(oReadyStateTimer);
                    // initialize SIPML5
                    preInit();
                }
            },
            500);
		setTimeout('sipRegister()',500); 
//}
        };

        function postInit() {
            // check for WebRTC support
            if (!SIPml.isWebRtcSupported()) {
                // is it chrome?
                if (SIPml.getNavigatorFriendlyName() == 'chrome') {
                    if (confirm("You're using an old Chrome version or WebRTC is not enabled.\nDo you want to see how to enable WebRTC?")) {
                        window.location = 'http://www.webrtc.org/running-the-demos';
                    }
                    else {
                        window.location = "index.html";
                    }
                    return;
                }
                else {
                    if (confirm("webrtc-everywhere extension is not installed. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
                        window.location = 'https://github.com/sarandogou/webrtc-everywhere';
                    }
                    else {
                        // Must do nothing: give the user the chance to accept the extension
                        // window.location = "index.html";
                    }
                }
            }

            // checks for WebSocket support
            if (!SIPml.isWebSocketSupported()) {
                if (confirm('Your browser don\'t support WebSockets.\nDo you want to download a WebSocket-capable browser?')) {
                    window.location = 'https://www.google.com/intl/en/chrome/browser/';
                }
                else {
                    window.location = "index.html";
                }
                return;
            }

            // FIXME: displays must be per session
            viewVideoLocal = videoLocal;
            viewVideoRemote = videoRemote;

            if (!SIPml.isWebRtcSupported()) {
                if (confirm('Your browser don\'t support WebRTC.\naudio/video calls will be disabled.\nDo you want to download a WebRTC-capable browser?')) {
                    window.location = 'https://www.google.com/intl/en/chrome/browser/';
                }
            }

            //btnRegister.disabled = false;
            document.body.style.cursor = 'default';
            oConfigCall = {
                audio_remote: audioRemote,
                video_local: viewVideoLocal,
                video_remote: viewVideoRemote,
                screencast_window_id: 0x00000000, // entire desktop
                bandwidth: { audio: undefined, video: undefined },
                video_size: { minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
                events_listener: { events: '*', listener: onSipEventSession },
                sip_caps: [
                                { name: '+g.oma.sip-im' },
                                { name: 'language', value: '\"en,fr\"' }
                ]
            };
        }


        function loadCallOptions() {
            if (window.localStorage) {
                var s_value;
                //if ((s_value = window.localStorage.getItem('org.doubango.call.phone_number'))) txtPhoneNumber.value = s_value;
                bDisableVideo = (window.localStorage.getItem('org.doubango.expert.disable_video') == "true");

                //txtCallStatus.innerHTML = '<i>Video ' + (bDisableVideo ? 'disabled' : 'enabled') + '</i>';
            }
        }

        function saveCallOptions() {
            if (window.localStorage) {
                //window.localStorage.setItem('org.doubango.call.phone_number', txtPhoneNumber.value);
                window.localStorage.setItem('org.doubango.expert.disable_video', bDisableVideo ? "true" : "false");
            }
        }



        // sends SIP REGISTER request to login
        function sipRegister() {
            // catch exception for IE (DOM not ready)
            try {
               
                if (window.localStorage) {
                    window.localStorage.setItem('org.doubango.identity.display_name', displayName);
                    window.localStorage.setItem('org.doubango.identity.impi', displayName);
                    window.localStorage.setItem('org.doubango.identity.impu', publicIdentity);
                    window.localStorage.setItem('org.doubango.identity.password', password);
                    window.localStorage.setItem('org.doubango.identity.realm', realm);
                }

                // update debug level to be sure new values will be used if the user haven't updated the page
                SIPml.setDebugLevel((window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_debug') == "true") ? "error" : "info");

                // create SIP stack
                oSipStack = new SIPml.Stack({
                    realm: realm,
                    impi: displayName,
                    impu: publicIdentity,
                    password: password,
                    display_name: displayName,
                    websocket_proxy_url: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.websocket_server_url') : null),
                    outbound_proxy_url: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.sip_outboundproxy_url') : null),
                    ice_servers: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.ice_servers') : null),
                    enable_rtcweb_breaker: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_rtcweb_breaker') == "true" : false),
                    events_listener: { events: '*', listener: onSipEventStack },
                    enable_early_ims: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.disable_early_ims') != "true" : true), // Must be true unless you're using a real IMS network
                    enable_media_stream_cache: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_media_caching') == "true" : false),
                    bandwidth: (window.localStorage ? tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')) : null), // could be redefined a session-level
                    video_size: (window.localStorage ? tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')) : null), // could be redefined a session-level
                    sip_headers: [
                            { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
                            { name: 'Organization', value: 'Doubango Telecom' }
                    ]
                }
                );
                if (oSipStack.start() != 0) {
                	writeLog('Failed to start the SIP stack');
                }
                else{
			failCnt = 0;
			return;
		}	 
            }
            catch (e) {
            	writeLog(e);
            }
            
        }

        // sends SIP REGISTER (expires=0) to logout
        function sipUnRegister() {
            if (oSipStack) {
                oSipStack.stop(); // shutdown all sessions
            }
        }

        // makes a call (SIP INVITE)
        function sipCall(s_type) {
            //if (oSipStack && !oSipSessionCall && !tsk_string_is_null_or_empty(txtPhoneNumber.value)) {
            if (oSipStack && !oSipSessionCall){

                if (window.localStorage) {
                    oConfigCall.bandwidth = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')); // already defined at stack-level but redifined to use latest values
                    oConfigCall.video_size = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')); // already defined at stack-level but redifined to use latest values
                }

                // create call session
                oSipSessionCall = oSipStack.newSession(s_type, oConfigCall);
                // make call
                /* if (oSipSessionCall.call(txtPhoneNumber.value) != 0) {
                    oSipSessionCall = null;
                    txtCallStatus.value = 'Failed to make call';
                    //btnCall.disabled = false;
                    //btnHangUp.disabled = true;
                    return;
                } */
                saveCallOptions();
            }
            else if (oSipSessionCall) {
                //txtCallStatus.innerHTML = '<i>Connecting...</i>';
                console.log("通话状态：连接中");
                oSipSessionCall.accept(oConfigCall);
            }
        }

        // Share entire desktop aor application using BFCP or WebRTC native implementation
        function sipShareScreen() {
            if (SIPml.getWebRtcType() === 'w4a') {
                // Sharing using BFCP -> requires an active session
                if (!oSipSessionCall) {
                    //txtCallStatus.innerHTML = '<i>No active session</i>';
                    console.log("通话状态：没有活动会话");
                    return;
                }
                if (oSipSessionCall.bfcpSharing) {
                    if (oSipSessionCall.stopBfcpShare(oConfigCall) != 0) {
                        //txtCallStatus.value = 'Failed to stop BFCP share';
                        console.log("通话状态：无法停止BFCP共享");
                    }
                    else {
                        oSipSessionCall.bfcpSharing = false;
                    }
                }
                else {
                    oConfigCall.screencast_window_id = 0x00000000;
                    if (oSipSessionCall.startBfcpShare(oConfigCall) != 0) {
                        //txtCallStatus.value = 'Failed to start BFCP share';
                    	console.log("通话状态：无法停止BFCP共享");
                    }
                    else {
                        oSipSessionCall.bfcpSharing = true;
                    }
                }
            }
            else {
                sipCall('call-screenshare');
            }
        }

        // transfers the call
        function sipTransfer() {
            if (oSipSessionCall) {
                var s_destination = prompt('Enter destination number', '');
                if (!tsk_string_is_null_or_empty(s_destination)) {
                    //btnTransfer.disabled = true;
                    if (oSipSessionCall.transfer(s_destination) != 0) {
                        //txtCallStatus.innerHTML = '<i>Call transfer failed</i>';
                        console.log("通话状态：呼叫转移失败");
                        //btnTransfer.disabled = false;
                        return;
                    }
                    //txtCallStatus.innerHTML = '<i>Transfering the call...</i>';
                    console.log("通话状态：呼叫转移中");
                }
            }
        }

        // holds or resumes the call
        function sipToggleHoldResume() {
            if (oSipSessionCall) {
                var i_ret;
                //btnHoldResume.disabled = true;
                //txtCallStatus.innerHTML = oSipSessionCall.bHeld ? '<i>Resuming the call...</i>' : '<i>Holding the call...</i>';
                if(oSipSessionCall.bHeld){
                	console.log("通话状态：恢复通话");
                }else{
                	console.log("通话状态：保持电话");
                }
                i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold();
                if (i_ret != 0) {
                   // txtCallStatus.innerHTML = '<i>Hold / Resume failed</i>';
                    console.log("通话状态：保持/恢复失败");
                    //btnHoldResume.disabled = false;
                    return;
                }
            }
        }

        // Mute or Unmute the call
        function sipToggleMute() {
            if (oSipSessionCall) {
                var i_ret;
                var bMute = !oSipSessionCall.bMute;
                //txtCallStatus.innerHTML = bMute ? '<i>Mute the call...</i>' : '<i>Unmute the call...</i>';
				if(bMute){
					console.log("通话状态：通话静音");
				}else{
					console.log("通话状态：取消静音");
				}
                
                i_ret = oSipSessionCall.mute('audio'/*could be 'video'*/, bMute);
                if (i_ret != 0) {
                    //txtCallStatus.innerHTML = '<i>Mute / Unmute failed</i>';
                    console.log("通话状态：静音/取消静音失败");
                    return;
                }
                oSipSessionCall.bMute = bMute;
                //btnMute.value = bMute ? "Unmute" : "Mute";
            }
        }

        // terminates the call (SIP BYE or CANCEL)
        function sipHangUp() {
            if (oSipSessionCall) {
                //txtCallStatus.innerHTML = '<i>Terminating the call...</i>';
                console.log("通话状态：终止通话");
                oSipSessionCall.hangup({ events_listener: { events: '*', listener: onSipEventSession } });
            }
        }

        function sipSendDTMF(c) {
            if (oSipSessionCall && c) {
                if (oSipSessionCall.dtmf(c) == 0) {
                    try { dtmfTone.play(); } catch (e) { }
                }
            }
        }

        function startRingTone() {
            try { ringtone.play(); }
            catch (e) { }
        }

        function stopRingTone() {
            try { ringtone.pause(); }
            catch (e) { }
        }

        function startRingbackTone() {
            try { ringbacktone.play(); }
            catch (e) { }
        }

        function stopRingbackTone() {
            try { ringbacktone.pause(); }
            catch (e) { }
        }

        function toggleFullScreen() {
            if (videoRemote.webkitSupportsFullscreen) {
                fullScreen(!videoRemote.webkitDisplayingFullscreen);
            }
            else {
                fullScreen(!bFullScreen);
            }
        }

        function openKeyPad() {
            divKeyPad.style.visibility = 'visible';
            divKeyPad.style.left = ((document.body.clientWidth - C.divKeyPadWidth) >> 1) + 'px';
            divKeyPad.style.top = '70px';
            divGlassPanel.style.visibility = 'visible';
        }

        function closeKeyPad() {
            divKeyPad.style.left = '0px';
            divKeyPad.style.top = '0px';
            divKeyPad.style.visibility = 'hidden';
            divGlassPanel.style.visibility = 'hidden';
        }

        function fullScreen(b_fs) {
            bFullScreen = b_fs;
            if (tsk_utils_have_webrtc4native() && bFullScreen && videoRemote.webkitSupportsFullscreen) {
                if (bFullScreen) {
                    videoRemote.webkitEnterFullScreen();
                }
                else {
                    videoRemote.webkitExitFullscreen();
                }
            }
            else {
                if (tsk_utils_have_webrtc4npapi()) {
                    try { if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs); }
                    catch (e) { /* divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen"); */ }
                }
                else {
                    //divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen");
                }
            }
        }

        function showNotifICall(s_number) {
            // permission already asked when we registered
            if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
                if (oNotifICall) {
                    oNotifICall.cancel();
                }
                oNotifICall = window.webkitNotifications.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number);
                oNotifICall.onclose = function () { oNotifICall = null; };
                oNotifICall.show();
            }
        }

        function onKeyUp(evt) {
            evt = (evt || window.event);
            if (evt.keyCode == 27) {
                fullScreen(false);
            }
            else if (evt.ctrlKey && evt.shiftKey) { // CTRL + SHIFT
                if (evt.keyCode == 65 || evt.keyCode == 86) { // A (65) or V (86)
                    bDisableVideo = (evt.keyCode == 65);
                   // txtCallStatus.innerHTML = '<i>Video ' + (bDisableVideo ? 'disabled' : 'enabled') + '</i>';
                    window.localStorage.setItem('org.doubango.expert.disable_video', bDisableVideo);
                }
            }
        }

        /* function onDivCallCtrlMouseMove(evt) {
            try { // IE: DOM not ready
                if (tsk_utils_have_stream()) {
                    btnCall.disabled = (!tsk_utils_have_stream() || !oSipSessionRegister || !oSipSessionRegister.is_connected());
                    document.getElementById("divCallCtrl").onmousemove = null; // unsubscribe
                }
            }
            catch (e) { }
        } */

        function uiOnConnectionEvent(b_connected, b_connecting) { // should be enum: connecting, connected, terminating, terminated
            //btnRegister.disabled = b_connected || b_connecting;
            //btnUnRegister.disabled = !b_connected && !b_connecting;
            //btnCall.disabled = !(b_connected && tsk_utils_have_webrtc() && tsk_utils_have_stream());
            //btnHangUp.disabled = !oSipSessionCall;
        }

        function uiVideoDisplayEvent(b_local, b_added) {
            var o_elt_video = b_local ? videoLocal : videoRemote;

            if (b_added) {
                o_elt_video.style.opacity = 1;
                uiVideoDisplayShowHide(true);
            }
            else {
                //o_elt_video.style.opacity = 0;
                fullScreen(false);
            }
        }

        function uiVideoDisplayShowHide(b_show) {
            if (b_show) {
                tdVideo.style.height = '340px';
                divVideo.style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';
            }
            else {
                //tdVideo.style.height = '0px';
                //divVideo.style.height = '0px';
            }
            //btnFullScreen.disabled = !b_show;
        }

        function uiDisableCallOptions() {
            if (window.localStorage) {
                window.localStorage.setItem('org.doubango.expert.disable_callbtn_options', 'true');
                uiBtnCallSetText('Call');
                writeLog('Use expert view to enable the options again (/!\\requires re-loading the page)');
            }
        }

        function uiBtnCallSetText(s_text) {
            if(s_text=="Answer"&&phone.callOutWR==1){
            	setTimeout('sipCall("call-audio")',1000); 
            }
        }

        function uiCallTerminated(s_description) {
            uiBtnCallSetText("Call");
            //btnHangUp.value = 'HangUp';
            //btnHoldResume.value = 'hold';
            //btnMute.value = "Mute";
            //btnCall.disabled = false;
           // btnHangUp.disabled = true;
            if (window.btnBFCP) window.btnBFCP.disabled = true;

            oSipSessionCall = null;

            stopRingbackTone();
            stopRingTone();

            //txtCallStatus.innerHTML = "<i>" + s_description + "</i>";
            console.log("通话状态："+s_description);
            if(s_description=="Media stream permission denied"){
            	alert("WebCall模式下电脑未插入麦克风无法使用，请插入麦克风后重新刷新页面进行注册");
            }
            uiVideoDisplayShowHide(false);
            //divCallOptions.style.opacity = 0;

            if (oNotifICall) {
                oNotifICall.cancel();
                oNotifICall = null;
            }

            uiVideoDisplayEvent(false, false);
            uiVideoDisplayEvent(true, false);

            setTimeout(function () { if (!oSipSessionCall) /* txtCallStatus.innerHTML = ''; */console.log("通话状态："); }, 2500);
        }

        // Callback function for SIP Stacks
        function onSipEventStack(e /*SIPml.Stack.Event*/) {
            tsk_utils_log_info('==stack event = ' + e.type);
            switch (e.type) {
                case 'started':
                    {
                        // catch exception for IE (DOM not ready)
                        try {
                            // LogIn (REGISTER) as soon as the stack finish starting
                            oSipSessionRegister = this.newSession('register', {
                                expires: 200,
                                events_listener: { events: '*', listener: onSipEventSession },
                                sip_caps: [
                                            { name: '+g.oma.sip-im', value: null },
                                            //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                                            { name: '+audio', value: null },
                                            { name: 'language', value: '\"en,fr\"' }
                                ]
                            });
                            oSipSessionRegister.register();
                        }
                        catch (e) {
                            //txtRegStatus.value = txtRegStatus.innerHTML = "<b>1:" + e + "</b>";
                            console.log("话机注册异常，"+e);
                            //btnRegister.disabled = false;
                        }
                        break;
                    }
                case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
                    {
                        var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                        oSipStack = null;
                        oSipSessionRegister = null;
                        oSipSessionCall = null;

                        uiOnConnectionEvent(false, false);

                        stopRingbackTone();
                        stopRingTone();

                        uiVideoDisplayShowHide(false);
                        //divCallOptions.style.opacity = 0;

                        //txtCallStatus.innerHTML = '';
                        console.log("通话状态：");
                        //txtRegStatus.innerHTML = bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>";
                        console.log("话机断开连接，"+e.description);
                        writeLog("WebCall模式话机连接服务器失败");
			if(failCnt==3){
                        	$("#onHookMode").removeAttr("disabled");
                			phone.onDisConnectTag=0;
                			SdAgent.logout();
                        }else{
				failCnt = failCnt + 1;
                        	sipRegister();
                        }

                       // $("#onHookMode").removeAttr("disabled");
            		//	phone.onDisConnectTag=0;
            		//	SdAgent.logout();
                        break;
                    }

                case 'i_new_call':
                    {
                        if (oSipSessionCall) {
                            // do not accept the incoming call if we're already 'in call'
                            e.newSession.hangup(); // comment this line for multi-line support
                        }
                        else {
                            oSipSessionCall = e.newSession;
                            // start listening for events
                            oSipSessionCall.setConfiguration(oConfigCall);

                            uiBtnCallSetText('Answer');
                            //btnHangUp.value = 'Reject';
                            //btnCall.disabled = false;
                            //btnHangUp.disabled = false;

                            startRingTone();

                            var sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown');
                            //txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
                            console.log("通话状态：来自" + sRemoteNumber + "的来电");
                            showNotifICall(sRemoteNumber);
                        }
                        break;
                    }

                case 'm_permission_requested':
                    {
                        //divGlassPanel.style.visibility = 'visible';
                        break;
                    }
                case 'm_permission_accepted':
                case 'm_permission_refused':
                    {
                        //divGlassPanel.style.visibility = 'hidden';
                        if (e.type == 'm_permission_refused') {
                            uiCallTerminated('Media stream permission denied');
                        }
                        break;
                    }

                case 'starting': default: break;
            }
        };

        // Callback function for SIP sessions (INVITE, REGISTER, MESSAGE...)
        function onSipEventSession(e /* SIPml.Session.Event */) {
            tsk_utils_log_info('==session event = ' + e.type);
            switch (e.type) {
                case 'connecting': case 'connected':
                    {
                        var bConnected = (e.type == 'connected');
                        if (e.session == oSipSessionRegister) {
                            uiOnConnectionEvent(bConnected, !bConnected);
                            //txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
                            console.log("话机状态："+e.description);
                        }
                        else if (e.session == oSipSessionCall) {
                            //btnHangUp.value = 'HangUp';
                            //btnCall.disabled = true;
                            //btnHangUp.disabled = false;
                            //btnTransfer.disabled = false;
                            if (window.btnBFCP) window.btnBFCP.disabled = false;

                            if (bConnected) {
                                stopRingbackTone();
                                stopRingTone();

                                if (oNotifICall) {
                                    oNotifICall.cancel();
                                    oNotifICall = null;
                                }
                            }

                            //txtCallStatus.innerHTML = "<i>" + e.description + "</i>";
                            console.log("通话状态："+e.description);
                            //divCallOptions.style.opacity = bConnected ? 1 : 0;

                            if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
                                uiVideoDisplayEvent(false, true);
                                uiVideoDisplayEvent(true, true);
                            }
                        }
                        break;
                    } // 'connecting' | 'connected'
                case 'terminating': case 'terminated':
                    {
                        if (e.session == oSipSessionRegister) {
                            uiOnConnectionEvent(false, false);

                            oSipSessionCall = null;
                            oSipSessionRegister = null;

                            //txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
                            console.log("话机状态："+e.description);
                            writeLog("WebCall模式话机注册失败，确认注册工号是否正确");
                            $("#onHookMode").removeAttr("disabled");
                			phone.onDisConnectTag=0;
                			SdAgent.logout();
                        }
                        else if (e.session == oSipSessionCall) {
                            uiCallTerminated(e.description);
                        }
                        break;
                    } // 'terminating' | 'terminated'

                case 'm_stream_video_local_added':
                    {
                        if (e.session == oSipSessionCall) {
                            uiVideoDisplayEvent(true, true);
                        }
                        break;
                    }
                case 'm_stream_video_local_removed':
                    {
                        if (e.session == oSipSessionCall) {
                            uiVideoDisplayEvent(true, false);
                        }
                        break;
                    }
                case 'm_stream_video_remote_added':
                    {
                        if (e.session == oSipSessionCall) {
                            uiVideoDisplayEvent(false, true);
                        }
                        break;
                    }
                case 'm_stream_video_remote_removed':
                    {
                        if (e.session == oSipSessionCall) {
                            uiVideoDisplayEvent(false, false);
                        }
                        break;
                    }

                case 'm_stream_audio_local_added':
                case 'm_stream_audio_local_removed':
                case 'm_stream_audio_remote_added':
                case 'm_stream_audio_remote_removed':
                    {
                        break;
                    }

                case 'i_ect_new_call':
                    {
                        oSipSessionTransferCall = e.session;
                        break;
                    }

                case 'i_ao_request':
                    {
                        if (e.session == oSipSessionCall) {
                            var iSipResponseCode = e.getSipResponseCode();
                            if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                                startRingbackTone();
                                //txtCallStatus.innerHTML = '<i>Remote ringing...</i>';
                                console.log("通话状态：远程响铃");
                            }
                        }
                        break;
                    }

                case 'm_early_media':
                    {
                        if (e.session == oSipSessionCall) {
                            stopRingbackTone();
                            stopRingTone();
                            //txtCallStatus.innerHTML = '<i>Early media started</i>';
                            console.log("通话状态：早期媒体开始了");
                        }
                        break;
                    }

                case 'm_local_hold_ok':
                    {
                        if (e.session == oSipSessionCall) {
                            if (oSipSessionCall.bTransfering) {
                                oSipSessionCall.bTransfering = false;
                                // this.AVSession.TransferCall(this.transferUri);
                            }
                            //btnHoldResume.value = 'Resume';
                            //btnHoldResume.disabled = false;
                            //txtCallStatus.innerHTML = '<i>Call placed on hold</i>';
                            console.log("通话状态：电话处于暂停状态");
                            oSipSessionCall.bHeld = true;
                        }
                        break;
                    }
                case 'm_local_hold_nok':
                    {
                        if (e.session == oSipSessionCall) {
                            oSipSessionCall.bTransfering = false;
                            //btnHoldResume.value = 'Hold';
                            //btnHoldResume.disabled = false;
                            //txtCallStatus.innerHTML = '<i>Failed to place remote party on hold</i>';
                            console.log("通话状态：无法暂停远程聚会");
                        }
                        break;
                    }
                case 'm_local_resume_ok':
                    {
                        if (e.session == oSipSessionCall) {
                            oSipSessionCall.bTransfering = false;
                            //btnHoldResume.value = 'Hold';
                            //btnHoldResume.disabled = false;
                            //txtCallStatus.innerHTML = '<i>Call taken off hold</i>';
                            console.log("通话状态：呼叫暂停");
                            oSipSessionCall.bHeld = false;

                            if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                                uiVideoDisplayEvent(false, true);
                                uiVideoDisplayEvent(true, true);
                            }
                        }
                        break;
                    }
                case 'm_local_resume_nok':
                    {
                        if (e.session == oSipSessionCall) {
                            oSipSessionCall.bTransfering = false;
                            //btnHoldResume.disabled = false;
                            //txtCallStatus.innerHTML = '<i>Failed to unhold call</i>';
                            console.log("通话状态：未能保持通话");
                        }
                        break;
                    }
                case 'm_remote_hold':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = '<i>Placed on hold by remote party</i>';
                            console.log("通话状态：由远程派对搁置");
                        }
                        break;
                    }
                case 'm_remote_resume':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = '<i>Taken off hold by remote party</i>';
                            console.log("通话状态：由远程派对暂停");
                        }
                        break;
                    }
                case 'm_bfcp_info':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = 'BFCP Info: <i>' + e.description + '</i>';
                            console.log("通话状态：BFCP信息-"+e.description);
                        }
                        break;
                    }

                case 'o_ect_trying':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = '<i>Call transfer in progress...</i>';
                            console.log("通话状态：呼叫转移正在进行中");
                        }
                        break;
                    }
                case 'o_ect_accepted':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = '<i>Call transfer accepted</i>';
                            console.log("通话状态：接听电话转接");
                        }
                        break;
                    }
                case 'o_ect_completed':
                case 'i_ect_completed':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = '<i>Call transfer completed</i>';
                            console.log("通话状态：呼叫转移已完成");
                            //btnTransfer.disabled = false;
                            if (oSipSessionTransferCall) {
                                oSipSessionCall = oSipSessionTransferCall;
                            }
                            oSipSessionTransferCall = null;
                        }
                        break;
                    }
                case 'o_ect_failed':
                case 'i_ect_failed':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = '<i>Call transfer failed</i>';
                            console.log("通话状态：呼叫转移失败");
                            //btnTransfer.disabled = false;
                        }
                        break;
                    }
                case 'o_ect_notify':
                case 'i_ect_notify':
                    {
                        if (e.session == oSipSessionCall) {
                            //txtCallStatus.innerHTML = "<i>Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b></i>";
                            console.log("通话状态：呼叫转移 "+e.getSipResponseCode()+" "+ e.description);
                            if (e.getSipResponseCode() >= 300) {
                                if (oSipSessionCall.bHeld) {
                                    oSipSessionCall.resume();
                                }
                                //btnTransfer.disabled = false;
                            }
                        }
                        break;
                    }
                case 'i_ect_requested':
                    {
                        if (e.session == oSipSessionCall) {
                            var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
                            if (confirm(s_message)) {
                                //txtCallStatus.innerHTML = "<i>Call transfer in progress...</i>";
                                console.log("通话状态：呼叫转移正在进行中");
                                oSipSessionCall.acceptTransfer();
                                break;
                            }
                            oSipSessionCall.rejectTransfer();
                        }
                        break;
                    }
            }
        }

        function settingsSave() {
            window.localStorage.setItem('org.doubango.expert.disable_video', "true");
            window.localStorage.setItem('org.doubango.expert.enable_rtcweb_breaker', "false");
            window.localStorage.setItem('org.doubango.expert.websocket_server_url', websocketServerUrl);
            window.localStorage.setItem('org.doubango.expert.sip_outboundproxy_url', "");
            window.localStorage.setItem('org.doubango.expert.ice_servers', "[]");
            window.localStorage.setItem('org.doubango.expert.bandwidth', "");
            window.localStorage.setItem('org.doubango.expert.video_size', "");
            window.localStorage.setItem('org.doubango.expert.disable_early_ims',  "true");
            window.localStorage.setItem('org.doubango.expert.disable_debug', "true");
            window.localStorage.setItem('org.doubango.expert.enable_media_caching',  "true");
            window.localStorage.setItem('org.doubango.expert.disable_callbtn_options', "false");

            console.log("保存话机设置完成");
        }
