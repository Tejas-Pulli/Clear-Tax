import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NotFoundPage = () => {
  const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
  
    useEffect(() => {
      if (!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate]);
  
  return (
    <>
      <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-r from-green-200 to-blue-200 text-gray-800 text-center overflow-hidden">
        {/* Dynamic Background with Moving Coins */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-green-100 to-blue-100 opacity-50 animate-fade"></div>

        {/* Animated Background Image */}
        <div
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')] opacity-100 animate-background"
          style={{
            animationDuration: "10s",
            animationTimingFunction: "linear",
          }}
        ></div>

        {/* 404 Error Message */}
        <h1 className="text-8xl font-bold relative z-10 flex items-center gap-2">
          <span>4</span>
          <span
            className="w-16 h-16 bg-cover bg-center rounded-full animate-spin-slow"
            style={{
              backgroundImage:
                "url('https://upload.wikimedia.org/wikipedia/commons/b/b7/Money_Flat_Icon_GIF_Animation.gif?20180906204821')",
            }}
          />
          <span>4</span>
        </h1>
        <p className="mt-4 text-lg relative z-10">
          Oops! This page is out of your tax jurisdiction.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition relative z-10"
        >
          Go Back to Finance Dashboard
        </button>
      </div>

      <style>
        {`
    @keyframes fade {
      0% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes float-slow {
      0% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0); }
    }

    @keyframes move-background {
      0% { background-position: 0 0; }
      100% { background-position: 100% 100%; }
    }

    .animate-fade {
      animation: fade 3s infinite alternate ease-in-out;
    }

    .animate-spin-slow {
      animation: spin-slow 8s linear infinite;
    }

    .animate-float-slow {
      animation: float-slow 5s infinite ease-in-out;
    }

    .animate-background {
      animation: move-background 30s infinite;
    }
  `}
      </style>
    </>
  );
};

export default NotFoundPage;
