package com.trilogy.dcm.test.party.person;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.trilogy.dcm.test.Order;
import com.trilogy.dcm.test.OrderedRunner;
import com.trilogy.dcm.test.TestUtils;

/**
 * Batch 1, Test Case 3
 */
@RunWith(OrderedRunner.class)
public class TC3SearchPersonPartyTest extends PersonPartyTest {

    private static final String R1                = TestUtils.randomIntAsString(3);

    private static final String R2                = TestUtils.randomIntAsString(3);

    private static final String R                 = TestUtils.randomIntAsString(5);

    private static final String TAX_ID_1          = TestUtils.randomIntAsString(5);

    private static final String TAX_ID_2          = String.valueOf(Integer.parseInt(TAX_ID_1) + 1);

    private static final String FIRST_NAME_PREFIX = "FN" + R;

    private static final String FIRST_NAME_1      = FIRST_NAME_PREFIX + TAX_ID_1;

    private static final String FIRST_NAME_2      = FIRST_NAME_PREFIX + TAX_ID_2;

    private static final String LAST_NAME_PREFIX  = "LN" + R;

    private static final String LAST_NAME_1       = LAST_NAME_PREFIX + TAX_ID_1;

    private static final String LAST_NAME_2       = LAST_NAME_PREFIX + TAX_ID_2;

    private static final String MIDDLE_NAME       = "Middle Name";

    private static final String PREFERRED_NAME    = "Preferred Name";

    private static final String CITY_1            = "C" + TAX_ID_1;

    private static final String CITY_2            = "C" + TAX_ID_2;

    private static final String DTCC_1            = "D" + R1;

    private static final String DTCC_2            = "D" + R2;

    private static final String NPN_1             = "N" + R1;

    private static final String NPN_2             = "N" + R2;

    private static final String STATE_CODE        = "AZ";

    private static final String STATE_NAME        = "Arizona";

    @Order(1)
    @Test
    public void testCreateParty1() {
        createParty(TAX_ID_1, FIRST_NAME_1, LAST_NAME_1, MIDDLE_NAME, PREFERRED_NAME, CITY_1, STATE_NAME, DTCC_1,
                NPN_1);
    }

    @Order(2)
    @Test
    public void testCreateParty2() {
        createParty(TAX_ID_2, FIRST_NAME_2, LAST_NAME_2, MIDDLE_NAME, PREFERRED_NAME, CITY_2, STATE_NAME, DTCC_2,
                NPN_2);
    }

    @Order(3)
    @Test
    public void testSearchParty() {
        focusFrameSubpage();

        WebElement primaryForm = driver.findElement(By.id("Search_Person_Main_primaryForm"));

        // Search party 2 by first name and last name
        setText(primaryForm, By.id("Field_Person_Main_FirstName_Search_Value"), FIRST_NAME_2);
        setText(primaryForm, By.id("Field_Person_Main_LastNameUpper_Search_Value"), LAST_NAME_2);
        driver.findElement(By.linkText("Search")).click();

        String text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains(FIRST_NAME_2));
        assertTrue(text.contains(LAST_NAME_2));
        assertTrue(text.contains(TAX_ID_2));

        // Search party 1 by first name, last name and tax id
        setText(primaryForm, By.id("Field_Person_Main_FirstName_Search_Value"), FIRST_NAME_1);
        setText(primaryForm, By.id("Field_Person_Main_LastNameUpper_Search_Value"), LAST_NAME_1);
        setText(primaryForm, By.id("Field_Person_Main_TaxID_Search_Value"), TAX_ID_1);
        driver.findElement(By.linkText("Search")).click();

        text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains(FIRST_NAME_1));
        assertTrue(text.contains(LAST_NAME_1));
        assertTrue(text.contains(TAX_ID_1));

        // Advanced search
        driver.findElement(By.id("Search_Person_Main_ShowHideSearchLink")).click();

        WebElement form = driver.findElement(By.id("Search_Person_Main_form"));

        // Search by first name prefix and last name prefix
        setText(form, By.id("Field_Person_Main_FirstName_Search_Value"), FIRST_NAME_PREFIX + "*");
        setText(form, By.id("Field_Person_Main_LastNameUpper_Search_Value"), LAST_NAME_PREFIX + "*");
        driver.findElement(By.linkText("Search")).click();

        text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains(FIRST_NAME_1));
        assertTrue(text.contains(LAST_NAME_1));
        assertTrue(text.contains(TAX_ID_1));
        assertTrue(text.contains(FIRST_NAME_2));
        assertTrue(text.contains(LAST_NAME_2));
        assertTrue(text.contains(TAX_ID_2));

        // Search by DTCC, NPN, City and State
        setText(form, By.id("Field_Person_Main_DTCCID_Search_Value"), DTCC_1);
        setText(form, By.id("Field_Person_Main_NPN_Search_Value"), NPN_1);
        setText(form, By.id("Field_Person_Main_City_Search_Value"), CITY_1);
        setText(form, By.id("Field_Person_Main_State_Search_Value"), STATE_CODE);
        driver.findElement(By.linkText("Search")).click();

        text = driver.findElement(By.id("Grid_Person_Main")).getText();
        assertTrue(text.contains(FIRST_NAME_1));
        assertTrue(text.contains(LAST_NAME_1));
        assertTrue(text.contains(TAX_ID_1));

        // Sort
        setText(form, By.id("Field_Person_Main_FirstName_Search_Value"), FIRST_NAME_PREFIX + "*");
        form.findElement(By.id("Field_Person_Main_LastNameUpper_Search_Value")).clear();
        form.findElement(By.id("Field_Person_Main_DTCCID_Search_Value")).clear();
        form.findElement(By.id("Field_Person_Main_NPN_Search_Value")).clear();
        form.findElement(By.id("Field_Person_Main_City_Search_Value")).clear();
        form.findElement(By.id("Field_Person_Main_State_Search_Value")).clear();
        driver.findElement(By.linkText("Search")).click();

        // Sort by party id
        // By default the table is sorted by party id in ascending order. Click
        // once to turn the order to descending.
        driver.findElement(By.cssSelector("#Field_Person_Main_PartyID_Grid > span.column-text")).click();
        text = driver.findElement(By.id("Grid_Person_Main")).getText();

        // We intentionally create party 1 before party 2. We also setup tax id
        // 2 to be bigger than tax id 1 intentionally.
        // Hence, party ids and tax ids have the same order.
        assertTrue(text.contains(TAX_ID_1));
        assertTrue(text.contains(TAX_ID_2));

        int index = text.indexOf(TAX_ID_2);
        assertTrue(text.substring(index).contains(TAX_ID_1));

        // Sort by tax id
        // Click twice to turn the order to descending.
        driver.findElement(By.cssSelector("#Field_Person_Main_TaxID_Grid > span.column-text")).click();
        driver.findElement(By.cssSelector("#Field_Person_Main_TaxID_Grid > span.column-text")).click();

        assertTrue(text.contains(TAX_ID_1));
        assertTrue(text.contains(TAX_ID_2));

        index = text.indexOf(TAX_ID_2);
        assertTrue(text.substring(index).contains(TAX_ID_1));
    }

}
