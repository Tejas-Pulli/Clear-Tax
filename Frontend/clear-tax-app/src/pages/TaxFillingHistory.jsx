import  { useState, useEffect, useContext } from "react";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Cookies from "js-cookie";
import { getTaxHistory } from "../services/TaxCalculationServiceApi.jsx";
import {
  getFillingStatus,
  getTaxFillingHistory,
} from "../services/TaxFillingServiceApi.jsx";
import { getUserByEmail } from "../services/UserServiceApi.jsx";
import { getIncomesByYearAndUserId } from "../services/IncomeServiceApi.jsx";
import { getDeductionsByYearAndUserId } from "../services/DeductionServiceApi.jsx";
import Sidebar from "../layouts/Sidebar.jsx";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
 
const TaxFillingHistory = () => {
  const [user, setUser] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxHistory, setTaxHistory] = useState([]);
  const [taxFilingStatus, setTaxFilingStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [amendment,setAmendment] = useState(0);  

  const year = new Date().getFullYear();
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
        setError("Error fetching user details: " + err.message);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTaxData = async () => {
      setLoading(true);
      const userId = user.userId;

      try {
        const incomeData = await getIncomesByYearAndUserId(userId, year,amendment);
        const deductionData = await getDeductionsByYearAndUserId(userId, year,amendment);

        if (incomeData && deductionData) {
          const existingTaxDetails = await getTaxHistory(userId);
          if (existingTaxDetails) {
            const filteredData = existingTaxDetails.filter(tax => tax.isAmended === 0).sort((a, b) => b.taxYear - a.taxYear);
            setTaxDetails(filteredData);
          }

          const history = await getTaxFillingHistory(userId);
          setTaxHistory(history.sort((a, b) => b.taxYear - a.taxYear));
          const filingStatus = await getFillingStatus(userId, year);
          setTaxFilingStatus(filingStatus);
        } else {
          setError(
            "Please add your income and deduction details for the current year."
          );
        }
      } catch (err) {
        setError("No Tax Previous Tax History Found...!");
      } finally {
        setLoading(false);
      }
    };

    fetchTaxData();
  }, [user, year,amendment]);

  const handleDownloadCSV = () => {
    const csvData = [
      [
        "Tax Year",
        "Gross Income",
        "Deductions",
        "Taxable Income",
        "Tax Liability",
        "Filing Status",
        "Date", 
      ], // Header
      ...taxHistory.map((history,index) => [
        history.taxYear,
        taxDetails[index]?.grossIncome,
        taxDetails[index]?.deductions,
        taxDetails[index]?.taxableIncome,
        taxDetails[index]?.taxLiability,
        history.fillingStatus,
        history.filingDate,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `tax_filing_history_${year}.csv`);
    link.click();
  };
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
              <div className="rounded-lg bg-white ">
                <motion.h1 className="text-3xl font-bold mb-8 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                  <FaHistory className="mr-2 text-blue-500" />
                  Tax Filing History
                </motion.h1>
                {error && <div className="text-red-500 mb-4">{error}</div>}
            
                <motion.table 
                className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <thead>
                    <tr className="bg-gray-500 text-white">
                      <th className="p-3 text-left">Tax Year</th>
                      <th className="p-3 text-left">Gross Income (₹)</th>
                      <th className="p-3 text-left">Deductions (₹)</th>
                      <th className="p-3 text-left">Taxable Income (₹)</th>
                      <th className="p-3 text-left">Tax Liability (₹)</th>
                      <th className="p-3 text-left">Filing Status</th>
                      <th className="p-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxHistory.length === 0 ? (
                      <motion.tr 
                      className="border-b transition hover:bg-gray-100"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay:  0.1 }}
                      >
                        <td colSpan="7" className="p-3 text-center">
                          No tax filing history available
                        </td>
                      </motion.tr>
                    ) : (
                      taxHistory.map((history, index) => (
                        <motion.tr key={index}
                        className="border-b transition hover:bg-gray-100"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <td className="p-3 text-center">{history.taxYear}</td>
                          <td className="p-3 text-center">
                            {taxDetails[index]?.grossIncome}
                          </td>
                          <td className="p-3 text-center">
                            {taxDetails[index]?.deductions}
                          </td>
                          <td className="p-3 text-center">
                            {taxDetails[index]?.taxableIncome}
                          </td>
                          <td className="p-3 text-center">
                            {taxDetails[index]?.taxLiability}
                          </td>
                          <td className="p-3 text-center">{history.fillingStatus}</td>
                          <td className="p-3 text-center">{history.filingDate}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </motion.table>

                <motion.button
                  onClick={handleDownloadCSV}
                  className="mt-4 bg-blue-500 text-white p-3 rounded flex justify-end items-end"
                  initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  Download Tax History
                </motion.button>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TaxFillingHistory;
