<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<script>
	var zh_CN = '${param.lang}' == 'zh_CN' ? true : false;
	var i18n = {};
	// mgtfile.js
	i18n.fileNotEmpty = zh_CN ? "文件内容不能为空" : "文本內容不能為空";
	i18n.fileUploadFail = zh_CN ? "文件上传失败" : "文件上傳失敗";
	i18n.fileMaxSize = zh_CN ? "单个文件上传大小不能超过" : "單個文件上傳大小不能超過";
	i18n.fileExist = zh_CN ? "该文件已经存在了，请重新选择文件！" : "該文件已經存在了，請重新選擇文件！";
	i18n.fileMaxLength = zh_CN ? "文件名长度不能超过216字！" : "文件名長度不能超過216字！";
</script>