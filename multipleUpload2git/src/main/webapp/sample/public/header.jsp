<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	
<c:set var="contextPath" value="<%=request.getContextPath()%>" scope="request" ></c:set>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	
	<%-- <link type="text/css" href="${contextPath}/static/Huploadify.css" rel="stylesheet" /> --%>
	<link type="text/css" href="${contextPath}/static/merged/common.css" rel="stylesheet" />
	
    <script type="text/javascript">
		var globalCp = '${contextPath}';
	</script>		
    
    <script src="${contextPath}/static/jquery/jquery-1.8.3.min.js"></script>
    <script src="${contextPath}/static/js/json2.js"></script>
    
    <script src="${contextPath}/static/js/multipleFileupload.js"></script>
    <script src="${contextPath}/static/js/messenger.js"></script>
    