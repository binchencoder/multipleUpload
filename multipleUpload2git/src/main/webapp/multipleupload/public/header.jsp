<%@ page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	
<c:set var="contextPath" value="<%=request.getContextPath()%>" scope="request" ></c:set>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	
	<%-- <link type="text/css" href="${contextPath}/static/Huploadify.css" rel="stylesheet" /> --%>
	<link type="text/css" href="${contextPath}/static/merged/common.css" rel="stylesheet" />
	
    <script type="text/javascript">
		var globalCp = '${contextPath}';
	</script>
	<%@ include file="commonMessage.jsp"%> 		
    
    <script src="${contextPath}/multipleupload/static/jquery/jquery-1.8.3.min.js"></script>
    <script src="${contextPath}/multipleupload/static/source/common.js"></script>
    
    <script src="${contextPath}/multipleupload/static/js/json2.js"></script>
    <%-- <script src="${contextPath}/static/jquery.Huploadify.js"></script> --%>
    <%-- <script src="${contextPath}/static/jquery.Huploadify.new.js"></script> --%>
    
    <script src="${contextPath}/multipleupload/static/js/jquery.loadscript.js"></script>
    <script src="${contextPath}/multipleupload/static/js/jquery.uploadAdapter.js?v=117"></script>
    <script src="${contextPath}/multipleupload/static/js/messenger.js"></script>
    