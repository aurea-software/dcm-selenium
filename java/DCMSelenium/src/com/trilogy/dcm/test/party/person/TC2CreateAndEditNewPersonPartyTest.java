package com.trilogy.dcm.test.party.person;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;

import com.trilogy.dcm.test.Order;
import com.trilogy.dcm.test.OrderedRunner;
import com.trilogy.dcm.test.TestUtils;
import com.trilogy.dcm.test.WebDriverHelper;

/**
 * Batch 1, Test Case 2
 */
@RunWith(OrderedRunner.class)
public class TC2CreateAndEditNewPersonPartyTest extends PersonPartyTest {

    private static final String TAX_ID = TestUtils.randomIntAsString(5);

    @Order(1)
    @Test
    public void testCreateParty() throws Exception {
        focusFrameSubpage();
        driver.findElement(By.id("Button_Person_Main_NewPerson")).click();

        focusFrameProppage();
        setText(By.id("Party.Salutation"), "Mr");
        setText(By.id("Party.FirstName"), "FN2");
        setText(By.id("Party.PreferredName"), "PN2");
        setText(By.id("Party.MiddleName"), "MN2");
        setText(By.id("Party.LastName"), "LN2");
        setText(By.id("Party.BirthDate"), "01/01/1970");
        setText(By.id("DTCCID"), "1111");
        setText(By.id("Party.NPN"), "2222");

        driver.findElement(By.cssSelector("button[data-id=SyncPDB]")).click();
        driver.findElement(By.linkText("No")).click();

        setText(By.id("Party.TaxID"), TAX_ID);
        driver.findElement(By.cssSelector("input[id=RoleEMPLOYEE] ~ i")).click();
        driver.findElement(By.cssSelector("input[id=RoleDISTRIBUTOR] ~ i")).click();

        setText(By.id("ContactPoint.Address.Street1"), "st1");
        setText(By.id("ContactPoint.Address.City"), "city2");

        WebDriverHelper.clickByReturnKey(driver, By.cssSelector("button[data-id=US_State]"));
        driver.findElement(By.linkText("Arizona")).click();

        setText(By.id("ZipCode"), "4444");
        driver.findElement(By.id("save")).click();

        focusFrameSubpage();
        String text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains(TAX_ID));
    }

    @Order(2)
    @Test
    public void testEditParty() {
        focusFrameSubpage();

        // The test case description requires to search by first name. We use
        // tax id instead of first name because first name is not unique.
        setText(By.id("Field_Person_Main_TaxID_Search_Value"), TAX_ID);
        driver.findElement(By.linkText("Search")).click();
        driver.findElement(By.id("Button_Person_Main_BasicInfo_EditGrid")).click();

        focusFrameProppage();

        driver.findElement(By.cssSelector("button[data-id=Party\\.Gender]")).click();
        driver.findElement(By.linkText("Male")).click();

        setText(By.id("Party.LastName"), "LN2New");
        setText(By.id("Party.FirstName"), "FN2New");
        driver.findElement(By.id("validate")).click();
        WebDriverHelper.assertNotExists(driver, By.id("ppError_div"));
        driver.findElement(By.id("save")).click();

        focusFrameSubpage();
        String text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains("LN2NEW"));
        assertTrue(text.contains("FN2NEW"));
    }

}
