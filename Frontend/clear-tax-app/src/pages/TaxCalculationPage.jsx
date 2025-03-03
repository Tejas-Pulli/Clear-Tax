import Cookies from "js-cookie";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChartBar, FaHistory } from "react-icons/fa";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar.jsx";
import { getDeductionsByYearAndUserId } from "../services/DeductionServiceApi.jsx";
import { getIncomesByYearAndUserId } from "../services/IncomeServiceApi.jsx";
import {
  amendTaxCalculation,
  calculateAndSaveTaxLiability,
  getTaxDetails,
  getTaxHistory,
} from "../services/TaxCalculationServiceApi.jsx";
import { getFillingStatus } from "../services/TaxFillingServiceApi.jsx";
import { getUserByEmail } from "../services/UserServiceApi.jsx";
import { RingLoader } from "react-spinners";
import labels from "../config/labels.jsx";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";

const TaxCalculationPage = () => {
  const [user, setUser] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [grossIncome, setGrossIncome] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxHistory, setTaxHistory] = useState([]);
  const [taxFilingStatus, setTaxFilingStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [amendment, setAmendment] = useState(0);
  const [formattedIncomeData, setFormattedIncomeData] = useState(null);
  const [formattedDeductionData, setFormattedDeductionData] = useState(null);
  const [oldTaxDetails, setOldTaxDetails] = useState(null);
  const [myLoading, setMyLoading] = useState(false);
  const year = new Date().getFullYear();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserByEmail(Cookies.get("userEmail"));
        setUser(userData);
      } catch (err) {
        setError(labels.taxCalculation.error.user + err.message);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const storedStatus = localStorage.getItem(
      labels.taxCalculation.taxHistory.amendment
    );
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, [user, amendment]);

  useEffect(() => {
    if (!user) return;

    const fetchTaxData = async () => {
      setLoading(true);
      const userId = user.userId;

      try {
        const incomeData = await getIncomesByYearAndUserId(
          userId,
          year,
          amendment
        );
        const deductionData = await getDeductionsByYearAndUserId(
          userId,
          year,
          amendment
        );
        setFormattedIncomeData(incomeData);
        setFormattedDeductionData(deductionData);

        if (incomeData && deductionData) {
          const totalIncome = incomeData.reduce(
            (total, income) => total + income.amount,
            0
          );
          const totalDeductions = deductionData.reduce(
            (total, deduction) => total + deduction.amount,
            0
          );

          setGrossIncome(totalIncome);
          setDeductions(totalDeductions);
          const oldTaxData = await getTaxDetails(userId, year, 0);
          if (oldTaxData) {
            setOldTaxDetails(oldTaxData);
          }
          const history = await getTaxHistory(user.userId);
          // Sort tax history in descending order
          const sortedHistory = history
            .sort((a, b) => b.taxYear - a.taxYear)
            .sort((c, d) => d.isAmended - c.isAmended);

          setTaxHistory(sortedHistory);

          const existingTaxDetails = await getTaxDetails(
            userId,
            year,
            amendment
          );
          if (existingTaxDetails) {
            setTaxDetails(existingTaxDetails);
          }

          const filingStatus = await getFillingStatus(userId, year);
          setTaxFilingStatus(filingStatus);
        } else {
          setError(labels.taxCalculation.error.requiredData);
        }
      } catch (err) {
        setError(labels.taxCalculation.error.taxData + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxData();
  }, [user, year, amendment]);

  const handleCalculateTaxLiability = async () => {
    try {
      setLoading(true);
      setMyLoading(true);
      setTimeout(() => {
        setMyLoading(false);
      }, 3000);
      // Add conditional logic to handle different behavior for amendment
      let response;
      if (!formattedIncomeData) {
        toast.error(labels.taxCalculation.error.missingIncomes, {
          position: "top-right",
          duration: 3000,
        });
      }
      if (!formattedDeductionData) {
        toast.error(labels.taxCalculation.error.missingDeductions, {
          position: "top-right",
          duration: 3000,
        });
      }
      if (amendment === 0) {
        // calculating tax liability for a new income record
        response = await calculateAndSaveTaxLiability(user.userId, year);
        if (response?.taxLiability) {
          setTaxDetails(response);

          const updatedHistory = await getTaxHistory(user.userId);
          setTaxHistory(updatedHistory);

          const filingStatus = await getFillingStatus(user.userId, year);
          setTaxFilingStatus(filingStatus);
          
        } else {
          // Handle invalid response (in case the response doesn't contain the expected data)
          throw new Error(labels.taxCalculation.error.invalidResponse);
        }
      } else if (amendment === 1) {
        // handling tax liability calculation when it's an amended record
        const myIncomes = formattedIncomeData.map((income) => ({
          incomeSource: income.incomeSource,
          amount: income.amount,
          userId: user.userId,
          incomeDate: new Date().toLocaleDateString("en-CA"),
          isAmended: 1,
        }));

        const myDeductions = formattedDeductionData.map((deduction) => ({
          deductionType: deduction.deductionType,
          amount: deduction.amount,
          userId: user.userId,
          deductionDate: new Date().toLocaleDateString("en-CA"),
          isAmended: 1,
        }));

        const amendmentData = {
          incomes: myIncomes,
          deductions: myDeductions,
          totalIncome: grossIncome,
          totalDeductions: deductions,
          taxableIncome: grossIncome - deductions,
          taxLiability: 0,
          isAmended: 1,
          originalTaxCalculationId: oldTaxDetails.taxCalculationId,
          taxYear: new Date().getFullYear(),
          user: user,
        };

        response = await amendTaxCalculation(user.userId, amendmentData);

        // If amendment is successful, reset the amendment status and reload
        if (oldTaxDetails.taxLiability > response.taxLiability) {
          localStorage.setItem(labels.taxCalculation.taxHistory.amendment, 0);
        }
        window.location.reload();
      }

      // Show success alert after amendment
      toast.success(labels.taxCalculation.success.taxCalculated, {
        position: "top-right",
        duration: 3000,
      });
    } catch (err) {
      setError(labels.taxCalculation.error.calculationError + err.message);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = taxHistory.slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        {labels.taxCalculation.loading.user}
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <div className="flex flex-col relative w-full min-h-screen pt-16 bg-white-100">
        <div className="flex flex-1">
          <div className={`transition-all ${isSidebarOpen ? "w-1/5" : "w-16"}`}>
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>

          <div
            className={`flex flex-col w-full ${isSidebarOpen ? "pl-2" : ""}`}
            style={{ minHeight: "calc(100vh - 4rem)" }}
          >
            {/* Loading Spinner while fetching data */}
            {myLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-gray-100 bg-opacity-50 z-50">
                <RingLoader color="#23293A" loading={myLoading} size={70} />
              </div>
            )}
            <main
              className="p-6 flex-grow overflow-y-auto h-[calc(100vh-4rem)] 
             [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-transparent
  dark:[&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
              {/* <div className="flex flex-col lg:flex-row lg:justify-between items-start mb-6"> */}
              <div className="rounded-lg  bg-white">
                <motion.h1 className="text-3xl font-bold mb-4"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <FaChartBar className="inline-block mr-2 text-blue-500" />
                  {labels.taxCalculation.taxHistory.taxLiability}
                </motion.h1>
                {/* <p className="text-gray-600 mb-6">
                  Welcome, <span className="font-semibold">{user.name}</span>.
                  <br />
                  Here you can calculate your tax liability for the Year {year}.
                </p> */}

                {/* Tax Details */}
                <motion.div className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <div className="bg-blue-50 p-3 shadow-md rounded-md">
                    <motion.p className="text-gray-600"
                     initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {labels.taxCalculation.taxLiability.grossIncome}
                    </motion.p>
                    <motion.p className="text-2xl font-semibold text-blue-700"
                    initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      ₹{taxDetails?.grossIncome || grossIncome}
                    </motion.p>
                  </div>
                  <div className="bg-green-50 p-3 shadow-md rounded-md">
                    <motion.p className="text-gray-600"
                   initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        >
                      {labels.taxCalculation.taxLiability.totalDeductions}
                    </motion.p>
                    <motion.p className="text-2xl font-semibold text-green-700"
                   initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        >
                      ₹{taxDetails?.deductions || deductions}
                    </motion.p>
                  </div>
                  <div className="bg-yellow-50 p-3 shadow-md rounded-md">
                    <motion.p className="text-gray-600"
                   initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        >
                      {labels.taxCalculation.taxLiability.taxableIncome}
                    </motion.p>
                    <motion.p className="text-2xl font-semibold text-yellow-700"
                   initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        >
                      ₹{taxDetails?.taxableIncome || grossIncome - deductions}
                    </motion.p>
                  </div>
                  <div className="bg-red-50 p-3 shadow-md rounded-md">
                    <motion.p className="text-gray-600"
                   initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        >
                      {labels.taxCalculation.taxLiability.taxLiability}
                    </motion.p>
                    <motion.p className="text-2xl font-semibold text-red-700"
                   initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        >
                      ₹{taxDetails?.taxLiability || 0}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Calculate Button */}
                {!taxDetails && (
                  <motion.button
                    onClick={handleCalculateTaxLiability}
                    className="absolute mt-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-500"
                    disabled={
                      loading ||
                      !grossIncome ||
                      !deductions ||
                      (taxFilingStatus === "filled" && amendment === 0)
                    }
                    initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                  >
                    {amendment === 0
                      ? labels.taxCalculation.taxLiability.calculateButton
                      : labels.taxCalculation.taxLiability.submitAmendment}
                  </motion.button>
                )}

                {/* Tax History */}
                {
                  <div className="mt-20">
                    <motion.h2 className="text-2xl font-semibold mb-4"
                    initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                    >
                      <FaHistory className="inline-block mr-2 text-gray-600" />
                      {labels.taxCalculation.taxHistory.title}
                    </motion.h2>
                    <motion.table className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4 table-auto"
                     initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                    >
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-left text-black-600">Year</th>
                          <th className="p-4 text-left text-black-600">
                            {labels.taxCalculation.taxLiability.grossIncome} (₹)
                          </th>
                          <th className="p-4 text-left text-black-600">
                            {labels.taxCalculation.taxHistory.deductions} (₹)
                          </th>
                          <th className="p-4 text-left text-black-600">
                            {labels.taxCalculation.taxHistory.taxableIncome} (₹)
                          </th>
                          <th className="p-4 text-left text-black-600">
                            {labels.taxCalculation.taxHistory.taxLiability} (₹)
                          </th>
                          <th className="p-4 text-left text-black-600">
                            {labels.taxCalculation.taxHistory.Amendment}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRows.map((tax, index) => (
                          <motion.tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index*0.1 }}
                          >
                            <td className="p-4">{tax.taxYear}</td>
                            <td className="p-4">{tax.grossIncome}</td>
                            <td className="p-4">{tax.deductions}</td>
                            <td className="p-4">{tax.taxableIncome}</td>
                            <td className="p-4">{tax.taxLiability}</td>
                            <td className="p-4">
                              {tax.isAmended == 0 ? "--" : "Amendment"}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </motion.table>

                    {/* Pagination */}
                    {taxHistory.length > rowsPerPage && (
                      <motion.div className="mt-4 flex justify-center"
                      initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                      >
                        <button
                          className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          {labels.taxCalculation.taxHistory.previous}
                        </button>
                        <span className="mx-2 text-lg">{currentPage}</span>
                        <button
                          className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={
                            currentPage * rowsPerPage >= taxHistory.length
                          }
                        >
                          {labels.taxCalculation.taxHistory.next}
                        </button>
                      </motion.div>
                    )}
                  </div>
                }
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TaxCalculationPage;
