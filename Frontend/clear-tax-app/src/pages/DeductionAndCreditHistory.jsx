import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useContext, useEffect, useState } from "react";
import { FaFilter, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { getDeductionsByUserId } from "../services/DeductionServiceApi";
import { getUserByEmail } from "../services/UserServiceApi";
import { AuthContext } from "../context/AuthContext";

const DeductionAndCreditHistory = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deductions, setDeductions] = useState([]);
  const [filteredDeductions, setFilteredDeductions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [amendment, setAmendment] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Fetch user details on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserByEmail(Cookies.get("userEmail"));
        setUser(userData);
      } catch (err) {
        setError("Error fetching user details: " + err.message);
      }
    };
    fetchUser();
  }, []);

  //fetch deductions
  useEffect(() => {
    if (!user) return;

    const fetchDeduction = async () => {
      try {
        // Fetch response1 and process it
        const response1 = await getDeductionsByUserId(user.userId, 0);
        // Initialize response2 as an empty array in case of an error
        let response2 = [];
        // Try fetching response2
        try {
          response2 = await getDeductionsByUserId(user.userId, 1);
          if(response2===undefined){
            response2 = [];
          }
        } catch (err) {
          console.error("Error fetching response2: ", err);

        }
        
        // Combine both responses
        const response = [...response1, ...response2];
        console.log(response);
        
        // Format and sort data
        const formattedData = response.map((deduction) => {
          const year = new Date(deduction.deductionDate).getFullYear();
          return { ...deduction, year };
        });
        
        const sortedData = [...formattedData].sort((a, b) => b.year - a.year);
        
        // Set deductions state
        setDeductions(sortedData);
        setFilteredDeductions(sortedData);
        
      } catch (err) {
        // Catch any errors from response1 or other operations
        setError(err);
      }
      
    };

    fetchDeduction();
  }, [user]);
  
  // Handle Year Filter
  const handleFilterChange = (year) => {
    setSelectedYear(year);
    if (year === "All") {
      setFilteredDeductions(deductions);
    } else {
      setFilteredDeductions(
        deductions.filter((item) => {
          const deductionYear = new Date(item.deductionDate).getFullYear();
          return deductionYear === parseInt(year);
        })
      );
    }
  };

  // Extract Unique Years for Filter
  const availableYears = [
    ...new Set(deductions.map((d) => new Date(d.deductionDate).getFullYear())),
  ];

  // Filtered and paginated deductions
  const displayedDeductions = filteredDeductions.filter((deduction) => {
    const search = searchQuery.toLowerCase().trim();
    return (
      deduction.deductionType
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      deduction.amount.toString().includes(search)
    );
  });

  // Paginate deductions
  const indexOfLastDeduction = currentPage * entriesPerPage;
  const indexOfFirstDeduction = indexOfLastDeduction - entriesPerPage;
  const currentDeductions = displayedDeductions.slice(
    indexOfFirstDeduction,
    indexOfLastDeduction
  );

  const totalPages = Math.ceil(displayedDeductions.length / entriesPerPage);

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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
              <motion.h1
                className="text-3xl flex font-bold mb-4 text-gray-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FaHistory className="mr-2 mt-1 text-blue-500" />
                Deduction & Credit History
              </motion.h1>

              <div className="flex flex-row justify-between">
                {/* Search Area */}
                <div className="flex justify-start items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="flex justify-end items-center mb-4">
                  <label className="text-lg flex items-center mr-2">
                    <FaFilter className="mr-2 text-gray-500" />
                    Filter By:
                  </label>
                  <select
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => handleFilterChange(e.target.value)}
                    value={selectedYear}
                  >
                    <option value="All">All Years</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Area */}
              {currentDeductions.length > 0 ? (
                <motion.table
                  className="w-full bg-white shadow-md rounded-lg overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <thead className="bg-gray-500 text-white">
                    <tr>
                      <th className="p-3 text-left">Year</th>
                      <th className="p-3 text-left">Amount (₹)</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDeductions.map((deduction, index) => (
                      <motion.tr
                        key={index}
                        className="border-b transition hover:bg-gray-100"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td className="p-3">
                          {new Date(deduction.deductionDate).getFullYear()}
                        </td>
                        <td className="p-3">{deduction.amount}</td>
                        <td className="p-3">{deduction.deductionType}</td>
                        <td className="p-3">
                          {deduction.isAmended === 0
                            ? "No Amendment"
                            : "Amendment"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              ) : (
                <motion.div
                  className="text-center text-gray-600 text-lg mt-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  No Data Available
                </motion.div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-2 bg-gray-500 text-white rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-lg mx-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-2 bg-gray-500 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DeductionAndCreditHistory;
