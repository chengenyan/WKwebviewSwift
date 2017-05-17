//请求地址
var url = "http://192.168.0.254:8080";
//var url = "http://192.168.0.80:8080";
//var url = "http://p2p.test.ccclubs.com";
//手机号码验证
var telnumber = /^0?1[3|4|5|8][0-9]\d{8}$/;
//邮箱验证
var mailnumber = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.mobile = loginInfo.mobile || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.mobile.length = 0) {
			return callback('手机号码不能为空');
		} else if (loginInfo.mobile.length < 5) {
			return callback('账号最短为 5 个字符');
		} else {
			if (telnumber.test(loginInfo.mobile)) {
				if (loginInfo.password.length < 6) {
					return callback('密码最短为 6 个字符');
				} else {
					memberlogin(); //注册提交信息
				}
			} else {
				callback("请输入正确的手机号码");
			};
		}
		//找不到第一个页面的Webview的id
		function memberlogin() {
			var action = "/app/user/login.do";
			myAjax(loginInfo, action, orderdetail);

			function orderdetail(json) {
				if (json.data.success) {
					callback('恭喜你登录成功！');
					plus.storage.setItem('mobile',loginInfo.mobile);
					localStorage.setItem("myindexlogin", "1");
					if (document.getElementById("index_id").value == "1") {
						var prame = {
							car_id: 1,
							type: 1,
							orde_id: ""
						}
						showview("/carBuy/carmodel_detail.html", "loadajax", prame);
					} else if (document.getElementById("index_id").value == "2") {
						showview("/account/account_center.html", "loadajax");
					} else if (document.getElementById("index_id").value == "3") {
						callback_fire("index_Account.html", "loadajax");
						closeallwebview();
					} else {
						var wp = plus.webview.currentWebview();
						var wps = wp.opener();
						myshowview(wps.id, "lucky", luckyid);
					}
				} else {
					callback(json.data.tips);
				}
			}
		}
	};
	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};
	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};


	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
}(mui, window.app = {}));
/*
 * 打开新页面
 */
function myopenWindow(url, name, data) {
	// 在Android5以上设备，如果默认没有开启硬件加速，则强制设置开启
	//		if(!plus.webview.defauleHardwareAccelerated()&&parseInt(plus.os.version)>=5){
	//			styles.hardwareAccelerated=true;
	//		}
	data = data || null;
	mui.openWindow({
		url: url,
		id: name,
		show: {
			aniShow: 'pop-in'
		},
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: true,
			title: '正在加载...',
		},
		extras: {
			version: data
		}

	})
}
//上下滑动

function mui_scroll() {
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		indicators: false
	});
}

function other_layer() {
	openlayer();
	var opener = plus.webview.currentWebview().opener();
	opener.reload(true);
	mui.back();
}
//打开提示信息

function openlayer() {
	mui("#account_authenLayer").popover('toggle');
}
//个人中心提示信息
var layertips = '<div id="account_authenLayer" class="mui-popover mui-popover-action mui-popover-bottom authenLayer">' + '<img src="../images/temp/authenticationsubmit.png" />' + '<h5 class="fontsize16 color-20B2FF">已经提交成功</h5>' + '<p class="fontsize16 color-333333">工作人员将在1-3个工作日内完成审核</p>' + '<p id="close_authenLayer" class="fontsize18 color-333333 auth-layer-p">关闭</p>' + '</div>';
//ajax请求标准数据
function myAjax(ajax_info, action, callback) {
	mui.ajax(url + action, {
		data: ajax_info,
		dataType: 'json',
		type: 'post',
		timeout: 3000,
		success: function(json) {
			if (callback != undefined) {
				callback(json);
			}
			if (json.error == 1) { //未登录
				myshowview("/login.html", "loadajax");
			}
		},
		error: function(xhr, type, errorThrown) {
			plus.nativeUI.toast("服务器又调皮了，程序猿正在调教中!!!");
			console.log(type);
		}
	})
}

var ws = null,
	wp = null,
	wo = null;
// H5 plus事件处理
function mywebview(url, name, data) {
	ws = plus.webview.currentWebview();
	wo = ws.opener();
	wp = plus.webview.create(url, name, {
		scrollIndicator: 'none',
		scalable: false,
		popGesture: 'none'
	}, {
		version: data
	});
	wp.show('pop-in');
}

function myopener() {
	//	var h=plus.webview.getWebviewById(plus.runtime.appid);
	//	mui.fire(h,'ssswww',{index:1});
	//	mui.openWindow({
	//	    id:plus.runtime.appid
	//	  });
	var h = plus.webview.getWebviewById("index_Account.html");
	mui.fire(h, 'loadaccount', {
		index: 1
	});
}

function callback_fire(id, callback) {
	var h = plus.webview.getWebviewById(id);
	mui.fire(h, callback);
}

function closeallwebview() {
	var h = plus.webview.getWebviewById(plus.runtime.appid);
	h.show("pop-in");
}

function showview(id, callback, extras) {
	extras = extras || null;
	var h = plus.webview.getWebviewById(id);
	mui.fire(h, callback, extras);
	if (h != null) {
		h.show("pop-in");
	} else {
		myopenWindow(id, id, extras);
	}

}
//通用打开页面
function myshowview(id, callback, extras) {
	extras = extras || null;
	var h = plus.webview.getWebviewById(id);
	if (h != null) {
		mui.fire(h, callback, extras);
		h.show("slide-in-right", 150);
	} else {
		var w = plus.webview.create(id);
		var nwaiting = plus.nativeUI.showWaiting(); //显示原生等待框
		w.addEventListener("loaded", function() { //注册新webview的载入完成事件
			nwaiting.close(); //新webview的载入完毕后关闭等待框
			mui.fire(w, callback, extras);
			w.show("slide-in-right", 150);
		}, false);
	}
}

function getCode(listener) {
	// “点击获取验证码”按钮
	var btn = document.getElementById('mobile_btn');
	btn.disabled = true;
	btn.removeEventListener('tap', listener);
	addClass(btn, 'mui-disabled');
	var time = 59;
	var timer = setInterval(function() {
		btn.innerText = time + " 秒后重新获";
		--time;
		if (time == 0) {
			clearInterval(timer);
			btn.innerText = "重新获取校验码";
			btn.disabled = false;
			removeClass(btn, 'mui-disabled');
			btn.addEventListener('tap', listener);
		}
	}, 1000);
}
//校验输入金额，用于充值等情景

function checkAmount(amount) {
	if (amount.value.length == 0) {
		plus.nativeUI.toast("请输入付款金额");
		amount.focus();
		return false;
	}
	var reg = new RegExp(/^\d*\.?\d{0,2}$/);
	if (!reg.test(amount.value)) {
		plus.nativeUI.toast("请正确输入付款金额，小数点后最多两位");
		amount.focus();
		return false;
	}
	//	if (Number(amount.value) < 10) {
	//		plus.nativeUI.toast("付款金额最小是 10元");
	//		amount.focus();
	//		return false;
	//	}
	return true;
}


// 原生JS，操作 css class 样式
function hasClass(elements, cName) {
	return !!elements.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)"));
};

function addClass(elements, cName) {
	if (!hasClass(elements, cName)) {
		elements.className += " " + cName;
	};
};

function removeClass(elements, cName) {
	if (hasClass(elements, cName)) {
		elements.className = elements.className.replace(new RegExp("(\\s|^)" + cName + "(\\s|$)"), " ");
	};
};
//控制台输出
function log(i) {
	console.log(new Date() + ":" + i)
}
//调用模板数据信息
/*
 * jsid:script的ID信息
 * jsonresult:返回数据的结果集
 * htmlid:传入页面的id
 */
function apptemplate(jsid, jsonresult, htmlid) {
	var tempFn = doT.template($('#' + jsid + '').html());
	var rentText = tempFn(jsonresult);
	$('#' + htmlid + '').append(rentText);
}
//获取不含秒的时间
/*
 * date:时间对象
 */
function getDateWithoutSec(date) {
	var str = "";
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var min = date.getMinutes();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	if (hour < 10) {
		hour = "0" + hour;
	}
	if (min < 10) {
		min = "0" + min;
	}
	str = str + date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + min;
	return str;
}
//获得租车时长（计算两个时间的间隔）
/*
 * date1
 * date2
 */
function dateDuration(date1, date2) {
	var startTime = new Date(Date.parse(date1.replace(/-/g, "-"))).getTime();
	var endTime = new Date(Date.parse(date2.replace(/-/g, "-"))).getTime();
	var interval = Math.abs(startTime - endTime) / 1000;
	var d = Math.floor(interval / (24 * 3600));
	var h = Math.floor(interval / 3600);
	var m = Math.floor(interval % 3600 / 60);
	if (d > 1) {
		h = h - d * 24;
	}
	var str = d + "天" + h + "小时" + m + "分钟";
	return str;
}