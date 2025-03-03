import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  addMultipleIncomes,
  getIncomesByUserId,
} from "../services/IncomeServiceApi";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { FaBackward, FaPlus, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast"; // Import react-hot-toast
import { MdDeleteForever } from "react-icons/md";
import labels from "../config/labels";

const AddIncomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const email = Cookies.get(labels.addincome.email);
  const [user, setUser] = useState(null);
  const [amendment, setAmendment] = useState(0);
  const [incomeForm, setIncomeForm] = useState([
    {
      category: "",
      amount: "",
      incomeDate: new Date().toISOString().slice(0, 10),
    },
  ]);
  const [availableCategories, setAvailableCategories] = useState([
    labels.addincome.category.c1,
    labels.addincome.category.c2,
    labels.addincome.category.c3,
    labels.addincome.category.c4,
    labels.addincome.category.c5,
    labels.addincome.category.c6,
  ]);
  const [errors, setErrors] = useState({});
  const [incomes, setIncomes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [isSaveAction, setIsSaveAction] = useState(false);

  // Track if form changes
  useEffect(() => {
    const formChanged = incomeForm.some(
      (income) =>
        income.category ||
        income.amount ||
        income.incomeDate !== new Date().toISOString().slice(0, 10)
    );
    setHasChanges(formChanged);
  }, [incomeForm]);

  useEffect(() => {
    const storedStatus = localStorage.getItem(labels.addincome.amendment);
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, []);

  // Browser tab navigation confirmation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasChanges) {
        const message = labels.addincome.modal.title;
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  // Custom confirmation for React Router back button
  const handleBackButton = () => {
    if (hasChanges) {
      setConfirmAction(() => () => navigate(-1));
      setIsConfirmModalOpen(true);
      setConfirmModalMessage(labels.addincome.modal.title);
    } else {
      navigate(-1);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserByEmail(email);
        setUser(userData);
      } catch (error) {
        setErrors(error);
      }
    };
    fetchUserData();
  }, [email]);

  // Fetch existing incomes
  useEffect(() => {
    const fetchIncomes = async () => {
      if (user) {
        try {
          const fetchedIncomes = await getIncomesByUserId(
            user.userId,
            amendment
          );
          setIncomes(fetchedIncomes);
        } catch (error) {
          setErrors(error);
        }
      }
    };
    fetchIncomes();
  }, [user, amendment]);

  const handleIncomeChange = (e, index) => {
    const { name, value } = e.target;
    const newIncomeForm = [...incomeForm];
    newIncomeForm[index][name] = value;
    setIncomeForm(newIncomeForm);
  };

  const handleAddIncome = () => {
    if (validateForm()) {
      setIncomeForm([
        ...incomeForm,
        {
          category: "",
          amount: "",
          incomeDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    } else {
      toast.error(labels.addincome.toast.adderror, { position: "top-right" });
    }
  };

  const handleRemoveIncome = (index) => {
    const newIncomeForm = incomeForm.filter((_, i) => i !== index);
    setIncomeForm(newIncomeForm);
  };

  const handleSaveIncome = async () => {
    const formattedData = incomeForm.map((income) => ({
      userId: user.userId,
      incomeSource: income.category,
      amount: income.amount,
      incomeDate: income.incomeDate,
      isAmended: amendment,
    }));

    try {
      const response = await addMultipleIncomes(formattedData);
      if (response) {
        toast.success(labels.addincome.toast.success, {
          position: "top-right",
        });
        navigate("/incomeDetails");
      } else {
        toast.error(labels.addincome.toast.failError, {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(labels.addincome.toast.tryAgain,
        { position: "top-right" }
      );
    }
  };

  const validateForm = () => {
    let isValid = true;
    let formErrors = {};

    incomeForm.forEach((income, index) => {
      if (
        !income.amount ||
        isNaN(income.amount) ||
        Number(income.amount) <= 0
      ) {
        isValid = false;
        formErrors[index] = labels.addincome.validation.validAmount;
      }
      if (!income.incomeDate) {
        isValid = false;
        formErrors[index] = labels.addincome.validation.validIncome;
      } else {
        const currentDate = new Date();
        const incomeDate = new Date(income.incomeDate);
        if (incomeDate > currentDate) {
          isValid = false;
          formErrors[index] = labels.addincome.validation.validDate;
        }
      }
    });

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any income source is empty
    let isFormEmpty = false;
    let formErrors = {};

    incomeForm.forEach((income, index) => {
      if (!income.category) {
        isFormEmpty = true;
        formErrors[index] = formErrors[index] || {};
        formErrors[index].category = labels.addincome.validation.validCategory;
      }
      if (
        !income.amount ||
        isNaN(income.amount) ||
        Number(income.amount) <= 0
      ) {
        isFormEmpty = true;
        formErrors[index] = formErrors[index] || {};
        formErrors[index].amount =labels.addincome.validation.positiveAmount;
      }
      if (!income.incomeDate) {
        isFormEmpty = true;
        formErrors[index] = formErrors[index] || {};
        formErrors[index].incomeDate = labels.addincome.validation.requiredDate;
      }
    });

    // If any field is empty, show alert and prevent submission
    if (isFormEmpty) {
      let errorMessages = [];
      Object.values(formErrors).forEach((error) => {
        if (error.category) errorMessages.push(error.category);
        if (error.amount) errorMessages.push(error.amount);
        if (error.incomeDate) errorMessages.push(error.incomeDate);
      });

      toast.error(
        errorMessages.join(" ") || labels.addincome.validation.requiredField,
        { position: "top-right" }
      );
      return;
    }

    // Ensure at least one income source is filled
    if (incomeForm.length === 0) {
      toast.error(labels.addincome.validation.oneEntry, {
        position: "top-right",
      });
      return;
    }

    // Validate that all income dates are in the same year
    const incomeYears = incomeForm.map((income) =>
      new Date(income.incomeDate).getFullYear()
    );
    const uniqueIncomeYears = new Set(incomeYears);

    if (uniqueIncomeYears.size > 1) {
      toast.error(labels.addincome.validation.sameYear, {
        position: "top-right",
      });
      return;
    }

    // Validate form inputs before submission
    if (validateForm()) {
      handleSaveIncome();
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
              <div className="flex flex-col lg:flex-row lg: items-center mb-6">
                <h1 className="text-3xl font-bold  text-gray-800">
                  {labels.addincome.heading.title}
                </h1>
              </div>
              <button
                onClick={handleBackButton}
                className="text-gray-600 hover:text-gray-800 flex items-center mb-6"
              >
                <FaBackward className="mr-2" />
                {labels.addincome.heading.backButton}
              </button>

              <div className="mb-6 mx-10">
                {incomeForm.map((income, index) => (
                  <div
                    key={index}
                    className="flex items-center mb-4 space-x-4 w-2/3"
                  >
                    {/* Category Select */}
                    <div className="w-1/3">
                      <label className="block text-sm font-semibold mb-1">
                      {labels.addincome.heading.source}
                      </label>
                      <select
                        name="category"
                        value={income.category}
                        onChange={(e) => handleIncomeChange(e, index)}
                        className="p-2 border rounded-md w-full"
                      >
                        <option value="">{labels.addincome.heading.select}</option>
                        {availableCategories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount Input */}
                    <div className="w-1/3">
                      <label className="block text-sm font-semibold mb-1">
                      {labels.addincome.heading.amount}
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={income.amount}
                        onChange={(e) => handleIncomeChange(e, index)}
                        placeholder="Amount"
                        className="p-2 border rounded-md w-full"
                      />
                    </div>

                    {/* Date Input */}
                    <div className="w-1/3">
                      <label className="block text-sm font-semibold mb-1">
                      {labels.addincome.heading.date}
                      </label>
                      <input
                        type="date"
                        name="incomeDate"
                        value={income.incomeDate}
                        onChange={(e) => handleIncomeChange(e, index)}
                        className="p-2 border rounded-md w-full"
                        onClick={(e) => e.target.focus()} // This will focus the date input field when clicked
                        disabled // Disable the date field
                      />
                    </div>

                    {/* Add/Remove Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Add button visible only for the last entry */}
                      {index === incomeForm.length - 1 && (
                        <button
                          type="button"
                          className="text-green-500"
                          onClick={handleAddIncome}
                        >
                          <FaPlus className="mt-4" />
                        </button>
                      )}

                      {/* Show the "cross" button only if there is more than one entry */}
                      {incomeForm.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => handleRemoveIncome(index)}
                        >
                          <MdDeleteForever className="size-5 mt-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 mx-10"
                onClick={handleSubmit}
              >
               {labels.addincome.heading.save}
              </button>
            </main>
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {isSaveAction ? "Confirm Save" : "Are you Sure ?"}
            </h2>
            <p>{confirmModalMessage}</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                {labels.addincome.heading.no}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  confirmAction();
                }}
              >
                {labels.addincome.heading.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AddIncomePage;
