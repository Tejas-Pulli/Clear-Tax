import { motion } from "framer-motion";
import Cookies from "js-cookie";
import  { useContext, useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast"; // Import react-hot-toast
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { getTaxDetails } from "../services/TaxCalculationServiceApi";
import {
  downloadReceipt,
  getAllTaxPaymentByUserId,
  getTaxPaymentByUserId,
  payTaxAtRazorpay,
  verifyPayment,
} from "../services/TaxPaymentService";
import { getUserByEmail } from "../services/UserServiceApi";
import { MdSimCardDownload } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TrackPaymentsPage = () => {

  const [user, setUser] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [error, setError] = useState("");
  const [taxDetails, setTaxDetails] = useState({});
  const [pdfBlob, setPdfBlob] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [amendment, setAmendment] = useState(0);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = allPayments.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(allPayments.length / itemsPerPage);
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
    const fetchTaxPaymentHistory = async () => {
      if (!user) return;
      try {
        const response = await getAllTaxPaymentByUserId(user.userId);
        if(response)
          setAllPayments(response);
        setLoading(false);
      } catch (error) {
        setError("" + error.message);
      }
    };
    fetchTaxPaymentHistory();
  }, [user, paymentStatus, transactionDetails]);
  useEffect(() => {
    const storedStatus = localStorage.getItem("amendment");
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, [user, amendment]);

  useEffect(() => {
  const fetchTransactionDetails = async () => {
    try {
        const response = await getTaxPaymentByUserId(user.userId);
        setTransactionDetails(response);
        setPaymentStatus(response.paymentStatus);
        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };
    fetchTransactionDetails();
  }, [user]);

  useEffect(() => {
    const fetchTaxDetails = async () => {
      if (!user) return;
      try {
        const response = await getTaxDetails(
          user.userId,
          new Date().getFullYear(),
          amendment
        );
        setTaxDetails(response);
        setLoading(false);
      } catch (error) {
        setError(error)
      }
    };
    fetchTaxDetails();
  }, [user, amendment]);

  // Effect to fetch PDF data once payment is completed
  useEffect(() => {
    const fetchReceipt = async () => {
      if (paymentStatus === "Completed" && !pdfBlob) {
        try {
          const pdfData = await downloadReceipt(
            user.userId,
            transactionDetails.transactionId
          );
          const blob = new Blob([pdfData], { type: "application/pdf" });
          if (blob.size > 0) {
            setPdfBlob(blob);
          }
        } catch (error) {
          toast.error("Error downloading receipt. Please try again.", {
            position: "top-right", 
          });
        }
      }
    };

    fetchReceipt();
  }, [paymentStatus, user, transactionDetails, pdfBlob]);

  useEffect(() => {
    if (paymentStatus === "Failed") {
      // Re-fetch transaction details when payment fails
      const fetchTransactionDetails = async () => {
        try {
          const response = await getTaxPaymentByUserId(user.userId);
          setTransactionDetails(response);
          setPaymentStatus(response.paymentStatus);
          setLoading(false);
        } catch (error) {
          setError(error);
        }
      };
      fetchTransactionDetails();
    }
  }, [paymentStatus, user]);

  const handlePayment = async () => {
    try {
      const response = await payTaxAtRazorpay(user.userId, amendment);

      if (response.paymentStatus === "Pending") {
        const razorpayOptions = {
          key: "rzp_test_5NRyDfXiLxWsWe",
          amount: response.amountPaid * 100,
          currency: "INR",
          name: "Tax Payment",
          description: "Payment for Tax",
          image: "/pageLogo.png",
          order_id: response.transactionId,
          handler: async function (paymentResponse) {
            try {
              const paymentStatus = await verifyPayment(
                paymentResponse.razorpay_order_id,
                paymentResponse.razorpay_payment_id,
                paymentResponse.razorpay_signature
              );

              if (paymentStatus === "success") {
                setPaymentStatus("Completed");
                setTransactionDetails({
                  ...transactionDetails,
                  paymentStatus: "Completed",
                  transactionId: response.transactionId,
                  paymentDate: new Date(),
                });
                setAllPayments((prevPayments) => [
                  ...prevPayments,
                  {
                    amountPaid: response.amountPaid,
                    paymentDate: new Date(),
                    transactionId: response.transactionId,
                  },
                ]);
                toast.success(
                  "Payment Successful! Your tax payment has been successfully completed.", {
                    position: "top-right", 
                  }
                );
                localStorage.setItem("amendment", 0);
              } else {
                setPaymentStatus("Failed");
                toast.error("Payment failed. Please try again.", {
                  position: "top-right", 
                });
              }
            } catch (error) {
              toast.error("Error verifying payment. Please try again.", {
                position: "top-right", 
              });
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#23293A",
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();

        razorpay.on("payment.failed", function () {
          setPaymentStatus("Failed");
          toast.error("Payment failed. Please try again.", {
            position: "top-right", 
          });
        });

        razorpay.on("closed", function () {
          setPaymentStatus("Pending");
        });
      }
    } catch (error) {
      toast.error("Error initiating payment. Please try again.", {
        position: "top-right", 
      });
    }
  };

  const handleDownload = async (transactionId) => {
    try {
      const pdfData = await downloadReceipt(user.userId, transactionId);
      if (!pdfData || pdfData.size === 0) {
        throw new Error("Empty PDF data received.");
      }

      const blob = new Blob([pdfData], { type: "application/pdf" });
      setPdfBlob(blob);
      downloadBlob(blob, transactionId);
    } catch (error) {
      toast.error("Error downloading receipt. Please try again.", {
        position: "top-right", 
      });
    }
  };

  const downloadBlob = (blob, transactionId) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Tax_Payment_Receipt_${transactionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
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
            <main className="p-8 flex-grow overflow-y-auto">
              <motion.h1 className="text-3xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Payments
              </motion.h1>

              {/* Payment Details */}
              {paymentStatus === "Pending" && (
                <div>
                  <h1 className="text-lg font-semibold text-gray-600 mb-6">
                    Pending Payments
                  </h1>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-200 cursor-pointer hover:shadow-xl transition"
                    onClick={toggleModal}
                  >
                    {/* Left Side - Tax Details */}

                    <div className="flex flex-row text-gray-700 w-4/5 space-x-10 justify-around">
                      <div className="flex flex-col items-center">
                        <motion.p
                          className="text-lg font-semibold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          Gross Income
                        </motion.p>
                        <motion.p
                          className="text-lg mt-2"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {taxDetails.grossIncome}
                        </motion.p>
                      </div>
                      <div className="flex flex-col items-center">
                        <motion.p
                          className="text-lg font-semibold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          Deductions
                        </motion.p>
                        <motion.p
                          className="text-lg mt-2"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {taxDetails.deductions}
                        </motion.p>
                      </div>
                      <div className="flex flex-col items-center">
                        <motion.p
                          className="text-lg font-semibold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          Tax Year
                        </motion.p>
                        <motion.p
                          className="text-lg mt-2"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {new Date().getFullYear()}
                        </motion.p>
                      </div>
                      <div className="flex flex-col items-center">
                        <motion.p
                          className="text-lg font-semibold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          Tax Liability
                        </motion.p>
                        <motion.p
                          className="text-lg mt-2"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {taxDetails.taxLiability}
                        </motion.p>
                      </div>
                    </div>

                    {/* Right Side - Pay Now / Try Again Button */}
                    {paymentStatus === "Failed" ? (
                      <button
                        className="bg-red-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                        onClick={() => window.location.reload()} // Auto refresh on failure
                      >
                        Try Again
                      </button>
                    ) : (
                      <button
                        className="bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal toggle
                          handlePayment();
                        }}
                      >
                        Pay Now
                      </button>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Payments History Table */}
              <div className="text-left mt-6">
                <motion.h2 className="text-lg font-bold text-gray-600 mt-6 mb-4 text-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  Payment History
                </motion.h2>
                <motion.table
                className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4"
                initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 border border-gray-300 text-left">
                        Transaction ID
                      </th>
                      <th className="p-3 border border-gray-300 text-left">
                        Amount Paid (₹)
                      </th>
                      <th className="p-3 border border-gray-300 text-left">
                        Payment Date
                      </th>
                      <th className="p-3 border border-gray-300 text-left">
                        Status
                      </th>
                      <th className="p-3 border border-gray-300 text-center">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {Array.isArray(currentPayments) && currentPayments.map((payment, index) => (
                      <motion.tr
                        key={index}
                        className="border border-gray-300 transition-all hover:bg-gray-100"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay:  index*0.1 }}
                      >
                        <td className="p-3 border border-gray-300">
                          {payment.transactionId}
                        </td>
                        <td className="p-3 border border-gray-300">
                          {payment.amountPaid}
                        </td>
                        <td className="p-3 border border-gray-300">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td
                          className={`p-3 border border-gray-300 font-bold ${
                            payment.paymentStatus === "Completed"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {payment.paymentStatus}
                        </td>
                        <td className="p-3 border border-gray-300 text-center">
                          {payment.paymentStatus === "Completed" ? (
                            <button
                              onClick={() =>
                                handleDownload(payment.transactionId)
                              }
                              className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                            >
                              <MdSimCardDownload className="size-5 text-green-600 hover:text-green-700" />
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <motion.div className="flex justify-center mt-4 space-x-2"
                   initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                  >
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                      >
                        Prev
                      </button>
                    )}
                    {currentPage < totalPages && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                      >
                        Next
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  {/* Modal Content */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-4 rounded-lg shadow-xl w-full sm:w-3/5 md:w-2/5 relative"
                  >
                    {/* Close Button */}
                    <button
                      onClick={toggleModal}
                      className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition-transform transform hover:scale-90"
                      aria-label="Close Modal"
                    >
                      <FaTimes className="text-lg" />
                    </button>

                    {/* Title */}
                    <motion.h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center tracking-wide"
                     initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      Payment Details
                    </motion.h2>

                    {/* User Details Section */}
                    <motion.div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 p-3 rounded-xl shadow-md mb-4"
                     initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        User Information
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800">
                          <strong>Name:</strong> {user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Email:</strong> {user?.email || "N/A"}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>User ID:</strong> {user?.userId || "N/A"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Tax Details Section */}
                    <motion.div className="bg-gradient-to-r from-green-50 via-green-100 to-green-200 p-3 rounded-xl shadow-md mb-4"
                     initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Tax Details
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800">
                          <strong>Gross Income:</strong> ₹
                          {taxDetails?.grossIncome || "N/A"}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Deductions:</strong> ₹
                          {taxDetails?.deductions || "N/A"}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Tax Year:</strong> {new Date().getFullYear()}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Tax Liability:</strong> ₹
                          {taxDetails?.taxLiability || "N/A"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Payment Details Section
                    <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-200 p-3 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Payment Information
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800">
                          <strong>Transaction ID:</strong>{" "}
                          {transactionDetails?.transactionId || "N/A"}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Payment Status:</strong>{" "}
                          <span
                            className={`font-semibold ${
                              transactionDetails?.paymentStatus === "Pending"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {transactionDetails?.paymentStatus === "Pending"
                              ? "Failed"
                              : transactionDetails?.paymentStatus || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Amount Paid:</strong> ₹
                          {transactionDetails?.amountPaid || "N/A"}
                        </p>
                        <p className="text-sm text-gray-800">
                          <strong>Payment Date:</strong>{" "}
                          {transactionDetails?.paymentDate
                            ? new Date(
                                transactionDetails.paymentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div> */}
                  </motion.div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default TrackPaymentsPage;
