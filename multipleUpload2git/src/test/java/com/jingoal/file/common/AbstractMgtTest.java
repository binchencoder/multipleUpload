package com.jingoal.file.common;

import javax.sql.DataSource;

import org.codehaus.jackson.map.DeserializationConfig.Feature;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;


@RunWith(SpringJUnit4ClassRunner.class)
public abstract class AbstractMgtTest extends
		AbstractTransactionalJUnit4SpringContextTests {
	
	public static ObjectMapper mapper = new ObjectMapper();
	
	@Override
	@Autowired
	public void setDataSource(
			@Qualifier("dataSource.eicms") DataSource dataSource) {
		super.setDataSource(dataSource);
	}
	
	public <T> T getBean(Class<T> type) {
		return applicationContext.getBean(type);
	}

	public Object getBean(String beanName) {
		return applicationContext.getBean(beanName);
	}

	protected ApplicationContext getContext() {
		return applicationContext;
	}

	@BeforeClass
	public static void beforeClass(){
		// 设置输入时忽略在JSON字符串中存在但Java对象实际没有的属性
		mapper.disable(Feature.FAIL_ON_UNKNOWN_PROPERTIES);
	}
	
	@Before
	public void before() {
		
	}
}
