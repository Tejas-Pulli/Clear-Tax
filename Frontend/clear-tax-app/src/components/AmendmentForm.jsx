// import { useState } from "react";
// import Swal from "sweetalert2";

// const AmendmentForm = ({ onCancel }) => {
//   const [formData, setFormData] = useState({
//     taxYear: "",
//     reason: "",
//     income: "",
//     deductions: "",
//   });

//   // Handle input changes for form data
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Handle the "Back" button action with confirmation
//   const handleBack = () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to cancel the amendment process. All your changes will be lost.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Cancel",
//       cancelButtonText: "No, Go Back",
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         onCancel(); // Call the onCancel function passed from parent
//       }
//     });
//   };

//   // Handle the "Submit" button action with confirmation
//   const handleSubmit = (e) => {
//     e.preventDefault(); // Prevent form submission

//     Swal.fire({
//       title: "Are you sure?",
//       text: "Are you sure you want to submit the amendment?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Submit",
//       cancelButtonText: "No, Edit",
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // Submit the form data (e.g., make API call to submit)
//         Swal.fire({
//           icon: "success",
//           title: "Amendment Submitted",
//           text: "Your amendment has been successfully submitted.",
//           confirmButtonText: "OK",
//           confirmButtonColor: "#3085d6",
//         });
//         // Handle form submission logic here (e.g., API call)
//       }
//     });
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-700">Amendment Form</h2>
//       <form className="mt-4" onSubmit={handleSubmit}>
//         {/* Tax Year Input
//         <div className="mb-4">
//           <label className="block text-gray-700">Tax Year</label>
//           <input
//             type="text"
//             name="taxYear"
//             className="w-full p-3 mt-2 border border-gray-300 rounded"
//             placeholder="Enter the tax year"
//             value={formData.taxYear}
//             onChange={handleInputChange}
//           />
//         </div>

//         Reason for Amendment
//         <div className="mb-4">
//           <label className="block text-gray-700">Reason for Amendment</label>
//           <textarea
//             name="reason"
//             className="w-full p-3 mt-2 border border-gray-300 rounded"
//             placeholder="Provide reason for amendment"
//             value={formData.reason}
//             onChange={handleInputChange}
//           ></textarea>
//         </div> */}

//         {/* Income Section */}
//         <div className="mb-4">
//           <h3 className="font-medium text-lg text-gray-800">Income</h3>
//           <label className="block text-gray-700">Total Income</label>
//           <input
//             type="text"
//             name="income"
//             className="w-full p-3 mt-2 border border-gray-300 rounded"
//             placeholder="Enter your total income"
//             value={formData.income}
//             onChange={handleInputChange}
//           />
//         </div>

//         {/* Deductions Section */}
//         <div className="mb-4">
//           <h3 className="font-medium text-lg text-gray-800">Deductions</h3>
//           <label className="block text-gray-700">Total Deductions</label>
//           <input
//             type="text"
//             name="deductions"
//             className="w-full p-3 mt-2 border border-gray-300 rounded"
//             placeholder="Enter your total deductions"
//             value={formData.deductions}
//             onChange={handleInputChange}
//           />
//         </div>

//         {/* Tax Calculation Section (Placeholder for now) */}
//         <div className="mb-4">
//           <h3 className="font-medium text-lg text-gray-800">Tax Calculation</h3>
//           <p>Tax calculation section will be implemented later.</p>
//         </div>

//         {/* Submit and Back buttons */}
//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={handleBack} // Trigger back/cancel confirmation
//             className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out"
//           >
//             Back
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
//           >
//             Submit Amendment
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AmendmentForm;import { useState, useEffect } from "react";

// import Swal from "sweetalert2";
// import Cookies from "js-cookie";
// import { getUserByEmail } from "../services/UserServiceApi";
// import { getIncomesByYearAndUserId } from "../services/IncomeServiceApi";
// import { getDeductionsByYearAndUserId } from "../services/DeductionServiceApi";
// import { useEffect, useState } from "react";
// import { Trash, Plus } from "lucide-react"; // Add Plus icon here

// const AmendmentForm = ({ onCancel }) => {
//   const [user, setUser] = useState(null);
//   const currentYear = new Date().getFullYear();
//   const [incomeData, setIncomeData] = useState([]);
//   const [deductionData, setDeductionData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editableIncome, setEditableIncome] = useState([]);
//   const [editableDeductions, setEditableDeductions] = useState([]);

//   // Dummy categories for income and deductions, replace with actual categories if needed

//   const incomeSources = ["Salary","Business","Rental","Capital Gains","Interest", "Other Incomes"];
//   const deductionTypes = ["Home Loan Interest","Medical Expenses","Charitable Donations","Education Expenses","Retirement Contributions","Other Deductions"];

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const userData = await getUserByEmail(Cookies.get("userEmail"));
//         setUser(userData);
//       } catch (err) {
//         setError("Error fetching user data.");
//       }
//     };
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user) return;
//       try {
//         setLoading(true);
//         const [incomeResponse, deductionResponse] = await Promise.all([
//           getIncomesByYearAndUserId(user.userId, currentYear),
//           getDeductionsByYearAndUserId(user.userId, currentYear),
//         ]);
//         setIncomeData(incomeResponse);
//         setDeductionData(deductionResponse);
//       } catch (err) {
//         setError("Error fetching data.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [user, currentYear]);

//   const handleEditData = () => {
//     setIsEditMode(true);
//     setEditableIncome([...incomeData]);
//     setEditableDeductions([...deductionData]);
//   };

//   const handleIncomeChange = (index, field, value) => {
//     const updatedIncome = [...editableIncome];
//     updatedIncome[index][field] = value;
//     setEditableIncome(updatedIncome);
//   };

//   const handleDeductionChange = (index, field, value) => {
//     const updatedDeductions = [...editableDeductions];
//     updatedDeductions[index][field] = value;
//     setEditableDeductions(updatedDeductions);
//   };

//   const handleDeleteIncome = (index) => {
//     setEditableIncome(editableIncome.filter((_, i) => i !== index));
//   };

//   const handleDeleteDeduction = (index) => {
//     setEditableDeductions(editableDeductions.filter((_, i) => i !== index));
//   };

//   const handleAddIncome = () => {
//     setEditableIncome([
//       ...editableIncome,
//       { incomeSource: incomeSources[0], amount: "" }, // Only incomeSource and amount when adding new income
//     ]);
//   };

//   const handleAddDeduction = () => {
//     setEditableDeductions([
//       ...editableDeductions,
//       { deductionType: deductionTypes[0], amount: "" }, // Only deductionType and amount when adding new deduction
//     ]);
//   };

//   const handleSave = () => {
//     setIncomeData(editableIncome);
//     setDeductionData(editableDeductions);
//     setIsEditMode(false);
//   };

//   const handleCancel = () => {
//     setIsEditMode(false);
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-700">Amendment Form</h2>
//       <div className="mt-4">
//         <h3 className="font-medium text-lg text-gray-800">Income for {currentYear}</h3>
//         {isEditMode ? (
//           <div>
//             {editableIncome.map((income, index) => (
//               <div key={index} className="mb-2 flex items-center">
//                 <select
//                   value={income.incomeSource}
//                   onChange={(e) => handleIncomeChange(index, "incomeSource", e.target.value)}
//                   className="border p-1 mr-2"
//                 >
//                   {incomeSources.map((source, idx) => (
//                     <option key={idx} value={source}>
//                       {source}
//                     </option>
//                   ))}
//                 </select>
//                 <input
//                   type="number"
//                   value={income.amount}
//                   onChange={(e) => handleIncomeChange(index, "amount", e.target.value)}
//                   className="border p-1 mr-2"
//                   placeholder="Amount"
//                 />
//                 <Trash className="text-red-500 cursor-pointer" onClick={() => handleDeleteIncome(index)} />
//               </div>
//             ))}
//             <button
//               onClick={handleAddIncome}
//               className="flex items-center text-blue-500 mt-2"
//             >
//               <Plus className="mr-1" /> Add Income
//             </button>
//           </div>
//         ) : (
//           <table className="table-auto w-full border-collapse border">
//             <thead className="bg-gray-200">
//               <tr>
//                 <th className="border px-4 py-2">Income Source</th>
//                 <th className="border px-4 py-2">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {incomeData.map((income, index) => (
//                 <tr key={index} className="border-b">
//                   <td className="px-4 py-2">{income.incomeSource}</td>
//                   <td className="px-4 py-2">{income.amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}

//         <h3 className="font-medium text-lg text-gray-800 mt-4">Deductions for {currentYear}</h3>
//         {isEditMode ? (
//           <div>
//             {editableDeductions.map((deduction, index) => (
//               <div key={index} className="mb-2 flex items-center">
//                 <select
//                   value={deduction.deductionType}
//                   onChange={(e) => handleDeductionChange(index, "deductionType", e.target.value)}
//                   className="border p-1 mr-2"
//                 >
//                   {deductionTypes.map((type, idx) => (
//                     <option key={idx} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//                 <input
//                   type="number"
//                   value={deduction.amount}
//                   onChange={(e) => handleDeductionChange(index, "amount", e.target.value)}
//                   className="border p-1 mr-2"
//                   placeholder="Amount"
//                 />
//                 <Trash className="text-red-500 cursor-pointer" onClick={() => handleDeleteDeduction(index)} />
//               </div>
//             ))}
//             <button
//               onClick={handleAddDeduction}
//               className="flex items-center text-blue-500 mt-2"
//             >
//               <Plus className="mr-1" /> Add Deduction
//             </button>
//           </div>
//         ) : (
//           <table className="table-auto w-full border-collapse border">
//             <thead className="bg-gray-200">
//               <tr>
//                 <th className="border px-4 py-2">Deduction Type</th>
//                 <th className="border px-4 py-2">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {deductionData.map((deduction, index) => (
//                 <tr key={index} className="border-b">
//                   <td className="px-4 py-2">{deduction.deductionType}</td>
//                   <td className="px-4 py-2">{deduction.amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//       <div className="flex justify-between mt-6">
//         {isEditMode ? (
//           <>
//             <button onClick={handleCancel} className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg">Cancel</button>
//             <button onClick={handleSave} className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg">Save</button>
//           </>
//         ) : (
//           <button onClick={handleEditData} className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg">Edit Data</button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AmendmentForm;

import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { getUserByEmail } from "../services/UserServiceApi";
import { getIncomesByYearAndUserId } from "../services/IncomeServiceApi";
import { getDeductionsByYearAndUserId } from "../services/DeductionServiceApi";
import {
  amendTaxCalculation,
  getTaxDetails,
  slabBasedTaxCalculation,
} from "../services/TaxCalculationServiceApi"; // Assuming this is the tax calculation service.
import { useEffect, useState } from "react";
import { Trash, Plus } from "lucide-react"; // Add Plus icon here
import { getTaxPaymentByUserId } from "../services/TaxPaymentService";
import { getTaxRefund } from "../services/TaxRefundService";

const AmendmentForm = ({ onCancel }) => {
  const [user, setUser] = useState(null);
  const currentYear = new Date().getFullYear();
  const [incomeData, setIncomeData] = useState([]);
  const [deductionData, setDeductionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableIncome, setEditableIncome] = useState([]);
  const [editableDeductions, setEditableDeductions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [taxLiability, setTaxLiability] = useState(0);
  const [originalTaxCalculationId, setOriginalTaxCalculationId] =
    useState(null);
  const [taxPayment, setTaxPayment] = useState(null);
  const [taxRefund, setTaxRefund] = useState(null);
  const navigate = useNavigate();

  const incomeSources = [
    "Salary",
    "Business",
    "Rental",
    "Capital Gains",
    "Interest",
    "Other Incomes",
  ];
  const deductionTypes = [
    "Home Loan Interest",
    "Medical Expenses",
    "Charitable Donations",
    "Education Expenses",
    "Retirement Contributions",
    "Other Deductions",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserByEmail(Cookies.get("userEmail"));
        setUser(userData);
      } catch (err) {
        setError("Error fetching user data.");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [incomeResponse, deductionResponse] = await Promise.all([
          getIncomesByYearAndUserId(user.userId, currentYear),
          getDeductionsByYearAndUserId(user.userId, currentYear),
        ]);
        setIncomeData(incomeResponse);
        setDeductionData(deductionResponse);

        // Set initial values for income and deductions
        calculateTotals(incomeResponse, deductionResponse);

        // Assume you have a way to fetch originalTaxCalculationId
        const originalTaxData = await getTaxDetails(user.userId, currentYear);
        console.log("ceee========>", originalTaxData);
        setOriginalTaxCalculationId(originalTaxData?.taxCalculationId);
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, currentYear]);

  const calculateTotals = (updatedIncome, updatedDeductions) => {
    const incomeTotal = updatedIncome.reduce(
      (total, income) => total + parseFloat(income.amount || 0),
      0
    );
    const deductionTotal = updatedDeductions.reduce(
      (total, deduction) => total + parseFloat(deduction.amount || 0),
      0
    );
    const taxableIncome = incomeTotal - deductionTotal;

    setTotalIncome(incomeTotal);
    setTotalDeductions(deductionTotal);
    setTaxableIncome(taxableIncome);

    slabBasedTaxCalculation(taxableIncome).then((tax) => {
      setTaxLiability(tax);
    });
  };

  useEffect(() => {
    const fetchTaxPayment = async () => {
      try {
        const paymentsData = await getTaxPaymentByUserId(user.userId);
        setTaxPayment(paymentsData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaxPayment();
  }, [user, editableDeductions, editableIncome, incomeData, deductionData]);

  useEffect(() => {
    const fetchTaxRefund = async () => {
      try {
        const RefundData = await getTaxRefund(user.userId);
        setTaxRefund(RefundData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaxRefund();
  }, [user, editableDeductions, editableIncome, incomeData, deductionData]);

  const handleEditData = () => {
    setIsEditMode(true);
    setEditableIncome([...incomeData]);
    setEditableDeductions([...deductionData]);
  };

  const handleIncomeChange = (index, field, value) => {
    setEditableIncome((prevIncome) => {
      const updatedIncome = [...prevIncome];
      updatedIncome[index][field] = value;
      calculateTotals(updatedIncome, editableDeductions);
      return updatedIncome;
    });
  };

  const handleDeductionChange = (index, field, value) => {
    setEditableDeductions((prevDeductions) => {
      const updatedDeductions = [...prevDeductions];
      updatedDeductions[index][field] = value;
      calculateTotals(editableIncome, updatedDeductions);
      return updatedDeductions;
    });
  };

  const handleDeleteIncome = (index) => {
    setEditableIncome(editableIncome.filter((_, i) => i !== index));
    calculateTotals(
      editableIncome.filter((_, i) => i !== index),
      editableDeductions
    );
  };

  const handleDeleteDeduction = (index) => {
    setEditableDeductions(editableDeductions.filter((_, i) => i !== index));
    calculateTotals(
      editableIncome,
      editableDeductions.filter((_, i) => i !== index)
    );
  };

  const handleAddIncome = () => {
    const newIncome = { incomeSource: incomeSources[0], amount: "" };
    setEditableIncome((prevIncome) => {
      const updatedIncome = [...prevIncome, newIncome];
      calculateTotals(updatedIncome, editableDeductions);
      return updatedIncome;
    });
  };

  const handleAddDeduction = () => {
    const newDeduction = { deductionType: deductionTypes[0], amount: "" };
    setEditableDeductions((prevDeductions) => {
      const updatedDeductions = [...prevDeductions, newDeduction];
      calculateTotals(editableIncome, updatedDeductions);
      return updatedDeductions;
    });
  };

  // const handleSave = async () => {
  //   // Calculate total income and deductions
  //   const incomeTotal = editableIncome.reduce((total, income) => total + parseFloat(income.amount || 0), 0);
  //   const deductionTotal = editableDeductions.reduce((total, deduction) => total + parseFloat(deduction.amount || 0), 0);

  //   // Calculate taxable income
  //   const taxableIncome = incomeTotal - deductionTotal;

  //   // Get tax liability using slab-based calculation
  //   const taxLiability = await slabBasedTaxCalculation(taxableIncome);

  //   // Prepare formatted income and deduction data
  //   const formattedIncomeData = editableIncome.map(income => ({
  //     incomeSource: income.incomeSource,
  //     amount: income.amount,
  //     userId: user.userId,
  //     incomeDate: new Date().toLocaleDateString('en-CA'),
  //     isAmended: 1,
  //   }));

  //   const formattedDeductionData = editableDeductions.map(deduction => ({
  //     deductionType: deduction.deductionType,
  //     amount: deduction.amount,
  //     userId: user.userId,
  //     deductionDate: new Date().toLocaleDateString('en-CA'),
  //     isAmended: 1,
  //   }));

  //   // Prepare amendment data with calculated totals
  //   const amendmentData = {
  //     incomes: formattedIncomeData,
  //     deductions: formattedDeductionData,
  //     totalIncome: incomeTotal,
  //     totalDeductions: deductionTotal,
  //     taxableIncome: taxableIncome,
  //     taxLiability: taxLiability,
  //     isAmended: 1,
  //     originalTaxCalculationId,
  //     taxYear: new Date().getFullYear(),
  //     user: user,
  //   };

  //   console.log(amendmentData);

  //   try {
  //     console.log(user.userId);
  //     await amendTaxCalculation(amendmentData.user.userId, amendmentData);
  //     Swal.fire("Success", "Tax calculation amended successfully!", "success");
  //     setIsEditMode(false);
  //   } catch (error) {
  //     Swal.fire("Error", "Failed to amend tax calculation.", "error");
  //   }
  // };

  const handleSave = async () => {
    const incomeTotal = editableIncome.reduce(
      (total, income) => total + parseFloat(income.amount || 0),
      0
    );
    const deductionTotal = editableDeductions.reduce(
      (total, deduction) => total + parseFloat(deduction.amount || 0),
      0
    );
    const taxableIncome = incomeTotal - deductionTotal;
    const taxLiability = await slabBasedTaxCalculation(taxableIncome);

    const formattedIncomeData = editableIncome.map((income) => ({
      incomeSource: income.incomeSource,
      amount: income.amount,
      userId: user.userId,
      incomeDate: new Date().toLocaleDateString("en-CA"),
      isAmended: 1,
    }));

    const formattedDeductionData = editableDeductions.map((deduction) => ({
      deductionType: deduction.deductionType,
      amount: deduction.amount,
      userId: user.userId,
      deductionDate: new Date().toLocaleDateString("en-CA"),
      isAmended: 1,
    }));

    const amendmentData = {
      incomes: formattedIncomeData,
      deductions: formattedDeductionData,
      totalIncome: incomeTotal,
      totalDeductions: deductionTotal,
      taxableIncome: taxableIncome,
      taxLiability: taxLiability,
      isAmended: 1,
      originalTaxCalculationId,
      taxYear: new Date().getFullYear(),
      user: user,
    };

    try {
      await amendTaxCalculation(amendmentData.user.userId, amendmentData);
      Swal.fire("Success", "Tax calculation amended successfully!", "success");

      setIsEditMode(false);

      // Check for tax payment and refund after submission
      if (taxPayment && taxPayment.amount > 0) {
        navigate("/trackPayments");
      } else if (taxRefund && taxRefund.amount > 0) {
        navigate("/calculateRefundLiability");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to amend tax calculation.", "error");
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  // Validation: Only allow submission if changes are made
  const isFormChanged =
    JSON.stringify(incomeData) !== JSON.stringify(editableIncome) ||
    JSON.stringify(deductionData) !== JSON.stringify(editableDeductions);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700">Amendment Form</h2>
      <div className="mt-4">
        {/* Income Section */}
        <h3 className="font-medium text-lg text-gray-800">
          Income for {currentYear}
        </h3>
        {isEditMode ? (
          <div>
            {editableIncome.map((income, index) => (
              <div key={index} className="mb-2 flex items-center">
                <select
                  value={income.incomeSource}
                  onChange={(e) =>
                    handleIncomeChange(index, "incomeSource", e.target.value)
                  }
                  className="border p-1 mr-2"
                >
                  {incomeSources.map((source, idx) => (
                    <option key={idx} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={income.amount}
                  onChange={(e) =>
                    handleIncomeChange(index, "amount", e.target.value)
                  }
                  className="border p-1 mr-2"
                  placeholder="Amount"
                />
                <Trash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDeleteIncome(index)}
                />
              </div>
            ))}
            <button
              onClick={handleAddIncome}
              className="flex items-center text-blue-500 mt-2"
            >
              <Plus className="mr-1" /> Add Income
            </button>
          </div>
        ) : (
          <table className="table-auto w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Income Source</th>
                <th className="border px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.map((income, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{income.incomeSource}</td>
                  <td className="px-4 py-2">{income.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Deductions Section */}
        <h3 className="font-medium text-lg text-gray-800 mt-4">
          Deductions for {currentYear}
        </h3>
        {isEditMode ? (
          <div>
            {editableDeductions.map((deduction, index) => (
              <div key={index} className="mb-2 flex items-center">
                <select
                  value={deduction.deductionType}
                  onChange={(e) =>
                    handleDeductionChange(
                      index,
                      "deductionType",
                      e.target.value
                    )
                  }
                  className="border p-1 mr-2"
                >
                  {deductionTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={deduction.amount}
                  onChange={(e) =>
                    handleDeductionChange(index, "amount", e.target.value)
                  }
                  className="border p-1 mr-2"
                  placeholder="Amount"
                />
                <Trash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDeleteDeduction(index)}
                />
              </div>
            ))}
            <button
              onClick={handleAddDeduction}
              className="flex items-center text-blue-500 mt-2"
            >
              <Plus className="mr-1" /> Add Deduction
            </button>
          </div>
        ) : (
          <table className="table-auto w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Deduction Type</th>
                <th className="border px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deductionData.map((deduction, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{deduction.deductionType}</td>
                  <td className="px-4 py-2">{deduction.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-between mt-6">
        {isEditMode ? (
          <>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormChanged}
              className={`px-6 py-3 ${
                !isFormChanged ? "bg-gray-400" : "bg-blue-500"
              } text-white font-medium rounded-lg`}
            >
              Save
            </button>
          </>
        ) : (
          <button
            onClick={handleEditData}
            className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg"
          >
            Edit Data
          </button>
        )}
      </div>
    </div>
  );
};

export default AmendmentForm;
