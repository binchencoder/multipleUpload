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
		auto: false,
		fileTypeExts:'*.jpg;*.png;*.exe;*.mp3;*.mp4;*.zip;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx;*.pdf',
		multi:true,
		fileSizeLimit:99999999,
		breakPoints:true,
		saveInfoLocal:true,
		showUploadedPercent:true,//是否实时显示上传的百分比，如20%
		showUploadedSize:true,
		removeTimeout:9999999,
		fileSplitSize: 1024 * 10, //断点续传的文件块大小，单位Byte，10K
		uploader: globalCp + '/modulefileupload/post.do',
		onCancel: function(file) {
			if(typeof(Storage) !== "undefined") {
				if (sessionStorage.getItem(file.name)) {
					sessionStorage.removeItem(file.name);
				}
			}
		},
		onSelect: function(files) {
			console.log(files[0].name);
			
		},
		onUploadStart:function(){
			//up.settings('formData', {aaaaa:'1111111',bb:'2222'});
			up.Huploadify('settings','formData', {aaaaa:'1111111',bb:'2222'});
		},
		onUploadSuccess:function(file){
			
			
		},
		onUploadComplete:function(originalFile, responseText){
			var postedSize = parseInt(sessionStorage.getItem(originalFile.name)) || 0;
			if (postedSize < parseInt(originalFile.size)) {
				up.getFileObj().container.find('#' + originalFile.id).find('.uploadbtn').text("续传");
			}
		},
		saveUploadedSize: function(file, value){
			if(typeof(Storage) !== "undefined") {
				sessionStorage.setItem(file.id, value);				
			}
		},
		getUploadedSize:function(file){
			if(typeof(Storage) !== "undefined") {
				return sessionStorage.getItem(file.fid) ? parseInt(sessionStorage.getItem(file.fid)) : 0;
			}
			
			var data = {
				file : {
					fileName : file.name,
					fileId: file.fid,
					lastModifiedDate : file.lastModifiedDate.getTime()
				}
			};
			var url = globalCp + '/modulefileupload/postedSize.do',
				postedSize = 0;
			$.ajax({
				url : url,
				contentType: 'application/json',
				dataType: 'json',
				data : JSON.stringify(data),
				async : false,
				type : 'POST',
				success : function(returnData){
					console.log(returnData);
					postedSize = returnData.postedSize;
				}
			});
			return postedSize;
		}	
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

</body>
</html>

