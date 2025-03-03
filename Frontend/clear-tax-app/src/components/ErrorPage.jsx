import { motion } from "framer-motion";

const ErrorPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white via-gray-100 to-gray-300 relative overflow-hidden">
      {/* Floating background icons with improved positions */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[
          { id:"1" , icon: "💰", size: "text-9xl", x: -350, y: -250 }, // Top-left
          { id:"2" , icon: "📊", size: "text-8xl", x: 350, y: 250 }, // Bottom-right
          { id:"3" , icon: "🏦", size: "text-7xl", x: -400, y: 300 }, // Bottom-left
          { id:"4" , icon: "💹", size: "text-8xl", x: 400, y: -300 }, // Top-right
        ].map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0.25, scale: 0.8, x: item.x, y: item.y }}
            animate={{ opacity: 0.45, scale: 1.2, x: item.x * -0.8, y: item.y * -0.8 }}
            transition={{ duration: 7 , repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className={`absolute text-gray-300 ${item.size}`}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Main Card with floating glass effect */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="backdrop-blur-md bg-white/90 rounded-3xl shadow-2xl p-12 max-w-lg text-center text-gray-800 border border-gray-200"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
          className="text-5xl font-extrabold text-red-500 mb-4 animate-pulse"
        >
          🚫 Server Error
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg mb-8 leading-relaxed"
        >
          Oops! Our server is currently unavailable. We’re working on it—please try again soon.
        </motion.p>

        {/* Animated Retry Button with better interaction */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#0284c7" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
