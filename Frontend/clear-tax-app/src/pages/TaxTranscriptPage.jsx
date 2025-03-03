import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import Footer from "../layouts/Footer";
import { FaDownload, FaFilePdf } from "react-icons/fa";
import { generateTaxTranscript } from "../services/ReportService";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { getAllTaxPaymentByUserId } from "../services/TaxPaymentService";

const TaxTranscriptPage = () => {
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const [taxPayment, setTaxPayment] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserByEmail(email);
        setUser(userData);
        setIsLoading(false);
      } catch (err) {
        setError("Error fetching user details. Please try again.");
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [email]);

  const handleGenerateTranscript = async () => {
    if (!user) {
      setError("User data is missing. Please log in again.");
      return;
    }

    if (!taxPayment) {
      setError("Please complete all the steps to access the tax transcript.");
      return;
    }

    setIsGeneratingTranscript(true);
    try {
      const response = await generateTaxTranscript(user.userId);
      if (!response) {
        setError("No Data Found...! Please Complete the Process First !");
        return;
      }
      const blob = new Blob([response], { type: "application/pdf" });
      const pdfLink = URL.createObjectURL(blob);
      setPdfUrl(pdfLink);
    } catch (err) {
      setError("Error generating tax transcript. Please try again.");
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

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
              <motion.div
                className="flex flex-row w-full lg:flex-col lg:justify-between items-start mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                  <FaFilePdf className="mr-2 text-blue-500" />
                  Tax Transcript Report
                </h1>
              </motion.div>

              {(() => {
                if (isLoading) {
                  return <p className="text-gray-500">Loading...</p>;
                }

                if (error) {
                  return <div className="text-red-500 mb-4">{error}</div>;
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
                        src={`${pdfUrl}#toolbar=0&navpanes=0&zoom=50`}
                        type="application/pdf"
                        width="95%"
                        height="500px"
                        title="Tax Transcript"
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
                          download="Tax_Transcript_Report.pdf"
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
                  <div>
                    <motion.button
                      onClick={handleGenerateTranscript}
                      disabled={isGeneratingTranscript}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FaFilePdf className="mr-2" />
                      {isGeneratingTranscript
                        ? "Generating..."
                        : "Generate Report"}
                    </motion.button>
                  </div>
                );
              })()}
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TaxTranscriptPage;
