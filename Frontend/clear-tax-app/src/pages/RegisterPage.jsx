import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../services/AuthServiceApi";
import { HttpStatusCode } from "axios";
import LoginLayoutLayer from "../layouts/LoginLayoutLayer";
import { FaUserAlt, FaEnvelope, FaLock, FaIdCard } from "react-icons/fa";
import labels from "../config/labels";

const RegisterPage = () => {
  const MAX_NAME_LENGTH = 150;
const MAX_EMAIL_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 150;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    governmentId: "",
    userRole: "USER",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    const nameRegex =
      /^([A-Z][a-z]+(?:['-][A-Z][a-z]+)?)(?: [A-Z][a-z]+(?:['-][A-Z][a-z]+)?)*$/;
      
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;
    const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;


    if (!formData.name) return labels.registerPage.name.error;
    if(formData.name.length > MAX_NAME_LENGTH) return labels.registerPage.name.lenghterror;
    if (!nameRegex.test(formData.name)) return "Invalid Name Format. (Ex. Dumy One) ";
    if (!formData.email) return labels.registerPage.email.error;
    if(formData.email.length > MAX_EMAIL_LENGTH) return labels.registerPage.email.lenghterror;
    if (!emailRegex.test(formData.email)) return "Invalid email format.";
    if (!formData.password) return labels.registerPage.password.error;
    if (!passwordRegex.test(formData.password))
      return labels.registerPage.password.error;
    if(formData.password.length > MAX_PASSWORD_LENGTH) return labels.registerPage.password.lenghterror;
    if (!formData.confirmPassword) return "Confirm Password is required.";
    if (formData.password !== formData.confirmPassword)
      return "Password and Confirm Password must match.";
    if (!formData.governmentId) return labels.registerPage.governmentId.error;
    if (!panRegex.test(formData.governmentId))
      return labels.registerPage.governmentId.error;
    return null;
  };

  // Handle Submit or Register
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error, {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setLoading(true);

    const toastId = toast.loading(labels.registerPage.toastMessage.buttonChange, {
      position: "top-right",
      duration: 2000,
    });

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await registerUser(dataToSend);

      if (response.success || HttpStatusCode.Accepted) {
        toast.success(labels.registerPage.toastMessage.successRegistration, {
          id: toastId,
          position: "top-right",
          duration: 3000,
        });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(
          response.message || labels.registerPage.toastMessage.errorRegistration,
          {
            id: toastId,
            position: "top-right",
            duration: 2000,
          }
        );
      }
    } catch (err) {
      toast.error(err.message, {
        id: toastId,
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayoutLayer>
      {/* Background and Full Screen Layout */}
      <div
        className="bg-cover bg-center min-h-screen flex items-center justify-center"
        style={{ backgroundImage: "url('/image.jpg')" }}
      >
        <div className="bg-white p-4 pr-8 pl-8 sm:rounded-xl shadow-xl max-w-md mx-auto mt-0 transform rounded-2xl transition-all duration-300 ease-in-out scale-95 hover:scale-100 w-full">
          {/* Logo and Text Line */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img
              src="./pageLogo.png"
              alt="Logo"
              className="h-16 transform transition-all duration-300 ease-in-out hover:rotate-12"
            />
            <div className="text-sm font-medium text-gray-600">
             {labels.loginPage.pageHeding.title}
            </div>
          </div>

          {/* Gradient Heading */}
          <h1 className="text-3xl font-bold text-center mb-5 animate__animated animate__fadeIn animate__delay-0.5s text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {labels.registerPage.heading.label}
          </h1>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Name Input */}
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={labels.registerPage.name.placeholder}
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all  duration-300 ease-in-out"
                autoComplete="off"
              />
              <label
                htmlFor="name"
                className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
              >
                <FaUserAlt className="inline-block mr-2 text-blue-500" />
                {labels.registerPage.name.label}
              </label>
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={labels.registerPage.email.placeholder}
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
                autoComplete="off"
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
              >
                <FaEnvelope className="inline-block mr-2 text-blue-500" />
                {labels.registerPage.email.label}
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={labels.registerPage.password.placeholder}
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
                autoComplete="off"
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
              >
                <FaLock className="inline-block mr-2 text-blue-500" />
                {labels.registerPage.password.label}
              </label>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={labels.registerPage.confirmPassword.placeholder}
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
                autoComplete="off"
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
              >
                <FaLock className="inline-block mr-2 text-blue-500" />
                {labels.registerPage.confirmPassword.label}
              </label>
            </div>

            {/* Government ID Input */}
            <div className="relative">
              <input
                type="text"
                name="governmentId"
                value={formData.governmentId}
                onChange={handleChange}
                placeholder={labels.registerPage.governmentId.placeholder}
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
                autoComplete="off"
              />
              <label
                htmlFor="governmentId"
                className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
              >
                <FaIdCard className="inline-block mr-2 text-blue-500" />
                {labels.registerPage.governmentId.label}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-6 bg-blue-500 text-white font-semibold text-lg rounded-lg transition-all duration-300 ease-in-out transform ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              {loading ? "Registering..." : labels.registerPage.name.buttonText}
            </button>
          </form>

          {/* Already Registered Button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="w-fit bg-white-200 text-gray-700 py-2 rounded-md text-sm hover:bg-white-200 focus:outline-none transition transform hover:scale-105 duration-300"
            >
              {labels.registerPage.heading.formfooter}{" "}
              <span className="text-blue-600">{labels.registerPage.register.buttonText}</span>
            </button>
          </div>
        </div>
      </div>
    </LoginLayoutLayer>
  );
};

export default RegisterPage;
