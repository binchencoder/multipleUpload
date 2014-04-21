<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<%@ include file="public/taglibs.jsp"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>multipleupload</title>
<style type="text/css">
body {
	padding-left: 0px !important;
	padding-right: 0px !important;
}
</style>

<%@ include file="public/header.jsp" %>

<script type="text/javascript">
	var messenger;
	$(function(){
		var heighten = 36;
		var frameId = window.name;
		if (null == frameId || frameId == "") {
			frameId = window.location.hash.substring(1);
		}
		
		var divId = frameId.substring(0, frameId.lastIndexOf("_"));
		
		messenger = new Messenger(frameId);
		messenger.addTarget(window.parent, 'parent');
		
		messenger.listen(function(msg){
			if (typeof msg == 'string') {
				var msgJson = null;
	    		try {
					msgJson = $.parseJSON(msg);
				} catch (e) {
					throw new Error("init uploadAdapter, message listen receive msg parseJSON error");
				}
				
				if (msgJson.action === 'initUpload') { // 初始化上传
					$('#multipleUpload').uploadAdapter($.extend(msgJson.option || {}, {
						uploader: globalCp + '/modulefileupload/post.do',
						onCancel: function(file){
							sendMessage({
								'action': 'heighten',
								'id': frameId,
								'height': -heighten
							});
							
							// 删除临时文件
							if (file.fid) {
								$.post(globalCp + '/modulefileupload/deleteFile.do?fileId='+file.fid, function(){ });	
							}
						},
						onSelect: function(){
							sendMessage({
								'action': 'heighten',
								'id': frameId,
								'height': heighten
							});
						}
					}));
				} else if (msgJson.action === 'getfiles') { // 获取附件集合
					var files = $('#multipleUpload').uploadAdapter({result: true});
					sendMessage({
						'action': msgJson.action,
						'id': frameId,
						'files': files
					});
				}
			}
		});
		
		// 发送消息通知父窗口，监听事件已经注册完毕，可以进行上传组件初始化
		if (messenger.listenFunc.length > 0) {
			sendMessage({ 'action': 'inited', 'id': frameId });
		}
	});
	
	// 发送消息给parent
	function sendMessage(msg){
		if (msg) {
			messenger.send(JSON.stringify(msg));
		} else {
			throw new Error('sendMessage msg is null');
		}
	};
	
	function getFiles(){
		var files = $('#multipleUpload').uploadAdapter({result: true});
		
		console.log(files.length);
		console.log(files);
	}
	
</script>
</head>

<body>
	<div id="multipleUpload"></div>
	
	<!-- <div>
		<button onclick="getFiles();">获取附件</button>
	</div> -->
</body>
</html>

