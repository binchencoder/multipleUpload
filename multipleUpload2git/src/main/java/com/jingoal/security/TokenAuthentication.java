package com.jingoal.security;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.jingoal.cache.CacheClient;

@Component
public class TokenAuthentication {
	
	private Logger log = LoggerFactory.getLogger(TokenAuthentication.class);

	@Autowired
	@Qualifier(value = "cacheClient.onlyMemcached")
	private CacheClient cacheClient;

	/**
	 * token
	 * 
	 * @param token
	 * @param uid
	 * @return true: 成功认证通过，false 失败
	 */
	@SuppressWarnings("unchecked")
	public boolean authenticate(String token, long uid) {
		
		try {
			Map<String, Long> map = (Map<String, Long>) cacheClient.get(token);

			if (map != null) {
				Long expired = (Long)map.get("expired");
				if (null == expired) {
					return false;
				}
				
				if (System.currentTimeMillis() > expired.longValue()) {
					cacheClient.remove0(token);
					return false;
				}
		        
				Long cacheUserId = map.get("userId");
				if (cacheUserId.longValue() > 0) {
					if (uid == cacheUserId.longValue()) {
						return true;
					}
				}
			} else {
				log.warn(
						"TokenAuthentication: token={} cannot find value in memcache",
						token);
			}
		} catch (Exception e) {
			log.error("TokenAuthentication error:token:{},uid:{}, {} ",
					new Object[] { token, uid, e });
		}
		return false;
	}
}
