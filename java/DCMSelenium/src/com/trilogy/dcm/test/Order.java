package com.trilogy.dcm.test;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * @author joscarsson
 * @author Linh Bui - Adapted for DCM.
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface Order {
    public int value();
}
