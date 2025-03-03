import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      {/* <div className="flex relative w-full min-h-screen bg-gray-100"> */}
      <div className="flex flex-col relative w-full min-h-screen bg-gray-100 pt-16">
        {/* <div className="flex flex-1"> */}
        {/* <div className="flex flex-col w-full mt-16"> */}
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
          <div className="min-h-screen bg-gray-100 flex items-center justify-center py-6 sm:py-12">
            <div className="relative w-full max-w-2xl mx-auto bg-white p-8 sm:rounded-3xl shadow-lg">
              <h1 className="text-3xl font-bold text-center mb-6">
                Admin Dashboard
              </h1>

              <div className="text-center">
                <p className="text-xl">Welcome, Admin!</p>
                <button
                  onClick={handleLogout}
                  className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
        {/* </div> */}
        {/* </div> */}
        <Footer />
      </div>
    </>
  );
};

export default AdminDashboardPage;
