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
	var attachs = [];
	for (var i = 1; i < 5; i++) {
		var file = {
			id: i,
			deleted: false,
			name: 'myfile' + i,
			fileName: 'myfile' + i,
			size: 20
		};
		attachs.push(file);
	}
	
	document['attachs_upload'] = attachs;
	document['attachs_upload1'] = attachs;
	
	$('#upload').multipleUpload({
		auto:true,
		//fileTypeExts:'*.jpg;*.png;*.exe;*.mp3;*.mp4;*.zip;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx;*.pdf',
		fileTypeExts: '*.*',
		multi:true,
		fileSplitSize: 1024 * 10,
		fileSizeLimit: 1024000,
		breakPoints:true,
		saveInfoLocal:true,
		showUploadedPercent:true,//是否实时显示上传的百分比，如20%
		showAverageSpeed: true, 
		showUploadedSize:true,
		removeTimeout:9999999,
		attached: 'upload',
		lang: "zh_TW",
		onsubmit: function(files){
			console.log(files);
		}
	});
	
	$('#upload1').multipleUpload({
		auto:true,
		//fileTypeExts:'*.jpg;*.png;*.exe;*.mp3;*.mp4;*.zip;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx;*.pdf',
		fileTypeExts: '*.*',
		multi:true,
		fileSplitSize: 1024 * 10,
		fileSizeLimit: 1024000,
		breakPoints:true,
		saveInfoLocal:true,
		showUploadedPercent:true,//是否实时显示上传的百分比，如20%
		showAverageSpeed: true, 
		showUploadedSize:true,
		removeTimeout:9999999,
		attached: 'upload1',
		onsubmit: function(files){
			console.log(files);
		}
	});
});
	function getFiles(id){
		$('#upload').multipleUpload({
			result: true
		});
	}
	
</script>
</head>

<body>
	<div id="upload"></div>
	
	<div id="upload1"></div>
	
	<div>
		<button onclick="getFiles();">获取附件</button>
	</div>
	<br/>
	<div>
		<progress max="100" value="80"></progress>
		
		<!-- <div class="fileUpload btn btn-primary">
		    <span>Upload</span>
		    <input type="file" class="selectbtn" />
		</div> -->
	</div>

</body>
</html>

