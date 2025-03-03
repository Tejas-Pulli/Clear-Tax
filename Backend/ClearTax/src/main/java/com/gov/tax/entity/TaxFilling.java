package com.gov.tax.entity;

import java.time.LocalDate;
import java.time.Year;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Data
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class TaxFilling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taxFilingId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate filingDate;

    @Column(nullable = false)
    @Builder.Default
    private String fillingStatus = "Pending";

    @Column(nullable = false)
    private Year taxYear;
    
    @Column(name = "pdf_generated", nullable = false)
    @Builder.Default
    private boolean pdfGenerated = false;

    @Column(nullable = false)
    private String refundStatus;

}
