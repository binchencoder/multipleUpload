package com.jingoal.file;

import java.io.InputStream;
import java.io.OutputStream;

public interface FileHandler {

	/**
	 * 获得指定文件的输入流
	 * 
	 * @param filePath
	 * @param uid
	 * @param cid
	 * @return
	 * @throws FileException
	 */
	public InputStream getAttachInputStream(String filePath, long uid, long cid)
			throws FileException;

	/**
	 * 获得指定文件的输入流
	 * 
	 * @param companyId
	 * @param uid
	 * @return
	 * @throws FileException
	 */
	public OutputStream getAttachOutputStream(long companyId,long uid)
			throws FileException;
	
	/**
	 * 获得一个与执行dfsPath指向同一个dfs文件的dfsPath
	 * 
	 * @param dfsPath
	 * @param domain
	 * @return
	 * @throws FileException
	 */
	public String duplicate(String dfsPath,long domain) throws FileException;

	/**
	 * 将指定文件保存至dfs中
	 * 
	 * @param inputStream
	 * @param companyId
	 * @param uid
	 * @return
	 * @throws FileException
	 */
	public String saveFile(InputStream inputStream, long companyId,long uid) throws FileException;

	/**
	 * 删除指定dfsPath的文件
	 * 
	 * @param dfsPath
	 * @param domain
	 */
	public void delete(String dfsPath,long domain);
}
