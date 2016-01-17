package com.trilogy.dcm.test;

import java.io.IOException;
import java.util.Properties;

public class WebDriverConfig {

    public static final String      DRIVER_CHROME            = "chrome";

    public static final String      DRIVER_FIREFOX           = "firefox";

    public static final String      DRIVER_INTERNET_EXPLORER = "internet explorer";

    private static final String     KEY_REMOTE_HOST          = "remote.host";

    private static final String     KEY_REMOTE_PORT          = "remote.port";

    private static final String     KEY_REMOTE_URL           = "remote.url";

    private static final String     KEY_DRIVER_NAME          = "driver.name";

    private static final String     KEY_TIMEOUT_IN_SECONDS   = "timeout.in.seconds";

    private static final Properties config;

    static {
        try {
            config = PropertiesReader.readAll("META-INF/conf.properties");
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static String getRemoteHost() {
        return config.getProperty(KEY_REMOTE_HOST);
    }

    public static String getRemotePort() {
        return config.getProperty(KEY_REMOTE_PORT);
    }

    public static String getRemoteUrl() {
        return config.getProperty(KEY_REMOTE_URL);
    }

    public static String getDriverName() {
        return config.getProperty(KEY_DRIVER_NAME);
    }

    public static long getTimeoutInSeconds() {
        String value = config.getProperty(KEY_TIMEOUT_IN_SECONDS);

        try {
            return Long.parseLong(value);
        }
        catch (NumberFormatException e) {
            return 0;
        }
    }

    private WebDriverConfig() {
    }

}
