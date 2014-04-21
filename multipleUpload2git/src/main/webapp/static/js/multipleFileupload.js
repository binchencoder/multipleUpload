/**
 * @description MultipleFileuploadJs, jingoal file upload plugin(support breakpoint upload)
 * @author chenbin
 * @version 1.0
 * @date 2014/03/13
 * @update 2014/04/21
 * 
 * 
 * 基于postMessage api 跨域通信，说明：
 * 
 * 发送消息的类型标识 action:
 * 
 * heighten: 添加/删除 附件之后，通知父iframe 改变高度；
 * inited：child iframe 加载完毕后，初始化上传组件；
 * getfiles：获取上传成功的附件操作，并调用回调函数，保存业务数据。
 */

(function ($) {
	"use strict";
	
	$.fn.multipleUpload = function(opts){
		var _this = this;
		
		// 默认参数
		var defaults = {
            remote: 'http://192.168.0.143/multipleUpload/multipleupload/index.jsp'
        };
		var option = $.extend(defaults, {lang: 'zh_CN'}, opts);
        
        var objId = _this[0].id; // current target id
        var iframeId = objId + "_iframe" ; // upload iframe id
        
        if (option.result) { // 获取附件，处理业务
        	window.messenger.targets[iframeId].submit = option.onsubmit;
         	window.messenger.targets[iframeId].send(JSON.stringify({ 'action': 'getfiles' }));
        } else {
        	var fileIframe = $('<iframe src="javascript:false;" frameborder="0" width="100%" height="85px" style="overflow:hidden;" />');
            // src="javascript:false;" removes ie6 prompt on https
            
            if (option.remote.indexOf('?') > 0) {
            	option.remote = option.remote + "&lang=" + option.lang;
            } else {
            	option.remote = option.remote + "?lang=" + option.lang;
            }
            
            fileIframe.attr("id", iframeId);
            fileIframe.attr("name", iframeId);
            fileIframe.attr("src", option.remote + "#" + iframeId);
            _this.append(fileIframe);
            
            // 父窗口中 - 初始化Messenger对象
            if (!window.messenger) {
            	window.messenger = new Messenger('parent');
            	
            	// 父窗口中监听消息
            	window.messenger.listen(function(msg){
                	if (typeof msg == 'string') {
                		var msgJson = null;
                		try {
        					msgJson = $.parseJSON(msg);
        				} catch (e) {
        					throw new Error("init multipleUpload, message listen receive msg parseJSON error");
        				}
        				
        				if (msgJson.action === 'heighten') { //  添加/删除 附件，iframe高度变化
        					var height = Number(msgJson.height);
        					var dom = $("#"+msgJson.id);
        					if (dom.length > 0) {
        						dom.height(dom.height()+height);
        					} else {
        						throw Error("the heighten dom is null");
        					}
        				} else if (msgJson.action === 'inited') { // upload iframe 加载完毕，通知child初始化上传组件
        					var _option = window.messenger.targets[msgJson.id].option;
        					// 取已经上传的附件列表
        			        if (_option.hasOwnProperty("attached")) {
    			        		var domId = _option.attached;
    			        		
    			        		var files = document['attachs_' + domId];
        			        	if (files) {
        			        		_option.attachedFiles = files;
        			        	}
    			        	}
        			        	
        					var msg = {
    			         		'action': 'initUpload',
    			     			'option': _option
    			         	};
    			         	window.messenger.targets[msgJson.id].send(JSON.stringify(msg));
        				} else if (msgJson.action === 'getfiles') { // 拿到上传成功的文件，保存业务数据（通过回调函数） 
        					window.messenger.targets[msgJson.id].submit && 
        						window.messenger.targets[msgJson.id].submit(msgJson.files);
        				}
                	}
                });
            };
            var uploadIframe = document.getElementById(iframeId);
         	// 父窗口中添加要发送的对象
         	window.messenger.addTarget(uploadIframe.contentWindow, iframeId);
         	window.messenger.targets[iframeId].option = option;
        }
	};
})(jQuery);