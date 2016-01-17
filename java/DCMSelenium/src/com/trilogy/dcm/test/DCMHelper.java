package com.trilogy.dcm.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class DCMHelper {

    public static void login(WebDriver driver) {
        driver.get(DCMConstants.BASE_URL + DCMConstants.LOGIN_PATH);
        driver.findElement(By.name("LOGINNAME")).clear();
        driver.findElement(By.name("LOGINNAME"))
                .sendKeys(DCMConstants.USERNAME);
        driver.findElement(By.name("PASSWORD")).clear();
        driver.findElement(By.name("PASSWORD")).sendKeys(DCMConstants.PASSWORD);
        driver.findElement(By.xpath("//button[@type='submit']")).click();
    }

}
