package com.memoiredecode.api.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Component
public class DatabaseConfig implements BeanFactoryPostProcessor, EnvironmentAware {

    private ConfigurableEnvironment environment;

    @Override
    public void setEnvironment(Environment environment) {
        if (environment instanceof ConfigurableEnvironment) {
            this.environment = (ConfigurableEnvironment) environment;
        }
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        if (environment == null) {
            return;
        }
        String url = environment.getProperty("spring.datasource.url");
        if (url != null && url.startsWith("jdbc:postgresql://") && url.contains("@")) {
            try {
                String cleanUriStr = url.substring(5);
                URI uri = new URI(cleanUriStr);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    String username = parts[0];
                    String password = parts[1];

                    // Reconstruct clean JDBC URL
                    String host = uri.getHost();
                    int port = uri.getPort();
                    String path = uri.getPath();
                    String query = uri.getQuery();

                    StringBuilder newUrl = new StringBuilder("jdbc:postgresql://");
                    newUrl.append(host);
                    if (port != -1) {
                        newUrl.append(":").append(port);
                    }
                    newUrl.append(path);
                    if (query != null) {
                        newUrl.append("?").append(query);
                    }

                    Map<String, Object> overrideProps = new HashMap<>();
                    overrideProps.put("spring.datasource.url", newUrl.toString());
                    overrideProps.put("spring.datasource.username", username);
                    overrideProps.put("spring.datasource.password", password);

                    environment.getPropertySources().addFirst(
                        new MapPropertySource("railwayDatabaseOverrides", overrideProps)
                    );
                    System.out.println("DATABASE_CONFIG: Overrode inline credentials in spring.datasource properties via BeanFactoryPostProcessor.");
                }
            } catch (Exception e) {
                System.err.println("DATABASE_CONFIG: Failed to parse credentials in BeanFactoryPostProcessor: " + e.getMessage());
            }
        }
    }
}
