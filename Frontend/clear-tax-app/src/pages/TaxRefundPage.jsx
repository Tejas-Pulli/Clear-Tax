import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import Footer from "../layouts/Footer";
import {
  getTaxRefund,
  updateTaxRefundStatus,
} from "../services/TaxRefundService";
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const TaxRefundPage = () => {
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [taxRefund, setTaxRefund] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  });
  const [isRefundEligible, setIsRefundEligible] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [refundStatus, setRefundStatus] = useState(null);
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
    const fetchTaxRefund = async () => {
      try {
        if (user?.userId) {
          const refundData = await getTaxRefund(user.userId);
          setTaxRefund(refundData);
          if (refundData?.refundStatus === "Pending") {
            setIsRefundEligible(true);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaxRefund();
  }, [user]);

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateBankDetails = () => {
    const { accountNumber, bankName, ifscCode } = bankDetails;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!accountNumber || isNaN(accountNumber) || accountNumber.length < 6) {
      setFormError("Invalid Account Number.");
      return false;
    }
    if (!bankName || /\d/.test(bankName)) {
      setFormError("Bank Name must contain only letters.");
      return false;
    }
    if (!ifscRegex.test(ifscCode)) {
      setFormError("Invalid IFSC Code.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleSubmitRefund = async () => {
    if (!validateBankDetails()) return;
    setStatusUpdating(true);
    try {
      // Update status to 'In Progress'
      await updateTaxRefundStatus(user.userId, {
        refundStatus: "In Progress",
        bankDetails,
      });
      setTaxRefund({
        ...taxRefund,
        refundStatus: "In Progress",
        refundInitiationDate: new Date().toLocaleString(),
      });
      setRefundStatus("Initiated");
    } catch (error) {
      setFormError("Something went wrong. Please try again.");
    }
  };

  const calculateCompletionDate = (refundDate) => {
    if (!refundDate) return null;
    const refundDateObj = new Date(refundDate);
    refundDateObj.setDate(refundDateObj.getDate() + 1);

    // Get year, month, and day
    const year = refundDateObj.getFullYear();
    const month = String(refundDateObj.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed, so add 1
    const day = String(refundDateObj.getDate()).padStart(2, "0");

    // Return in yyyy-mm-dd format
    return `${year}-${month}-${day}`;
  };
  const renderRefundStatusMessage = () => {
    if (!taxRefund) {
      return (
        <motion.p className="text-gray-500 text-lg font-semibold"
         initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
          No refund available.
        </motion.p>
      );
    }

    const completionDate = calculateCompletionDate(taxRefund.refundDate);
    const formattedDate = new Date();
    const currentDate = formattedDate.toISOString().split("T")[0];

    if (taxRefund.refundStatus === "Pending") {
      return (
        <>
          <p className="text-green-600 font-semibold mt-5">
            You are eligible for the refund.
          </p>
          {isRefundEligible && (
            <motion.div className="mt-4 p-6 bg-white rounded-lg shadow-md"
             initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
              <h3 className="text-lg font-semibold mb-3">Enter Bank Details</h3>
              <form className="space-y-3">
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Account Number"
                  value={bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  className="w-full p-3 border rounded-md shadow-sm"
                />
                <input
                  type="text"
                  name="bankName"
                  placeholder="Bank Name"
                  value={bankDetails.bankName}
                  onChange={handleBankDetailsChange}
                  className="w-full p-3 border rounded-md shadow-sm"
                />
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="IFSC Code"
                  value={bankDetails.ifscCode}
                  onChange={handleBankDetailsChange}
                  className="w-full p-3 border rounded-md shadow-sm"
                />
                {formError && <p className="text-red-500">{formError}</p>}
                <button
                  type="button"
                  onClick={handleSubmitRefund}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Submit Refund Details
                </button>
              </form>
            </motion.div>
          )}
        </>
      );
    }
    if (taxRefund.refundStatus === "In Progress") {
      if (currentDate >= completionDate) {
        // Update refund status to "Completed" in DB
        updateTaxRefundStatus(user.userId, {
          refundStatus: "Completed",
          refundCompletionDate: currentDate,
        });
        setTaxRefund({ ...taxRefund, refundStatus: "Completed" });
      }

      return (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center text-yellow-600 font-semibold">
            <FaHourglassHalf className="mr-2" /> Refund is being processed...
          </div>

          {/* Toggle the progress timeline visibility based on `showRefundStatus` */}
          {
            <div className="w-full mt-4 relative">
              {/* Timeline Container */}
              <div className="relative flex items-center justify-between w-full">
                {/* Initiated Step */}
                <div className="relative flex items-center text-center w-1/3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-black font-semibold z-10 transform transition duration-500 ${(() => {
                      if (taxRefund.refundStatus === "Pending")
                        return "bg-gray-400";
                      return "bg-blue-500";
                    })()}`}
                  >
                    1.
                  </div>
                  <div className="text-black font-semibold ems-center justify-center z-10">
                    Initiated
                  </div>
                </div>

                {/* Line Connecting Steps */}
                <div
                  className={`w-1/3 h-0.5 mt-4 relative transform transition duration-500 ${(() => {
                    if (taxRefund.refundStatus === "Pending")
                      return "bg-gray-300";
                    return "bg-blue-500";
                  })()}`}
                >
                  {/* Step Indicator based on status */}
                  <div
                    className={`absolute top-0 left-0 h-full transform transition-all duration-500 ${
                      taxRefund.refundStatus === "In Progress" ||
                      taxRefund.refundStatus === "Completed"
                        ? "w-1/3 bg-blue-500"
                        : "w-0"
                    }`}
                  ></div>
                </div>

                {/* In Progress Step */}
                <div className="relative flex items-center text-center w-1/3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-black font-semibold z-10 transform transition duration-500 ${(() => {
                      if (taxRefund.refundStatus === "Pending")
                        return "bg-gray-400";
                      return "bg-yellow-500";
                    })()}`}
                  >
                    2.
                  </div>
                  <div className="text-black font-semibold ems-center justify-center z-10">
                    In Progress
                  </div>
                </div>

                {/* Line Connecting Steps */}
                <div
                  className={`w-1/3 h-0.5 mt-4 relative transform transition duration-500 ${(() => {
                    if (taxRefund.refundStatus === "Pending")
                      return "bg-gray-300";
                    return "bg-yellow-500";
                  })()}`}
                >
                  {/* Step Indicator based on status */}
                  <div
                    className={`absolute top-0 left-0 h-full transform transition-all duration-500 ${
                      taxRefund.refundStatus === "In Progress" ||
                      taxRefund.refundStatus === "Completed"
                        ? "w-1/3 bg-yellow-500"
                        : "w-0"
                    }`}
                  ></div>
                </div>

                {/* Completed Step */}
                <div className="relative flex items-center text-center w-1/3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-black font-semibold z-10 transform transition duration-500 ${
                      taxRefund.refundStatus === "Completed"
                        ? "bg-green-500 "
                        : "bg-gray-400 animate-bounce"
                    }`}
                  >
                    3.
                  </div>
                  <div className="text-black font-semibold ems-center justify-center z-10">
                    Completed
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div
                className={`absolute top-0 left-0 h-full transform transition-all duration-500 ${
                  taxRefund.refundStatus === "In Progress" ||
                  taxRefund.refundStatus === "Completed"
                    ? "w-1/3 bg-blue-500"
                    : "w-0"
                }`}
              ></div>

              <div
                className={`absolute top-0 left-1/3 h-full transform transition-all duration-500 ${
                  taxRefund.refundStatus === "In Progress" ||
                  taxRefund.refundStatus === "Completed"
                    ? "w-1/3 bg-yellow-500"
                    : "w-0"
                }`}
              ></div>

              <div
                className={`absolute top-0 left-2/3 h-full transform transition-all duration-500 ${
                  taxRefund.refundStatus === "Completed"
                    ? "w-1/3 bg-green-500"
                    : "w-0"
                }`}
              ></div>
            </div>
          }
        </motion.div>
      );
    }

    if (taxRefund.refundStatus === "Completed") {
      return (
        <motion.div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg"
         initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
        >
          <div className="flex items-center text-green-700 font-semibold">
            <FaCheckCircle className="mr-2" /> Your refund has been successfully
            processed!
          </div>
        </motion.div>
      );
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
              <div className="flex flex-col lg:flex-row lg:justify-between items-start mb-6">
                <motion.h1 className="text-3xl font-bold text-gray-800"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >Tax Refund</motion.h1>
              </div>

              {taxRefund && (
                <>
                <motion.h1 className="text-lg font-semibold text-gray-600 mb-2"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                Refund Data
              </motion.h1>

              <motion.div className="p-6 bg-white rounded-lg shadow-md mb-6"
               initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 shadow-md rounded-md">
                    <p className="text-gray-600">Name</p>
                    <p className="text-2xl font-semibold text-blue-700">
                      {user?.name}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 shadow-md rounded-md">
                    <p className="text-gray-600">Refund Amount</p>
                    <p className="text-2xl font-semibold text-yellow-700">
                      ₹ {taxRefund?.refundAmount || "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 shadow-md rounded-md">
                    <p className="text-gray-600">Initiation Date</p>
                    <p className="text-2xl font-semibold text-green-700">
                    {statusUpdating ? taxRefund?.refundDate : "N/A"}
                      
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 shadow-md rounded-md">
                    <p className="text-gray-600">Refund Date</p>
                    <p className="text-2xl font-semibold text-red-700">
                      {statusUpdating ? calculateCompletionDate(taxRefund?.refundDate) : "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>
                </>
              )}

              {renderRefundStatusMessage()}
            </main>
          </div>
        </div>
        <Footer />
      </div>

      <style>
        {`
    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    .animate-progress { animation: progress 5s linear; }
    .animate-bounce { animation: bounce 1s infinite; }
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-8px);
      }
    }
    .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.6; }
      100% { opacity: 1; }
    }
  `}
      </style>
    </>
  );
};

export default TaxRefundPage;
