package com.jingoal.file.utils;

public class UploadFileUtil {
	
	public static String getInitName(String clientPath) {
		int posi = clientPath.lastIndexOf("\\") > clientPath.lastIndexOf("/") ? clientPath
				.lastIndexOf("\\") : clientPath.lastIndexOf("/");
		return clientPath.substring(posi + 1);
	}
	
	
}
