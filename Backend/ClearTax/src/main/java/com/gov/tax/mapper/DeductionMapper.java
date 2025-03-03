package com.gov.tax.mapper;

import org.mapstruct.Mapper;

import com.gov.tax.dto.DeductionDTO;
import com.gov.tax.entity.Deduction;

@Mapper(componentModel = "spring")
public interface DeductionMapper {

	DeductionDTO deductionToDeductionDTO(Deduction deduction);

	Deduction deductionDTOToDeduction(DeductionDTO deductionDTO);
}
