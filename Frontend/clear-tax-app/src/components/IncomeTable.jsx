import React from "react";

const IncomeTable = ({ groupedIncomes, calculateTotalIncomeForYear }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Income List</h2>
      {Object.keys(groupedIncomes).map((year) => (
        <div key={year}>
          <h3 className="text-lg font-bold">{year}</h3>
          <table className="w-full mt-2">
            <thead>
              <tr>
                <th>Source</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {groupedIncomes[year].map((income) => (
                <tr key={income.id}>
                  <td>{income.incomeSource}</td>
                  <td>{income.amount}</td>
                  <td>{income.incomeDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2">
            Total: {calculateTotalIncomeForYear(groupedIncomes[year])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncomeTable;
