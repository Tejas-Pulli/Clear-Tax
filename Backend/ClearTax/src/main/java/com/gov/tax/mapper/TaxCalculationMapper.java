package com.gov.tax.mapper;

import org.mapstruct.Mapper;

import com.gov.tax.dto.TaxCalculationDTO;
import com.gov.tax.entity.TaxCalculation;

@Mapper(componentModel = "spring")
public interface TaxCalculationMapper {
	TaxCalculationDTO toDTO(TaxCalculation taxCalculation);

	TaxCalculation toEntity(TaxCalculationDTO taxCalculationDTO);
}
