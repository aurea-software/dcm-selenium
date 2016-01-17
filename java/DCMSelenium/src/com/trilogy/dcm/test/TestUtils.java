package com.trilogy.dcm.test;

import static org.junit.Assert.assertEquals;

import java.util.Random;

public class TestUtils {

    public static void assertContains(String text, boolean contained, String... chunks) {
        for (String chunk : chunks) {
            assertEquals(contained, text.contains(chunk));
        }
    }

    public static int randomInt(int length) {
        return Integer.parseInt(randomIntAsString(length));
    }

    public static String randomIntAsString(int length) {
        if (length <= 0 || length >= 10) {
            throw new IllegalArgumentException(
                    "length [" + length + "] is invalid. The value must be between 1 and 9 inclusively.");
        }

        Random random = new Random();
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < length; ++i) {
            builder.append(random.nextInt(9) + 1);
        }

        return builder.toString();
    }

}
