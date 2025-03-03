import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getIncomesByUserId,
  deleteIncome,
  updateIncome,
} from "../services/IncomeServiceApi";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import { getUserByEmail } from "../services/UserServiceApi";
import Cookies from "js-cookie";
import Sidebar from "../layouts/Sidebar";
import { getFillingStatus } from "../services/TaxFillingServiceApi";
import { calculateAndUpdateTaxLiability } from "../services/TaxCalculationServiceApi";
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import labels from "../config/labels";
import SliderAddIncome from "../components/SilderAddIncome";
import { motion } from "framer-motion";

const IncomeDetailsPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const email = Cookies.get(labels.incomeDetails.email);
  const [user, setUser] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxFillingStatus, setTaxFillingStatus] = useState("");
  const [editingIncome, setEditingIncome] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editIncomeType, setEditIncomeType] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentYear = new Date().getFullYear();
  const [amendment, setAmendment] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIncomeId, setDeleteIncomeId] = useState(null);
  const [deleteModalMessage, setDeleteModalMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false); // State to control slider visibility

  const [availableCategories, setAvailableCategories] = useState([
    labels.addincome.category.c1,
    labels.addincome.category.c2,
    labels.addincome.category.c3,
    labels.addincome.category.c4,
    labels.addincome.category.c5,
    labels.addincome.category.c6,
  ]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Filtered incomes based on selected year
  const filteredIncomes = incomes.filter((income) => {
    if (!selectedYear) return true;
    return new Date(income.incomeDate).getFullYear() === parseInt(selectedYear);
  });

  // Paginate the filtered incomes
  const displayedIncomes = filteredIncomes
    .filter((income) => amendment !== 1 || income.isAmended === 1)
    .filter((income) => {
      const searchLower = searchQuery.toLowerCase().trim();
      return (
        income.incomeSource.toLowerCase().includes(searchLower) ||
        income.amount.toString().includes(searchLower)
      );
    })
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserByEmail(email);
        setUser(userData);
      } catch (error) {
        setError(labels.incomeDetails.userFetchError);
      }
    };
    fetchUserData();
  }, [email]);

  useEffect(() => {
    const storedStatus = localStorage.getItem(labels.incomeDetails.amendment);
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, [user, amendment]);

  useEffect(() => {
    const fetchIncomes = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedIncomes = await getIncomesByUserId(
            user.userId,
            amendment
          );
          fetchedIncomes.sort(
            (a, b) => new Date(b.incomeDate) - new Date(a.incomeDate)
          );
          setIncomes(fetchedIncomes);
        } catch (error) {
          setError(labels.incomeDetails.noIncomesAvailable);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchIncomes();
  }, [user, amendment,isSidebarOpen]);

  useEffect(() => {
    const fetchTaxFillingStatus = async () => {
      if (user) {
        try {
          const status = await getFillingStatus(user.userId, currentYear);
          setTaxFillingStatus(status);
        } catch (error) {
          setError(error);
        }
      }
    };
    fetchTaxFillingStatus();
  }, [user, currentYear,isSidebarOpen]);
  
  const handleAddIncome = () => {
    setIsSliderOpen(true); 
  };

  const closeSlider = () => {
    setIsSliderOpen(false); 
  };

  const handleEditIncome = (income) => {
    if (new Date(income.incomeDate).getFullYear() === currentYear) {
      setEditingIncome(income);
      setEditedAmount(income.amount);
      setEditIncomeType(income.incomeSource);
    } else {
      toast.error(labels.incomeDetails.editRestrictedMessage, {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value > 0) {
      setEditedAmount(value); // Assuming you have a state hook for editedAmount
    } else {
      toast.error("Amount must be greater than 0",{
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleIncomeChange = (e) => {
    setEditIncomeType(e.target.value);
  }

  const handleCancelEdit = () => {
    setEditingIncome(null);
    setEditedAmount("");
    setEditIncomeType("");
  };

  const handleSaveEdit = async () => {
    if ((editedAmount && editedAmount !== editingIncome.amount) || (editIncomeType && editIncomeType !== editingIncome.incomeSource)) {
      const updatedIncome = { ...editingIncome, amount: editedAmount, incomeSource:editIncomeType  };
      try {
        await updateIncome(editingIncome.incomeId, updatedIncome);
        setIncomes((prevIncomes) =>
          prevIncomes.map((income) =>
            income.incomeId === editingIncome.incomeId
              ? { ...income, amount: editedAmount, incomeSource: editIncomeType }
              : income
          )
        );
        calculateAndUpdateTaxLiability(user.userId, currentYear);
        setEditingIncome(null);

        // Toast Success
        toast.success(labels.incomeDetails.updateSuccessMessage, {
          position: "top-right",
          duration: 3000,
        });
      } catch (error) {
        // Toast Error
        toast.error(labels.incomeDetails.updateErrorMessage, {
          duration: 3000,
          position: "top-right",
        });
      }
    }
  };

  const handleDeleteIncome = (incomeId, incomeDate) => {
    if (new Date(incomeDate).getFullYear() === currentYear) {
      setDeleteIncomeId(incomeId);
      setDeleteModalMessage(labels.incomeDetails.deleteConfirmationTitle);
      setIsDeleteModalOpen(true);
    } else {
      toast.error(labels.incomeDetails.deleteRestrictedMessage, {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col relative w-full min-h-screen pt-16 bg-gray-100">
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
                >
                  {/* <FaMoneyBill className="inline-block -mt-2 mr-2 text-blue-500" /> */}
                  {labels.incomeDetails.pageTitle}
                </motion.h1>
              </div>

              <div className="flex flex-row items-center justify-between mb-6">
                <motion.div className="flex flex-row"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <input
                    type="text"
                    placeholder={labels.incomeDetails.searchPlaceholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="mx-2 p-2 border rounded-md"
                  >
                    <option value="">
                      {labels.incomeDetails.allYearsOption}
                    </option>
                    {Array.from(
                      new Set(
                        incomes.map((income) =>
                          new Date(income.incomeDate).getFullYear()
                        )
                      )
                    )
                      .sort((a, b) => b - a)
                      .map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                </motion.div>

                {/* Add income button */}
                <motion.button
                  onClick={handleAddIncome}
                  className={`py-2 px-4 flex rounded-lg text-white shadow-md transition-all ${
                    taxFillingStatus === "Filled" && amendment === 0
                      ? "bg-gray-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={taxFillingStatus === "Filled" && amendment === 0}
                  initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                >
                  <FaPlus className="mt-1 mr-2" />
                  {labels.incomeDetails.addIncomeButton}
                </motion.button>
              </div>

              {/* Table for incomes */}
              <div>
                <div className="rounded-lg overflow-hidden">
                  <motion.table className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4 table-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  >
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-4 py-2">
                          {labels.incomeDetails.incomeSource}
                        </th>
                        <th className="border px-4 py-2">
                          {labels.incomeDetails.amount} (₹)
                        </th>
                        <th className="border px-4 py-2">
                          {labels.incomeDetails.date}
                        </th>
                        <th className="border px-4 py-2">
                          {labels.incomeDetails.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedIncomes
                        .filter(
                          (income) => amendment !== 1 || income.isAmended === 1
                        ) // Add the filter here
                        .map((income,index) => (
                          <motion.tr
                            key={income.incomeId}
                            className={
                              taxFillingStatus ===
                              labels.incomeDetails.filingStatus
                                ? "bg-gray-100 text-black-500"
                                : ""
                            }
                            initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index*0.1 }}
                          >
                            <td className="border px-4 py-2">
                              {editingIncome &&
                              editingIncome.incomeId === income.incomeId ? (
                                <select
                                  name="category"
                                  value={editIncomeType}
                                  onChange={handleIncomeChange}
                                  className="p-2 border rounded-md w-full"
                                >
                                  <option value="">
                                    {labels.addincome.heading.select}
                                  </option>
                                  {availableCategories.map((category) => (
                                    <option
                                      key={category.name}
                                      value={category.name}
                                    >
                                      {category.icon} {category.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                income.incomeSource
                              )}
                            </td>

                            <td className="border px-4 py-2">
                              {editingIncome &&
                              editingIncome.incomeId === income.incomeId ? (
                                <input
                                  type="number"
                                  value={editedAmount}
                                  onChange={handleAmountChange}
                                  className="p-2 border rounded-md"
                                  min="1"
                                />
                              ) : (
                                income.amount
                              )}
                            </td>
                            <td className="border px-4 py-2">
                              {income.incomeDate}
                            </td>

                            <td className="border px-4 py-2 text-center">
                              {taxFillingStatus !==
                                labels.incomeDetails.filledStatus ||
                              amendment === 1 ? (
                                <>
                                  {new Date(income.incomeDate).getFullYear() ===
                                  currentYear ? (
                                    <>
                                      {editingIncome &&
                                      editingIncome.incomeId ===
                                        income.incomeId ? (
                                        <>
                                          <button
                                            onClick={handleSaveEdit}
                                            className="bg-green-500 text-white p-2 rounded-md mr-2"
                                          >
                                            <FaCheck />
                                          </button>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="bg-gray-500 text-white p-2 rounded-md"
                                          >
                                            <FaTimes />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() =>
                                              handleEditIncome(income)
                                            }
                                            className="bg-yellow-500 text-white p-2 rounded-md mr-2"
                                          >
                                            <FaEdit />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteIncome(
                                                income.incomeId,
                                                income.incomeDate
                                              )
                                            }
                                            className="bg-red-500 text-white p-2 rounded-md"
                                          >
                                            <FaTrash />
                                          </button>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">
                                      labels.incomeDetails.restrictedAction
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {new Date(income.incomeDate).getFullYear() ===
                                    currentYear && (
                                    <>
                                      <button className="bg-gray-500 text-white p-2 rounded-md mr-2">
                                        <FaEdit />
                                      </button>
                                      <button className="bg-gray-500 text-white p-2 rounded-md">
                                        <FaTrash />
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </motion.table>
                </div>
              </div>

              {/* Page info and Pagination */}
              {Math.ceil(filteredIncomes.length / itemsPerPage) > 1 && (
                <motion.div className="mt-4 flex justify-center items-center space-x-4"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    disabled={currentPage === 0}
                  >
                    {labels.incomeDetails.previousPage}
                  </button>

                  <span className="text-lg text-gray-700">
                    {labels.incomeDetails.page} {currentPage + 1} of{" "}
                    {Math.ceil(filteredIncomes.length / itemsPerPage)}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(
                          Math.ceil(filteredIncomes.length / itemsPerPage) - 1,
                          currentPage + 1
                        )
                      )
                    }
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    disabled={
                      currentPage ===
                      Math.ceil(filteredIncomes.length / itemsPerPage) - 1
                    }
                  >
                    {labels.incomeDetails.nextPage}
                  </button>
                </motion.div>
              )}
            </main>
          </div>
        </div>

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">
                {labels.incomeDetails.confirmTitle}
              </h2>
              <p>{deleteModalMessage}</p>
              <motion.div className="flex justify-end space-x-4 mt-4"
               initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded-md"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  {labels.incomeDetails.no}
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={async () => {
                    try {
                      await deleteIncome(deleteIncomeId);
                      setIncomes((prevIncomes) =>
                        prevIncomes.filter(
                          (income) => income.incomeId !== deleteIncomeId
                        )
                      );

                      // Toast Success for delete
                      toast.success(
                        "Income Deleted! The income entry has been deleted.",
                        {
                          duration: 3000,
                          position: "top-right",
                        }
                      );
                    } catch (error) {
                      // Toast Error for delete
                      toast.error(
                        "Failed to delete income. Please try again.",
                        {
                          position: "top-right",
                          duration: 3000,
                        }
                      );
                    }

                    // Close the modal after deletion
                    setIsDeleteModalOpen(false);
                  }}
                >
                  {labels.incomeDetails.yes}
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Add the Slider Component Here */}
        {isSliderOpen && <SliderAddIncome closeSlider={closeSlider} />}

        <Footer />
      </div>
    </>
  );
};

export default IncomeDetailsPage;
