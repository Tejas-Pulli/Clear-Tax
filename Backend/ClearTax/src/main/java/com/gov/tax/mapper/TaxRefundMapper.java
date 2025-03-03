package com.gov.tax.mapper;

import com.gov.tax.dto.TaxRefundDTO;
import com.gov.tax.entity.TaxRefund;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaxRefundMapper {
    TaxRefundDTO toDTO(TaxRefund taxRefund);

    TaxRefund toEntity(TaxRefundDTO taxRefundDTO);
}
