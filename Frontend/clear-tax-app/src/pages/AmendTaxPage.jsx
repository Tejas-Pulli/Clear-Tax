import { useContext, useEffect, useState } from "react";
import Footer from "../layouts/Footer";
import Sidebar from "../layouts/Sidebar";
import Navbar from "../layouts/Navbar";
import { getUserByEmail } from "../services/UserServiceApi";
import Cookies from "js-cookie";
import { getAllTaxPaymentByUserId } from "../services/TaxPaymentService";
import { getFillingStatus } from "../services/TaxFillingServiceApi";
import { getTaxHistory } from "../services/TaxCalculationServiceApi";
import AmendmentForm from "../components/AmendmentForm";
import { useNavigate } from "react-router-dom";
import {
  addMultipleIncomes,
  getIncomesByUserId,
} from "../services/IncomeServiceApi";
import {
  addMultipleDeductions,
  getDeductionsByUserId,
} from "../services/DeductionServiceApi";
import toast from "react-hot-toast";
import labels from "../config/labels"; 
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const AmendTaxPage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [taxPayment, setTaxPayment] = useState(null);
  const [taxFillingStatus, setTaxFillingStatus] = useState();
  const [taxCalculationDetails, setTaxCalculationDetails] = useState(null);
  const [isAmendmentInProgress, setIsAmendmentInProgress] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [myIncomes, setmyIncomes] = useState([]);
  const [myDeductions, setmyDeductions] = useState([]);
  const [amendment, setAmendment] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  
  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserByEmail(Cookies.get("userEmail"));
        setUser(userData);
      } catch (err) {
        setError(labels.errors.fetchUser + err.message);
      }
    };
    fetchUser();
  }, []);

  //get amendment status  from the localstorage
  useEffect(() => {
    const storedStatus = localStorage.getItem("amendment");
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, [user, amendment]);

  //fetch incomes
  useEffect(() => {
    const fetchIncomes = async () => {
      if (user) {
        try {
          const fetchedIncomes = await getIncomesByUserId(user.userId, 0);
          setIncomes(fetchedIncomes);

          if (fetchedIncomes && fetchedIncomes.length > 0) {
            const formattedData = fetchedIncomes
              .filter((income) => {
                const incomeYear = new Date(income.incomeDate).getFullYear();
                return incomeYear === currentYear;
              })
              .map((income) => ({
                userId: user.userId,
                incomeSource: income.incomeSource,
                amount: income.amount,
                incomeDate: income.incomeDate,
                isAmended: 1,
              }));

            setmyIncomes(formattedData);
          }
        } catch (error) {
          setError("No Incomes are Available...!");
        }
      }
    };

    fetchIncomes();
  }, [user,currentYear]);

  //fetch deductions
  useEffect(() => {
    const fetchDeductions = async () => {
      if (user) {
        try {
          const fetchedDeductions = await getDeductionsByUserId(user.userId, 0);
          setDeductions(fetchedDeductions);

          if (fetchedDeductions && fetchedDeductions.length > 0) {
            const formattedData2 = fetchedDeductions
              .filter((deduction) => {
                const deductionYear = new Date(
                  deduction.deductionDate
                ).getFullYear();
                return deductionYear === currentYear;
              })
              .map((deduction) => ({
                userId: user.userId,
                deductionType: deduction.deductionType,
                amount: deduction.amount,
                deductionDate: deduction.deductionDate,
                isAmended: 1,
              }));
            setmyDeductions(formattedData2);
          }
        } catch (error) {
          setError("No Deductions are Available...!");
        }
      }
    };

    fetchDeductions();
  }, [user,currentYear]);

  // Fetch current tax payment and previous payment history
  useEffect(() => {
    const fetchTaxPaymentHistory = async () => {
      if (!user) return;
      try {
        const response = await getAllTaxPaymentByUserId(user.userId);
        const currentYear = new Date().getFullYear();
        const currentYearPayments = response.filter((payment) => {
          const paymentYear = new Date(payment.paymentDate).getFullYear();
          return paymentYear === currentYear;
        });

        setTaxPayment(currentYearPayments);
      } catch (error) {
        setError("Error fetching details..", error);
      }
    };
    fetchTaxPaymentHistory();
  }, [user]);

  //get Tax Filling Status
  useEffect(() => {
    const fetchTaxFillingStatus = async () => {
      if (!user) return;
      try {
        const response = await getFillingStatus(
          user.userId,
          new Date().getFullYear()
        );

        setTaxFillingStatus(response);
      } catch (error) {
        setError("Error fetching status: ", error);
      }
    };
    fetchTaxFillingStatus();
  }, [user]);

  //get Tax Filling Status
  useEffect(() => {
    const fetchTaxCalculationDetails = async () => {
      if (!user) return;
      try {
        const response = await getTaxHistory(
          user.userId,
          new Date().getFullYear()
        );
        setTaxCalculationDetails(response);
      } catch (error) {
        setError("Error fetching status: ", error);
      }
    };
    fetchTaxCalculationDetails();
  }, [user]);

  //get only the current year taxDetails
  let currentYearTaxDetail = taxCalculationDetails;
  if (taxCalculationDetails) {
    currentYearTaxDetail = taxCalculationDetails.find(
      (detail) => detail.taxYear === currentYear
    );
  }

  // Handle checking amendment eligibility
  const handleCheckEligibility = async () => {
    toast.loading("Checking Eligibility...", { position: "top-right" });

    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000)
    );

    toast.dismiss();

    if (taxCalculationDetails == null) {
      toast.error("You have No tax calculation for this year.", {
        position: "top-right",
      });
    } else if (taxCalculationDetails.some((calc) => calc.isAmended === 1)) {
      toast.success("You have already made an amendment for this year.", {
        position: "top-right",
      });
    } else if (amendment === 1) {
      toast("Amendment in Progress. Please complete the process.", {
        position: "top-right",
        icon: "⚠️",
      });
    } else if (taxFillingStatus === "Pending" || taxFillingStatus == null) {
      toast.error("You have not filed tax for this year.", {
        position: "top-right",
      });
    } else if (
      taxFillingStatus === "Filled" &&
      currentYearTaxDetail &&
      currentYearTaxDetail.taxLiability === 0
    ) {
      setIsModalOpen(true);
    } else if (taxPayment == null || taxPayment.paymentStatus === "Pending") {
      toast.error("You have not made any payments for this year.", {
        position: "top-right",
        icon: "⚠️",
      });
    } else {
      setIsModalOpen(true);
    }
  };

  // Handle the modal confirmation
  const handleProceedWithAmendment = async () => {
    try {
      await Promise.all([
        addMultipleIncomes(myIncomes),
        addMultipleDeductions(myDeductions),
      ]);

      localStorage.setItem("amendment", 1);
      toast.success("Proceeding with Amendment", { position: "top-right" });

      setTimeout(() => navigate("/incomeDetails"), 3000);
    } catch (error) {
      toast.error(
        "There was an error processing your amendment. Please try again.",
        { position: "top-right" }
      );
    }

    setIsModalOpen(false);
  };

  //Handle canclemodal
  const handleCancelModal = () => {
    setIsModalOpen(false);
    toast.success("Amendment postponed. You can amend your taxes later.", {
      position: "top-right",
    });
  };

  //handle cancle request
  const handleCancelAmendment = () => {
    setIsAmendmentInProgress(false);
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
              <motion.h1 className="text-3xl font-bold text-gray-800 mb-6"
               initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Tax Amendment
              </motion.h1>

              <div className="space-y-6">
                {!isAmendmentInProgress ? (
                  <>
                    {/* Instructions Section */}
                    <motion.div className="bg-blue-50 p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl font-semibold text-gray-700">
                        Instructions for Tax Amendment
                      </h2>
                      <p className="mt-4 text-gray-600">
                        In India, taxpayers can file an amendment to their
                        income tax returns under Section 139(5) of the Income
                        Tax Act, 1961. You can amend your return if there are
                        any errors or omissions in the original filing. The
                        process must be completed within a specified time frame
                        after filing the return, typically within 1 years from
                        the end of the assessment year.
                      </p>
                      <p className="mt-4 text-gray-600">
                        Ensure that all the details you wish to amend are
                        correct. If the amendment is for claiming additional
                        deductions or correcting income details, you need to
                        provide relevant documents.
                      </p>
                    </motion.div>

                    {/* Terms and Conditions */}
                    <motion.div className="bg-yellow-50 p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl font-semibold text-gray-700">
                        Terms and Conditions for Amendment
                      </h2>
                      <p className="mt-4 text-gray-600">
                        1. Amendments can only be made for returns filed in the
                        last year.
                        <br />
                        2. The original return must have been filed on time to
                        be eligible for an amendment.
                        <br />
                        3. If additional tax is payable after the amendment,
                        interest and penalties may be applicable.
                        <br />
                        4. If the return is amended to reduce the tax liability,
                        the revised return will be treated as the final return.
                        <br />
                        5. A taxpayer can amend the return only once for each
                        assessment year.
                      </p>
                    </motion.div>

                    {/* Amendment Related Information */}
                    <motion.div className="bg-green-50 p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-xl font-semibold text-gray-700">
                        Tax Amendment Information
                      </h2>
                      <p className="mt-4 text-gray-600">
                        Under the Income Tax Act, taxpayers can file a revised
                        return under Section 139(5) in case of errors,
                        omissions, or if they need to claim additional
                        deductions or correct any income discrepancies. Common
                        reasons for amendments include:
                      </p>
                      <ul className="list-disc pl-5 mt-4 text-gray-600">
                        <li>Incorrect reporting of income</li>
                        <li>Claiming additional deductions</li>
                        <li>Missed tax credits (e.g., TDS, advance tax)</li>
                        <li>Filing errors in the original return</li>
                        <li>
                          Changes in income after filing the original return
                        </li>
                      </ul>
                      <p className="mt-4 text-gray-600">
                        The amendment can be done online through the Income Tax
                        Department's e-filing portal. Once you submit the
                        revised return, it will be processed and, if accepted,
                        the necessary changes will be reflected in your final
                        tax record.
                      </p>
                    </motion.div>

                    {/* Check Eligibility Button */}
                    <motion.div className="mt-6 flex justify-center"
                    initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                    >
                      <button
                        onClick={handleCheckEligibility}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-sky-600 transition duration-300 ease-in-out"
                      >
                        Check Amendment Eligibility
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <AmendmentForm onCancel={handleCancelAmendment} />
                )}
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>

      {/* Modal for Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm to Proceed</h2>
            <p className="text-center text-gray-600 mb-6">
              You are eligible for a tax amendment. Do you want to proceed?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleProceedWithAmendment}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Yes
              </button>
              <button
                onClick={handleCancelModal}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AmendTaxPage;
