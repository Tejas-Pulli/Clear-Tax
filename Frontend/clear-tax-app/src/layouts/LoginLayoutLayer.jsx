import React from "react";
 
const LoginLayoutLayer = ({ children }) => {
  return (
    <div
      className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('../loginImage2.png')" }}
    >
      {/* Overlay for background blur */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
 
      {/* Content (children) */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-30">
        {children}
      </div>
    </div>
  );
};
 
export default LoginLayoutLayer;