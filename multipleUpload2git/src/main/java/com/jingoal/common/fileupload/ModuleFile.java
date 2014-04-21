package com.jingoal.common.fileupload;

public class ModuleFile {

	private long id;
	private boolean deleted;
	private String fileName;
	private String localPath;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getLocalPath() {
		return localPath;
	}

	public void setLocalPath(String localPath) {
		this.localPath = localPath;
	}

	public ModuleFile() {
		super();
	}

	@Override
	public String toString() {
		return "ModuleFile [id=" + id + ", deleted=" + deleted + ", fileName="
				+ fileName + ", localPath=" + localPath + "]";
	}

	
}
