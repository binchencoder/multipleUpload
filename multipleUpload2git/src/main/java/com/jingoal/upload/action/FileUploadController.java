package com.jingoal.upload.action;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import com.jingoal.dfsclient.DFSShardClient;
import com.jingoal.file.FileException;
import com.jingoal.file.FileHandler;
import com.jingoal.security.TokenAuthentication;
import com.jingoal.upload.utils.IPConvert;


@Controller
@RequestMapping("/modulefileupload")
public class FileUploadController {
	
	private static Logger log= LoggerFactory.getLogger(FileUploadController.class);

	@Value("${file.upload.temp.dir}")
	private String fileDir;
	
	@Autowired
	@Qualifier(value = "dfs.client")
	private DFSShardClient dfsClient;
	
	@Autowired
	@Qualifier(value = "fileHandler")
	private FileHandler fileHandler;
	
	@Autowired
	private TokenAuthentication tokenAuthentication;
	
	private static final Long currUid = 2L;
	
	/**
	 * 文件上传
	 * @param file
	 *          续传的文件片段
	 * @param fileId
	 *          前端生成的文件id，拼接fileName = fid + "_" + currUid
	 * @param fileSize
	 *          愿文件总大小
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/post.do", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> post(@RequestParam MultipartFile file, 
			@RequestParam String fileId, @RequestParam long fileSize, 
			HttpServletRequest request, Model model){
		
		Map<String, Object> retData = new HashMap<String, Object>();
		
		try {
			File tempFile = new File(fileDir + fileId + "_" + currUid);
			if (!tempFile.exists()) {
				file.transferTo(tempFile);
				
				retData.put("postedSize", tempFile.length());
			} else {
				RandomAccessFile raf = new RandomAccessFile(tempFile, "rw");
				raf.seek(tempFile.length());
				
				byte[] readContent = new byte[1024];
				int offset = 0;

				InputStream is = file.getInputStream();
				while ((offset = is.read(readContent)) != -1) {
					raf.write(readContent, 0, offset);
				}
				
				if (raf.length() >= fileSize) { // 上传完成
					retData.put("localPath", fileId + "_" + currUid);
					
					// 当前tomcat服务器所在ip
					InetAddress addr = InetAddress.getLocalHost();
					String ipStr = addr.getHostAddress().toString();
					retData.put("server", IPConvert.ipToLong(ipStr));
				}
				retData.put("postedSize", raf.length());
				
				raf.close();
				is.close();
			}
		} catch (Exception e) {
			log.error("post file error, {}", e);
		}
		
		return retData;
	}
	
	/**
	 * 获取指定fid的文件已上传的大小
	 * @param data
	 * @param model
	 * @return
	 */
	@Deprecated
	@RequestMapping(value = "/postedSize.do", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> getUploadedSize(@RequestBody Map<String,Object> data, Model model){
		Map<String, Object> retData = new HashMap<String, Object>();
		
		long postedSize = 0L;
		
		Map<String, String> file = (Map<String, String>) data.get("file");
		String fid = file.get("fileId");
		
		if (StringUtils.isNotBlank(fid)) {
			File tempFile = new File(fileDir + fid + "_" + currUid);
			if (tempFile.exists() && tempFile.isFile()) {
				postedSize = tempFile.length();
			} else {
				log.error("找不到指定的文件, fileFullPath={}"+ (fileDir + fid + "_" + currUid));
			}
		} else {
			log.error("获取文件已上传大小，fid不能为空！");
		}
		
		retData.put("postedSize", postedSize);
		
		return retData;
	}
	
	/**
	 * 根据fileId，删除文件
	 * @param fileId
	 * @param model
	 */
	@RequestMapping(value = "/deleteFile.do", method = RequestMethod.POST)
	public @ResponseBody void delete(@RequestParam String fileId, Model model){
		
		if (StringUtils.isNotBlank(fileId)) {
			File tempFile = new File(fileDir + fileId + "_" + currUid);
			if (tempFile.exists() && tempFile.isFile()) {
				tempFile.delete();
			} else {
				log.error("找不到要删除的文件, fileFullPath={}"+ (fileDir + fileId + "_" + currUid));
			}
		} else {
			log.error("删除文件操作，fid不能为空！");
		}
	}
	
	/**
	 * file server 对外提供接口，保存文件到DFS
	 * 
	 * @param request
	 */
	@RequestMapping(value= "/saveFile2DFS.do", method = RequestMethod.POST)
	public @ResponseBody String saveFile2DFS(HttpServletRequest request, HttpServletResponse response){
		// 1. 检查参数的合法性
		String token = request.getParameter("token"); // 对用户进行安全认证
		String userIdStr = request.getParameter("uid"); // 上传用户uid
		String compIdStr = request.getParameter("cid"); // 上传用户cid
		String fileId = request.getParameter("fileid"); // 当前上传文件在临时目录下的名称
		
		if (StringUtils.isBlank(token)) {
			log.info("token not allow blank");
			return null;
		}
		
		if (StringUtils.isBlank(userIdStr)) {
			log.error("userId not allow blank");
			return null;
		}
		
		if (StringUtils.isBlank(compIdStr)) {
			log.error("companyId not allow blank, current uid="+userIdStr);
			return null;
		}
		
		if (StringUtils.isBlank(fileId) || fileId.contains("/") || fileId.contains("\\")) {
			log.error("file dfspath not allow blank or filepath illegal, current uid=" 
					+ userIdStr + ", cid=" + compIdStr);
			return null;
		}
		
		// 2. 对用户进行安全认证
		long uid = Long.parseLong(userIdStr);
		long cid = Long.parseLong(compIdStr);
		
		/*if (!tokenAuthentication.authenticate(token, uid)){
			log.info("current user is not authentication");
			return null;
		}*/
		
		// 3. 保存文件
		File tempFile = new File(fileDir + fileId);
		String dfspath = null;
		if (tempFile.exists() && tempFile.isFile()) {
			try {
				FileInputStream fis = new FileInputStream(tempFile);
				dfspath = fileHandler.saveFile(fis, cid, uid);
			} catch (FileNotFoundException e) {
				log.error("saveFile2DFS fileNotFound, fileId={}", fileId);
			} catch (FileException e) {
				log.error("saveFile2DFS FileException, {}", e);
			}
		}
		
		return dfspath;
	}
	
	/**
	 * 异常处理
	 * @param ex
	 * @param request
	 */
	@ExceptionHandler(Exception.class)
	public void handleException(Exception ex, HttpServletRequest request) {
		
		if (ex instanceof MaxUploadSizeExceededException) {
			String fileId = request.getParameter("fileId");
			log.error("上传的文件长度超出限制，fileId={}", fileId);
		} else {
			log.error("文件上传出现异常了，{}", ex);
		}
	}
}