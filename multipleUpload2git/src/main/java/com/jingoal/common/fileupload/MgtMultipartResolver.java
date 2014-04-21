package com.jingoal.common.fileupload;

import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUpload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;


public class MgtMultipartResolver extends CommonsMultipartResolver {
	private static Logger log= LoggerFactory.getLogger(MgtFileUploadController.class);
	
	private static Map<String,MgtProgressListener> progressListener = new ConcurrentHashMap<String, MgtProgressListener>();
	private static ThreadLocal<String> progressListener2 = new ThreadLocal<String>();
	@Override
	public void cleanupMultipart(MultipartHttpServletRequest request) {
//		progressListener.get().setMultipartFinished();
		super.cleanupMultipart(request);
	}

	@Override
	protected FileUpload newFileUpload(FileItemFactory fileItemFactory) {
		FileUpload fileUpload = super.newFileUpload(fileItemFactory);
		String str="";
		if( progressListener2.get()!=null){
			str= progressListener2.get();
		}
		fileUpload.setProgressListener(progressListener.get(str));
		progressListener2.remove();
		return fileUpload;
	}

	@Override
	public MultipartHttpServletRequest resolveMultipart(
			HttpServletRequest request) throws MultipartException {
		log.info("X-Progress-ID: " + request.getParameter("idoo"));
		String str = request.getParameter("idoo");
		if(str==null|| str.equals(""))
			return super.resolveMultipart(request);
		
		progressListener.put(str,new MgtProgressListener(request));
		progressListener2.set(str);
		clearProgressMap();
		return super.resolveMultipart(request);
	}
	
	public static ProgressStatus getProgressStatus(String idoo){
		MgtProgressListener l = progressListener.get(idoo);
		if(l == null)
			return ProgressStatus.none;
		ProgressStatus ps = l.getProgressStatus();	
		if(ps.getReceived()>0&& ps.getReceived()>=ps.getSize()){			
			progressListener.remove(idoo);			
		}
		return ps;
	}
	//清道夫的工作
	private void clearProgressMap(){
		Set<String> set = progressListener.keySet();
		if(set.size()<100)
			return;
		
		long now = new Date().getTime()-24*3600000;
		ProgressStatus ps;
		for(String str:set){
			ps  = progressListener.get(str).getProgressStatus();
			if(ps.getBeginTime()<now)
				progressListener.remove(str);
		}
	}

	public MgtMultipartResolver() {
		super();

	}
	
}