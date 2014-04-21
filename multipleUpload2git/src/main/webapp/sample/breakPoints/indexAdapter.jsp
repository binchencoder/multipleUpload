<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<%@ include file="../public/taglibs.jsp"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Huploadify demo</title>

<%@include file="../public/header.jsp" %>
<script src="${contextPath}/multipleupload/static/js/jquery.loadscript.js"></script>
<script src="${contextPath}/multipleupload/static/js/jquery.uploadAdapter.js"></script>

<script type="text/javascript">
$(function(){
	var up = $('#upload').uploadAdapter({
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
		}
	});
});
</script>
</head>

<body>
	<div id="upload"></div>
</body>
</html>

