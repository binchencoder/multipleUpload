// JavaScript Document
//用于判断客户端浏览器类型，以确定采用何种上传组件

var plugin = plugin || {};

(function ($) {
	"use strict";
	
    $.fn.uploadAdapter = function (opts) {
    	var _VERSION = "1.0.0 (2014-03-28)",
    		_TIME = new Date().getTime(),
    		_DEBUG = true;
    	
        var defaults = {
            baseUrl: globalCp + '/multipleupload/static',
            pluginType: null //自己配置使用的插件类型，取值html5或flash
            //pluginType: 'mgtfileupload'
        };
        var option = $.extend(defaults, opts);
        var _this = this;
        
        // 取附件
        if (option.result) {
        	if (plugin.pluginName === "Huploadify") {
        		var fileObj = plugin.pluginObj;
        		return fileObj ? fileObj.getSuccessFiles() : [];
        	} else {
        		return _this[plugin.pluginName](option);
        	}
        }
        
        //获取HTML5特性支持情况
        var checkSupport = function () {
            var input = document.createElement('input');
            var fileSupport = !! (window.File && window.FileReader && window.FileList && window.Blob);
            var xhr = false;
            try {
                xhr = new XMLHttpRequest(); //尝试创建 XMLHttpRequest 对象，除 IE 外的浏览器都支持这个方法。
            } catch (e) {
                xhr = ActiveXobject("Msxml12.XMLHTTP"); //使用较新版本的 IE 创建 IE 兼容的对象（Msxml2.XMLHTTP）。
            }
            
            var fd = !! window.FormData;
            return 'multiple' in input && 
            		fileSupport && 
            		'onprogress' in xhr && 'upload' in xhr && 
            		fd ? 'html5' : 'mgtfile';
        };
        
        //调用传进来的上传插件
        var callUploader = function (pluginName, jsUrl, cssUrl) {
            _this.each(function () {
            	
                var athis = $(this);
                $.loadScript(jsUrl, 'js', function () {
                    $.loadScript(cssUrl, 'css');
                    try {
                    	plugin.pluginObj = athis[pluginName](option);
					} catch (e) {
						//console.log(e.message);
					}
                });
                
            });
        };

        var jsUrl = "", cssUrl = "";
        var setLoaderValue = function (type) {
            if (type == 'html5') {
            	plugin.pluginName = 'Huploadify';
                jsUrl = option.baseUrl + '/js/jquery.Huploadify.new.js?ver=' + encodeURIComponent(_DEBUG ? _TIME : _VERSION);
                cssUrl = option.baseUrl + '/css/Huploadify.css?ver=' + encodeURIComponent(_DEBUG ? _TIME : _VERSION);
            } else {
            	plugin.pluginName = 'mgtfileupload';
                jsUrl = option.baseUrl + '/source/mgtfile.js?ver=' + encodeURIComponent(_DEBUG ? _TIME : _VERSION);
                cssUrl = option.baseUrl + '/merged/common.css?ver=' + encodeURIComponent(_DEBUG ? _TIME : _VERSION);
            }
        };

        //如果有配置使用的插件类型，则按照配置的，否则进行客户端支持性判断
        if (option.pluginType) {
        	plugin.pluginType = option.pluginType;
        } else {
        	plugin.pluginType = checkSupport();
        }
        setLoaderValue(plugin.pluginType);

        callUploader(plugin.pluginName, jsUrl, cssUrl);
    };

})(jQuery);