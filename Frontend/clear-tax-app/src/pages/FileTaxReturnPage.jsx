import { useContext, useEffect, useState } from "react";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import {
  createTaxFilingPdf,
  generateTaxFilingPdf,
  getFillingStatus,
  isPdfGenerated,
  submitTaxReturn,
} from "../services/TaxFillingServiceApi";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import { getTaxDetails } from "../services/TaxCalculationServiceApi";
import {
  FaFilePdf,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRegCircle,
  FaDownload,
  FaFileSignature,
} from "react-icons/fa";
import toast from "react-hot-toast";
import labels from "../config/labels";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const FileTaxReturnPage = () => {
  const taxYear = new Date().getFullYear();
  const [user, setUser] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isPdfGeneratedState, setIsPdfGeneratedState] = useState(false);
  const [fillingStatus, setFillingStatus] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [flag, setFlag] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = Cookies.get(labels.fileTaxReturnPage.userEmail);
        if (!userEmail) {
          throw new Error(labels.fileTaxReturnPage.error.emailError);
        }

        const userData = await getUserByEmail(userEmail);
        setUser(userData);

        const taxDetailsData = await getTaxDetails(userData.userId, taxYear, 0);
        setTaxDetails(taxDetailsData);

        // Check if PDF is already generated for the user and tax year
        const pdfGenerated = await isPdfGenerated(userData.userId, taxYear);
        const status = await getFillingStatus(userData.userId, taxYear);
        setFillingStatus(status);

        if (pdfGenerated) {
          const NewtaxFillingDto = {
            userId: userData.userId,
            userName: userData.name,
            governmentId: userData.governmentId,
            taxYear: taxYear,
            grossIncome: taxDetailsData.grossIncome,
            totalDeductions: taxDetailsData.deductions,
            taxableIncome: taxDetailsData.taxableIncome,
            taxLiabillity: taxDetailsData.taxLiability,
            fillingStatus: status,
            refundStatus: labels.fileTaxReturnPage.status.notProcessed,
          };

          const pdfData = await createTaxFilingPdf(NewtaxFillingDto);
          const blob = new Blob([pdfData], { type: "application/pdf" });
          setPdfBlob(blob);
          setIsPdfGeneratedState(true);
        }
      } catch (err) {
        setError(err.message || labels.fileTaxReturnPage.error.failedDataFetch);
      }
    };

    fetchUserData();
  }, [flag,taxYear]);

  const handleGeneratePdf = async () => {
    if (!taxDetails) {
      toast(
        labels.fileTaxReturnPage.toast.requiredTaxCalculation,
        {
          position: "top-right",
          duration: 3000,
          icon: "⚠️",
        }
      );
      return;
    }

    setIsLoading(true);

    const taxFillingDto = {
      userId: user.userId,
      userName: user.name,
      governmentId: user.governmentId,
      taxYear: taxYear,
      grossIncome: taxDetails.grossIncome,
      totalDeductions: taxDetails.deductions,
      taxableIncome: taxDetails.taxableIncome,
      taxLiabillity: taxDetails.taxLiability,
      fillingStatus: labels.fileTaxReturnPage.status.pending,
      refundStatus: labels.fileTaxReturnPage.status.notProcessed,
    };

    try {
      const pdfData = await generateTaxFilingPdf(taxFillingDto);
      const blob = new Blob([pdfData], { type: "application/pdf" });
      setPdfBlob(blob);
      setIsPdfGeneratedState(true);
      toast.success(labels.fileTaxReturnPage.toast.pdfSuccessMessage, {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      setError(error.message || labels.fileTaxReturnPage.error.pdfError);
      toast.error(labels.fileTaxReturnPage.error.pdfError, {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTaxReturn = async () => {
    if (!taxDetails) {
      toast(
        labels.fileTaxReturnPage.toast.requiredPdf,
        {
          position: "top-right",
          duration: 3000,
          icon: "⚠️",
        }
      );

      return;
    }

    setIsLoading(true);

    try {
      await submitTaxReturn(user.userId, taxYear);
      const updatedTaxDetails = await getTaxDetails(user.userId, taxYear, 0);
      setTaxDetails(updatedTaxDetails);
      setFlag(true);
      toast.success(labels.fileTaxReturnPage.toast.taxSubmitSuccessMessage, {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      setError(error.message || labels.fileTaxReturnPage.error.taxSubmitError);
      toast.error(labels.fileTaxReturnPage.error.taxSubmitError, {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfBlob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `Tax_Filing_${taxYear}.pdf`;
      link.click();
    }
  };

  // Utility for step progress classes
  const stepClass = (isCompleted) =>
    isCompleted
      ? "bg-green-500 text-white"
      : "bg-gray-300 text-gray-600 border border-gray-400";

  return (
    <>
      <Navbar />
      <div className="flex flex-col relative w-full pt-16 min-h-screen bg-gray-100">
        <div className="flex flex-1">
          <div className={`transition-all ${isSidebarOpen ? "w-1/5" : "w-16"}`}>
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>

          {/* Main Content */}
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
              <motion.h1 className="text-3xl font-bold text-gray-800 mb-6"
               initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FaFileSignature className="inline-block -mt-2 mr-2 text-blue-500" />
                {labels.fileTaxReturnPage.heading.title}{taxYear}
              </motion.h1>

              {/* Progress Tracker */}
              <div className="mb-6">
                <div className="flex flex-col items-center mb-10">
                  <motion.h2 className="text-2xl font-bold text-gray-800 mb-6"
                   initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                  >
                    {labels.fileTaxReturnPage.heading.subtitle}
                  </motion.h2>
                  <div className="flex items-center justify-between w-full max-w-xl">
                    {/* Step 1: Tax Details */}
                    <motion.div className="flex flex-col items-center"
                     initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                          taxDetails ? "bg-green-500" : "bg-gray-400"
                        }`}
                      >
                        {taxDetails ? (
                          <FaCheckCircle className="text-white text-xl" />
                        ) : (
                          <FaRegCircle className="text-white text-xl" />
                        )}
                      </div>
                      <p
                        className={`mt-2 ${
                          taxDetails ? "text-green-700" : "text-gray-600"
                        } text-center`}
                      >
                        {labels.fileTaxReturnPage.heading.step1}
                      </p>
                    </motion.div>
                    <motion.div
                      className={`w-10 h-1 ${
                        taxDetails ? "bg-green-500" : "bg-gray-400"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.0 }}
                    ></motion.div>
                    {/* Step 2: Generate PDF */}
                    <motion.div className="flex flex-col items-center"
                     initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.0 }}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                          isPdfGeneratedState ? "bg-green-500" : "bg-gray-400"
                        }`}
                      >
                        {isPdfGeneratedState ? (
                          <FaFilePdf className="text-white text-xl" />
                        ) : (
                          <FaRegCircle className="text-white text-xl" />
                        )}
                      </div>
                      <p
                        className={`mt-2 ${
                          isPdfGeneratedState
                            ? "text-green-700"
                            : "text-gray-600"
                        } text-center`}
                      >
                                                {labels.fileTaxReturnPage.heading.step2}

                      </p>
                    </motion.div>
                    <motion.div
                      className={`w-10 h-1 ${
                        isPdfGeneratedState ? "bg-green-500" : "bg-gray-400"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5 }}
                    ></motion.div>

                    {/* Step 3: Submit Tax Return */}
                    <motion.div className="flex flex-col items-center"
                     initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                          fillingStatus === "Filled"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {fillingStatus === "Filled" ? (
                          <FaPaperPlane className="text-white text-xl" />
                        ) : (
                          <FaRegCircle className="text-white text-xl" />
                        )}
                      </div>
                      <p
                        className={`mt-2 ${
                          fillingStatus === "Filled"
                            ? "text-green-700"
                            : "text-gray-600"
                        } text-center`}
                      >
                        {labels.fileTaxReturnPage.heading.step3}
                        
                      </p>
                    </motion.div>

                    <motion.div
                      className={`w-10 h-1 ${
                        fillingStatus === "Filled"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2.0 }}
                    ></motion.div>

                    {/* Step 4: Tax Return Verified */}
                    <motion.div className="flex flex-col items-center"
                     initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2.0 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                          fillingStatus === "Filled"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {fillingStatus === "Filled" ? (
                          <FaCheckCircle className="text-white text-xl" />
                        ) : (
                          <FaRegCircle className="text-white text-xl" />
                        )}
                      </div>
                      <p
                        className={`mt-2 ${
                          fillingStatus === "Filled"
                            ? "text-green-700"
                            : "text-gray-600"
                        } text-center`}
                      >
                                               {labels.fileTaxReturnPage.heading.step4}

                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Tax Filing Status */}
              <div className="mb-8">
                {fillingStatus === "Filled" ? (
                  <div className="flex items-center justify-between bg-green-100 p-4 rounded-lg shadow-md">
                    <motion.div className="flex items-center"
                     initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <FaCheckCircle className="text-green-600 text-3xl mr-4" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-700">
                          {labels.fileTaxReturnPage.status.filled}
                        </h3>
                        <p>
                          {labels.fileTaxReturnPage.heading.pageLabel1} {taxYear} has been successfully filed.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-lg shadow-md">
                    <motion.div className="flex items-center"
                     initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                      <FaExclamationTriangle className="text-yellow-600 text-3xl mr-4" />
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-700">
                          Tax Return Not Filed
                        </h3>
                        <p>
                          {labels.fileTaxReturnPage.heading.pageLabel1} {taxYear} is not yet filed. Please
                          proceed with filing.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* PDF Actions */}
              <motion.div className="flex justify-between items-center mb-6"
                    initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={handleGeneratePdf}
                  disabled={isPdfGeneratedState || isLoading}
                  className={`p-3 rounded-md w-40 flex items-center justify-center ${
                    isPdfGeneratedState
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <FaFilePdf className="mr-2" />
                  {isLoading ? "Generating..." : "Generate Form"}
                </button>

                <button
                  onClick={handleSubmitTaxReturn}
                  disabled={!pdfBlob || isLoading || fillingStatus === "Filled"}
                  className={`p-3 rounded-md w-40 flex items-center justify-center ${
                    !pdfBlob || fillingStatus === "Filled"
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <FaPaperPlane className="mr-2" />
                  {isLoading ? "Submitting..." : "Submit Form"}
                </button>
              </motion.div>

              {/* Show PDF */}
              {pdfBlob && (
                <div className="relative mt-6">
                  {/* Top-right Download Icon */}
                  <button
                    onClick={handleDownloadPdf}
                    disabled={!pdfBlob}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      !pdfBlob
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    title="Download Form"
                  >
                    <FaDownload />
                  </button>
                  {/* PDF Preview Section */}
                  <motion.h2 className="text-xl font-semibold mb-4"
                        initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                  >
                    Tax Filing Form
                  </motion.h2>
                  <iframe
                    src={`${URL.createObjectURL(
                      pdfBlob
                    )}#toolbar=0&navpanes=0&zoom=80`}
                    type="application/pdf"
                    width="80%"
                    height="930px"
                    title="Tax Form"
                    className="rounded-md border"
                    style={{
                      pointerEvents: "none",
                      maxWidth: "100%",
                      margin: "0 auto",
                      display: "block",
                    }}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default FileTaxReturnPage;
