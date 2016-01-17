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
 * Batch 1, Test Case 4
 */
@RunWith(OrderedRunner.class)
public class TC4EditBasicInfoTest extends PersonPartyTest {

    private static final String TAX_ID         = TestUtils.randomIntAsString(4);

    private static final String FIRST_NAME     = "FN" + TAX_ID;

    private static final String LAST_NAME      = "LN" + TAX_ID;

    private static final String MIDDLE_NAME    = "MN" + TAX_ID;

    private static final String PREFERRED_NAME = "PN" + TAX_ID;

    private static final String CITY           = "C" + TAX_ID;

    private static final String DTCC           = TAX_ID;

    private static final String NPN            = TAX_ID;

    private static final String STATE_NAME     = "Arizona";

    private static final String NEW_NUMBER     = "9";

    private static final String NEW_STRING     = "New";

    @Order(1)
    @Test
    public void testCreateParty() {
        createParty(TAX_ID, FIRST_NAME, LAST_NAME, MIDDLE_NAME, PREFERRED_NAME, CITY, STATE_NAME, DTCC, NPN);
    }

    @Order(2)
    @Test
    public void testEditBasicInfo() throws Exception {
        focusFrameSubpage();
        setText(By.id("Field_Person_Main_LastNameUpper_Search_Value"), LAST_NAME);
        driver.findElement(By.linkText("Search")).click();

        focusFrameSidebar();
        driver.findElement(By.id("Tab_Person_Main_BasicInfo_link")).click();

        focusFrameComponentIFrame();
        driver.findElement(By.id("Button_Person_Main_BasicInfo_Edit")).click();

        focusFrameProppage();
        setText(By.id("Party.MiddleName"), MIDDLE_NAME + NEW_STRING);
        setText(By.id("Party.PreferredName"), PREFERRED_NAME + NEW_STRING);
        setText(By.id("Party.TaxID"), TAX_ID + NEW_NUMBER);
        setText(By.id("Party.NPN"), NPN + NEW_NUMBER);

        driver.findElement(By.id("save")).click();

        focusFrameComponentIFrame();
        String text = driver.findElement(By.id("Inspector_Person_Main_BasicInfo_rollup_div")).getText();
        assertTrue(text.contains(MIDDLE_NAME + NEW_STRING));
        assertTrue(text.contains(PREFERRED_NAME + NEW_STRING));
        assertTrue(text.contains(TAX_ID + NEW_NUMBER));
        assertTrue(text.contains(NPN + NEW_NUMBER));

        driver.findElement(By.id("Button_Person_Main_BasicInfo_Edit")).click();

        focusFrameProppage();
        setText(By.id("DTCCID"), DTCC + NEW_NUMBER);
        driver.findElement(By.id("save")).click();
        text = driver.findElement(By.id("ppError_div")).getText();
        assertTrue(text.contains("Input for property: DTCCID is too long, the maximum size is 4."));
        driver.findElement(By.id("cancel")).click();

        focusFrameSidebar();
        driver.findElement(By.id("Tab_Person_Main_BasicInfo_Comments_link")).click();

        focusFrameComponentIFrame();
        driver.findElement(By.id("Button_Person_Main_BasicInfo_NewComment")).click();

        focusFrameProppage();
        driver.findElement(By.cssSelector("button[data-id=PredefinedCommentCode]")).click();

        WebElement commentCodes = driver.findElement(By.cssSelector("button[data-id=PredefinedCommentCode] ~ div"));
        text = commentCodes.getAttribute("innerHTML");
        TestUtils.assertContains(text, true, "(00) - New", "(01) - Comment 1", "(02) - Another Comment",
                "(03) - One more comment");

        commentCodes.findElement(By.linkText("(00) - New")).click();

        String comment = "this is a new comment";
        setText(By.id("Comment"), comment);

        driver.findElement(By.id("validate")).click();
        WebElement ppBody = driver.findElement(By.id("ppBody"));
        WebDriverHelper.assertNotExists(ppBody, By.id("ppError_div"));

        driver.findElement(By.id("save")).click();

        focusFrameComponentIFrame();
        text = driver.findElement(By.id("Grid_Person_Main_BasicInfo_PartyComments")).getText();
        assertTrue(text.contains(comment.toUpperCase()));

        focusFrameSidebar();
        driver.findElement(By.id("Tab_Person_Main_BasicInfo_Status_link")).click();

        focusFrameComponentIFrame();
        driver.findElement(By.id("Button_Person_Main_BasicInfo_UpdatePartyStatus")).click();

        focusFrameProppage();
        driver.findElement(By.cssSelector("button[data-id=NewStatus\\.StatusCode]")).click();
        driver.findElement(By.linkText("Not Recontractable")).click();

        setText(By.id("NewStatus.StartDate"), "01/01/2015");
        driver.findElement(By.id("validate")).click();

        text = driver.findElement(By.id("ppError_div")).getText();
        assertTrue(text.contains("Warning:The new status completely overlaps one or more existing statuses"));

        // Click twice due to the warning
        driver.findElement(By.id("save")).click();
        driver.findElement(By.id("save")).click();

        focusFrameComponentIFrame();
        text = driver.findElement(By.id("Grid_Person_Main_BasicInfo_Status_div")).getText();
        assertTrue(text.contains("Not Recontractable".toUpperCase()));
    }

}
