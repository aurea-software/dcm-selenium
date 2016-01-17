package com.trilogy.dcm.test;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

@Ignore
public class RemoteWebDriverTest {

    protected static WebDriver driver;

    @BeforeClass
    public static void beforeClass() throws Exception {
        if (WebDriverConfig.DRIVER_CHROME.equals(WebDriverConfig.getDriverName())) {
            driver = WebDriverHelper.buildRemoteChromeDriver();
        }
        else if (WebDriverConfig.DRIVER_FIREFOX.equals(WebDriverConfig.getDriverName())) {
            driver = WebDriverHelper.buildRemoteFirefoxDriver();
        }
        else if (WebDriverConfig.DRIVER_INTERNET_EXPLORER.equals(WebDriverConfig.getDriverName())) {
            driver = WebDriverHelper.buildRemoteInternetExplorerDriver();
        }
        else {
            driver = WebDriverHelper.buildDefaultRemoteDriver();
        }
    }

    @AfterClass
    public static void afterClass() throws Exception {
         driver.quit();
    }

    public static void setText(WebElement element, By by, String text) {
        WebDriverHelper.setText(element, by, text);
    }

    protected void setText(By by, String text) {
        WebDriverHelper.setText(driver, by, text);
    }

}
