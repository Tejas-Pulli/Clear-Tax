// import {
//   FiDollarSign,
//   FiFileText,
//   FiCreditCard,
//   FiPieChart,
//   FiShield,
// } from "react-icons/fi";
// import {
//   MdAttachMoney,
//   MdReceipt,
//   MdHistory,
//   MdPayment,
//   MdSummarize,
// } from "react-icons/md";
// import { AiOutlineFileProtect, AiOutlineFileDone } from "react-icons/ai";
// import { BsBoxArrowInUp } from "react-icons/bs";
// import labels from "../config/labels";

// const SidebarItems = [
//   {
//     name: labels.sidebar.section1.title,
//     icon: <FiDollarSign />,
//     items: [
//       { name: labels.sidebar.section1.row1, path: "/incomeDetails", icon: <MdAttachMoney /> },
//       { name: labels.sidebar.section1.row2, path: "/trackExpenses", icon: <MdReceipt /> },
//     ],
//   },
//   {
//     name: labels.sidebar.section2.title,
//     icon: <FiFileText />,
//     items: [
//       { name: labels.sidebar.section2.row1, path: "/estimateTaxLiability", icon: <FiPieChart /> },
//       // { name: "Tax Filing Form", path: "/generateTaxFilingForm", icon: <AiOutlineFileProtect /> },
//       { name: labels.sidebar.section2.row2, path: "/fileTaxReturn", icon: <AiOutlineFileDone /> },
//       { name: labels.sidebar.section2.row3, path: "/amendTaxReturn", icon: <BsBoxArrowInUp /> },
//     ],
//   },
//   {
//     name: labels.sidebar.section3.title,
//     icon: <FiCreditCard />,
//     items: [
//       { name: labels.sidebar.section3.row1, path: "/trackPayments", icon: <MdPayment /> },
//       // { name: "Submit Payment", path: "/submitPayment", icon: <FiDollarSign /> },
//       { name: labels.sidebar.section3.row2, path: "/calculateRefundLiability", icon: <MdSummarize /> },
//       // { name: "Tax Payment Receipt", path: "/generateTaxPaymentReceipt", icon: <MdReceipt /> },
//       // { name: "Refund Status", path: "/checkRefundStatus", icon: <BsBarChartFill /> },
//       {
//         name: labels.sidebar.section3.row3,
//         path: "/generateTaxRefundCertificate",
//         icon: <AiOutlineFileProtect />,
//       },
//     ],
//   },
//   {
//     name: labels.sidebar.section4.title,
//     icon: <FiPieChart />,
//     items: [
//       { name:labels.sidebar.section4.row1, path: "/generateSummaryReport", icon: <MdSummarize /> },
//       { name: labels.sidebar.section4.row2, path: "/downloadFilingHistory", icon: <MdHistory /> },
//       { name: labels.sidebar.section4.row3, path: "/requestTaxTranscript", icon: <FiShield /> },
//       {
//         name: labels.sidebar.section4.row4,
//         path: "/viewDeductionHistory",
//         icon: <MdHistory />,
//       },
//     ],
//   },

//   // {
//   //   name: "Admin/Advanced Features",
//   //   icon: <FiShield />,
//   //   items: [
//   //     { name: "Track Filing Status", path: "/trackFilingStatus", icon: <BsBarChartFill /> },
//   //     {
//   //       name: "Generate Payment Reminder",
//   //       path: "/generatePaymentReminder",
//   //       icon: <FiCreditCard />,
//   //     },
      
//   //   ],
//   // },
// ];

// export default SidebarItems;


import {
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiPieChart,
  FiShield,
} from "react-icons/fi";
import {
  MdAttachMoney,
  MdReceipt,
  MdHistory,
  MdPayment,
  MdSummarize,
} from "react-icons/md";
import { AiOutlineFileProtect, AiOutlineFileDone } from "react-icons/ai";
import { BsBoxArrowInUp } from "react-icons/bs";

const SidebarItems = [
  {
    name: "Income and Expense",
    icon: <FiDollarSign />,
    items: [
      { name: "Income Details", path: "/incomeDetails", icon: <MdAttachMoney /> },
      { name: "Track Expenses", path: "/trackExpenses", icon: <MdReceipt /> },
    ],
  },
  {
    name: "Tax Management",
    icon: <FiFileText />,
    items: [
      { name: "Tax Liability", path: "/estimateTaxLiability", icon: <FiPieChart /> },
      // { name: "Tax Filing Form", path: "/generateTaxFilingForm", icon: <AiOutlineFileProtect /> },
      { name: "File Tax Return", path: "/fileTaxReturn", icon: <AiOutlineFileDone /> },
      { name: "Tax Amendment", path: "/amendTaxReturn", icon: <BsBoxArrowInUp /> },
    ],
  },
  {
    name: "Payments and Refunds",
    icon: <FiCreditCard />,
    items: [
      { name: "Payments", path: "/trackPayments", icon: <MdPayment /> },
      // { name: "Submit Payment", path: "/submitPayment", icon: <FiDollarSign /> },
      { name: "Tax Refund", path: "/calculateRefundLiability", icon: <MdSummarize /> },
      // { name: "Tax Payment Receipt", path: "/generateTaxPaymentReceipt", icon: <MdReceipt /> },
      // { name: "Refund Status", path: "/checkRefundStatus", icon: <BsBarChartFill /> },
      {
        name: "Refund Certificate",
        path: "/generateTaxRefundCertificate",
        icon: <AiOutlineFileProtect />,
      },
    ],
  },
  {
    name: "Reports and Summaries",
    icon: <FiPieChart />,
    items: [
      { name: "Summary Report", path: "/generateSummaryReport", icon: <MdSummarize /> },
      { name: "Filing History", path: "/downloadFilingHistory", icon: <MdHistory /> },
      { name: "Tax Transcript", path: "/requestTaxTranscript", icon: <FiShield /> },
      {
        name: "Deduction & Credit History",
        path: "/viewDeductionHistory",
        icon: <MdHistory />,
      },
    ],
  },

  // {
  //   name: "Admin/Advanced Features",
  //   icon: <FiShield />,
  //   items: [
  //     { name: "Track Filing Status", path: "/trackFilingStatus", icon: <BsBarChartFill /> },
  //     {
  //       name: "Generate Payment Reminder",
  //       path: "/generatePaymentReminder",
  //       icon: <FiCreditCard />,
  //     },
      
  //   ],
  // },
];

export default SidebarItems;
