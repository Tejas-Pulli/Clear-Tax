import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { getUserByEmail } from "../services/UserServiceApi";
import { getIncomesByYearAndUserId } from "../services/IncomeServiceApi";
import { getDeductionsByYearAndUserId } from "../services/DeductionServiceApi";
import { getTaxDetails } from "../services/TaxCalculationServiceApi";
import {
  getFillingStatus,
  isPdfGenerated,
} from "../services/TaxFillingServiceApi";
import { getAllTaxPaymentByUserId } from "../services/TaxPaymentService";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import Footer from "../layouts/Footer";
import labels from "../config/labels";
import { AuthContext } from "../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [currentYear] = useState(new Date().getFullYear());
  const [amendment, setAmendment] = useState(0);
  const [taxData, setTaxData] = useState(null);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState({
    income: false,
    deductions: false,
    taxDetails: false,
    pdfGenerated: false,
    filingStatus: false,
    taxPayment: false,
  });

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
    if (!user) return;

    const fetchIncomeData = async () => {
      try {
        const incomeData = await getIncomesByYearAndUserId(
          user.userId,
          currentYear,
          amendment
        );
        setSteps((prevSteps) => ({
          ...prevSteps,
          income: incomeData?.length > 0,
        }));
      } catch (error) {
        setError(error);
      }
    };

    fetchIncomeData();
  }, [user, currentYear,amendment]);

  useEffect(() => {
    if (!user) return;

    const fetchDeductionsData = async () => {
      try {
        const deductionsData = await getDeductionsByYearAndUserId(
          user.userId,
          currentYear,
          amendment
        );
        setSteps((prevSteps) => ({
          ...prevSteps,
          deductions: deductionsData?.length > 0,
        }));
      } catch (error) {
        setError(error);
      }
    };

    fetchDeductionsData();
  }, [user, currentYear,amendment]);

  useEffect(() => {
    if (!user) return;

    const fetchTaxDetails = async () => {
      try {
        const taxDetailsData = await getTaxDetails(
          user.userId,
          currentYear,
          amendment
        );
        setTaxData(taxDetailsData);
        setSteps((prevSteps) => ({
          ...prevSteps,
          taxDetails: !!taxDetailsData,
        }));
      } catch (error) {
        setError(error);
      }
    };

    fetchTaxDetails();
  }, [user, currentYear,amendment]);

  useEffect(() => {
    if (!user) return;

    const fetchPdfGeneratedStatus = async () => {
      try {
        const pdfGeneratedData = await isPdfGenerated(user.userId, currentYear);
        setSteps((prevSteps) => ({
          ...prevSteps,
          pdfGenerated: pdfGeneratedData,
        }));
      } catch (error) {
        setError(error);
      }
    };

    fetchPdfGeneratedStatus();
  }, [user, currentYear]);

  useEffect(() => {
    if (!user) return;

    const fetchFilingStatus = async () => {
      try {
        const filingStatusData = await getFillingStatus(
          user.userId,
          currentYear
        );
        setSteps((prevSteps) => ({
          ...prevSteps,
          filingStatus: filingStatusData === labels.homePage.status.Filled,
        }));
      } catch (error) {
        setError(error);
      }
    };

    fetchFilingStatus();
  }, [user, currentYear]);

  useEffect(() => {
    if (!user) return;

    const fetchTaxPaymentData = async () => {
      try {
        const taxPaymentData = await getAllTaxPaymentByUserId(user.userId);
        if (taxPaymentData) {
          setSteps((prevSteps) => ({
            ...prevSteps,
            taxPayment: taxPaymentData?.length > 0,
          }));
        } else if (
          !taxPaymentData &&
          steps.filingStatus &&
          taxData.taxLiability === 0
        ) {
          setSteps((prevSteps) => ({
            ...prevSteps,
            taxPayment: true,
          }));
        } else {
          setSteps((prevSteps) => ({
            ...prevSteps,
            taxPayment: false,
          }));
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchTaxPaymentData();
  }, [user,steps.filingStatus,taxData]);

  const handleStepClick = (step) => {
    const routes = {
      income: "/incomeDetails",
      deductions: "/trackExpenses",
      taxDetails: "/estimateTaxLiability",
      pdfGenerated: "/fileTaxReturn",
      filingStatus: "/fileTaxReturn",
      taxPayment: "/trackPayments",
    };
    navigate(routes[step] || "/");
  };

  const getStepClass = (step) => (steps[step] ? "bg-green-500" : "bg-gray-400");

  const Step = ({ step, label }) => (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={() => handleStepClick(step)}
    >
      <div
        className={`w-6 h-6 rounded-full ${getStepClass(step)} transition-all`}
      ></div>
      <p
        className={`mt-2 text-center ${
          steps[step] ? "text-green-700" : "text-gray-600"
        }`}
      >
        {label}
      </p>
    </div>
  );

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
            <main className="p-6 bg-white rounded-xl mx-4 overflow-y-auto overflow-x-hidden">
              {/* <div className="text-right">
                <div className="flex justify-end w-full">
                  <p className="text-m italic truncate overflow-hidden max-w-xl text-right">
                    {labels.homePage.heading.welcome}{" "}
                    {user ? user.name : "User"}!
                  </p>
                </div>
              </div> */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-blue-600">
                  {labels.homePage.heading.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {labels.homePage.heading.subTitle}
                </p>
              </div>

              <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-12">
                <div className="flex felx items-center w-full">
                  <Step
                    step={labels.homePage.income.step}
                    label={labels.homePage.income.label}
                  />
                  <div
                    className={`w-20 h-1 mb-14 ${getStepClass(
                      labels.homePage.income.step
                    )} bg-gray-300`}
                  ></div>

                  <Step
                    step={labels.homePage.deduction.step}
                    label={labels.homePage.deduction.label}
                  />
                  <div
                    className={`w-20 mb-14 h-1 ${getStepClass(
                      labels.homePage.deduction.step
                    )} bg-gray-300`}
                  ></div>

                  <Step
                    step={labels.homePage.taxDetails.step}
                    label={labels.homePage.taxDetails.label}
                  />
                  <div
                    className={`w-20 mb-14 h-1 ${getStepClass(
                      labels.homePage.taxDetails.step
                    )} bg-gray-300`}
                  ></div>

                  <Step
                    step={labels.homePage.pdf.step}
                    label={labels.homePage.pdf.label}
                  />
                  <div
                    className={`w-20 mb-14 h-1 ${getStepClass(
                      labels.homePage.pdf.step
                    )} bg-gray-300`}
                  ></div>

                  <Step
                    step={labels.homePage.status.step}
                    label={labels.homePage.status.label}
                  />
                  <div
                    className={`w-20 mb-14 h-1 ${getStepClass(
                      labels.homePage.status.step
                    )} bg-gray-300`}
                  ></div>

                  <Step
                    step={labels.homePage.payment.step}
                    label={labels.homePage.payment.label}
                  />
                </div>
              </div>

              {/* Latest Tax News Section */}
              <motion.div
                className="bg-red-50 p-6 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105"
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h3 className="text-xl font-semibold text-blue-600">
                  {labels.homePage.section1.title}
                </h3>
                <div className="mt-4 text-gray-700">
                  <ul className="list-disc pl-5">
                    <li>{labels.homePage.section1.row1}</li>
                    <li>{labels.homePage.section1.row2} </li>
                    <li>{labels.homePage.section1.row3}</li>
                  </ul>
                </div>
              </motion.div>

              {/* Tax FAQs Section */}
              <motion.div
                className="bg-yellow-50 p-6 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h3 className="text-xl font-semibold text-blue-600">
                  {labels.homePage.section2.title}
                </h3>
                <div className="mt-4 text-gray-700">
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>{labels.homePage.section2.q}</strong>
                      {labels.homePage.section2.row1[0]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section2.a}</strong>{" "}
                      {labels.homePage.section2.row1[1]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section2.q}</strong>{" "}
                      {labels.homePage.section2.row2[0]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section2.a}</strong>{" "}
                      {labels.homePage.section2.row2[1]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section2.q}</strong>{" "}
                      {labels.homePage.section2.row3[0]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section2.a}</strong>{" "}
                      {labels.homePage.section2.row3[1]}
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Tax-related Information Section */}
              <motion.div
                className="bg-green-50 p-6 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105"
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h3 className="text-xl font-semibold text-blue-600">
                  {labels.homePage.section3.title}
                </h3>
                <div className="mt-4 text-gray-700">
                  <p className="text-red-500 font-semibold text-lg animate-pulse">
                    {labels.homePage.section3.subtitle}
                  </p>
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>{labels.homePage.section3.row1Title}</strong>
                      <ul className="pl-5">
                        <li>{labels.homePage.section3.row1line1}</li>
                        <li>{labels.homePage.section3.row1line2}</li>
                        <li>{labels.homePage.section3.row1line3}</li>
                        <li>{labels.homePage.section3.row1line4}</li>
                        <li>{labels.homePage.section3.row1line5}</li>
                        <li>{labels.homePage.section3.row1line6}</li>
                        <li>{labels.homePage.section3.row1line7}</li>
                      </ul>
                    </li>
                    <li>
                      <strong>{labels.homePage.section3.row2[0]}</strong>
                      {labels.homePage.section3.row2[1]}
                    </li>{" "}
                    {/* Updated for senior citizens */}
                    <li>
                      <strong>{labels.homePage.section3.row3[0]}</strong>
                      {labels.homePage.section3.row3[1]}
                    </li>{" "}
                    {/* Updated for senior citizens */}
                    <li>
                      <strong>{labels.homePage.section3.row4[0]}</strong>{" "}
                      {labels.homePage.section3.row4[1]}
                    </li>{" "}
                    {/* Updated deduction limit */}
                  </ul>
                </div>
              </motion.div>

              {/* New Section - Tax Tips for the Current Year */}
              <motion.div
                className="bg-blue-50 p-6 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h3 className="text-xl font-semibold text-blue-600">
                  {labels.homePage.section4.title}
                </h3>
                <div className="mt-4 text-gray-700">
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>{labels.homePage.section4.row1[0]}</strong>{" "}
                      {labels.homePage.section4.row1[1]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section4.row2[0]}</strong>{" "}
                      {labels.homePage.section4.row2[1]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section4.row3[0]}</strong>{" "}
                      {labels.homePage.section4.row3[1]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section4.row4[0]}</strong>{" "}
                      {labels.homePage.section4.row4[1]}
                    </li>
                    <li>
                      <strong>{labels.homePage.section4.row5[0]}</strong>{" "}
                      {labels.homePage.section4.row5[1]}
                    </li>
                  </ul>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
