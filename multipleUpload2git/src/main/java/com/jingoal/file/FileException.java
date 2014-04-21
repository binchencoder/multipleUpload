package com.jingoal.file;

public class FileException extends Exception {
	private static final long serialVersionUID = 20140319L;

	public FileException() {
		super();
	}

	public FileException(String message, Throwable cause) {
		super(message, cause);
	}

	public FileException(String message) {
		super(message);
	}

	public FileException(Throwable cause) {
		super(cause);
	}
}
