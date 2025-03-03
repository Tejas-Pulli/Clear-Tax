import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./provider/AuthProvider";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAsyncError } from "react-router-dom";
import BaseApi from "./services/BaseApi";
import ErrorPage from "./components/ErrorPAge";

function App() {
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    // Check server status on app load
    const checkServer = async () => {
      try {
        await BaseApi.get('/healthChecker/health-check');
        setServerDown(false);
      } catch (error) {
        setServerDown(true);
      }
    };

    checkServer();
  }, []);

  if (serverDown) {
    return <ErrorPage />;
  }

  
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<Test/>}/>
    //   </Routes>
    // </Router>
    <>
      <Toaster/>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  );
}

export default App;
