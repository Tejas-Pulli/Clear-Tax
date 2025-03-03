import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import labels from "../config/labels";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [exitAnimation, setExitAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setExitAnimation(true);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    }, 2500);
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.img
          src="/pageLogo.png"
          alt="Logo"
          className="w-96 h-40 mb-4"
          animate={exitAnimation ? { scale: 20, opacity: 0 } : {}}
          transition={{ duration: 1 }}
        />
        <motion.h1
          className="text-3xl font-semibold tracking-wide"
          animate={exitAnimation ? { opacity: 0 } : {}}
          transition={{ duration: 1 }}
        >
          {labels.welcomeScreen.title}
        </motion.h1>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;

// import { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// const WelcomeScreen = () => {
//   const navigate = useNavigate();
//   const [exitAnimation, setExitAnimation] = useState(false);
//   const audioRef = useRef(null);

//   useEffect(() => {
//     // Play the music when the component mounts
//     if (audioRef.current) {
//       audioRef.current.volume = 0.5; // Adjust volume if needed
//       audioRef.current.play().catch((err) => console.error("Audio play failed", err));
//     }

//     setTimeout(() => {
//       setExitAnimation(true);
//       setTimeout(() => {
//         navigate("/home");
//       }, 1200); // Smooth transition to homepage
//     }, 2500); // Display welcome message for 2.5s
//   }, [navigate]);

//   return (
//     <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
//       {/* Background Music */}
//       <audio ref={audioRef} src="/welcome-music.mp3" loop />

//       <motion.div
//         className="flex flex-col items-center"
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <motion.img
//           src="/pageLogo.png"
//           alt="Logo"
//           className="w-40 h-40 mb-4"
//           animate={exitAnimation ? { scale: 20, opacity: 0 } : {}}
//           transition={{ duration: 1 }}
//         />
//         <motion.h1
//           className="text-4xl font-semibold tracking-wide"
//           animate={exitAnimation ? { opacity: 0 } : {}}
//           transition={{ duration: 1 }}
//         >
//           Welcome to the Tax Filling Journey
//         </motion.h1>
//       </motion.div>
//     </div>
//   );
// };

// export default WelcomeScreen;
