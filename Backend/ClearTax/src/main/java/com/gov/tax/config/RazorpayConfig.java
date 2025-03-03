package com.gov.tax.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Configuration
public class RazorpayConfig {
	@Value("${razorpay.api.key}")
    private String keyId ;

    @Value("${razorpay.api.secret}")
    private static  String keySecret ;
	@Bean
	RazorpayClient razorpayClient() throws RazorpayException {
		return new RazorpayClient(keyId, keySecret);
	}
	public static String getSecret() {
		return keySecret;
	}
}