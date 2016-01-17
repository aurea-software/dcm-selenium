package com.trilogy.dcm.test.party.person;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.trilogy.dcm.test.Order;
import com.trilogy.dcm.test.OrderedRunner;
import com.trilogy.dcm.test.TestUtils;
import com.trilogy.dcm.test.WebDriverHelper;

/**
 * Batch 1, Test Case 1
 */
@RunWith(OrderedRunner.class)
public class TC1ValidateNewPersonPartyDataTest extends PersonPartyTest {

    private static final String ERR_TAX_ID   = "Enter TaxID, It is required to fetch NPN from PDB";

    private static final String ERR_STREET_1 = "Mailing Communications Mode requires that at least Street1 be specified";

    private static final String ERR_CITY     = "Mailing Communications Mode requires that the City be specified";

    private static final String ERR_ZIP      = "Mailing Communications Mode requires that the Zip Code/Postal Code be specified";

    private static final String ERR_ROLE     = "New Parties must play at least one role";

    private static final String TAX_ID       = TestUtils.randomIntAsString(5);

    @Order(1)
    @Test
    public void testBlankForm() throws Exception {
        driver.navigate().refresh();

        focusFrameSubpage();
        driver.findElement(By.id("Button_Person_Main_NewPerson")).click();

        focusFrameProppage();
        driver.findElement(By.id("validate")).click();
        String text = driver.findElement(By.id("ppError_div")).getText();
        TestUtils.assertContains(text, true, ERR_TAX_ID, ERR_STREET_1, ERR_CITY, ERR_ZIP, ERR_ROLE);
    }

    @Order(2)
    @Test
    public void testHalfBlankForm() throws Exception {
        driver.navigate().refresh();

        focusFrameSubpage();
        driver.findElement(By.id("Button_Person_Main_NewPerson")).click();

        WebDriverHelper.selectFrame(driver, "container", "cacheframe0", "proppage");
        setText(By.id("Party.FirstName"), "FN1");
        setText(By.id("Party.LastName"), "LN1");

        // SyncPDB
        driver.findElement(By.cssSelector("button[data-id=SyncPDB]")).click();
        driver.findElement(By.linkText("No")).click();

        setText(By.id("Party.TaxID"), TAX_ID);
        driver.findElement(By.cssSelector("input[id=RoleDISTRIBUTOR] ~ i")).click();

        driver.findElement(By.id("validate")).click();
        String text = driver.findElement(By.id("ppError_div")).getText();
        TestUtils.assertContains(text, true, ERR_STREET_1, ERR_CITY, ERR_ZIP);
    }

    @Order(3)
    @Test
    public void testValidForm() throws Exception {
        driver.navigate().refresh();

        focusFrameSubpage();
        driver.findElement(By.id("Button_Person_Main_NewPerson")).click();

        focusFrameProppage();
        setText(By.id("Party.FirstName"), "FN1");
        setText(By.id("Party.LastName"), "LN1");

        // SyncPDB
        driver.findElement(By.cssSelector("button[data-id=SyncPDB]")).click();
        driver.findElement(By.linkText("No")).click();

        setText(By.id("Party.TaxID"), TAX_ID);

        if (!driver.findElement(By.cssSelector("input[id=RoleDISTRIBUTOR]")).isSelected()) {
            driver.findElement(By.cssSelector("input[id=RoleDISTRIBUTOR] ~ i")).click();
        }

        setText(By.id("ContactPoint.Address.Street1"), "street1");
        setText(By.id("ContactPoint.Address.City"), "city1");
        setText(By.id("ZipCode"), "12347");

        driver.findElement(By.id("validate")).click();
        WebElement ppBody = driver.findElement(By.id("ppBody"));
        WebDriverHelper.assertNotExists(ppBody, By.id("ppError_div"));

        driver.findElement(By.id("save")).click();

        focusFrameSubpage();
        String text = driver.findElement(By.id("Grid_Person_Main")).getText();
        // As per the test case description, we need to validate by first name
        // and last name. These values are not necessarily to be unique. Hence,
        // we validate by SSN / Tax instead.
        assertTrue(text.contains(TAX_ID));
    }
}
