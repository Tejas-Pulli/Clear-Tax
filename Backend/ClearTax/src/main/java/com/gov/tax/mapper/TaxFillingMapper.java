package com.gov.tax.mapper;

import com.gov.tax.dto.TaxFillingDTO;
import com.gov.tax.entity.TaxFilling;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaxFillingMapper {
    TaxFillingDTO toDTO(TaxFilling taxFiling);

    TaxFilling toEntity(TaxFillingDTO taxFilingDTO);
}
