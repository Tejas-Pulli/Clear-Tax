import Cookies from "js-cookie";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaBackward, FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import {
  addMultipleDeductions,
  getDeductionsByUserId,
} from "../services/DeductionServiceApi.jsx";
import { getUserByEmail } from "../services/UserServiceApi";
import labels from "../config/labels.jsx";

const AddDeductionPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const email = Cookies.get(labels.adddeduction.email);
  const [amendment, setAmendment] = useState(0);
  const [user, setUser] = useState(null);
  const [deductionForm, setDeductionForm] = useState([
    {
      category: "",
      amount: "",
      deductionDate: new Date().toISOString().slice(0, 10),
    },
  ]);
  const [availableCategories, setAvailableCategories] = useState([
   labels.adddeduction.category.c1,
   labels.adddeduction.category.c2,
   labels.adddeduction.category.c3,
   labels.adddeduction.category.c4,
   labels.adddeduction.category.c5,
   labels.adddeduction.category.c6,
  ]);
  const [errors, setErrors] = useState({});
  const [deductions, setDeductions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [isSaveAction, setIsSaveAction] = useState(false);

  // Track if form changes
  useEffect(() => {
    // Function to compare initial state to current state
    const formChanged = deductionForm.some(
      (deduction) =>
        deduction.category ||
        deduction.amount ||
        deduction.deductionDate !== new Date().toISOString().slice(0, 10)
    );
    setHasChanges(formChanged);
  }, [deductionForm]);

  // Browser tab navigation confirmation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasChanges) {
        const message =labels.adddeduction.modal.title;
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    const storedStatus = localStorage.getItem(labels.adddeduction.amendment);
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, []);

  // Custom confirmation for React Router back button
  const handleBackButton = () => {
    if (hasChanges) {
      setConfirmAction(() => () => navigate(-1));
      setIsConfirmModalOpen(true);
      setConfirmModalMessage(
        labels.adddeduction.modal.title,
      );
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

  // Fetch existing deductions
  useEffect(() => {
    const fetchDeductions = async () => {
      if (user) {
        try {
          const fetchedDeductions = await getDeductionsByUserId(
            user.userId,
            amendment
          );
          setDeductions(fetchedDeductions);
        } catch (error) {
          setErrors(error);
        }
      }
    };
    fetchDeductions();
  }, [user, amendment]);

  const handleDeductionChnage = (e, index) => {
    const { name, value } = e.target;
    const newdeductionForm = [...deductionForm];
    newdeductionForm[index][name] = value;
    setDeductionForm(newdeductionForm);
  };

  const handleAddDeduction = () => {
    if (validateForm()) {
      setDeductionForm([
        ...deductionForm,
        {
          category: "",
          amount: "",
          deductionDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    } else {
      toast.error(labels.adddeduction.toast.adderror, { position: "top-right" });
    }
  };

  const handleRemoveDeduction = (index) => {
    const newdeductionForm = deductionForm.filter((_, i) => i !== index);
    setDeductionForm(newdeductionForm);
  };

  const handleSaveDeduction = async () => {
    const formattedData = deductionForm.map((deduction) => ({
      userId: user.userId,
      deductionType: deduction.category,
      amount: deduction.amount,
      deductionDate: deduction.deductionDate,
      isAmended: amendment,
    }));

    try {
      const response = await addMultipleDeductions(formattedData);
      if (response) {
        toast.success(labels.adddeduction.toast.success, {
          position: "top-right",
        });
        navigate("/trackExpenses");
      } else {
        toast.error(labels.adddeduction.toast.failError, {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(
        labels.adddeduction.toast.tryAgain,
        { position: "top-right" }
      );
    }
  };

  const validateForm = () => {
    let isValid = true;
    let formErrors = {};

    deductionForm.forEach((deduction, index) => {
      if (
        !deduction.amount ||
        isNaN(deduction.amount) ||
        Number(deduction.amount) <= 0
      ) {
        isValid = false;
        formErrors[index] = labels.adddeduction.validation.validAmount;
      }
      if (!deduction.deductionDate) {
        isValid = false;
        formErrors[index] = labels.adddeduction.validation.validDeduction;
      } else {
        const currentDate = new Date();
        const deductionDate = new Date(deduction.deductionDate);
        if (deductionDate > currentDate) {
          isValid = false;
          formErrors[index] = labels.adddeduction.validation.validDate;
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

    deductionForm.forEach((deduction, index) => {
      if (!deduction.category) {
        isFormEmpty = true;
        formErrors[index] = formErrors[index] || {};
        formErrors[index].category = labels.adddeduction.validation.validCategory;
      }
      if (
        !deduction.amount ||
        isNaN(deduction.amount) ||
        Number(deduction.amount) <= 0
      ) {
        isFormEmpty = true;
        formErrors[index] = formErrors[index] || {};
        formErrors[index].amount = labels.adddeduction.validation.positiveAmount;
      }
      if (!deduction.deductionDate) {
        isFormEmpty = true;
        formErrors[index] = formErrors[index] || {};
        formErrors[index].deductionDate = labels.adddeduction.validation.requiredDate;
      }
    });

    // If any field is empty, show alert and prevent submission
    if (isFormEmpty) {
      let errorMessages = [];
      Object.values(formErrors).forEach((error) => {
        if (error.category) errorMessages.push(error.category);
        if (error.amount) errorMessages.push(error.amount);
        if (error.deductionDate) errorMessages.push(error.deductionDate);
      });

      toast.error(
        errorMessages.join(" ") || labels.adddeduction.validation.requiredField,
        { position: "top-right" }
      );

      return;
    }

    // Ensure at least one income source is filled
    if (deductionForm.length === 0) {
      toast.error(
        labels.adddeduction.validation.oneEntry,
        {
          position: "top-right",
        }
      );
      return;
    }

    // Validate that all income dates are in the same year
    const deductionYears = deductionForm.map((deduction) =>
      new Date(deduction.deductionDate).getFullYear()
    );
    const uniquedeductionYears = new Set(deductionYears);

    if (uniquedeductionYears.size > 1) {
      toast.error(labels.adddeduction.validation.sameYear, {
        position: "top-right",
      });
      return;
    }

    // Validate form inputs before submission
    if (validateForm()) {
      handleSaveDeduction();
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
                {labels.adddeduction.heading.title}
                </h1>
              </div>
              <button
                onClick={handleBackButton}
                className="text-gray-600 hover:text-gray-800 flex items-center mb-6"
              >
                <FaBackward className="mr-2" />
                {labels.adddeduction.heading.backButton}
              </button>

              <div className="mb-6 mx-10">
                {deductionForm.map((deduction, index) => (
                  <div
                    key={index}
                    className="flex items-center mb-4 space-x-4 w-2/3"
                  >
                    {/* Category Select */}
                    <div className="w-2/3">
                      <label className="block text-sm font-semibold mb-1">
                        {labels.adddeduction.heading.type}
                      </label>
                      <select
                        name="category"
                        value={deduction.category}
                        onChange={(e) => handleDeductionChnage(e, index)}
                        className="p-2 border rounded-md w-full"
                      >
                        <option value="">{labels.adddeduction.heading.select}</option>
                        {availableCategories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="1/3 flex">
                      {/* Amount Input */}
                      <div className="w-1/2">
                        <label className="block text-sm font-semibold mb-1">
                          {labels.adddeduction.heading.amount}
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={deduction.amount}
                          onChange={(e) => handleDeductionChnage(e, index)}
                          placeholder="Amount"
                          className="p-2 border rounded-md w-full"
                        />
                      </div>

                      {/* Date Input */}
                      <div className="w-1/2">
                        <label className="block text-sm font-semibold mb-1 mx-2">
                          {labels.adddeduction.heading.date}
                        </label>
                        <input
                          type="date"
                          name="deductionDate"
                          value={deduction.deductionDate}
                          onChange={(e) => handleDeductionChnage(e, index)}
                          className="p-2 border rounded-md w-full mx-2"
                          onClick={(e) => e.target.focus()} // This will focus the date input field when clicked
                          disabled // Disable the date field
                        />
                      </div>
                    </div>

                    {/* Add/Remove Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Add button visible only for the last entry */}
                      {index === deductionForm.length - 1 && (
                        <button
                          type="button"
                          className="text-green-500"
                          onClick={handleAddDeduction}
                        >
                          <FaPlus className="mt-4" />
                        </button>
                      )}

                      {/* Show the "cross" button only if there is more than one entry */}
                      {deductionForm.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => handleRemoveDeduction(index)}
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
                {labels.adddeduction.heading.save}
              </button>
            </main>
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {isSaveAction ? "Confirm Save" : "Are You Sure ?"}
            </h2>
            <p>{confirmModalMessage}</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                {labels.adddeduction.heading.no}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  confirmAction();
                }}
              >
                {labels.adddeduction.heading.yes}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default AddDeductionPage;
