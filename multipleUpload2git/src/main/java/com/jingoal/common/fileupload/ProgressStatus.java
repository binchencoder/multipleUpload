package com.jingoal.common.fileupload;

import java.util.Date;


public class ProgressStatus {
	public final static ProgressStatus none = new ProgressStatus();
	private long received = 0;
	private long size = 0;
	
	private long beginTime = (new Date()).getTime();
	
	public long getReceived() {
		return received;
	}



	public void setReceived(long received) {
		this.received = received;
	}



	public long getSize() {
		return size;
	}



	public void setSize(long size) {
		this.size = size;
	}

	public long getBeginTime() {
		return beginTime;
	}
	
	

}
