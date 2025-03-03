import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  addMultipleDeductions,
  getDeductionsByUserId,
} from "../services/DeductionserviceApi";
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


const EditDeductionPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const email = Cookies.get("userEmail");
  const [user, setUser] = useState(null);
  const [DeductionForm, setDeductionForm] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([
    {
      name: "Home Loan Interest",
      description: "Interest paid on your home loan",
      icon: "🏡",
    },
    {
      name: "Medical Expenses",
      description: "Expenses related to your health care",
      icon: "💊",
    },
    {
      name: "Charitable Donations",
      description: "Donations made to charitable organizations",
      icon: "🎗️",
    },
    {
      name: "Education Expenses",
      description: "Expenses for education and learning",
      icon: "🎓",
    },
    {
      name: "Retirement Contributions",
      description: "Contributions made to retirement funds",
      icon: "💼",
    },
    {
      name: "Other Deductions",
      description: "Other types of deductions not listed",
      icon: "📜",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [Deductions, setDeductions] = useState([]);
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

  // Fetch existing Deductions
  useEffect(() => {
    const fetchDeductions = async () => {
      if (user) {
        try {
          const fetchedDeductions = await getDeductionsByUserId(user.userId);
          setDeductions(fetchedDeductions);
        } catch (error) {
          console.error("Error fetching Deductions:", error);
        }
      }
    };
    fetchDeductions();
  }, [user]);

  const handleDeductionChange = (e, category) => {
    const { name, value } = e.target;
    setDeductionForm((prev) =>
      prev.map((Deduction) =>
        Deduction.category === category
          ? { ...Deduction, [name]: value }
          : Deduction
      )
    );
  };

  const handleAddDeduction = (category) => {
    setDeductionForm((prev) => [
      ...prev,
      {
        category,
        amount: "",
        DeductionDate: "",
      },
    ]);
    setExpandedCategory(category); // Expand the form for the clicked category
  };

  const handleCancelDeduction = (category) => {
    setDeductionForm((prev) =>
      prev.filter((Deduction) => Deduction.category !== category)
    );
    setExpandedCategory(null); // Collapse the form when canceling
  };

  const handleClearDeduction = (category) => {
    setDeductionForm((prev) =>
      prev.filter((Deduction) => Deduction.category !== category)
    );
    setSavedCategories((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const handleSaveDeduction = (category) => {
    const DeductionData = DeductionForm.find(
      (Deduction) => Deduction.category === category
    );

    if (DeductionData && DeductionData.amount && DeductionData.DeductionDate) {
      const DeductionYear = new Date(DeductionData.DeductionDate).getFullYear();

      // Check if an entry with the same category and year already exists
      const existingDeduction = Deductions.find(
        (Deduction) =>
          Deduction.DeductionType === category &&
          new Date(Deduction.DeductionDate).getFullYear() === DeductionYear
      );

      if (existingDeduction) {
        // Show an error message if Deduction already exists for the selected year
        alert(
          `Deduction entry for ${category} in ${DeductionYear} already exists.`
        );
      } else {
        // Proceed to save the Deduction data if no duplicates exist
        const formattedData = {
          userId: user.userId,
          DeductionType: category,
          amount: DeductionData.amount,
          DeductionDate: `${DeductionData.DeductionDate}-01`, // Append day to the month
        };

        // Save the Deduction data (no actual DB saving for now)
        setSavedCategories((prev) => ({ ...prev, [category]: true }));
        setExpandedCategory(null); // Collapse the form after saving
        console.log(
          "Deduction data is valid, but not saving to DB for now",
          formattedData
        );
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    let formErrors = {};

    DeductionForm.forEach((Deduction) => {
      if (
        !Deduction.amount ||
        isNaN(Deduction.amount) ||
        Number(Deduction.amount) <= 0
      ) {
        isValid = false;
        formErrors[Deduction.category] = "Amount must be a positive number.";
      }
      if (!Deduction.DeductionDate) {
        isValid = false;
        formErrors[Deduction.category] = "Deduction date is required.";
      } else {
        const currentDate = new Date();
        const DeductionDate = new Date(Deduction.DeductionDate);
        if (DeductionDate > currentDate) {
          isValid = false;
          formErrors[Deduction.category] =
            "Deduction date cannot be in the future.";
        }
      }
    });

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure at least one Deduction Type is filled
    if (DeductionForm.length === 0) {
      alert("Please add at least one Deduction Type.");
      return;
    }

    // Ensure no more than 6 entries are provided
    if (DeductionForm.length > 6) {
      alert("You can only submit a maximum of 6 Deduction Types.");
      return;
    }

    // Validate that all Deduction dates are in the same year
    const DeductionYears = DeductionForm.map((Deduction) =>
      new Date(Deduction.DeductionDate).getFullYear()
    );
    const uniqueDeductionYears = new Set(DeductionYears);

    if (uniqueDeductionYears.size > 1) {
      alert("All Deduction entries must be for the same year.");
      return;
    }

    // Validate form inputs before submission
    if (validateForm()) {
      const formattedData = DeductionForm.map((Deduction) => ({
        userId: user.userId,
        deductionType: Deduction.category,
        amount: Deduction.amount,
        deductionDate: `${Deduction.DeductionDate}-01`, // Append the day to the month
      }));

      try {
        console.log(formattedData);
        const response = await addMultipleDeductions(formattedData);
        if (response) {
          alert("Deduction data submitted successfully!");
          navigate("/trackExpenses");
        } else {
          alert("Failed to submit Deduction data.");
        }
      } catch (error) {
        console.error("Error submitting Deduction data:", error);
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
            <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaBackward className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-800">Add Deduction</h1>
            </header>

            <main className="p-6 flex-grow overflow-y-auto h-[calc(100vh-4rem)] p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Enter Deduction Details
              </h2>

              {/* Deduction Type Cards */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                {availableCategories.map((category) => (
                  <div
                    key={category.name}
                    className={`bg-white border rounded-lg shadow-md p-6 transition-transform transform hover:scale-105 flex flex-col
                    ${expandedCategory === category.name ? "scale-105":"scale-100" }`}
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
                            onClick={() => handleClearDeduction(category.name)}
                            className="ml-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ) : expandedCategory === category.name ? (
                        <>
                          <button
                            onClick={() => handleCancelDeduction(category.name)}
                            className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <FaTimes className="mr-2" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddDeduction(category.name)}
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
                              DeductionForm.find(
                                (Deduction) =>
                                  Deduction.category === category.name
                              )?.amount || ""
                            }
                            onChange={(e) =>
                              handleDeductionChange(e, category.name)
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
                            Deduction Date
                          </label>
                          <input
                            type="month"
                            name="DeductionDate"
                            value={
                              DeductionForm.find(
                                (Deduction) =>
                                  Deduction.category === category.name
                              )?.DeductionDate || ""
                            }
                            onChange={(e) =>
                              handleDeductionChange(e, category.name)
                            }
                            max={new Date().toISOString().slice(0, 7)} // Restrict to the current month
                            className="w-full p-2 border rounded-md"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveDeduction(category.name)}
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

export default EditDeductionPage;
