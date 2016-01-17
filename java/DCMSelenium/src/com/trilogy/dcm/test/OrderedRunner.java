package com.trilogy.dcm.test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.junit.runners.BlockJUnit4ClassRunner;
import org.junit.runners.model.FrameworkMethod;
import org.junit.runners.model.InitializationError;

/**
 * The execution order of junit test cases is not guaranteed to be the
 * declaration order. This runner is to control the order of execution.
 * 
 * @author joscarsson
 * @author Linh Bui - Adapted for DCM.
 */
public class OrderedRunner extends BlockJUnit4ClassRunner {
    public OrderedRunner(Class<?> klass) throws InitializationError {
        super(klass);
    }

    @Override
    protected List<FrameworkMethod> computeTestMethods() {
        List<FrameworkMethod> list = new ArrayList<FrameworkMethod>(
                super.computeTestMethods());

        Collections.sort(list, new Comparator<FrameworkMethod>() {
            @Override
            public int compare(FrameworkMethod f1, FrameworkMethod f2) {
                Order o1 = f1.getAnnotation(Order.class);
                Order o2 = f2.getAnnotation(Order.class);

                // Test cases without the Order annotations will be executed
                // last
                if (o1 == null) {
                    return 1;
                }

                if (o2 == null) {
                    return -1;
                }

                // Do NOT return o1.value() - o2.value(). If the values are
                // Integer.MIN_VALUE, Integer.MAX_VALUE, ..., the result of this
                // subtraction will surpass the limitation of Int (and
                // therefore, the returned value will be wrong).
                return o1.value() <= o2.value() ? -1 : 1;
            }
        });

        return list;
    }
}