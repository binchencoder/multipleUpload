package com.jingoal.common.fileupload;

import java.io.File;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.jingoal.upload.utils.IPConvert;



@Controller
@RequestMapping("/mgtfileupload")
public class MgtFileUploadController {

	private static Logger log= LoggerFactory.getLogger(MgtFileUploadController.class);
	
	@Value("${file.upload.temp.dir}")
	private String fileDir;

	@RequestMapping(value = "/status", method = RequestMethod.GET)
	public @ResponseBody
	ProgressStatus fileUploadForm2(@RequestParam("X-Progress-ID") String idoo) {
		return ProgressStatus.none;//假数据
	}

	@RequestMapping(value = "/post", method = RequestMethod.POST)
	public String processUpload(@RequestParam MultipartFile file, Model model,
			@RequestParam("idoo") String idoo) {
		log.info(" file.getSize(): " + file.getSize() + " . "
				+ file.getOriginalFilename() + " . "
				+ file.getClass().getName());

		try {
			File f = new File(fileDir + idoo);
			file.transferTo(f);
			model.addAttribute("ok", true);
			model.addAttribute("size", file.getSize() + "");

			// 当前tomcat服务器所在ip
			InetAddress addr = InetAddress.getLocalHost();
			String ipStr = addr.getHostAddress().toString();
			model.addAttribute("server", IPConvert.ipToLong(ipStr));
		} catch (Exception e) {
			model.addAttribute("ok", false);
			model.addAttribute("size", "0");
			log.error("processUpload", e);
		}

		model.addAttribute("idoo", idoo);
		
		return "common/mgtfileuploadResult";
	}

	@ExceptionHandler(Exception.class)
	public ModelAndView handleException(Exception ex, HttpServletRequest request) {

		Map<String, String> model = new HashMap<String, String>();
//		String idoo = request.getParameter("idoo");
//		CommonLog.log.error("ooo exception " + request.getParameter("idoo"));
		log.error("ooo", ex);

		model.put("ok", "false");

		if (ex instanceof MaxUploadSizeExceededException) {
			model.put("size", 10240000000L + "");// 10g, 最大值了
		} else {
			model.put("size", "0");// 10g, 最大值了
		}

		return new ModelAndView("common/mgtfileuploadResult", model);

	}
}
