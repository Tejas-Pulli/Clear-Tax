import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getDeductionsByUserId,
  deleteDeduction,
  updateDeduction,
} from "../services/DeductionServiceApi";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import { getUserByEmail } from "../services/UserServiceApi";
import Cookies from "js-cookie";
import Sidebar from "../layouts/Sidebar";
import { getFillingStatus } from "../services/TaxFillingServiceApi";
import { calculateAndUpdateTaxLiability } from "../services/TaxCalculationServiceApi";
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import "react-confirm-alert/src/react-confirm-alert.css";
import labels from "../config/labels";
import SliderAddDeduction from "../components/SliderAddDeduction";
import { motion } from "framer-motion";

const DeductionDetailsPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [user, setUser] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxFillingStatus, setTaxFillingStatus] = useState("");
  const [editingDeduction, setEditingDeduction] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editDeduction, setEditDeduction] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentYear = new Date().getFullYear();
  const [amendment, setAmendment] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteDeductionId, setDeleteDeductionId] = useState(null);
  const [deleteModalMessage, setDeleteModalMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([
    labels.adddeduction.category.c1,
    labels.adddeduction.category.c2,
    labels.adddeduction.category.c3,
    labels.adddeduction.category.c4,
    labels.adddeduction.category.c5,
    labels.adddeduction.category.c6,
   ]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Filtered deductions based on selected year
  const filteredDeductions = deductions.filter((deduction) => {
    if (!selectedYear) return true;
    return (
      new Date(deduction.deductionDate).getFullYear() === parseInt(selectedYear)
    );
  });

  const displayedDeductions = filteredDeductions
    .filter((deduction) => amendment !== 1 || deduction.isAmended === 1)
    .filter((deduction) => {
      const searchLower = searchQuery.toLowerCase().trim();
      return (
        deduction.deductionType.toLowerCase().includes(searchLower) ||
        deduction.amount.toString().includes(searchLower)
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
        setError("Error fetching user data. Please try again later.");
      }
    };
    fetchUserData();
  }, [email]);

  useEffect(() => {
    const storedStatus = localStorage.getItem("amendment");
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, [user, amendment]);

  useEffect(() => {
    const fetchDeductions = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedDeductions = await getDeductionsByUserId(
            user.userId,
            amendment
          );
          fetchedDeductions.sort(
            (a, b) => new Date(b.deductionDate) - new Date(a.deductionDate)
          );
          setDeductions(fetchedDeductions);
        } catch (error) {
          setError("No Deductions are Available...!");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchDeductions();
  }, [user, amendment]);

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
  }, [user, currentYear]);

  const handleAddDeduction = () => {
    setIsSliderOpen(true);
  };

  const closeSlider = () => {
    setIsSliderOpen(false);
  };


  const handleEditDeduction = (deduction) => {
    if (new Date(deduction.deductionDate).getFullYear() === currentYear) {
      setEditingDeduction(deduction);
      setEditedAmount(deduction.amount);
      setEditDeduction(deduction.deductionType);
    } else {
      toast.error("You can only edit deductions from the current year.", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value > 0) {
      setEditedAmount(value);
    } else {
      toast.error("Amount must be greater than 0",{
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleDeductionChnage = (e) => {
    setEditDeduction(e.target.value);
  };

  const handleCancelEdit = () => {
    setEditingDeduction(null);
    setEditedAmount("");
    setEditDeduction("");
  };

  const handleSaveEdit = async () => {
    if ((editedAmount && editedAmount !== editingDeduction.amount) || (editDeduction && editDeduction !== editingDeduction.deductionType)) {
      const updatedDeduction = { ...editingDeduction, amount: editedAmount, deductionType: editDeduction };
      try {
        await updateDeduction(editingDeduction.deductionId, updatedDeduction);
        setDeductions((prevDeductions) =>
          prevDeductions.map((deduction) =>
            deduction.deductionId === editingDeduction.deductionId
              ? { ...deduction, amount: editedAmount, deductionType:  editDeduction}
              : deduction
          )
        );
        calculateAndUpdateTaxLiability(user.userId, currentYear);
        setEditingDeduction(null);
        toast.success("Deduction details have been successfully updated.", {
          position: "top-right",
          duration: 3000,
        });
      } catch (error) {
        toast.error("Failed to save changes. Please try again.", {
          duration: 3000,
          position: "top-right",
        });
      }
    }
  };

  const handleDeleteDeduction = async (deductionId, deductionDate) => {
    if (new Date(deductionDate).getFullYear() === currentYear) {
      setDeleteDeductionId(deductionId);
      setDeleteModalMessage("Are you sure? This action cannot be undone!");
      setIsDeleteModalOpen(true);
    } else {
      toast.error("You can only delete deduction from the current year.", {
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
              <div className="flex flex-col lg:flex-row lg:justify-between items-center mb-6">
                <motion.h1 className="text-3xl font-bold text-gray-800"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  {/* <FaMoneyBillWaveAlt className="inline-block -mt-2 mr-2 text-blue-500" /> */}
                  Deduction Details
                </motion.h1>
              </div>

              <div className="flex flex-row items-center justify-between mb-6">
                {/* <div>
                  <label htmlFor="year" className="text-lg font-medium mr-4">
                    <FaFilter className="inline-block mr-2" />
                    Filter by Year:
                  </label> */}

                <motion.div className="flex flex-row"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <input
                    type="text"
                    placeholder="Search Deduction Type..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="p-2 border rounded-md mx-2"
                  >
                    <option value="">All Years</option>
                    {Array.from(
                      new Set(
                        deductions.map((deduction) =>
                          new Date(deduction.deductionDate).getFullYear()
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
                <motion.button
                  onClick={handleAddDeduction}
                  className={`flex items-center text-white px-4 py-2 rounded-lg shadow-md transition-all ${
                    taxFillingStatus === "Filled" && amendment === 0
                      ? "bg-gray-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={taxFillingStatus === "Filled" && amendment === 0}
                  initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                >
                  <FaPlus className="mr-2" />
                  Add
                </motion.button>
              </div>

              {/* Deduction Table */}
              <div>
                <div className="rounded-lg overflow-hidden">
                  <motion.table className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4 table-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  >
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border px-4 py-2">Deduction Type</th>
                        <th className="border px-4 py-2">Amount (₹)</th>
                        <th className="border px-4 py-2">Date</th>
                        <th className="border px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedDeductions
                        .filter(
                          (deduction) =>
                            amendment !== 1 || deduction.isAmended === 1
                        ) // Filtering for amendments
                        .map((deduction,index) => (
                          <motion.tr
                            key={deduction.deductionId}
                            className={
                              taxFillingStatus === "Filled"
                                ? "bg-gray-100 text-black-500"
                                : ""
                            }
                            initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index*0.1 }}
                          >
                            {/* <td className="border px-4 py-2">{deduction.deductionType}</td> */}
                            <td className="border px-4 py-2">
                              {editingDeduction &&
                              editingDeduction.deductionId ===
                                deduction.deductionId ? (
                                <select
                                  name="category"
                                  value={editDeduction}
                                  onChange={handleDeductionChnage}
                                  className="p-2 border rounded-md w-full"
                                >
                                  <option value="">
                                    {labels.adddeduction.heading.select}
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
                                deduction.deductionType
                              )}
                            </td>
                            <td className="border px-4 py-2">
                              {editingDeduction &&
                              editingDeduction.deductionId ===
                                deduction.deductionId ? (
                                <input
                                  type="number"
                                  value={editedAmount}
                                  onChange={handleAmountChange}
                                  className="p-2 border rounded-md"
                                  min="1"
                                />
                              ) : (
                                deduction.amount
                              )}
                            </td>
                            <td className="border px-4 py-2">
                              {deduction.deductionDate}
                            </td>

                            <td className="border px-4 py-2 text-center">
                              {taxFillingStatus !== "Filled" ||
                              amendment === 1 ? (
                                <>
                                  {new Date(
                                    deduction.deductionDate
                                  ).getFullYear() === currentYear ? (
                                    <>
                                      {editingDeduction &&
                                      editingDeduction.deductionId ===
                                        deduction.deductionId ? (
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
                                              handleEditDeduction(deduction)
                                            }
                                            className="bg-yellow-500 text-white p-2 rounded-md mr-2"
                                          >
                                            <FaEdit />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteDeduction(
                                                deduction.deductionId,
                                                deduction.deductionDate
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
                                      Restricted
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {new Date(
                                    deduction.deductionDate
                                  ).getFullYear() === currentYear && (
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

              {/* Pagination */}
              {Math.ceil(filteredDeductions.length / itemsPerPage) > 1 && (
                <motion.div className="mt-4 flex justify-center items-center space-x-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    className={`px-4 py-2 bg-gray-200 rounded-md ${
                      currentPage === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 cursor-pointer"
                    }`}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>

                  <span className="text-lg text-gray-700">
                    Page {currentPage + 1} of{" "}
                    {Math.ceil(filteredDeductions.length / itemsPerPage)}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(
                          Math.ceil(filteredDeductions.length / itemsPerPage) -
                            1,
                          currentPage + 1
                        )
                      )
                    }
                    className={`px-4 py-2 bg-gray-200 rounded-md ${
                      currentPage ===
                      Math.ceil(filteredDeductions.length / itemsPerPage) - 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 cursor-pointer"
                    }`}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredDeductions.length / itemsPerPage) - 1
                    }
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </main>
          </div>
        </div>

        {/* Confirmation Modal  */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Are You Sure ?</h2>
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
                  No
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={async () => {
                    try {
                      await deleteDeduction(deleteDeductionId); // Your delete logic here
                      setDeductions((prevDeductions) =>
                        prevDeductions.filter(
                          (deduction) =>
                            deduction.deductionId !== deleteDeductionId
                        )
                      );

                      // Toast Success for delete
                      toast.success(
                        "Deduction Deleted! The income entry has been deleted.",
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
                  Yes
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Add the Slider Component Here */}
        {isSliderOpen && <SliderAddDeduction closeSlider={closeSlider} />}

        <Footer />
      </div>
    </>
  );
};

export default DeductionDetailsPage;
