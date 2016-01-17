package com.trilogy.dcm.test;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class PropertiesReader {

    public static Properties readAll(String path) throws IOException {
        InputStream is = PropertiesReader.class.getClassLoader().getResourceAsStream(path);
        Properties properties = new Properties();
        properties.load(is);
        return properties;
    }

}
