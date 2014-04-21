package com.jingoal.file.test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.Consts;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.junit.Test;


public class FileUploadTest {
	
	
	@Test
	public void uploadTest() throws ClientProtocolException, IOException{
		CloseableHttpClient httpClient = HttpClients.createDefault();
		
		try {
			List<NameValuePair> list = new ArrayList<NameValuePair>();
			list.add(new BasicNameValuePair("uid", 2+""));
			list.add(new BasicNameValuePair("cid", 2+""));
			list.add(new BasicNameValuePair("fileid", "E74DB26A90E45D9C3BF3473DE9B93030_2"));
			list.add(new BasicNameValuePair("token", "token"));
			
			HttpHost httpHost = new HttpHost("localhost", 80, "http");
			
			HttpPost httpPost = new HttpPost("/multipleUpload/modulefileupload/saveFile2DFS.do");
			httpPost.setEntity(new UrlEncodedFormEntity(list, Consts.UTF_8));
			
			System.out.println("Executing request " + httpPost.getRequestLine());
			
			// Create a custom response handler
			ResponseHandler<String> responseHandler = new ResponseHandler<String>() {

				public String handleResponse(
                        final HttpResponse response) throws ClientProtocolException, IOException {
                    int status = response.getStatusLine().getStatusCode();
                    System.out.println(status);
                    if (status >= 200 && status < 300) {
                        HttpEntity entity = response.getEntity();
                        return entity != null ? EntityUtils.toString(entity) : null;
                    } else {
                        throw new ClientProtocolException("Unexpected response status: " + status);
                    }
                }
				
			};
			
			String responseBody = httpClient.execute(httpHost, httpPost, responseHandler);
            System.out.println("----------------------------------------");
            System.out.println(responseBody);
		} finally {
			httpClient.close();
		}
	}

}
