hojo.provide("icallcenter.Phone");

hojo.require("hojo.io.script");
hojo.require("icallcenter.hojotools");
hojo.require("icallcenter.stateElement.base");
hojo.require("icallcenter.stateElement.hold");
hojo.require("icallcenter.stateElement.invalid");
hojo.require("icallcenter.stateElement.abate");
hojo.require("icallcenter.stateElement.peerState");
hojo.require("icallcenter.stateElement.link.consultationLink");
hojo.require("icallcenter.stateElement.link.innerLink");
hojo.require("icallcenter.stateElement.link.dialoutLink");
hojo.require("icallcenter.stateElement.link.listenLink");
hojo.require("icallcenter.stateElement.link.normalLink");
hojo.require("icallcenter.stateElement.link.threeWayCallLink");
hojo.require("icallcenter.stateElement.ring.innerRing");
hojo.require("icallcenter.stateElement.ring.normalRing");
hojo.require("icallcenter.stateElement.ring.listenRing");
hojo.require("icallcenter.stateElement.ringring.consultationRinging");
hojo.require("icallcenter.stateElement.ringring.innerRinging");
hojo.require("icallcenter.stateElement.ringring.normalRinging");

hojo.declare("icallcenter.Phone", null, {
    _base: null,
    _peerState: null,
    _invalid: null,
    _abate: null,
    _hold: null,
    _consultationLink: null,
    _innerLink: null,
    _dialoutLink: null,
    _listenLink: null,
    _normalLink: null,
    _threeWayCallLink: null,
    _innerRing: null,
    _normalRing: null,
    _listenRing: null,
    _consultationRinging: null,
    _innerRinging: null,
    _normalRinging: null,

    monitorPeers: [],
    monitorQueues: [],
    monitorServiceNos: [],
    accountCalls: null,

    _isWaitingEvent: false,
    _destroyed: false,
    callObject: {},
    _curChannel: null,
    _otherChannel: null,
    _callId: null,
    iccCount: 0,
    dialoutData: null,
    _isInvestigatting: false,
    _isLooting: false,
    _isCallingOut: false,
    _isSettingbusy: false,
    _isRing: false,
    _handles: [],
    constructor: function (config) {
//        var evtHandle = this.register("EvtAutoBusyTime", this, "onAutoBusyTimeChanged");
//        this._handles.push(evtHandle);
        this._loadConfig(config);
        this._evtXhr = hojo._xhrObj();
        this._waitEvent();
    },
    destroy: function (removeQueue) {
        if (!this._destroyed) {
            for (var handle in this._handles) {
                this.unregister(this._handles[handle]);
            }
            this._stopEvent();
            this._exit(this.loginName, removeQueue);
            this._destroyed = true;
        }
    },

    _loadConfig: function (config) {
        for (var i in config) {
            this[i] = config[i];
        }
    },

    _stopEvent: function () {
        if (this._evtXhr) {
            this._evtXhr.abort();
            this._evtXhr = null;
        }
    },

    ////////////////////////////////////////////////////////////
    // OCX控件事件处理,供软电话使用
    ////////////////////////////////////////////////////////////

    onRing: function (callId, remoteId) {
        this.oldInboundId = this._inboundId;
        console.debug("控件onRing返回[callId:%s,remoteId:%s]", callId, remoteId);
        this._inboundId = callId;
    },

    onRemoteRing: function (callId, remoteId) {
        console.debug("控件onRemoteRing返回[callId:%s,remoteId:%s]", callId, remoteId);
        this._outboundId = callId;
    },

    onCalloutFail: function (callId, cause) {
        console.debug("控件CalloutFail返回[callId:%s,cause:%s,inboundid:%s]", callId, cause, this._inboundId);
        if (this.state == "stConsulting") {
            if (this._inboundId) {
                sipPhone.ChangeCurrentCall(this._inboundId);
                this._changeState("stTalking");
            }
        }
    },

    onRegister: function (info) {
    },

    register: function (evtType, obj, method) {
        return hojo.subscribe(evtType, obj, method);
    },

    unregister: function (handle) {
        hojo.unsubscribe(handle);
    },

    playSound: function () {
        try {
            document.soundPlayer.play();
        } catch (e) {
//            console.debug(e);
        }
    },

    stopSound: function () {
        try {
            document.soundPlayer.stop();
        } catch (e) {
//            console.debug(e);
        }
    },

    _exit: function (loginName, removeQueue) {
    	//[2015-03-25]退出，停留在原先页面
        //var returnUrl = "./login.html";
        if (removeQueue == undefined) {
            removeQueue = true;
        }
        var self = this;
        if (!loginName) {
            loginName = self.loginName;
        }
        var url = this.proxy_url;
        var result = false;
        var phoneJson = {
            Command: "Action",
            Action: "Logoff",
            SessionID: self.uniqueId,
            ActionID: "Logoff" + Math.random(),
            QueueRemove: removeQueue,
            User: self.userId,
            PBX: self.pbx_in_ip,
            Account: self.accountId
        };
        hojo.io.script.get({
            url: url,
            content: {json: hojo.toJson(phoneJson)},
            callbackParamName: "callbackName",
            timeout: 15000,
            preventCache: true,
            load: function (response, ioArgs) {
                console.debug("退出成功");
                console.dir(response);
                console.debug("清除事件XHR");
                //[2015-03-25]退出，停留在原先页面
                //window.location = returnUrl;
            },
            error: function (response, ioArgs) {
                console.debug("注销返回错误");
                console.dir(response);
                result = true;
                console.debug("清除事件XHR");
               //[2015-03-25]退出，停留在原先页面
               // window.location = returnUrl;
            }
        });
    },
    _changeState: function (state) {
        console.debug("改变状态[%s]", state);
        hojo.publish("EvtBarChange", [this.extenType + "_" + state]);
    },
    _eventHandler: function (evtJsons) {
        try {
            var self = this;
            hojo.forEach(evtJsons, function (item) {
                if (self._base == null) {
                    self._base = new icallcenter.stateElement.base(self);
                }
                //[2015-06-05]建立通话
                //[2015-06-10]合力技术说这是所有坐席的状态，非本坐席，所以将代码移至“callProcessor.js”
                /*if(item.Event == "ChannelStatus"){
                	if(item.ChannelStatus == "Link"){
                		window.onLinkCTI = true;
                	}
                	if(item.ChannelStatus == "Hangup"){
                		window.onLinkCTI = false;
                	}
                }*/
                self._base._switchState(item);
            });
        } catch (e) {
            console.dir(e);
        }
    },
    _waitEvent: function () {
        if (this._isWaitingEvent) return;
        if (this._evtXhr == null) return;
        this._isWaitingEvent = true;
        var self = this,
            url = this.proxy_url,
            phoneJson = {
                Command: "Action",
                Action: "GetState",
                ActionID: "GetState" + Math.random(),
                SessionID: this.uniqueId,
                User: this.userId
            };
        hojo.io.script.get({
            url: url,
            content: {json: hojo.toJson(phoneJson)},
            callbackParamName: "callbackName",
            timeout: 15000,
            preventCache: true,
            load: function (response) {
                iccCount = 0;
                self.display("");
                if (!response)
                    return;
                var datas = response,
                    _response = datas.Response;
                if (!_response)
                    _response = datas;
                if (!_response.Succeed) {
                    console.debug("会话失效");
                    console.dir(_response);
                    self._isWaitingEvent = false;
                    if (_response.Expired) {
                        console.debug("开始自动重连");
                        self._relogin();
                        return;
                    } else {
                        console.debug("返回错误!");
                    }
                } else if(_response.Succeed && _response.HasEvent) {
                    if (_response.Kick) {
                        var comments = "";
                        if (_response.Comments)
                            comments = _response.Comments;
                        if (comments == "ukick" || comments == "ekick")
                            alert("您当前的会话已经失效,导致该问题的原因是别的座席使用相同的帐号（或相同的分机）登录了");
                        else
                            alert("您当前的会话已经失效,导致该问题的原因可能是被管理员强制签出");
                        //[2015-03-25]不需要跳转，停留在原先页面
                        //window.location = "./notify.html";
                        self.destroy();
                        return;
                    } else {
                        var events = datas.Event;
                        console.dir(events);
                        if (events != null)
                            self._eventHandler(events);
                    }
                }
                self._isWaitingEvent = false;
                self._waitEvent();
            },
            error: function (response, ioArgs) {
                self._isWaitingEvent = false;
                window.setTimeout(function () {
                    iccCount++;
                    if (iccCount > 3) {
                        self.display("连接服务器超时，可能是您的网络问题，正在尝试重新连接...");
                    }
                    self._waitEvent();
                }, 1000);
                return;
            }
        });
    },
    display: function (message) {
        var netMessage = hojo.byId("netMessage");
        if (netMessage) {
            netMessage.innerHTML = message;
        }
    },
    _relogin: function () {
        if (this._isRelogin)
            return;
        var self = this;
        self._isRelogin = true;
        var phoneJson = {
            Command: "Action",
            Action: "Login",
            ActionID: "Login" + Math.random(),
            ExtenType: self.extenType,
            User: self.loginName,
            Password: self.password,
            AutoBusy: false,
            Monitor: self.Monitor
        };
        hojo.io.script.get({
            url: self.proxy_url,
            content: {json: hojo.toJson(phoneJson)},
            callbackParamName: "callbackName",
            timeout: 15000,
            preventCache: true,
            load: function (response) {
                var _response = response;
                if (!_response.Succeed) {
                    var code = _response.Result;
                    if (code) {
                        if (code == 601) {
                            alert("您的账户通话座席登录数已达最大或者已经到期,请使用无通话方式登录或联系管理员");
                        } else if (code == 602) {
                            alert("您的账户无通话座席登录数已达最大或者已经到期,请使用软电话/网关/直线方式登录或联系管理员");
                        } else {
                            alert("登录失败" + code + ",请联系管理员");
                        }
                    }else {
                        alert("您当前的会话已经失效,导致该问题的原因可能是被管理员强制签出");
                    }
                    //不需要跳转，停留在原先的页面
                    //window.location = "./notify.html";
                    self.destroy();
                } else if (_response.SessionID) {
                    console.debug("重新登录成功");
                    self.uniqueId = _response.SessionID;
                    var date = new Date(),
                        identity = date.valueOf();
                    self.currentServerTime = identity - _response.Timestamp * 1000;
                    if (self._peerState._curPeerStateKey == '0') {
                        self.setBusy(false, self._peerState._curPeerStateKey);
                    } else if (self._peerState._curPeerStateKey != '99') {
                        self.setBusy(true, self._peerState._curPeerStateKey);
                    }
                    self._waitEvent();
                } else {
                    console.debug("登录成功,但没有sessionid");
                }
                self._isRelogin = false;
            },
            error: function (response, ioArgs) {
                console.debug("注册ass失败，请求超时，请检查本地网络或请求的服务器IP地址！！！");
                alert("请求超时，请检查本地网络或请求的服务器IP地址！！！");
                _self.logonStatus = "logonFail";
                hojo.publish("EvtLogon", [_self.logonStatus]);
                return response;
            }
        });

    },
    //[2015-11-27]添加参数
    //@param phoneNum 外呼号码
    //@param custPhoneNum 透传号码
    dialout: function (phoneNum, custPhoneNum) {
        console.debug("呼叫：" + phoneNum);
        var self = this,
            call_type = "";
        if (phoneNum.length < 5) {
            var peer = this._base._getUserViaExten(phoneNum);
            if (!peer) {
                phoneNum = "9" + phoneNum;
                call_type = "dialout";
                self.callObject.originCallNo = self.didNum;
                self.callObject.originCalledNo = phoneNum;
            } else {
                call_type = "inner";
            }
        } else {
            phoneNum = "9" + phoneNum;
            call_type = "dialout";
            self.callObject.originCallNo = self.didNum;
            self.callObject.originCalledNo = phoneNum;
        }
        //[2015-09-29]软电话条外呼添加参数: dwd_call_id
        var interfaceData = {staff_pos_id: '11223344', type: 'Local', dwd_call_id: sessionStorage.getItem("callId").toString()};
        this._sendAction("Originate", {
            Channel: "SIP/" + self.sipNo,
            Context: self.accountId,
            Exten: phoneNum,
            Priority: '1',
            UserID: self.userId,
            Timeout: 60000,
            Async: "true",
            InterfaceData: interfaceData,
            CallType: call_type,
            Variable: "directCallerIDNum%3d" + custPhoneNum
        }, function (response, ioArgs) {
            var json = response;
            console.dir(response);
            if (json.Succeed) {
                console.debug("外呼[%s]成功", phoneNum);
            } else {
                console.debug("外呼失败");
                console.dir(json);
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },
    //weili
    batchDialout: function (phoneNum, data) {
        console.debug("批量呼叫：" + phoneNum);
        var self = this;
        if (phoneNum && data) {
            var context = data.context;
            var type = data.type;
            var callbackSuccFun = data.callbackSuccFun;
            var callbackFailFun = data.callbackFailFun;
            var callbackObj = data.callbackObj;

            this._sendAction("BatchDialout", {
                BatchDialoutType: type,
                Context: context,
                CallNumber: phoneNum,
                Timeout: 120000,
                Async: "true"
            }, function (response, ioArgs) {
                var json = response;

                if (json.Succeed) {
                    console.debug("批量外呼[%s]成功", phoneNum);
                    callbackSuccFun.call(callbackObj, response.Message);
                } else {
                    callbackFailFun.call(callbackObj, 0);
                }
            }, function (response, ioArgs) {
                console.debug("批量外呼[%s]失败", phoneNum);
                callbackFailFun.call(callbackObj, 0);
            });
        } else {
            console.debug("批量外呼号码不存在。");
        }
    },

    playDTMF: function (num) {
        console.debug("play DTMF[%s]", num);
        sipPhone.PlayDTMF(num);
    },


    answer: function () {

    },
    hangup: function () {
        var self = this;
        console.debug("挂断电话：" + self.extenType);
        this._sendAction('Hangup', {
            Channel: self._curChannel
        }, function (response, ioArgs) {
            var json = response;
            console.dir(json);
            if (json.Succeed) {
                console.debug("挂机动作成功");
            } else {
                console.debug("挂机动作失败");
                self.callObject = {};
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },

    //保持通话
    hold: function () {
        var self = this;
        this._sendAction("Hold", {
            Channel: self._otherChannel,
            UserID: self.userId,
            Async: "true"
        }, function (response, ioArgs) {
            var json = response;
            console.dir(response);
            if (json.Succeed) {
                console.debug("保持成功");
                self._stateBeforeHold = self._base._curCallState._callState;
                self._changeState("stHold");
            } else {
                console.debug("保持[%s]失败" + response.Message, self._curChannel);
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },

    // 取消保持
    unhold: function () {
        var self = this;
        this._sendAction("Unhold", {
            Channel: self._otherChannel,
            UserID: self.userId,
            Async: "true"
        }, function (response, ioArgs) {
            var json = response;
            console.dir(response);
            if (json.Succeed) {
                console.debug("取消保持成功");
                self._changeState(self._stateBeforeHold);
            } else {
                console.debug("取消保持[%s]失败" + response.Message, self._curChannel);
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },


    investigate: function () {
        if (this._isInvestigatting)
            return;
        this._isInvestigatting = true;
        console.info("转满意度调查");
        var self = this;
        var userId = self.userId;
        var context = self.accountId + "-investigate";
        self._sendAction('Transfer', {
            Exten: 's',
            Channel: self._otherChannel,
            CallType: "investigate",
            UserID: userId,
            Context: context
        }, function (response, ioArgs) {
            console.dir(response);
            var json = response;
            if (json.Succeed) {
                console.debug("转满意度调查成功");
            } else {
                console.debug("转满意度调查失败");
                self._isInvestigatting = false;
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
        this._isInvestigatting = false;
    },

    transfer: function (destExten, mode, values) {
        var self = this;
        console.info("电话转接[%s:%s]", destExten, mode);

        var fromCid = self.callObject.originCallNo;
        if (destExten.substr(0, 1) == '9' && mode == 'external') {
            if (destExten.length <= 5) {
                destExten = destExten.substr(1);
                var peer = this._base._getUserViaExten(destExten);
                if (!peer) {
                    destExten = "9" + destExten;
                }
            }
        }

        if (destExten.length > 4 && mode != 'skillgroup') {
            icallcenter.hojotools.showLoading(destExten);
            fromCid = this.sipNo + '@' + this.didNum;
        } else if (destExten.length <= 4 && mode != 'skillgroup') {
            if (destExten.substr(0, 1) != '9') {
                icallcenter.hojotools.showLoading("工号  " + destExten + " ");
            } else {
                icallcenter.hojotools.showLoading(destExten);
            }
        } else if (mode == 'skillgroup') {
            icallcenter.hojotools.showLoading(destExten);
        }

        var synData = hojo.objectToQuery(values);
        console.debug(synData);
        var context = "";
        context = this.accountId;
        var workSheetId;
        var customerId;
        if (self.callObject && self.callObject.data) {
            workSheetId = self.callObject.data.workSheetId;
            customerId = self.callObject.data.customerId;
        }
        self._sendAction('Transfer', {
            WorkSheetID: workSheetId ? workSheetId : "",
            CustomerID: customerId ? customerId : "",
            Exten: destExten,
            UserID: self.userId,
            Channel: self._otherChannel,
            ExtraChannel: self._curChannel,
            Context: context
        }, function (response, ioArgs) {
            icallcenter.hojotools.close();
            console.dir(response);
            var json = response;
            if (json.Succeed) {
                icallcenter.hojotools.showSucc("转接成功");
                console.debug("转接成功");
            } else {
                console.debug("转接失败-" + json.Message);
                var message = "";
                if (json.Message == "310") {
                    message = "未配置外呼线路";
                } else if (json.Message == "311") {
                    message = "转接的用户忙";
                } else if (json.Message == "312") {
                    message = "转接的用户未签入";
                } else if (json.Message == "313") {
                    message = "转接的用户正在通话";
                } else if (json.Message == "314") {
                    message = "转接的用户没有以通话方式登录";
                } else if (json.Message == "315") {
                    message = "无法呼通转接的用户";
                } else if (json.Message == "316") {
                    message = "转接用户不存在";
                } else {
                    message = "";
                }

                if (message == "") {
                    icallcenter.hojotools.error("转接失败");
                } else {
                    icallcenter.hojotools.error("转接失败：" + message);
                }
                if (json.Expired) {
                    self._relogin();
                }
            }
        }, function (response, ioArgs) {
            icallcenter.hojotools.close();
            console.debug("ACTION返回错误");
            console.dir(response);
        });
    },


    listen: function (channel) {
        // summary:
        //  软电话监听
        var self = this;
        if (this._peerState._curPeerStateKey == "0") {
            icallcenter.hojotools.error("请先将电话置为忙碌");
            //alert("请先将电话置为忙碌");
            return;
        }
        this._sendAction("Originate", {
            Channel: "SIP/" + self.sipNo,
            Application: "ChanSpy",
            Data: channel + "|bq",
            UserID: self.userId,
            Callerid: self.sipNo,
            Async: "true"
        }, function (response, ioArgs) {
            var json = response;
            console.dir(response);
            if (json.Succeed) {
                console.debug("监听[%s]成功", channel);
                self._otherChannel = channel;
            } else {
                console.debug("监听[%s]失败" + response.Message, channel);
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },

    hangupChannel: function (channel) {
        var self = this;
        console.debug("强拆" + channel);
        var params = {
            Channel: channel
        };
        var onload = function (response, ioArgs) {
            console.dir(response);
            var json = response;
            if (json.Succeed) {
                console.debug("强拆动作成功");
            } else {
                console.debug("强拆动作失败");
                if (json.Expired) {
                    self._relogin();
                }
            }
        };

        if (this._destroyed) return;
        var phoneJson = {};
        var url = this.proxy_url;
        hojo.mixin(phoneJson, {
            Command: "Action",
            Action: "Hangup",
            ActionID: "ForceHangup" + Math.random(),
            PBX: this.pbx_in_ip,
            Account: this.accountId,
            SessionID: this.uniqueId
        });

        hojo.mixin(phoneJson, params);

        if (onload == null) {
            onload = function (response, ioArgs) {
                console.debug("ACTION调用成功[%s]", response);
            }
        }

        console.debug("发送ACTION");
        console.dir(phoneJson);
        hojo.io.script.get({
            url: url,
            content: {json: hojo.toJson(phoneJson)},
            callbackParamName: "callbackName",
            timeout: 60000,
            preventCache: true,
            load: onload,
            error: function (response, ioArgs) {
                //console.error("请求超时,请检查本地网络[" + ioArgs.url + "]");
                console.debug("ACTION返回错误");
                console.dir(response);
            }
        });

    },

    lootCall: function (channel) {
        var self = this;
        if (this._peerState._curPeerStateKey == "0") {
            icallcenter.hojotools.error("请先将电话置为忙碌");
            //alert("请先将电话置为忙碌");
            return;
        }
        var context = this.accountId;
        console.debug("抢接" + channel);
        self._sendAction('Transfer', {
            Exten: self.sipNo,
            Channel: channel,
            UserID: self.userId,
            CallType: "Loot",
            Context: context
        }, function (response, ioArgs) {
            console.dir(response);
            var json = response;
            if (json.Succeed) {
                console.debug("抢接成功");
                self._isLooting = true;
            } else {
                console.debug("抢接失败");
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },

    kick: function (exten) {
        console.debug("签出座席" + exten);
        var self = this;
        this._sendAction("Kick", {
            Exten: exten
        }, function (response, ioArgs) {
            var json = response;
            console.dir(response);
            if (json.Succeed) {
                console.debug("签出[%s]成功", exten);
                var peer = self.monitorPeers[exten];
                if (peer) {
                    peer.C5Status = "";
                    peer.callNo = "";
                    peer.callStatus = "Idle";
                    var date = new Date();
                    var identity = date.valueOf();
                    peer.timestamp = identity / 1000;
                    linked = false;
                    peer.channel = "";
                    peer.linkedChannel = "";
                    console.debug("kickoff");
                    hojo.publish("EvtMonitorPeer", [peer]);
                    self._base._updateQueueInfo();
                }
            } else {
                console.debug("签出[%s]失败" + response.Message, exten);
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },

    pick: function (userId) {
        console.debug("签入座席" + userId);
        var self = this;
        var peer = self.monitorPeers[userId];
        if (peer == null || peer.localNo == null || peer.localNo == "") {
            icallcenter.hojotools.error("不能对没有直线号码的座席做签入操作");
            //alert("不能对没有直线号码的座席做签入操作");
            return;
        }
        this._sendAction("SignIn", {
            User: userId
        }, function (response, ioArgs) {
            var json = response;
            console.dir(response);
            if (json.Succeed) {
                console.debug("签入[%s]成功", userId);
                icallcenter.hojotools.showSucc("座席签入成功");
                //alert("座席签入成功");
            } else {
                console.debug("签入[%s]失败" + json.Message, userId);
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },

    threeWayCall: function (phoneNum) {
        console.debug("开始三方通话：" + phoneNum);
        var self = this;
        this._sendAction("ThreeWayCall",
            {
                FromExten: self.sipNo,
                Exten: phoneNum,
                UserID: self.userId,
                Timeout: 60000
            }, function (response, ioArgs) {
                var json = response;
                console.dir(json);
                if (json.Succeed) {
                    console.debug("三方通话[%s]成功", phoneNum);
                    self._changeState("stThreeWayTalking");
                } else {
                    console.debug("三方通话失败");
                    if (json.Expired) {
                        self._relogin();
                    }
                    icallcenter.hojotools.error("三方通话失败");
                }
            });
    },

    consult: function (phoneNum, mode) {
        console.debug("开始咨询通话：" + phoneNum);
        var self = this;
        if (phoneNum.substr(0, 1) == '9' && mode == 'external') {
            if (phoneNum.length <= 5) {
                phoneNum = phoneNum.substr(1);
                var peer = this._base._getUserViaExten(phoneNum);
                if (!peer) {
                    phoneNum = "9" + phoneNum;
                }
            }
        }
        if (phoneNum.length > 4 && mode != 'skillgroup') {
            icallcenter.hojotools.showLoading(phoneNum);
            fromCid = this.sipNo + '@' + this.didNum;
        } else if (phoneNum.length <= 4 && mode != 'skillgroup') {
            if (phoneNum.substr(0, 1) != '9') {
                icallcenter.hojotools.showLoading("工号  " + phoneNum + " ");
            } else {
                icallcenter.hojotools.showLoading(phoneNum);
            }
        } else if (mode == 'skillgroup') {
            icallcenter.hojotools.showLoading(phoneNum);
        }

        this._sendAction("Consult", {
            FromExten: self.sipNo,
            Exten: phoneNum,
            UserID: self.userId,
            Timeout: 60000
        }, function (response, ioArgs) {
            icallcenter.hojotools.close();
            var json = response;
            console.dir(json);
            if (json.Succeed) {
                console.debug("咨询[%s]成功", phoneNum);
                icallcenter.hojotools.showSucc("咨询成功");
                self._changeState("stConcultTalking");
            } else {
                icallcenter.hojotools.error("咨询失败");
                console.debug("咨询失败");
                if (json.Expired) {
                    self._relogin();
                }
            }
        }, function (response, ioArgs) {
            icallcenter.hojotools.close();
            icallcenter.hojotools.error("咨询失败");
            console.debug("ACTION返回错误");
            console.dir(response);
        });
    },

    stopConsult: function () {
        console.debug("结束咨询通话");
        var self = this;
        this._sendAction("StopConsult", {
            FromExten: self.sipNo,
            UserID: self.userId,
            Timeout: 60000
        }, function (response, ioArgs) {
            var json = response;
            console.dir(json);
            if (json.Succeed) {
                if (response.Message != undefined) {
                    if (response.Message == "Idle") {
                        self._changeState("stInvalid");
                    } else {
                        self._changeState("stTalking");
                    }
                } else {
                    self._changeState("stTalking");
                }
            } else {
                console.debug("结束咨询失败");
                if (json.Expired) {
                    self._relogin();
                }
                icallcenter.hojotools.error("结束咨询通话失败");
            }
        });
    },
    setBusy: function (isBusy, busyType) {
        if (this._isSettingbusy) {
            return;
        } else {
            this._isSettingbusy = true;
        }
        var self = this;
        var params = {
            "Exten": self.userId,
            Busy: isBusy,
            BusyType: "" + busyType
        };
        self._sendAction('Busy', params, function (response, ioArgs) {
            var res = response;
            if (res.Succeed) {
                console.debug("update status success!");
            } else {
                if (res.Expired) {
                    self._relogin();
                }
            }
        });
        this._isSettingbusy = false;
    },
    toIVR: function () {
        console.info("转IVR验证");
        var self = this;
        var context = userInfo.accountId + "-validate";
        var actionName = "Validate";
        if (userInfo.accountId == "Q000000003893" || userInfo.accountId == "B000000006069") {
            actionName = "Check";
        }
        self._sendAction(actionName, {
            Exten: 's',
            Channel: self._otherChannel,
            Context: context
        }, function (response, ioArgs) {
            console.dir(response);
            var json = response;
            if (json.Succeed) {
                console.debug("转IVR成功");
            } else {
                console.debug("转IVR失败");
                if (json.Expired) {
                    self._relogin();
                }
                return ERR_NO_SUCH_CHANNEL;
            }
        });
        this._isInvestigatting = false;
        return SUCCESS;
    },

    changePhone: function (extenType) {
        var self = this;
        if (!(extenType == "Local" || extenType == "gateway" || extenType == "sip"))
            return;
        self._sendAction('SetExtenType', {
            User: self.userId,
            ExtenType: extenType,
            LoginExten: ''
        }, function (response, ioArgs) {
            console.dir(response);
            var json = response;
            if (json.Succeed) {
                console.debug("变更登录方式成功");
            } else {
                console.debug("变更登录方式失败");
                if (json.Expired) {
                    self._relogin();
                }
            }
        });
    },
    _sendAction: function (action, params, onload, onerror) {
        if (this._destroyed) return;
        var phoneJson = {};
        var url = this.proxy_url;
        hojo.mixin(phoneJson, {
            Command: "Action",
            Action: action,
            ActionID: action + Math.random(),
            PBX: this.pbx_in_ip,
            Account: this.accountId,
            SessionID: this.uniqueId
        });
        hojo.mixin(phoneJson, params);
        var timeout = 60000;
        if (params.Timeout != 'undefined')
            timeout = params.Timeout;
        if (onload == null) {
            onload = function (response, ioArgs) {
                console.debug("ACTION调用成功[%s]", response);
            }
        }
        if (onerror == null) {
            onerror = function (response, ioArgs) {
                console.debug("ACTION返回错误");
                console.dir(response);
            }
        }
//        console.debug("发送ACTION");
        console.dir(phoneJson);
        hojo.io.script.get({
            url: url,
            content: {json: hojo.toJson(phoneJson)},
            callbackParamName: "callbackName",
            timeout: timeout,
            preventCache: true,
            load: onload,
            error: onerror
        });
    },
    onAutoBusyTimeChanged: function (autoBusyTime) {
        this.autoBusyTime = autoBusyTime;
    }
});
icallcenter.Phone.registerHollyPhoneEvent = function (config) {
    var result = null;
    var url = config.hollyPhone_url;
    var phoneJson = {
        Command: "Action",
        Action: "SoftPhoneLogin",
        ActionID: "SoftPhoneLogin" + Math.random(),
        Password: config.password,
        LoginName: config.User
    };

    var _self = this;
    hojo.io.script.get({
        url: url,
        content: phoneJson,
        callbackParamName: "callbackName",
        timeout: 5000,
        preventCache: true,
        load: function (response, ioArgs) {
            var _response = response;
            if (_response.Succeed) {
                if (_response.status) {
                    if (_response.status == "0000") {
                        icallcenter.Phone.registerEvent(config);
                    } else if (_response.status == "4444") {
                        icallcenter.hojotools.error("登录HollyPhone异常，密码错误");
                        console.debug("登录HollyPhone异常，密码错误");
                    } else if (_response.status == "6666" || _response.status == "5555") {
                        icallcenter.hojotools.error("登录HollyPhone异常，账户错误");
                        console.debug("登录HollyPhone异常，账户错误");
                    } else {
                        icallcenter.hojotools.error("登录HollyPhone异常,返回值:" + _response.status);
                        console.debug("登录HollyPhone异常,返回值:" + _response.status);
                    }
                } else {
                    icallcenter.hojotools.error("登录HollyPhone异常,返回值:" + _response.status);
                    console.debug("登录HollyPhone异常,返回值:" + _response.status);
                }
            } else {
                icallcenter.hojotools.error("登录HollyPhone异常");
                console.debug("登录HollyPhone异常");
            }
            console.dir(_response);
        },
        error: function (response, ioArgs) {
            icallcenter.hojotools.error("登录HollyPhone超时，请检查HollyPhone电话是否正常启动");
            console.debug("登录HollyPhone超时，请检查HollyPhone电话是否正常启动");
            console.dir(response);
            return response;
        }
    });
};

icallcenter.Phone.registerEvent = function (config) {
    var result = null,
        url = config.proxy_url,
        phoneJson = {
            Command: "Action",
            Action: "Login",
            ActionID: "Login" + Math.random(),
            ExtenType: config.extenType,
            Password: config.password,
            BusyType: config.busyType,
            Monitor: config.Monitor,
            User: config.User
        },
        _self = this;
    hojo.io.script.get({
        url: url,
        content: {json: hojo.toJson(phoneJson)},
        callbackParamName: "callbackName",
        timeout: 15000,
        preventCache: true,
        load: function (response) {
            var _response = response;
            if (!_response.Succeed) {
                result = false;
                var code = _response.Result;
                if (code) {
                    if (code == 601) {
                        alert("您的账户通话座席登录数已达最大或者已经到期,请使用无通话方式登录或联系管理员");
                    } else if (code == 602) {
                        alert("您的账户无通话座席登录数已达最大或者已经到期,请使用软电话/网关/直线方式登录或联系管理员");
                    } else {
                        alert("登录失败" + code + ",请联系管理员");
                    }
                }
                _self.logonStatus = "logonFail";
                //[2015-07-29]登录失败回调
                config.callback(_self.logonStatus);
            } else if (_response.SessionID) {
                config.uniqueId = _response.SessionID;
                var date = new Date(),identity = date.valueOf();
                config.currentServerTime = identity - _response.Timestamp * 1000;
                config.PhonebarConfig = _response.PhonebarConfig;
                config.autoBusyTime = _response.AutoBusyTime;
                config.userId = _response.UserID;
                config.pbx_in_ip = _response.PBX;
                config.accountId = _response.Account;
                config.loginName = config.User;
                config.sipNo = _response.SipNum;
                result = new icallcenter.Phone(config);
                phone = result;
                icallcenter.logon.afterPhone(phone);
                _self.logonStatus = "logonSuccess";
                //[2015-07-29]登录成功回调
                config.callback(_self.logonStatus,config.User,config.password);
            } else {
                _self.logonStatus = "logonFail";
                result = false;
                //[2015-07-29]登录失败回调
                config.callback(_self.logonStatus);
            }
            hojo.publish("EvtLogon", [_self.logonStatus]);
            return response;
        },
        error: function (response) {
            console.debug("注册ass失败，请求超时，请检查本地网络或请求的服务器IP地址！！！");
            alert("请求超时，请检查本地网络或请求的服务器IP地址！！！");
            _self.logonStatus = "logonFail";
            //[2015-07-29]登录成功回调
            config.callback(_self.logonStatus);
            hojo.publish("EvtLogon", [_self.logonStatus]);
            return response;
        }
    });
};