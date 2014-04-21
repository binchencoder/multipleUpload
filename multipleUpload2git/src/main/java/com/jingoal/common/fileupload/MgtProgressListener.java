package com.jingoal.common.fileupload;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.ProgressListener;

public class MgtProgressListener  implements ProgressListener {
	
//	private static Logger log =  LoggerFactory.getLogger(MgtProgressListener.class);
   
    private ProgressStatus ps;
    public MgtProgressListener(HttpServletRequest request) {
    	ps = new ProgressStatus();
    }

    @Override
    public void update(long bytesRead, long contentLength, int items) {
//    	Date t = new Date();
//    	log.error("infooo:   "+ t.toString() + " , bytesRead:{},contentLength:{}",bytesRead,contentLength);    	
    	ps.setReceived(bytesRead);
    	ps.setSize(contentLength);
    }
    
    public ProgressStatus getProgressStatus(){
    	return ps;
    }
}