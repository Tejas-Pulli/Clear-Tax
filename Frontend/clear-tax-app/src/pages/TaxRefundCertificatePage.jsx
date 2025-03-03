import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import Footer from "../layouts/Footer";
import {
  getTaxRefund,
  fetchRefundCertificate,
} from "../services/TaxRefundService";
import { FaDownload } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const TaxRefundCertificatePage = () => {
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [taxRefund, setTaxRefund] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserByEmail(email);
      setUser(userData);
    };
    fetchUser();
  }, [email]);

  useEffect(() => {
    const fetchRefund = async () => {
      if (user) {
        const refundData = await getTaxRefund(user.userId);
        setTaxRefund(refundData);
      }
    };
    fetchRefund();
  }, [user]);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (taxRefund?.refundStatus === "Completed") {
        setIsGeneratingCertificate(true);
        try {
          const certificateData = await fetchRefundCertificate(user.userId);
          const blob = new Blob([certificateData], { type: "application/pdf" });
          setCertificate(blob);
        } catch (err) {
          // console.error("Error fetching certificate:", err.message);
        } finally {
          setIsGeneratingCertificate(false);
        }
      }
    };
    fetchCertificate();
  }, [taxRefund, user]);

  const handleDownload = () => {
    if (certificate) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(certificate);
      link.download = "TaxRefundCertificate.pdf";
      link.click();
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen pt-16 bg-white">
        <div className="flex flex-1">
          <div className={`transition-all ${isSidebarOpen ? "w-1/5" : "w-16"}`}>
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>

          <div
            className={`flex flex-col w-full ${isSidebarOpen ? "pl-2" : ""}`}
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
                <h1 className="text-3xl font-bold text-gray-800">
                  Tax Refund Certificate
                </h1>
              </motion.div>

              {/* <div className="text-right"> */}
              {/* <p className="text-right italic">
                  Welcome, {user ? user.name : "User"}!
                </p> */}
              {/* </div> */}

              {(() => {
                if (taxRefund === null || taxRefund === undefined) {
                  return (
                    <motion.div
                      className="text-start text-gray-600 text-xl font-semibold"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      No Refund Data
                    </motion.div>
                  );
                }

                if (
                  taxRefund?.refundStatus === "Pending" ||
                  taxRefund?.refundStatus === "In Progress"
                ) {
                  return (
                    <motion.div
                      className="text-start text-gray-600 text-xl font-semibold"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      Refund Certificate will be generated after the refund is
                      completed
                    </motion.div>
                  );
                }

                if (taxRefund?.refundStatus === "Completed") {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {certificate ? (
                        <div>
                          <p>Your certificate is ready to download:</p>
                          <button
                            onClick={handleDownload}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center mt-2 mb-2"
                          >
                            <FaDownload className="mr-2" />
                            Download Certificate
                          </button>
                          <iframe
                            src={`${URL.createObjectURL(
                              certificate
                            )}#toolbar=0&navpanes=0&zoom=62`}
                            type="application/pdf"
                            width="80%"
                            height="500px"
                            title="Tax Refund Certificate"
                            className="rounded-md border"
                            style={{
                              pointerEvents: "none",
                              maxWidth: "100%",
                              margin: "0 auto",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : (
                        <div>Loading certificate...</div>
                      )}
                    </motion.div>
                  );
                }

                return null;
              })()}
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TaxRefundCertificatePage;
