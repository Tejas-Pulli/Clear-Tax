package com.gov.tax.mapper;

import com.gov.tax.dto.TaxPaymentDTO;
import com.gov.tax.entity.TaxPayment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaxPaymentMapper {
    TaxPaymentDTO toDTO(TaxPayment taxPayment);

    TaxPayment toEntity(TaxPaymentDTO taxPaymentDTO);
}
