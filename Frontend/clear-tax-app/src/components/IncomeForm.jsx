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
import {
  FaBackward,
  FaPlus,
  FaTimes,
  FaCheck,
  FaTrashAlt,
} from "react-icons/fa";

const IncomeForm = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [user, setUser] = useState(null);
  const [incomeForm, setIncomeForm] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([
    { name: "Salary", description: "Income from your job", icon: "💼" },
    { name: "Business", description: "Income from your business", icon: "🏢" },
    {
      name: "Rental",
      description: "Income from rental properties",
      icon: "🏠",
    },
    {
      name: "Capital Gains",
      description: "Income from capital gains",
      icon: "📈",
    },
    { name: "Interest", description: "Income from investments", icon: "💰" },
    {
      name: "Other Incomes",
      description: "Other sources of income",
      icon: "📝",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [incomes, setIncomes] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null); // To track the expanded category
  const [savedCategories, setSavedCategories] = useState({}); // Track saved categories

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserByEmail(email);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [email]);

  // Fetch existing incomes
  useEffect(() => {
    const fetchIncomes = async () => {
      if (user) {
        try {
          const fetchedIncomes = await getIncomesByUserId(user.userId);
          setIncomes(fetchedIncomes);
        } catch (error) {
          console.error("Error fetching incomes:", error);
        }
      }
    };
    fetchIncomes();
  }, [user]);

  const handleIncomeChange = (e, category) => {
    const { name, value } = e.target;
    setIncomeForm((prev) =>
      prev.map((income) =>
        income.category === category ? { ...income, [name]: value } : income
      )
    );
  };

  const handleAddIncome = (category) => {
    setIncomeForm((prev) => [
      ...prev,
      {
        category,
        amount: "",
        incomeDate: "",
      },
    ]);
    setExpandedCategory(category); // Expand the form for the clicked category
  };

  const handleCancelIncome = (category) => {
    setIncomeForm((prev) =>
      prev.filter((income) => income.category !== category)
    );
    setExpandedCategory(null); // Collapse the form when canceling
  };

  const handleClearIncome = (category) => {
    setIncomeForm((prev) =>
      prev.filter((income) => income.category !== category)
    );
    setSavedCategories((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const handleSaveIncome = (category) => {
    const incomeData = incomeForm.find(
      (income) => income.category === category
    );

    if (incomeData?.amount && incomeData?.incomeDate) {
      // const incomeYear = new Date(incomeData.incomeDate).getFullYear();

      // Check if an entry with the same category and year already exists
      // const existingIncome = incomes.find(
      //   (income) =>
      //     income.incomeSource === category &&
      //     new Date(income.incomeDate).getFullYear() === incomeYear
      // );

      // if (existingIncome) {
        // Show an error message if income already exists for the selected year
        // alert(`Income entry for ${category} in ${incomeYear} already exists.`);
      // } else {
        // Proceed to save the income data if no duplicates exist
        const formattedData = {
          userId: user.userId,
          incomeSource: category,
          amount: incomeData.amount,
          incomeDate: `${incomeData.incomeDate}-01`, // Append day to the month
        };

        // Save the income data (no actual DB saving for now)
        setSavedCategories((prev) => ({ ...prev, [category]: true }));
        setExpandedCategory(null); // Collapse the form after saving
        console.log(
          "Income data is valid, but not saving to DB for now",
          formattedData
        );
      // }
    }
  };

  const validateForm = () => {
    let isValid = true;
    let formErrors = {};

    incomeForm.forEach((income) => {
      if (
        !income.amount ||
        isNaN(income.amount) ||
        Number(income.amount) <= 0
      ) {
        isValid = false;
        formErrors[income.category] = "Amount must be a positive number.";
      }
      if (!income.incomeDate) {
        isValid = false;
        formErrors[income.category] = "Income date is required.";
      } else {
        const currentDate = new Date();
        const incomeDate = new Date(income.incomeDate);
        if (incomeDate > currentDate) {
          isValid = false;
          formErrors[income.category] = "Income date cannot be in the future.";
        }
      }
    });

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure at least one income source is filled
    if (incomeForm.length === 0) {
      alert("Please add at least one income source.");
      return;
    }

    // Ensure no more than 6 entries are provided
    if (incomeForm.length > 6) {
      alert("You can only submit a maximum of 6 income sources.");
      return;
    }

    // Validate that all income dates are in the same year
    const incomeYears = incomeForm.map((income) =>
      new Date(income.incomeDate).getFullYear()
    );
    const uniqueIncomeYears = new Set(incomeYears);

    if (uniqueIncomeYears.size > 1) {
      alert("All income entries must be for the same year.");
      return;
    }

    // Validate form inputs before submission
    if (validateForm()) {
      const formattedData = incomeForm.map((income) => ({
        userId: user.userId,
        incomeSource: income.category,
        amount: income.amount,
        incomeDate: `${income.incomeDate}-01`, // Append the day to the month
      }));

      try {
        const response = await addMultipleIncomes(formattedData);
        if (response) {
          alert("Income data submitted successfully!");
          navigate("/incomeDetails");
        } else {
          alert("Failed to submit income data.");
        }
      } catch (error) {
        console.error("Error submitting income data:", error);
        alert("An error occurred while submitting the data. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col relative w-full min-h-screen bg-gray-100">
        <div className="flex flex-1">
          <div className="w-1/5">
            <Sidebar />
          </div>
          <div
            className="flex flex-col w-4/5 mt-16"
            style={{ minHeight: "calc(100vh - 4rem)" }}
          >
            <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaBackward className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">
                Add Income
              </h1>
            </header>

            <main className="p-6 flex-grow overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Enter Income Details
              </h2>

              {/* Income Source Cards */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                {availableCategories.map((category) => (
                  <div
                    key={category.name}
                    className={`bg-white border rounded-lg shadow-md p-6 transition-transform transform hover:scale-105 flex flex-col
                    ${
                      expandedCategory === category.name
                        ? "scale-105"
                        : "scale-100"
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-2">{category.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-800 flex-grow">
                        {category.name}
                      </h3>
                      {savedCategories[category.name] ? (
                        <div className="flex items-center">
                          <FaCheck className="text-green-500 text-xl" />
                          <button
                            onClick={() => handleClearIncome(category.name)}
                            className="ml-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ) : expandedCategory === category.name ?(
                        <>
                          <button
                            onClick={() => handleCancelIncome(category.name)}
                            className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <FaTimes className="mr-2" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddIncome(category.name)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <FaPlus />
                          Add
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {category.description}
                    </p>
                    {expandedCategory === category.name && (
                      <div className="mt-4">
                        <div className="mb-4">
                          <label className="block text-sm text-gray-700">
                            Amount
                          </label>
                          <input
                            type="number"
                            name="amount"
                            value={
                              incomeForm.find(
                                (income) => income.category === category.name
                              )?.amount || ""
                            }
                            onChange={(e) =>
                              handleIncomeChange(e, category.name)
                            }
                            className="w-full p-2 border rounded-md"
                            min="0"
                          />
                          {errors[category.name] && (
                            <div className="text-red-500 text-xs mt-1">
                              {errors[category.name]}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm text-gray-700">
                            Income Date
                          </label>
                          <input
                            type="month"
                            name="incomeDate"
                            value={
                              incomeForm.find(
                                (income) => income.category === category.name
                              )?.incomeDate || ""
                            }
                            onChange={(e) =>
                              handleIncomeChange(e, category.name)
                            }
                            max={new Date().toISOString().slice(0, 7)} // Restrict to the current month
                            className="w-full p-2 border rounded-md"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveIncome(category.name)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <FaCheck className="mr-2" />
                  Submit
                </button>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default IncomeForm;
