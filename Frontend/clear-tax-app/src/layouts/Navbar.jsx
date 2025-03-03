// import { useEffect, useRef, useState } from "react";
// import Cookies from "js-cookie";
// import { FaPhoneAlt, FaRegBell, FaRegQuestionCircle } from "react-icons/fa";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { getTaxPaymentByUserId } from "../services/TaxPaymentService";
// import { getUserByEmail } from "../services/UserServiceApi";
// import { getTaxRefund } from "../services/TaxRefundService";
// import { motion } from "framer-motion";
// import { toast } from "react-hot-toast";
// import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
// import { MenuIcon } from "lucide-react";

// const Navbar = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const [isPendingPayment, setIsPendingPayment] = useState(false);
//   const [isPendingRefund, setIsPendingRefund] = useState(false);
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [taxRefund, setTaxRefund] = useState("");
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const userEmail = Cookies.get("userEmail");

//    Modal Ref to check clicks outside modal
//   const modalRef = useRef(null);

//    Close the modal when clicking outside of it
//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         setIsModalOpen(false);
//       }
//     };

//     if (isModalOpen) {
//       document.addEventListener("click", handleOutsideClick);
//     }

//     return () => {
//       document.removeEventListener("click", handleOutsideClick);
//     };
//   }, [isModalOpen]);

//    Modal for logout
//   const handleLogout = () => {
//     setIsModalOpen(true);
//   };

//   const confirmLogout = () => {
//     const toastId = toast.loading("Logging out...", {
//       position: "top-right",
//       duration: 1500,
//       progress: 0.8,
//     });

//     Cookies.remove("authToken");
//     Cookies.remove("userEmail");
//     localStorage.removeItem("amendment");
//     setIsModalOpen(false);
//     toast.success("You have successfully logged out.", {
//       id: toastId,
//       position: "top-right",
//       duration: 1500,
//       progress: 0.8,
//     });

//     setTimeout(() => {
//       navigate("/login");
//     }, 1000);
//   };

//   const cancelLogout = () => {
//     setIsModalOpen(false);
//   };

//   Fetch payment status for the logged-in user
//   useEffect(() => {
//     const fetchPaymentStatus = async () => {
//       try {
//         const userData = await getUserByEmail(userEmail);
//         setUser(userData);
//         const paymentData = await getTaxPaymentByUserId(userData.userId);
//         if (paymentData.paymentStatus === "Pending") {
//           setIsPendingPayment(true);
//         } else {
//           setIsPendingPayment(false);
//         }
//       } catch (error) {
//         console.error("Error fetching payment status:", error);
//       }
//     };

//     if (userEmail) {
//       Initial fetch
//       fetchPaymentStatus();

//       Set up interval to fetch payment status every 10 seconds
//       const interval = setInterval(fetchPaymentStatus, 10000);

//       Clean up the interval when component unmounts or userEmail changes
//       return () => clearInterval(interval);
//     }
//   }, [userEmail, location.pathname]);

//   useEffect(() => {
//     const fetchRefund = async () => {
//       if (user && user.userId) {
//         try {
//           const refundData = await getTaxRefund(user.userId);
//           if (refundData) {
//             setTaxRefund(refundData);
//             if (refundData && refundData.refundStatus === "Pending") {
//               setIsPendingRefund(true);
//             } else {
//               setIsPendingRefund(false);
//             }
//           }
//         } catch (err) {
//           console.error("Error Fetching refund:", err);
//         }
//       }
//     };

//     fetchRefund();
//   }, [user]);

//   Update notification count when new notification arrives
//   useEffect(() => {
//     const storedNotificationStatus = localStorage.getItem("notificationRead");

//     if (isPendingPayment && !storedNotificationStatus) {
//       setNotificationCount(1);
//     } else {
//       setNotificationCount(0);
//     }
//   }, [isPendingPayment]);

//   Handle clicking a notification
//   const handleNotificationClick = () => {
//     setNotificationCount(0);
//     setIsNotificationOpen(false);
//     localStorage.setItem("notificationRead", "true");
//     navigate("/trackPayments");
//   };

//   Reset notification count when logging in
//   useEffect(() => {
//     const notificationReadStatus = localStorage.getItem("notificationRead");
//     if (notificationReadStatus === "true") {
//       setNotificationCount(0);
//     }
//   }, [userEmail]);

//   console.log(isPendingPayment);

//   Dropdown and notifications
//   useEffect(() => {
//     const handleClickOutside = () => {
//       setIsDropdownOpen(false);
//       setIsNotificationOpen(false);
//     };

//     document.addEventListener("click", handleClickOutside);

//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   const toggleDropdown = (event) => {
//     event.stopPropagation();
//     setIsDropdownOpen((prev) => !prev);
//   };

//   const toggleNotificationPanel = (event) => {
//     event.stopPropagation();
//     console.log("Notification panel clicked");
//     setIsNotificationOpen((prev) => !prev);
//   };

//   const profileItems = [
//     { name: "Profile", path: "/profile" },
//     { name: "Settings", path: "/settings" },
//   ];

//   Notification for pending payment
//   const paymentNotification = isPendingPayment
//     ? { message: "Your tax payment is pending. Please make the payment." }
//     : null;

//   const refundNotification = isPendingRefund
//     ? { message: "Your tax payment is pending. Please make the payment." }
//     : null;

//   console.log(notificationCount);
//   return (
//     <>
//       <div className="fixed top-0 w-full z-40">
//         <nav className="bg-gray-800 p-4 text-white shadow-md w-full">
//           <div className="flex justify-between items-center w-full">
//             <div className="flex items-center space-x-4">
//               <Link to="/">
//                 <img src="/pageLogo.png" alt="Logo" className="h-8" />
//               </Link>
//             </div>

//             {/* Profile Icon */}
//             <div className="relative flex items-center space-x-4">
//               <div className="relative">
//                 {/* Help Icon */}
//                 <FaRegQuestionCircle className="text-2xl text-white-600 cursor-pointer hover:text-gray-400" />
//               </div>

//               <div className="relative">
//                 {/* Contact Us Icon */}
//                 <FaPhoneAlt className="text-2xl text-white-600 cursor-pointer hover:text-gray-400" />
//               </div>

//               {/* Notification Bell */}
//               <div className="relative">
//                 <FaRegBell
//                   className="text-2xl text-white-600 cursor-pointer hover:text-gray-400"
//                   onClick={toggleNotificationPanel}
//                 />
//                 {notificationCount > 0 && ( // Show badge only if count > 0
//                   <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-0.5 py-0.5">
//                     {notificationCount}
//                   </span>
//                 )}
//                 {isNotificationOpen && (
//                   <motion.div
//                     className="absolute  right-0 w-64 bg-current rounded-lg shadow-lg z-10"
//                     onClick={(e) => e.stopPropagation()}
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
//                       <div className="flex">
//                         <FaRegBell className="mt-3 mx-2 text-gray-600" />
//                         <div className="py-2  flex-1 font-semibold text-gray-700 border-b">
//                           Notifications
//                         </div>
//                       </div>

//                       <ul className="py-2 max-h-64 overflow-y-auto">
//                         {paymentNotification ? (
//                           <li
//                             onClick={handleNotificationClick}
//                             className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
//                           >
//                             {paymentNotification.message}
//                           </li>
//                         ) : (
//                           <li className="px-4 py-2 text-sm text-gray-500">
//                             No notifications
//                           </li>
//                         )}
//                       </ul>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Profile Icon */}
//               <div
//                 className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-gray-300"
//                 onClick={toggleDropdown}
//               >
//                 <img
//                   src="/profileIcon.png"
//                   alt="Profile Icon"
//                   className="w-full h-full object-cover"
//                 />
//               </div>

//               {/* Profile Dropdown */}
//               {isDropdownOpen && (
//                 <motion.div
//                   className="absolute top-11 right-0 mt-2 w-64 bg-current rounded-lg shadow-lg z-10"
//                   onClick={(e) => e.stopPropagation()}
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <div className="flex">
//                     <MenuIcon className="mt-2 mx-3 text-gray-600" />
//                     <div className="py-2  flex-1 font-semibold text-gray-700 border-b">
//                       Menu
//                     </div>
//                   </div>

//                   <ul className="py-2 max-h-64 overflow-hidden">
//                     {/* Profile Item */}
//                     <motion.li
//                       key="profile"
//                       className="flex items-center px-4 py-2 text-l text-gray-600 hover:bg-gray-100 cursor-pointer"
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <FaUser className="mr-2 text-gray-600" />{" "}
//                       {/* Profile Icon */}
//                       <Link to="/profile" className="flex-1">
//                         Profile
//                       </Link>
//                     </motion.li>

//                     {/* Settings Item */}
//                     <motion.li
//                       key="settings"
//                       className="flex items-center px-4 py-2 text-l text-gray-600 hover:bg-gray-100 cursor-pointer"
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <FaCog className="mr-2 text-gray-600" />{" "}
//                       {/* Settings Icon */}
//                       <Link to="/settings" className="flex-1">
//                         Settings
//                       </Link>
//                     </motion.li>

//                     {/* Logout Item */}
//                     <motion.li
//                       key="logout"
//                       className="flex items-center px-4 py-2 text-l text-gray-600 hover:bg-red-100 cursor-pointer"
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <FaSignOutAlt className="mr-2 text-gray-600" />{" "}
//                       {/* Logout Icon */}
//                       <button
//                         onClick={handleLogout}
//                         className="flex-1 text-left text-gray-600 hover:bg-red-100"
//                       >
//                         Logout
//                       </button>
//                     </motion.li>
//                   </ul>
//                 </motion.div>
//               )}
//             </div>
//           </div>
//         </nav>

//         {/* Logout Confirmation Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-30">
//             <div
//               ref={modalRef}
//               className="bg-white rounded-lg shadow-xl p-8 w-96 transform transition-transform duration-300 scale-105 hover:scale-110"
//             >
//               <h3 className="text-2xl text-center text-gray-800 font-semibold mb-6">
//                 Are you sure you want to log out?
//               </h3>
//               <div className="flex justify-center gap-6">
//                 <button
//                   onClick={cancelLogout}
//                   className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 ease-in-out transform hover:scale-105"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmLogout}
//                   className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out transform hover:scale-105"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };
// export default Navbar;

import { useContext, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getTaxPaymentByUserId } from "../services/TaxPaymentService";
import { getUserByEmail } from "../services/UserServiceApi";
import { getTaxRefund } from "../services/TaxRefundService";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { FaUser, FaSignOutAlt, FaRegBell, FaUserAlt, FaRegUser } from "react-icons/fa";
import labels from "../config/labels";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPendingPayment, setIsPendingPayment] = useState(false);
  const [isPendingRefund, setIsPendingRefund] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [taxRefund, setTaxRefund] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = Cookies.get("userEmail");
  const { isAuthenticated } = useContext(AuthContext);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  // Close the modal when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isModalOpen]);

  // Modal for logout
  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    const toastId = toast.loading(labels.navbar.toast.logOutLoading, {
      position: "top-right",
      duration: 1500,
      progress: 0.8,
    });

    Cookies.remove(labels.navbar.tokens.auth);
    Cookies.remove(labels.navbar.tokens.email);
    localStorage.removeItem(labels.navbar.tokens.amendmnet);
    setIsModalOpen(false);
    toast.success(labels.navbar.toast.successLogin, {
      id: toastId,
      position: "top-right",
      duration: 1500,
      progress: 0.8,
    });

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  // Fetch payment status for the logged-in user
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const userData = await getUserByEmail(userEmail);
        setUser(userData);
        const paymentData = await getTaxPaymentByUserId(userData.userId);
        if (paymentData.paymentStatus === labels.navbar.status.pendingStatus) {
          setIsPendingPayment(true);
        } else {
          setIsPendingPayment(false);
        }
      } catch (error) {
        // console.error(labels.navbar.status.errrorStatus, error);
      }
    };

    if (userEmail) {
      // Initial fetch
      fetchPaymentStatus();

      // Set up interval to fetch payment status every 10 seconds
      const interval = setInterval(fetchPaymentStatus, 10000);

      // Clean up the interval when component unmounts or userEmail changes
      return () => clearInterval(interval);
    }
  }, [userEmail, location.pathname]);

  useEffect(() => {
    const fetchRefund = async () => {
      if (user?.userId) {
        try {
          const refundData = await getTaxRefund(user.userId);
          if (refundData) {
            setTaxRefund(refundData);
            if (
              refundData.refundStatus === labels.navbar.status.pendingStatus
            ) {
              setIsPendingRefund(true);
            } else {
              setIsPendingRefund(false);
            }
          }
        } catch (error) {
          // console.error(labels.navbar.status.pendingStatus, err);
        }
      }
    };

    fetchRefund();
  }, [user]);

  // Update notification count when new notification arrives
  useEffect(() => {
    const storedNotificationStatus = localStorage.getItem(labels.navbar.tokens.notificationRead);
  
    let newNotificationCount = 0;
  
    if (!storedNotificationStatus || storedNotificationStatus === labels.navbar.boolean.false) {
      if (isPendingPayment) {
        newNotificationCount += 1;
      }
      if (isPendingRefund) {
        newNotificationCount += 1;
      }
    }
  
    setNotificationCount(newNotificationCount);
  }, [isPendingPayment, isPendingRefund]);
  
  const handleNotificationClick = () => {
    setNotificationCount(0);
    setIsNotificationOpen(false);
  
    // Mark notifications as read
    localStorage.setItem(labels.navbar.tokens.notificationRead, labels.navbar.boolean.true);
  
    navigate("/trackPayments");
  };
  

  // Reset notification count when logging in
  useEffect(() => {
    const notificationReadStatus = localStorage.getItem(
      labels.navbar.tokens.notificationRead
    );
    if (notificationReadStatus === labels.navbar.boolean.true) {
      setNotificationCount(0);
    }
  }, [userEmail]);

  // Dropdown and notifications
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
      setIsNotificationOpen(false);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleNotificationPanel = (event) => {
    event.stopPropagation();
    setIsNotificationOpen((prev) => !prev);
  };

  // Notification for pending payment
  const paymentNotification = isPendingPayment
    ? { message: labels.navbar.notification.paymentNotification }
    : null;

  const refundNotification = isPendingRefund
    ? { message: labels.navbar.notification.refundNotification }
    : null;

  return (
    <div className="fixed top-0 w-full z-40">
      <nav className="bg-gray-800 p-4 text-white shadow-md w-full">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img src="/pageLogo.png" alt="Logo" className="h-8" />
            </Link>
          </div>

          {/* Profile Icon */}
          <div className="relative flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <FaRegBell
                className="text-2xl text-white-600 cursor-pointer hover:text-gray-400"
                onClick={toggleNotificationPanel}
              />
              {notificationCount > 0 && ( // Show badge only if count > 0
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-0.5 py-0.5">
                  {notificationCount}
                </span>
              )}
              {isNotificationOpen && (
                <motion.div
                  className="absolute  right-0 w-64 bg-current rounded-lg shadow-lg z-10"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                    <div className="flex">
                      <FaRegBell className="mt-3 mx-2 text-gray-600" />
                      <div className="py-2  flex-1 font-semibold text-gray-700 border-b">
                        {labels.navbar.notification.title}
                      </div>
                    </div>

                    <ul className="py-2 max-h-64 overflow-y-auto">
                      {paymentNotification ? (
                        <li>
                          <button
                            onClick={handleNotificationClick}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none"
                          >
                            {paymentNotification.message}
                          </button>
                        </li>
                      ) : null}
                      {refundNotification ? (
                        <li>
                          <button
                            onClick={handleNotificationClick}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            {refundNotification.message}
                          </button>
                        </li>
                      ) : null}
                      {!paymentNotification && !refundNotification && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          {labels.navbar.notification.noTitle}
                        </li>
                      )}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Profile Icon */}
            <button
              onClick={toggleDropdown}
              className="w-10 h-10 overflow-hidden"
            >
              {/* <img
                src="/profileIcon.png"
                alt="Profile Icon"
                className="w-full h-full object-cover"
              /> */}
              <FaRegUser className="text-2xl text-white-600 cursor-pointer hover:text-gray-400"  />
            </button>

            {/* Profile Dropdown */}
            {isDropdownOpen && (
              <motion.div
                className="absolute top-11 right-0 w-64 bg-current rounded-lg shadow-lg z-10"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <div className="text-right">
                    <div className="flex justify-end  w-full">
                      <p className="text-m p-2 mx-2  italic truncate overflow-hidden max-w-60 text-right text-black">
                        {labels.homePage.heading.welcome}{" "}
                        {user ? user.name : "User"}!
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="py-2 max-h-64 overflow-hidden">
                  {/* Profile Item */}
                  <motion.li
                    key="profile"
                    className="flex items-center px-4 py-2 text-l text-gray-600 hover:bg-gray-100 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUser className="mr-2 text-gray-600" />{" "}
                    {/* Profile Icon */}
                    <Link to="/profile" className="flex-1">
                      {labels.navbar.profile.title}
                    </Link>
                  </motion.li>

                  {/* Logout Item */}
                  <motion.li
                    key="logout"
                    className="flex items-center px-4 py-2 text-l text-gray-600 hover:bg-gray-100 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaSignOutAlt className="mr-2 text-gray-600" />{" "}
                    {/* Logout Icon */}
                    <button
                      onClick={handleLogout}
                      className="flex-1 text-left text-gray-600 hover:bg-gray-100"
                    >
                      {labels.navbar.profile.logout}
                    </button>
                  </motion.li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-30">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-8 w-96 transform transition-transform duration-300 scale-105 hover:scale-110"
          >
            <h3 className="text-2xl text-center text-gray-800 font-semibold mb-6">
              {labels.navbar.modal.title}
            </h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={cancelLogout}
                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 ease-in-out transform hover:scale-105"
              >
                {labels.navbar.modal.cancle}
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out transform hover:scale-105"
              >
                {labels.navbar.modal.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
