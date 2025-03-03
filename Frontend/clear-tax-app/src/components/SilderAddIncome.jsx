import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  addMultipleIncomes,
  getIncomesByUserId,
} from "../services/IncomeServiceApi";
import Cookies from "js-cookie";
import { getUserByEmail } from "../services/UserServiceApi";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { MdDeleteForever } from "react-icons/md";
import labels from "../config/labels";
import ConfirmationModal from "../components/ConfirmationModal";

const SliderAddIncome = ({ closeSlider }) => {
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
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    setFormattedDate(formatDate(new Date()));
  }, []);

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
    if (value > 0) {
      const newIncomeForm = [...incomeForm];
      newIncomeForm[index][name] = value;
      setIncomeForm(newIncomeForm);
    } else {
      toast.error("Amount must be greater than 0",{
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleIncomeChangeSelect = (e,index)=>{
    const { name, value } = e.target;
    if (value) {
      const newIncomeForm = [...incomeForm];
      newIncomeForm[index][name] = value;
      setIncomeForm(newIncomeForm);
    }else{
      toast.error("Select Source",{
        duration: 3000,
        position: "top-right",
      });
    }
  }

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
    }
  };

  const handleRemoveIncome = (index) => {
    const newIncomeForm = incomeForm.filter((_, i) => i !== index);
    setIncomeForm(newIncomeForm);
  };

  const handleSaveIncome = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    if (incomeForm.every((income) => !income.amount || !income.category)) {
      toast.error(labels.addincome.toast.adderror, {
        position: "top-right",
      });
      return;
    }

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
        window.location.reload();
        closeSlider();
      } else {
        toast.error(labels.addincome.toast.failError, {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(labels.addincome.toast.tryAgain, { position: "top-right" });
    }
  };

  const validateForm = () => {
    let isValid = true;
    let formErrors = [];

    incomeForm.forEach((income) => {
      if (
        !income.amount ||
        isNaN(income.amount) ||
        Number(income.amount) <= 0 ||
        !income.category ||
        !income.incomeDate
      ) {
        isValid = false;
        formErrors.push(labels.addincome.validation.validIncome);
      }
    });

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
        className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-40 backdrop-blur-sm"
      >
        <div className="fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl rounded-l-3xl p-8 flex flex-col overflow-y-auto z-40 animate-slideInRight">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {labels.addincome.heading.title}
            </h1>
            <button
              onClick={handleCancelSlider}
              className="text-gray-600 hover:text-gray-800 transition-all duration-300 transform hover:scale-110"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Date */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm">{formattedDate}</p>
          </div>

          {/* Income Form */}
          <div className="mb-6 flex-grow">
            <div className="flex flex-row gap-80 mb-2 ml-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {labels.addincome.heading.source}
              </label>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {labels.addincome.heading.amount}
              </label>
            </div>
            {incomeForm.map((income, index) => (
              <div key={index} className="flex items-center mb-5 space-x-6">
                {/* Category Select */}
                <div className="w-full sm:w-2/3">
                  <select
                    name="category"
                    value={income.category}
                    onChange={(e) => handleIncomeChangeSelect(e, index)}
                    className="p-4 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
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
                <div className="w-full sm:w-1/3">
                  <input
                    type="number"
                    name="amount"
                    value={income.amount}
                    onChange={(e) => handleIncomeChange(e, index)}
                    className="p-4 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                    min="1"
                  />
                </div>

                {/* Add/Remove Buttons */}
                <div className="w-12 flex flex-row items-center justify-center space-x-4">
                  {index === incomeForm.length - 1 && (
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-700 transform hover:scale-110 transition-all duration-200"
                      onClick={handleAddIncome}
                    >
                      <FaPlus size={24} />
                    </button>
                  )}
                  {incomeForm.length > 1 && (
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700 transform hover:scale-110 transition-all duration-200"
                      onClick={() => handleRemoveIncome(index)}
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
              {labels.addincome.heading.cancel}
            </button>
            <button
              className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={handleSaveIncome}
            >
              {labels.addincome.heading.save}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SliderAddIncome;
