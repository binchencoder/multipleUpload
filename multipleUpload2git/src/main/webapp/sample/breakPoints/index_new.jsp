<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<%@ include file="../public/taglibs.jsp"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Huploadify demo</title>

<%@include file="../public/header.jsp" %>

<script type="text/javascript">
$(function(){
	var up = $('#upload').Huploadify({
		auto:true,
		//fileTypeExts:'*.jpg;*.png;*.exe;*.mp3;*.mp4;*.zip;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx;*.pdf',
		fileTypeExts: '*.*',
		multi:true,
		fileSplitSize: 1024 * 10,
		fileSizeLimit:99999999,
		breakPoints:true,
		saveInfoLocal:true,
		showUploadedPercent:true,//是否实时显示上传的百分比，如20%
		showAverageSpeed: true, 
		showUploadedSize:true,
		removeTimeout:9999999,
		uploader: globalCp + '/modulefileupload/post.do',
		onCancel: function(file){
			sessionStorage.getItem(file.fid) && 
				sessionStorage.removeItem(file.fid);
			
			$.post(globalCp + '/modulefileupload/deleteFile.do?fileId='+file.fid, function(){
				
			});
		},
		onUploadStart:function(file){
			up.Huploadify('settings','formData', {fileId: file.fid, fileSize: file.size});
		},
		onUploadSuccess:function(file, responseText){ // 上传完成， 去掉"上传" 和 "删除" 按钮
			var fileObj = up.getFileObj();
			var fileContainer = fileObj.container.find("#" + file.id);
			fileContainer && fileContainer.find(".uploadbtn").remove();
			//fileContainer && fileContainer.find(".delfilebtn").remove();
		},
		onUploadComplete:function(file, responseText){
			var postedSize = responseText ? parseInt(JSON.parse(responseText).postSize) : 0;
			if (postedSize < file.size) {
				up.getFileObj().container.find("#" + file.id).find(".uploadbtn").show().text("续传");	
			}
		}/* ,
		saveUploadedSize: function(file, uploadedSize) {
			sessionStorage.setItem(file.fid, uploadedSize);
		},
		getUploadedSize:function(file){
			if (null != sessionStorage.getItem(file.fid)) {
				return parseInt(sessionStorage.getItem(file.fid)) || 0;
			}
			
			var data = {
				file : {
					fileId: file.fid,
					fileName : file.name,
					lastModifiedDate : file.lastModifiedDate.getTime()
				}
			};
			var url = globalCp + '/modulefileupload/postedSize.do';
			var postedSize = 0;
			$.ajax({
				url : url,
				contentType: 'application/json',
				dataType: 'json',
				data : JSON.stringify(data),
				async : false,
				type : 'POST',
				success : function(returnData){
					postedSize = returnData.postedSize;
				}
			});
			return postedSize;
		} */	
	});

	$('#btn1').click(function(){
		up.stop();
	});
	$('#btn2').click(function(){
		up.upload('*');
	});
	$('#btn3').click(function(){
		up.cancel('*');
	});
	$('#btn4').click(function(){
		//up.disable();
		up.Huploadify('disable');
	});
	$('#btn5').click(function(){
		up.ennable();
	});
	$('#btn6').click(function(){
		up.destroy();
	});

});
</script>
</head>

<body>
<div id="upload"></div>
<button id="btn1">stop</button>
<button id="btn2">upload</button>
<button id="btn3">cancel</button>
<button id="btn4">disable</button>
<button id="btn5">ennable</button>
<button id="btn6">destroy</button>

<br/>
<div>
	<progress max="100" value="80"></progress>
</div>

</body>
</html>

