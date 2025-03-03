import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import UserProfilePage from "../pages/UserProfilePage";
import IncomeDetailsPage from "../pages/IncomeDetailsPage";
import DeductionDetailsPage from "../pages/DeductionDetailsPage";
import TaxCalculationPage from "../pages/TaxCalculationPage";
import ProtectedRoute from "./ProtectedRoute";
import FileTaxReturnPage from "../pages/FileTaxReturnPage";
import AddIncome from "../components/AddIncome";
import AddDeduction from "../components/AddDeductions";
import EditIncome from "../components/EditIncome";
import TrackPaymentsPage from "../pages/TrackPaymentsPage";
import AmendTaxPage from "../pages/AmendTaxPage";
import SummaryReportPage from "../pages/SummaryReportPage";
import TaxFillingHistory from "../pages/TaxFillingHistory";
import TaxTranscriptPage from "../pages/TaxTranscriptPage";
import TaxRefundCertificatePage from "../pages/TaxRefundCertificatePage";
import TaxRefundPage from "../pages/TaxRefundPage";
import DeductionAndCreditHistory from "../pages/DeductionAndCreditHistory";
import WelcomeScreen from "../components/WelcomeScreen";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incomeDetails"
          element={
            <ProtectedRoute>
              <IncomeDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trackExpenses"
          element={
            <ProtectedRoute>
              <DeductionDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estimateTaxLiability"
          element={
            <ProtectedRoute>
              <TaxCalculationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fileTaxReturn"
          element={
            <ProtectedRoute>
              <FileTaxReturnPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-income"
          element={
            <ProtectedRoute>
              <AddIncome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-deduction"
          element={
            <ProtectedRoute>
              <AddDeduction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-income"
          element={
            <ProtectedRoute>
              <EditIncome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trackPayments"
          element={
            <ProtectedRoute>
              <TrackPaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/amendTaxReturn"
          element={
            <ProtectedRoute>
              <AmendTaxPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generateSummaryReport"
          element={
            <ProtectedRoute>
              <SummaryReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/downloadFilingHistory"
          element={
            <ProtectedRoute>
              <TaxFillingHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requestTaxTranscript"
          element={
            <ProtectedRoute>
              <TaxTranscriptPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generateTaxRefundCertificate"
          element={
            <ProtectedRoute>
              <TaxRefundCertificatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calculateRefundLiability"
          element={
            <ProtectedRoute>
              <TaxRefundPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/viewDeductionHistory"
          element={
            <ProtectedRoute>
              <DeductionAndCreditHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/welcomeScreen"
          element={
            <ProtectedRoute>
              <WelcomeScreen />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
