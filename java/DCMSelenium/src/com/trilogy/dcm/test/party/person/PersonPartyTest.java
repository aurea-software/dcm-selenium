package com.trilogy.dcm.test.party.person;

import static org.junit.Assert.assertTrue;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;

import com.trilogy.dcm.test.DCMHelper;
import com.trilogy.dcm.test.Order;
import com.trilogy.dcm.test.RemoteWebDriverTest;
import com.trilogy.dcm.test.WebDriverHelper;

@Ignore
public class PersonPartyTest extends RemoteWebDriverTest {

    @Order(Integer.MIN_VALUE)
    @Test
    public void testLogin() {
        DCMHelper.login(driver);
        assertTrue(true);
    }

    @Order(Integer.MIN_VALUE + 1)
    @Test
    public void testOpenPage() {
        WebDriverHelper.selectFrame(driver, "navbar");
        driver.findElement(By.id("Party")).click();
        assertTrue(true);
    }

    protected void focusFrameSidebar() {
        WebDriverHelper.selectFrame(driver, "sidebar");
    }

    protected void focusFrameSubpage() {
        WebDriverHelper.selectFrame(driver, "container", "cacheframe0", "subpage");
    }

    protected void focusFrameComponentIFrame() {
        WebDriverHelper.selectFrame(driver, "container", "cacheframe0", "subpage", "component_iframe");
    }

    protected void focusFrameProppage() {
        WebDriverHelper.selectFrame(driver, "container", "cacheframe0", "proppage");
    }

    protected void createParty(String taxId, String firstName, String lastName, String middleName, String preferredName,
            String city, String stateName, String dtcc, String npn) {
        driver.navigate().refresh();

        focusFrameSubpage();
        driver.findElement(By.id("Button_Person_Main_NewPerson")).click();

        focusFrameProppage();
        WebDriverHelper.setText(driver, By.id("Party.Salutation"), "Mr");
        WebDriverHelper.setText(driver, By.id("Party.FirstName"), firstName);
        WebDriverHelper.setText(driver, By.id("Party.PreferredName"), preferredName);
        WebDriverHelper.setText(driver, By.id("Party.MiddleName"), middleName);
        WebDriverHelper.setText(driver, By.id("Party.LastName"), lastName);
        WebDriverHelper.setText(driver, By.id("Party.BirthDate"), "01/01/1970");
        WebDriverHelper.setText(driver, By.id("DTCCID"), dtcc);
        WebDriverHelper.setText(driver, By.id("Party.NPN"), npn);

        driver.findElement(By.cssSelector("button[data-id=SyncPDB]")).click();
        driver.findElement(By.linkText("No")).click();

        WebDriverHelper.setText(driver, By.id("Party.TaxID"), taxId);
        driver.findElement(By.cssSelector("input[id=RoleEMPLOYEE] ~ i")).click();
        driver.findElement(By.cssSelector("input[id=RoleDISTRIBUTOR] ~ i")).click();

        WebDriverHelper.setText(driver, By.id("ContactPoint.Address.Street1"), "Street 1");
        WebDriverHelper.setText(driver, By.id("ContactPoint.Address.City"), city);

        WebDriverHelper.clickByReturnKey(driver, By.cssSelector("button[data-id=US_State]"));
        driver.findElement(By.linkText(stateName)).click();

        WebDriverHelper.setText(driver, By.id("ZipCode"), "4444");
        driver.findElement(By.id("save")).click();

        focusFrameSubpage();
        String text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains(taxId));
    }

}
