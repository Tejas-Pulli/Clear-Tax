import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { loginUser } from "../services/AuthServiceApi";
import { AuthContext } from "../context/AuthContext";
import LoginLayoutLayer from "../layouts/LoginLayoutLayer";
import { FaUserAlt, FaLock } from "react-icons/fa";
import labels from "../config/labels";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error(labels.loginPage.messages.requiredFields, {
        position: "top-right",
        duration: 1500,
        progress: 0.8,
      });
      setError(labels.loginPage.messages.requiredFields);
      return;
    }

    setLoading(true);

    const toastId = toast.loading(labels.loginPage.messages.loading, {
      position: "top-right",
      duration: 2000,
      progress: 0.8,
    });

    try {
      const loginResponse = await loginUser(formData);

      if (loginResponse.token) {
        login(loginResponse.token);
        Cookies.set("authToken", loginResponse.token);
        Cookies.set("userEmail", loginResponse.email);

        toast.success(labels.loginPage.messages.successLogin, {
          id: toastId,
          position: "top-right",
          duration: 1500,
          progress: 0.8,
        });

        setTimeout(() => {
          if (loginResponse.role === labels.loginPage.role.admin) {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/welcomeScreen", { replace: true });
          }
        }, 1000);
      } else {
        setError(labels.loginPage.messages.invalidLogin);
        toast.error(labels.loginPage.messages.invalidLogin, {
          id: toastId,
          position: "top-right",
          duration: 1500,
          progress: 0.8,
        });
      }
    } catch (err) {
      setError(err.response?.data || labels.loginPage.messages.errorOccurred);
      toast.error(err.response?.data || labels.loginPage.messages.errorOccurred, {
        id: toastId,
        position: "top-right",
        duration: 1500,
        progress: 0.8,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayoutLayer>
      {/* Login Card */}
      <div className="bg-white rounded-2xl p-8 sm:rounded-xl shadow-lg max-w-md mx-auto mt-16 transform transition-all duration-300 ease-in-out hover:scale-105">
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
        <h1 className="text-3xl font-bold text-center mb-10 animate__animated animate__fadeIn animate__delay-0.5s text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        {labels.loginPage.pageHeding.subtitle}
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={labels.loginPage.email.placeholder} 
              className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
              autoComplete="off"
            />
            <label
              htmlFor="email"
              className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
            >
              <FaUserAlt className="inline-block mr-2 text-blue-500" />
              {labels.loginPage.email.label}
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={labels.loginPage.password.placeholder} 
              className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
              autoComplete="off"
            />
            <label
              htmlFor="password"
              className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-300 ease-in-out"
            >
              <FaLock className="inline-block mr-2 text-blue-500" />
              {labels.loginPage.password.label}
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md text-lg hover:bg-blue-500 focus:outline-none transition transform hover:scale-105 duration-300"
              disabled={loading}
            >
              {loading ? (
                <span className="animate__animated animate__bounceIn animate__delay-0.5s">
                  {labels.loginPage.login.loading}
                </span>
              ) : (
                labels.loginPage.login.button 
              )}
            </button>
          </div>
        </form>

        {/* Register Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/register")}
            className="w-fit bg-white-200 text-gray-700 py-2 rounded-md text-sm hover:bg-white-200 focus:outline-none transition transform hover:scale-105 duration-300"
          >
          {labels.loginPage.pageHeding.formFooter}{" "}
          <span className="text-blue-600">{labels.loginPage.register.buttonText}</span>
            
          </button>
        </div>
      </div>
    </LoginLayoutLayer>
  );
};

export default LoginPage;
