package com.gov.tax.config;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.gov.tax.exception.MethodExecutionException;

//  Aspect class that logs method execution details for controllers and service
//  implementations. This helps in tracking method calls, parameters, return
//  values, and exceptions.

@Aspect
@Component
public class LogAspect {

	private static final Logger logger = LoggerFactory.getLogger(LogAspect.class);

	// ThreadLocal variable to store method start time for each thread (request).
	private static final ThreadLocal<Long> startTimeThreadLocal = new ThreadLocal<>();

//	  Defines a pointcut that captures all method executions in controller and
//	  service implementation packages.
	@Pointcut("execution(* com.gov.tax.controller..*(..)) || execution(* com.gov.tax.service.impl..*(..))")
	public void clearTaxPointcut() {
	}

//	Logs method name and arguments before execution starts.
	@Before(value = "clearTaxPointcut()")
	public void logBeforeMethod(JoinPoint joinPoint) {
	    if (logger.isInfoEnabled()) {  // Check if INFO level logging is enabled
	        Object[] args = joinPoint.getArgs();
	        logger.info("Method called: {} | Arguments: {}", joinPoint.getSignature(),
	                (args.length > 0 ? Arrays.toString(args) : "No arguments"));
	    }
	}

	// Logs method exit after execution completes, regardless of whether it returns
	// successfully or throws an exception.
	@After(value = "clearTaxPointcut()")
	public void logAfterMethodCompletes(JoinPoint joinPoint) {
		logger.info("Method execution finished: {}", joinPoint.getSignature());
	}

	// Logs method return details if execution completes successfully.
	@AfterReturning(value = "clearTaxPointcut()", returning = "result")
	public void logAfterMethodReturns(JoinPoint joinPoint, Object result) {
		logger.info("Method returned: {} | Result: {}", joinPoint.getSignature(), result);
	}

	// Logs an error message if a method throws an exception during execution.
	@AfterThrowing(value = "clearTaxPointcut()", throwing = "exception")
	public void logException(JoinPoint joinPoint, Exception exception) {
		logger.error("Exception in method: {} | Cause: {}", joinPoint.getSignature(), exception.getMessage(),
				exception);
	}

	// Around advice that logs before and after method execution.
	@Around("clearTaxPointcut()")
	public Object logAroundMethod(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
	    long startTime = 0;
	    
	    if (logger.isInfoEnabled()) {  // Only log if INFO level is enabled
	        startTime = System.nanoTime(); // Capture start time only when needed
	        startTimeThreadLocal.set(startTime);
	        Object[] args = proceedingJoinPoint.getArgs();
	        logger.info("Method called: {} | Arguments: {} | Timestamp: {}", 
	                    proceedingJoinPoint.getSignature(), 
	                    (args.length > 0 ? Arrays.toString(args) : "No arguments"), 
	                    System.currentTimeMillis());
	    }

	    // Proceed with method execution
	    Object result;
	    try {
	        result = proceedingJoinPoint.proceed();
	    } catch (Exception ex) {
	        throw new MethodExecutionException("Error executing method: " + proceedingJoinPoint.getSignature(), ex);
	    }


	    if (logger.isInfoEnabled()) {  // Only log return details if INFO level is enabled
	        long duration = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startTime);
	        logger.info("Method returned: {} | Result: {} | Duration: {} ms | Timestamp: {}", 
	                    proceedingJoinPoint.getSignature(), 
	                    result, 
	                    duration, 
	                    System.currentTimeMillis());
	        startTimeThreadLocal.remove(); // Clean up ThreadLocal only when used
	    }

	    return result;
	}

}
