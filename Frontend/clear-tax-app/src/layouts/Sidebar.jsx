import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SidebarItems from "./SidebarItems";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { FaRegWindowClose } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const [activePath, setActivePath] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [openIcon, setOpenIcon] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [activeBox, setActiveBox] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Track window width
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Listen for window resize event
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    setActivePath(currentPath);

    if (isOpen) {
      const currentSection = SidebarItems.find((section) =>
        section.items.some((item) => item.path === currentPath)
      );
      if (currentSection) {
        setOpenIcon(currentSection.name);
      }
    } else {
      setOpenIcon(null);
    }

    // Close sidebar when window is small (less than 768px)
    if (windowWidth < 768) {
      setIsOpen(false);
      setIsSidebarOpen(false);
    }
    else{
      setIsOpen(true);
      setIsSidebarOpen(true);
    }
  }, [location.pathname, windowWidth]);

  const toggleIcon = (sectionName) => {
    setOpenIcon((prev) => (prev === sectionName ? null : sectionName));
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
    setIsSidebarOpen((prevState) => !prevState);
  };
  
  const handleBoxClick = (sectionName) => {
    const section = SidebarItems.find(
      (section) => section.name === sectionName
    );
    if (section?.items[0]) {
      setActiveBox(sectionName);
      setActivePath(section.items[0].path);
    }
  };

  return (
    <div
      className={`relative h-full ${isOpen ? "w-64" : "w-16"} transition-all duration-300 bg-gray-900 text-white shadow-lg z-30`}
    >
      <div className="p-4 flex justify-end">
        <button onClick={toggleSidebar} className="text-white">
          {isOpen ? <FaRegWindowClose size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div
        className={`flex flex-col items-center gap-4 py-4 ${!isOpen ? "block" : "hidden"}`}
      >
        {SidebarItems.map((section) => (
          <div
            key={section.name}
            className="relative"
            onMouseEnter={() => setHoveredIcon(section.name)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <button
              onClick={() => toggleIcon(section.name)}
              className={`text-2xl cursor-pointer ${
                openIcon === section.name || hoveredIcon === section.name
                  ? "text-sky-400"
                  : "text-white"
              }`}
            >
              {section.icon}
            </button>

            {/* Show the hover box on hover or if it's the active box */}
            {(hoveredIcon === section.name || activeBox === section.name) && (
              <div
                className="absolute -top-4 left-full ml-2 bg-gray-800 p-4 rounded-lg w-64 flex flex-col cursor-pointer"
                onClick={() => handleBoxClick(section.name)} // Make box clickable
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {section.items.map((item) => (
                    <Link
                      to={item.path}
                      key={item.name}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        activePath === item.path
                          ? "bg-sky-500 text-gray-900"
                          : "hover:bg-sky-500 hover:bg-opacity-50"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`overflow-y-auto h-[calc(100vh-4rem)] p-4
      [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-transparent
  dark:[&::-webkit-scrollbar-thumb]:bg-gray-300"
       ${isOpen ? "" : "hidden"} `}
      >
        <ul className="space-y-4">
          {SidebarItems.map((section) => (
            <li key={section.name}>
              <div
                className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg transition-colors ${
                  openIcon === section.name
                    ? "bg-gray-800"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => toggleIcon(section.name)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  {isOpen && (
                    <span className="font-medium">{section.name}</span>
                  )}
                </div>
                <span>
                  {openIcon === section.name ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </span>
              </div>

              {(openIcon === section.name || hoveredIcon === section.name) && (
                <ul className="ml-6 mt-2 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          activePath === item.path
                            ? "bg-sky-500 text-gray-900"
                            : "hover:bg-sky-500 hover:bg-opacity-50"
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
