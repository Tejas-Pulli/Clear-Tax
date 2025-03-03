package com.gov.tax.mapper;

import org.mapstruct.Mapper;

import com.gov.tax.dto.IncomeDTO;
import com.gov.tax.entity.Income;

@Mapper(componentModel = "spring")
public interface IncomeMapper {
	
    IncomeDTO incomeToIncomeDTO(Income income);

    Income incomeDTOToIncome(IncomeDTO incomeDTO);
}
