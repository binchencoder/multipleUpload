package com.jingoal.file.handler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jingoal.dfsclient.DFSClientDuplicateShardImpl;
import com.jingoal.dfsclient.DFSOutputStream;
import com.jingoal.dfsclient.DFSShardClient;
import com.jingoal.dfsclient.FileNotFoundException;
import com.jingoal.dfsclient.LackofDomainOrBizNameException;
import com.jingoal.file.FileException;
import com.jingoal.file.FileHandler;
import com.mongodb.util.Util;

public class FileHandlerDFSImpl implements FileHandler {
	
	private final static String BIZNAME = "mgt";
	
	private DFSShardClient dfsClient;

	private static Logger log =  LoggerFactory.getLogger(FileHandlerDFSImpl.class);
	
	public void setDfsClient(DFSShardClient dfsClient) {
		this.dfsClient = dfsClient;
	}

	/* 
	 * 获得指定文件的输入流
	 * @see com.jingoal.file.FileHandler#getAttachInputStream(java.lang.String, long, long)
	 */
	public InputStream getAttachInputStream(String dfsPath, long uid, long cid)
			throws FileException {
		if (dfsPath == null || dfsPath.startsWith("ERROR:"))
			throw new FileException("获取文件输入流失败,DFS路径错误,dfsPath=" + dfsPath);
		try {
			return dfsClient.getInputStream(dfsPath, cid);
		} catch (FileNotFoundException e) {
			throw new FileException("获取文件输入流失败", e);
		}
	}

	public OutputStream getAttachOutputStream(long companyId,long uid)
			throws FileException {
		try {
			String userId = String.valueOf(uid);
			return dfsClient.getOutputStream(companyId, BIZNAME, null,userId);
		} catch (LackofDomainOrBizNameException e) {
			throw new FileException("获取文件输出流失败", e);
		}
	}

	/* 
	 * 将指定文件保存至dfs中
	 * @see com.jingoal.file.FileHandler#saveFile(java.io.InputStream, long, long)
	 */
	public String saveFile(InputStream inputStream, long companyId,long uid) throws FileException{
		byte[] content = new byte[1024];
		int read;
		DFSOutputStream out = null;
		String dfsPath = null;
		String fid = null; //文件id
		try {
			ByteArrayOutputStream output = new ByteArrayOutputStream();
			while ((read = inputStream.read(content)) != -1) {
				output.write(content, 0, read);
			}
			String md5 = Util.hexMD5(output.toByteArray());  // 根据文件内容获取md5码
			//通过 公司id，md5，文件长度，返回文件fid，如果为fid不为null，说明文件已经上传过，则拷贝文件
			fid  = dfsClient.getByMd5(companyId, md5, output.toByteArray().length);
			if (null == fid) {
				out = (DFSOutputStream) getAttachOutputStream(companyId,uid);
				out.write(output.toByteArray());
			} else {
				dfsPath = fid;
			}
		} catch (Exception e) {
			log.error("保存DFS文件失败,companyId:{}{}", new Object[]{ companyId, e});			
		} finally {
			try {
				inputStream.close();
				if (out != null) {
					out.close();
					if (null == fid) dfsPath = out.getId();
				}
			} catch (IOException e) {
				log.error("FileHandlerDFSImpl saveFile IOException", e);
			}
		}
		log.debug("FileHandlerDFSImpl saveFile:dfsPath:{}",dfsPath);
		if (dfsPath == null)
			throw new FileException("FileHandlerDFSImpl saveFile:dfsPath is null!");

		return dfsPath;
	}

	public String duplicate(String dfsPath,long domain) throws FileException {
		String duplicatePath = null;
		try {
			duplicatePath = ((DFSClientDuplicateShardImpl) dfsClient).duplicate(dfsPath,domain);
			if (duplicatePath == null)
				throw new FileException("复制dfs文件链接失败!");
			return duplicatePath;
		} catch (FileNotFoundException e) {
			throw new FileException("复制dfs文件链接失败!", e);
		} catch (IOException e) {
			throw new FileException("复制dfs文件链接失败!", e);
		}
	}

	/* 
	 * 删除指定dfsPath的文件
	 * @see com.jingoal.file.FileHandler#delete(java.lang.String, long)
	 */
	public void delete(String dfsPath,long domain) {
		dfsClient.delete(dfsPath,domain);
		log.debug("FileHandlerDFSImpl delete:dfsPath:{}",dfsPath);
	}
}
