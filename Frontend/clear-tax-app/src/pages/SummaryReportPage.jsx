import React, { useState, useEffect, useContext } from "react";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Cookies from "js-cookie";
import {
  getTaxDetails,
  getTaxHistory,
} from "../services/TaxCalculationServiceApi.jsx";
import { getFillingStatus } from "../services/TaxFillingServiceApi.jsx";
import { getUserByEmail } from "../services/UserServiceApi.jsx";
import { getIncomesByYearAndUserId } from "../services/IncomeServiceApi.jsx";
import { getDeductionsByYearAndUserId } from "../services/DeductionServiceApi.jsx";
import Sidebar from "../layouts/Sidebar.jsx";
import { FaFilePdf, FaDownload, FaExclamationCircle } from "react-icons/fa";
import { getAllTaxPaymentByUserId } from "../services/TaxPaymentService.jsx";
import { createTaxSummaryReport } from "../services/ReportService"; // Import the new service
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";

const SummaryReportPage = () => {
  const [user, setUser] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxHistory, setTaxHistory] = useState([]);
  const [taxFilingStatus, setTaxFilingStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [taxPayment, setTaxPayment] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [amendment, setAmendment] = useState(0);
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

        if (incomeData && deductionData) {
          fetchTaxDetails();
          const history = await getTaxHistory(userId);
          setTaxHistory(history.sort((a, b) => b.taxYear - a.taxYear));

          const filingStatus = await getFillingStatus(userId, year);
          setTaxFilingStatus(filingStatus);
        } else {
          setError(
            "Please add your income and deduction details for the current year."
          );
        }
      } catch (err) {
        setError("No Data Found...! Please Complete the Process First !");
      } finally {
        setLoading(false);
      }
    };

    fetchTaxData();
  }, [user, year, amendment]);

  useEffect(() => {
    if (!user) return;

    const fetchTaxPaymentData = async () => {
      try {
        const taxPaymentData = await getAllTaxPaymentByUserId(user.userId);
        setTaxPayment(taxPaymentData);
        if (
          taxPaymentData[0]?.paymentStatus &&
          taxPaymentData[0]?.paymentStatus === "Completed"
        ) {
          // If the payment is completed, try to generate the report
          setPdfUrl(taxPaymentData.pdfUrl); // Check if URL is already present
        }
      } catch (error) {
        // console.error("Error fetching tax payment data", error);
      }
    };

    fetchTaxPaymentData();
  }, [user]);

  const fetchTaxDetails = async (userId, year) => {
    try {
      // Fetch both versions of tax details concurrently
      const [taxDetailsVersion0, taxDetailsVersion1] = await Promise.allSettled(
        [
          getTaxDetails(userId, year, 0), // Tax details for isAmended === 0
          getTaxDetails(userId, year, 1), // Tax details for isAmended === 1
        ]
      );

      // Initialize an empty array to store tax details
      let existingTaxDetails = [];

      // Check for successful resolution of both promises
      if (taxDetailsVersion0.status === "fulfilled") {
        existingTaxDetails.push(taxDetailsVersion0.value); // Push first set of details
      }
      if (taxDetailsVersion1.status === "fulfilled") {
        existingTaxDetails.push(taxDetailsVersion1.value); // Push second set of details
      }
      // If we have any valid tax details, set them
      if (existingTaxDetails.length > 0) {
        setTaxDetails(existingTaxDetails); // Update state with the fetched data
      }
    } catch (error) {
      // console.error(' while fetching tax details:', error);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await createTaxSummaryReport(user.userId); // Call the service function
      const blob = new Blob([response], { type: "application/pdf" });
      const pdfLink = URL.createObjectURL(blob);
      setPdfUrl(pdfLink); // Set the PDF URL for the iframe
    } catch (err) {
      setError("Error generating tax summary report: " + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
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
            // style={{ minHeight: "calc(100vh - 4rem)" }}
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
              <motion.div
                className="flex flex-col lg:flex-row lg:justify-between items-start mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                  <FaFilePdf className="mr-2 text-blue-500" />
                  Tax Summary Report
                </h1>
              </motion.div>

              {/* <div className="flex flex-row w-full lg:flex-col lg:justify-between items-start mb-6"> */}
              {(() => {
                if (loading) {
                  return <p className="text-gray-600">Loading...</p>;
                }
                if (error) {
                  return <p className="text-red-500">{error}</p>;
                }
                if (taxPayment && taxPayment[0].paymentStatus !== "Completed") {
                  return (
                    <motion.div
                      className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FaExclamationCircle className="inline-block mr-2 text-yellow-500" />
                      <span>
                        Your tax payment is pending. Please complete your
                        payment to access the tax summary report.
                      </span>
                    </motion.div>
                  );
                }
                if (pdfUrl) {
                  return (
                    <motion.div
                      className="mt-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&zoom=70`}
                        type="application/pdf"
                        width="85%"
                        height="550px"
                        title="Tax Summary Report"
                        className="rounded-md border"
                        style={{
                          maxWidth: "100%",
                          margin: "0 auto",
                          display: "block",
                        }}
                      />
                      <div className="mt-4 flex justify-end">
                        <a
                          href={pdfUrl}
                          download="Tax_Summary_Report.pdf"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <FaDownload className="mr-2" />
                          Download Report
                        </a>
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <button
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                      <FaFilePdf className="mr-2" />
                      {isGeneratingReport ? "Generating..." : "Generate Report"}
                    </button>
                  </motion.div>
                );
              })()}

              {/* </div> */}
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default SummaryReportPage;
