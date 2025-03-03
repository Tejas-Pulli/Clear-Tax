import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  addMultipleDeductions,
  getDeductionsByUserId,
} from "../services/DeductionServiceApi";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast"; // Import react-hot-toast
import { MdDeleteForever } from "react-icons/md";
import labels from "../config/labels";
import ConfirmationModal from "../components/ConfirmationModal"; // Assuming you have a custom modal

const SliderAddDeduction = ({ closeSlider }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const email = Cookies.get(labels.adddeduction.email);
  const [user, setUser] = useState(null);
  const [amendment, setAmendment] = useState(0);
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
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formattedDate, setFormattedDate] = useState(""); // Add formatted date state

  // Track if form changes
  useEffect(() => {
    const formChanged = deductionForm.some(
      (deduction) =>
        deduction.category ||
        deduction.amount ||
        deduction.deductionDate !== new Date().toISOString().slice(0, 10)
    );
    setHasChanges(formChanged);
  }, [deductionForm]);

  useEffect(() => {
    const storedStatus = localStorage.getItem(labels.adddeduction.amendment);
    if (storedStatus) {
      setAmendment(parseInt(storedStatus));
    }
  }, []);

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

  // Format the current date
  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Set formatted date on load
  useEffect(() => {
    setFormattedDate(formatDate(new Date()));
  }, []);

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

  const handleDeductionChange = (e, index) => {
    const { name, value } = e.target;
    if (value > 0) {
      const newDeductionForm = [...deductionForm];
      newDeductionForm[index][name] = value;
      setDeductionForm(newDeductionForm);
    } else {
      toast.error("Amount must be greater than 0",{
        duration: 3000,
        position: "top-right",
      });
    }

  };

  const handleDeductionChangeSelect = (e,index)=>{
    const { name, value } = e.target;
    if (value) {
      const newIncomeForm = [...deductionForm];
      newIncomeForm[index][name] = value;
      setDeductionForm(newIncomeForm);
    }else{
      toast.error("Select Source",{
        duration: 3000,
        position: "top-right",
      });
    }
  }

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
      //   toast.error(labels.adddeduction.toast.adderror, { position: "top-right" });
    }
  };

  const handleRemoveDeduction = (index) => {
    const newDeductionForm = deductionForm.filter((_, i) => i !== index);
    setDeductionForm(newDeductionForm);
  };

  const handleSaveDeduction = async () => {
    // First, validate form
    const isValid = validateForm();
    if (!isValid) {
      return; // Don't continue if validation fails
    }

    // If no data entries
    if (
      deductionForm.every(
        (deduction) => !deduction.amount || !deduction.category
      )
    ) {
      toast.error(labels.adddeduction.toast.adderror, {
        position: "top-right",
      });
      return;
    }

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
        window.location.reload();
        closeSlider();
      } else {
        toast.error(labels.adddeduction.toast.failError, {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(labels.adddeduction.toast.tryAgain, {
        position: "top-right",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    let formErrors = [];

    deductionForm.forEach((deduction, index) => {
      if (
        !deduction.amount ||
        isNaN(deduction.amount) ||
        Number(deduction.amount) <= 0 ||
        !deduction.category ||
        !deduction.deductionDate
      ) {
        isValid = false;
        formErrors.push(labels.adddeduction.validation.validDeduction);
      }
    });

    // Show a single toast if there are errors
    if (!isValid && formErrors.length > 0) {
      toast.error(formErrors.join(" | "), { position: "top-right" });
    }

    return isValid;
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === "sliderBackdrop" && hasChanges) {
      setShowConfirmationModal(true);
    } else if (e.target.id === "sliderBackdrop" && !hasChanges) {
      closeSlider();
    }
  };

  const handleCancelSlider = () => {
    if (hasChanges) {
      setShowConfirmationModal(true);
    } else {
      closeSlider();
    }
  };

  const handleConfirmationClose = (confirmed) => {
    if (confirmed) {
      closeSlider();
    }
    setShowConfirmationModal(false);
  };

  return (
    <>
      {showConfirmationModal && (
        <ConfirmationModal
          message={labels.addincome.confirmationMessage}
          subMessage={labels.addincome.confirmationSubMessage}
          onConfirm={() => handleConfirmationClose(true)}
          onCancel={() => handleConfirmationClose(false)}
        />
      )}

      <div
        id="sliderBackdrop"
        onClick={handleOutsideClick}
        className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-all duration-500 ease-in-out"
      >
        {/* Slider */}
        <div className="fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl rounded-l-3xl p-8 flex flex-col overflow-y-auto z-40 animate-slideInRight animate-slideOutRight">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {labels.adddeduction.heading.title}
            </h1>
            <button
              onClick={handleCancelSlider}
              className="text-gray-600 hover:text-gray-800 transform hover:scale-110 transition-all duration-300"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Display formatted date */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm">{formattedDate}</p>
          </div>

          {/* Deduction Form */}
          <div className="mb-6 flex-grow">
            <div className="flex flex-row gap-80 mb-2 ml-2">
              <label className="block text-sm font-semibold text-gray-700">
                {labels.adddeduction.heading.type}
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                {labels.adddeduction.heading.amount}
              </label>
            </div>
            {deductionForm.map((deduction, index) => (
              <div key={index} className="flex items-center mb-5 space-x-6">
                {/* Category Select */}
                <div className="w-full sm:w-2/3">
                  <select
                    name="category"
                    value={deduction.category}
                    onChange={(e) => handleDeductionChangeSelect(e, index)}
                    className="p-4 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                  >
                    <option value="">
                      {labels.adddeduction.heading.select}
                    </option>
                    {availableCategories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div className="w-full sm:w-1/3">
                  <input
                    type="number"
                    name="amount"
                    value={deduction.amount}
                    onChange={(e) => handleDeductionChange(e, index)}
                    className="p-4 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                    min="1"
                  />
                </div>

                {/* Add/Remove Buttons */}
                <div className="w-12 flex flex-row items-center justify-center space-x-4">
                  {index === deductionForm.length - 1 && (
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-700 transform hover:scale-110 transition-all duration-200"
                      onClick={handleAddDeduction}
                    >
                      <FaPlus  size={24} />
                    </button>
                  )}
                  {deductionForm.length > 1 && (
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700 transform hover:scale-110 transition-all duration-200"
                      onClick={() => handleRemoveDeduction(index)}
                    >
                      <FaTrash size={24} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-6 mt-auto">
            <button
              className="px-8 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-all duration-200 shadow-sm"
              onClick={handleCancelSlider}
            >
              {labels.adddeduction.heading.cancel}
            </button>
            <button
              className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={handleSaveDeduction}
            >
              {labels.adddeduction.heading.save}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SliderAddDeduction;
