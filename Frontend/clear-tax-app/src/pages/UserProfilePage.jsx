import { useState, useEffect, useContext } from "react";
import { getUserByEmail, updateUser } from "../services/UserServiceApi";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import Sidebar from "../layouts/Sidebar";
import {
  FaUserAlt,
  FaEdit,
  FaRegSave,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import profileIllustration from "../assets/profileIllustration.jpg";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import labels from "../config/labels";

const UserProfilePage = () => {
  const MAX_NAME_LENGTH = 150;
  const MAX_EMAIL_LENGTH = 100;
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const nameRegex =
    /^([A-Z][a-z]+(?:['-][A-Z][a-z]+)?)(?: [A-Z][a-z]+(?:['-][A-Z][a-z]+)?)*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [editing, setEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const email = Cookies.get("userEmail");
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  // Fetch logged-in user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserByEmail(email);
        setUserData(data);
        setFormData({
          name: data.name,
          email: data.email,
          password: "",
          confirmPassword: "",
        });
      } catch (err) {
        toast.error("Error fetching user data: " + err.message, {
          position: "top-right",
        });
      }
    };

    fetchUserData();
  }, [email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    // Check if there are actual changes before submitting the form
    if (
      formData.name === userData.name &&
      formData.email === userData.email &&
      formData.password === "" && // Assuming password is empty if not changed
      formData.confirmPassword === ""
    ) {
      toast.error(
        "No changes detected. Please make some updates before saving.",
        {
          position: "top-right",
        }
      );
      return;
    }

    if (!formData.name) {
      toast.error(labels.registerPage.name.error, {
        position: "top-right",
      });
      return;
    }
    if (formData.name.length > MAX_NAME_LENGTH) {
      toast.error(labels.registerPage.name.lenghterror, {
        position: "top-right",
      });return;
    }
    if (!nameRegex.test(formData.name)) {
      toast.error("Invalid Name Format. (Ex. Dumy One) ", {
        position: "top-right",
      });return;
    }
    if (!formData.email)
      if (!nameRegex.test(formData.name)) {
        toast.error(labels.registerPage.email.error, {
          position: "top-right",
        });return;
      }

    if (formData.email.length > MAX_EMAIL_LENGTH) {
      toast.error(labels.registerPage.email.lenghterror, {
        position: "top-right",
      });return;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format.", {
        position: "top-right",
      });return;
    }

    // Check if the passwords match before updating
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please check again.", {
        position: "top-right",
      });
      return;
    }

    try {
      await updateUser(email, formData);
      Cookies.set("userEmail", formData.email);
      toast.success("Profile updated successfully!", {
        position: "top-right",
      });
      setUserData({
        ...userData,
        name: formData.name,
        email: formData.email,
      });
      setEditing(false);
    } catch (err) {
      toast.error("Email already Exists", {
        position: "top-right",
      });
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col relative w-full min-h-screen pt-16 bg-white-100">
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
            <main className="p-6 flex-grow overflow-y-auto h-[calc(100vh-4rem)] 
             [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-transparent
  dark:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                <motion.h1 className="text-3xl font-bold mb-4"
                 initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                  <FaUserAlt className="inline-block mr-2 text-blue-500" />
                  User Profile
                </motion.h1>

              <div className="max-w-5xl mx-auto mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Section: Profile Info */}
                  <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 transform transition duration-300 ease-in-out">
                    <motion.div className="flex items-center justify-between space-x-4"
                     initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                    >
                    <div className="flex items-center space-x-6">
                      <FaUserCircle className="text-7xl text-blue-500" />
                      <div>
                        <h3 className="text-2xl font-medium text-gray-700">
                          Profile Info
                        </h3>
                        <p className="text-sm text-gray-500">
                          {userData.email}
                        </p>
                      </div>
                    </div>

                    <div>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105"
                      >
                        <FaEdit className="inline -mt-1" />
                      </button>
                    ) : (
                      <>
                        {/* <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-200 transform hover:scale-105"
              >
                <FaRegSave className="inline mr-2 -mt-1" />
                Save Changes
              </button> */}
                      </>
                    )}
                    </div>
                    </motion.div>
                    <div className="space-y-6">
                      {/* Name */}
                      <motion.div className="flex justify-between items-center"
                      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                      >
                        <label className="text-gray-600 font-medium w-2/5">
                          Name
                        </label>
                        {editing ? (
                          <motion.input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 p-2 rounded-lg w-3/5 max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                            placeholder="Enter your name"
                            whileHover={{ scale: 1.05 }}
                            whileFocus={{ scale: 1.05 }}
                          />
                        ) : (
                          <p className="text-gray-700 w-full max-w-[500px] truncate">
                            {userData.name || "Not provided"}
                          </p>
                        )}
                      </motion.div>

                      {/* Email */}
                      <motion.div className="flex justify-between items-center"
                      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                      >
                        <label className="text-gray-600 font-medium w-2/5">
                          Email
                        </label>
                        {editing ? (
                          <motion.input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 p-2 rounded-lg w-3/5 max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                            placeholder="Enter your email"
                            whileHover={{ scale: 1.05 }}
                            whileFocus={{ scale: 1.05 }}
                          />
                        ) : (
                          <p className="text-gray-700 w-full max-w-[500px] truncate">
                            {userData.email || "Not provided"}
                          </p>
                        )}
                      </motion.div>

                      {/* Government ID */}
                      <motion.div className="flex justify-between items-center"
                      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                >
                        <label className="text-gray-600 font-medium w-2/5">
                          Government ID
                        </label>
                        <p className="text-gray-700 w-full max-w-[500px] truncate">
                          {userData.governmentId || "Not provided"}
                        </p>
                      </motion.div>

                      {/* Edit/Save/Cancel Buttons */}
                      {editing && (
                        <motion.div className="flex justify-end space-x-4 mt-6"
                        initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                          <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-200 transform hover:scale-105"
                          >
                            <FaRegSave className="inline mr-2 -mt-1" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditing(false)} // Cancel editing
                            className="px-3 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition duration-200 transform hover:scale-105"
                          >
                            <FaTimes className="inline -mt-1 mx-2" />
                            Cancel
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Animated Profile Image */}
                  <div className="bg-white p-8 rounded-xl shadow-lg flex justify-center items-center transform transition duration-300 ease-in-out">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full max-w-sm h-auto"
                    >
                      <img
                        src={profileIllustration}
                        alt="User Profile Illustration"
                        className="rounded-lg shadow-xl transform transition-all duration-500 ease-in-out hover:scale-105"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default UserProfilePage;
