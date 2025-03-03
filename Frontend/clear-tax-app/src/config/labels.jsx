
const labels = {
  loginPage: {
    pageHeding: {
      title: "Make your tax filing journey easy",
      subtitle: "Login to Your Account",
      formFooter: "Don’t have an account?",
    },
    role: {
      user: "USER",
      admin: "ADMIN",
    },
    email: {
      placeholder: "Email Address",
      label: "Email Address",
    },
    password: {
      placeholder: "Password",
      label: "Password",
    },
    login: {
      button: "Log In",
      loading: "Logging in...",
    },
    register: {
      buttonText: " Sign up here",
    },
    messages: {
      successLogin: "You have successfully logged in.",
      invalidLogin: "Invalid login credentials.",
      requiredFields: "All fields are required.",
      errorOccurred: "An error occurred while logging in.",
    },
  },

  registerPage: {
    heading: {
      label: "User Registration",
      formfooter: "Already registered?",
    },
    toastMessage: {
      buttonChange: "Registering...",
      successRegistration: "Registration Successful! Redirecting to login...",
      errorRegistration: "An error occurred while registering.",
    },
    name: {
      label: "Full Name",
      placeholder: "Enter your full name",
      icon: "FaUserAlt",
      error: "Name is required and should be in a valid format.",
      buttonText: "Register",
      lenghterror:"Max 150 Characters Allowed in Name",
    },
    email: {
      label: "Email Address",
      placeholder: "Enter your email address",
      icon: "FaEnvelope",
      error: "Email is required and should be in a valid format.",
      lenghterror:"Max 100 Characters Allowed in email",
    },
    password: {
      label: "Password",
      placeholder: "Enter your password",
      icon: "FaLock",
      error:
        "Password is required. It must be at least 8 characters, including uppercase, lowercase, numbers, and a special character.",
        lenghterror:"Max 150 Characters Allowed in password",
    },
    confirmPassword: {
      label: "Confirm Password",
      placeholder: "Confirm your password",
      icon: "FaLock",
      error: "Confirm Password is required and must match the password.",
    },
    governmentId: {
      label: "Government ID (PAN)",
      placeholder: "Enter your PAN",
      icon: "FaIdCard",
      error: "PAN is required and should match the format: ABCDE1234Z",
    },
    register: {
      buttonText: " Login here",
    },
  },

  homePage: {
    heading: {
      welcome: "Hi,",
      title: "Let's Start Your Tax Filing Journey",
      subTitle: "Follow the steps to complete your tax filing process.",
    },
    income: {
      step: "income",
      label: "Add Incomes",
    },
    deduction: {
      step: "deductions",
      label: "Add Deductions",
    },
    taxDetails: {
      step: "taxDetails",
      label: "Calculate Liability",
    },
    pdf: {
      step: "pdfGenerated",
      label: "Generate Form",
    },
    status: {
      Filled: "Filled",
      step: "filingStatus",
      label: "Submit Form",
    },
    payment: {
      step: "taxPayment",
      label: "Tax Payment",
    },

    section1: {
      title: "Latest Tax News",
      row1: "Government announces new tax slabs for FY 2025-26",
      row2: "Income tax department to focus more on e-filing this year",
      row3: "Changes in tax treatment for digital assets in the upcoming budget",
    },
    section2: {
      title: "Tax Filing FAQs",
      q: "Q:",
      a: "A:",
      row1: [
        "What is the deadline for filing income tax returns?",
        "The deadline for filing ITR for FY 2024-25 is July 31, 2025.",
      ],
      row2: [
        "Can I claim deductions for home loan interest?",
        "Yes, you can claim deductions under Section 24(b) for home loan interest up to Rs. 2 lakh.",
      ],
      row3: [
        "What documents do I need for tax filing?",
        "You need your PAN, Aadhaar, Form 16, income proofs, and investment proofs.",
      ],
    },
    section3: {
      title: "Tax-related Information",
      subtitle: "Latest Update",
      row1Title: "Income Tax Slabs for FY 2025-26:",
      row1line1: "Up to ₹4 lakh: No tax",
      row1line2: "₹4 lakh to ₹8 lakh: 5%",
      row1line3: "₹8 lakh to ₹12 lakh: 10%",
      row1line4: "₹12 lakh to ₹16 lakh: 15%",
      row1line5: "₹16 lakh to ₹20 lakh: 20%",
      row1line6: "₹21 lakh to ₹24 lakh: 25%",
      row1line7: "Above ₹24 lakh: 30%",
      row2: [
        "Tax Benefits for Salariad Employee:",
        "Tax rebet till ₹12 lakh income means no tax upto ₹12 lakh and additional benefits for 80C and above.",
      ],
      row3: [
        "Tax Benefits for Senior Citizens:",
        "Higher exemption limit for seniors (₹4 lakh) and additional benefits for those aged 80 and above.",
      ],
      row4: [
        "Section 80C Deductions:",
        "Investments in PPF, EPF, and life insurance premiums qualify for deductions up to ₹2 lakh.",
      ],
    },
    section4: {
      title: "Tax Tips for the Current Year",
      row1: [
        "Tip 1:",
        "Invest in tax-saving instruments like PPF, EPF, and NPS to maximize deductions under Section 80C.",
      ],
      row2: [
        "Tip 2:",
        "Don’t forget to claim deductions for medical expenses under Section 80D if applicable.",
      ],
      row3: [
        "Tip 3:",
        "Consider shifting to tax-efficient investments such as equity-linked savings schemes (ELSS).",
      ],
      row4: [
        "Tip 4:",
        "Keep track of your TDS and ensure proper documentation to avoid discrepancies during filing.",
      ],
      row5: [
        "Tip 5:",
        "Explore the benefits of tax-free bonds for steady returns and reduced tax burden.",
      ],
    },
  },

  footer: {
    title: "© 2025 ClearTax. All Rights Reserved.",
  },

  navbar: {
    boolean: {
      true: "true",
    },
    tokens: {
      auth: "authToken",
      email: "userEmail",
      amendmnet: "amendment",
      notificationRead: "notificationRead",
    },
    status: {
      pendingStatus: "Pending",
      errrorStatus: "Error fetching payment status:",
      penidngRefund: "Error Fetching refund:",
    },
    toast: {
      logOutLoading: "Logging out...",
      successLogin: "You have successfully logged out.",
    },
    notification: {
      title: "Notifications",
      noTitle: "No notifications",
      paymentNotification:
        "Your tax payment is pending. Please make the payment.",
      refundNotification: "Your tax refund is pending",
    },
    profile: {
      title: "Profile",
      settings: "Settings",
      logout: "Logout",
    },
    modal: {
      title: "Are you sure you want to log out?",
      yes: "Logout",
      cancle: "Cancel",
    },
  },

  sidebar: {
    section1: {
      title: "Income and Expense",
      row1: "Income Details",
      row2: "Track Expenses",
    },
    section2: {
      title: "Tax Managment",
      row1: "Tax Liability",
      row2: "File Tax Return",
      row3: "Tax Amendment",
    },
    section3: {
      title: "Payments and Refunds",
      row1: "Payments",
      row2: "Tax Refund",
      row3: "Refund Certificate",
    },
    section4: {
      title: "Reports and Summaries",
      row1: "Summary Report",
      row2: "Filing History",
      row3: "Tax Transcript",
      row4: "Deduction & Credit History",
    },
  },

  addincome: {
    email: "userEmail",
    amendment:"amendment",
    confirmationMessage:"Are You Sure ?",
    confirmationSubMessage:"You have unsaved changes. You want to discard them ?",
    heading:{
      title: "Incomes",
      backButton:"back",
      cancel:"Cancle",
      source:"Source",
      select:"Select",
      amount:"Amount",
      date:"Date",
      save:"Save",
      no:"No",
      yes:"Yes",
      
    },
    category: {
      c1: { name: "Salary", description: "Income from your job", icon: "💼",},
      c2: { name: "Business", description: "Income from your business", icon: "🏢",},
      c3: { name: "Rental", description: "Income from rental properties", icon: "🏠",},
      c4: { name: "Capital Gains", description: "Income from capital gains", icon: "📈",},
      c5: { name: "Interest", description: "Income from investments", icon: "💰", },
      c6: { name: "Other Incomes", description: "Other sources of income", icon: "📝",},
    },
    modal: {
      title: "You have unsaved changes. Are you sure you want to discard them and go back?",
    },
    toast: {
      adderror: "Please add the data first!",
      success: "Income data submitted successfully!",
      failError: "Failed to submit income data. Please try again.",
      tryAgain: "An error occurred while submitting the data. Please try again.",
     },
     validation:{
      validAmount:"Amount must be a positive number.",
      validIncome:"Income data is required.",
      validDate:"Income date cannot be in the future.",
      validCategory:"Category is required.",
      positiveAmount:"Amount must be a positive number.",
      requiredDate:"Income date is required.",
      requiredField:"Please fill in all required fields.",
      oneEntry:"Please add at least one income source before submitting.",
      sameYear:"All income entries must be for the same year.", 
     },
  },

  adddeduction: {
    email: "userEmail",
    amendment:"amendment",
    heading:{
      title: "Deductions",
      backButton:"back",
      cancel:"Cancel",
      type:"Type",
      select:"Select",
      amount:"Amount",
      date:"Date",
      save:"Save",
      no:"No",
      yes:"Yes",
      
    },
    category: {
      c1:{
        name: "Home Loan Interest",
        description: "Interest paid on your home loan",
        icon: "🏡",
      },
      c2:{
        name: "Medical Expenses",
        description: "Expenses related to your health care",
        icon: "💊",
      },
      c3:{
        name: "Charitable Donations",
        description: "Donations made to charitable organizations",
        icon: "🎗️",
      },
      c4:{
        name: "Education Expenses",
        description: "Expenses for education and learning",
        icon: "🎓",
      },
      c5:{
        name: "Retirement Contributions",
        description: "Contributions made to retirement funds",
        icon: "💼",
      },
      c6:{
        name: "Other Deductions",
        description: "Other types of deductions not listed",
        icon: "📜",
      },
    },
    modal: {
      title: "You have unsaved changes. Are you sure you want to discard them and go back?",
    },
    toast: {
      adderror: "Please add the data first!",
      success: "Deduction data submitted successfully!",
      failError: "Failed to submit deduction data. Please try again.",
      tryAgain: "An error occurred while submitting the data. Please try again.",
     },
     validation:{
      validAmount:"Amount must be a positive number.",
      validDeduction:"Deduction data is required.",
      validDate:"Deduction date cannot be in the future.",
      validCategory:"Category is required.",
      positiveAmount:"Amount must be a positive number.",
      requiredDate:"Deduction date is required.",
      requiredField:"Please fill in all required fields.",
      oneEntry:"Please add at least one deduction source before submitting.",
      sameYear:"All deduction entries must be for the same year.", 
     },
  },

  incomeDetails:{
    email:"userEmail",
  pageTitle: "Income Details",
  amendment:"amendment",
  userFetchError:"Error fetching user data. Please try again later.",
  searchPlaceholder: "Search Income Source...",
  allYearsOption: "All Years",
  addIncomeButton: "Add",
  incomeSource:"Income Source",
  amount:"Amount",
  date:"Date",
  actions:"Actions",
  filledStatus:"Filled",
  addIncomeDisabledTooltip: "Cannot add income after tax filing.",
  editIncomeTooltip: "Edit this income entry.",
  deleteIncomeTooltip: "Delete this income entry.",
  restrictedAction: "Restricted",
  editRestrictedMessage: "You can only edit incomes from the current year.",
  deleteRestrictedMessage: "You can only delete incomes from the current year.",
  deleteConfirmationTitle: "Are You Sure? This action cannot be undone!",
  deleteSuccessMessage: "Income Deleted! The income entry has been deleted.",
  deleteErrorMessage: "Failed to delete income. Please try again.",
  updateSuccessMessage: "Income details have been successfully updated.",
  updateErrorMessage: "Failed to save changes. Please try again.",
  noIncomesAvailable: "No Incomes are Available...!",
  previousPage: "Previous",
  nextPage: "Next",
  page: "Page",
  confirmTitle: "Are You Sure ?",
  no:"No",
  yes:"Yes",
  pageInfo: (current, total) => `Page ${current} of ${total}`,
  },

  taxCalculation :{
    taxLiability: {
      title: "Tax Liability",
      grossIncome: "Gross Income",
      totalDeductions: "Total Deductions",
      taxableIncome: "Taxable Income",
      taxLiability: "Tax Liability",
      calculateButton: "Check Liability",
      submitAmendment: "Submit Amendment",
    },
    taxHistory: {
      title: "Tax History",
      year: "Year",
      grossIncome: "Gross Income",
      deductions: "Deductions",
      taxableIncome: "Taxable Income",
      taxLiability: "Tax Liability",
      amendment: "amendment",
      Amendment:"Amendment",
      previous: "Previous",
      next: "Next",
    },
    loading: {
      user: "Loading user data...",
      taxData: "Loading tax data...",
    },
    error: {
      user: "Error fetching user details: ",
      taxData: "Error fetching tax data: ",
      invalidResponse: "Received invalid response from tax calculation.",
      requiredData: "Please add your income and deduction details for the current year.",
      calculationError:"Error calculating tax liability: ",
      missingIncomes: "Income Details are missing..!",
      missingDeductions: "Deductions deatils are missing..!",
    },
    success: {
      taxCalculated: "Tax Liability Calculated and Saved Successfully!",
    },
  },  

  welcomeScreen:{
    title: "Welcome to the Tax Filling Journey",
  },

  fileTaxReturnPage:{
    userEmail:"userEmail",

    heading:{
      title: "File Tax Return - ",
      subtitle: "Filing Progress",
      step1:"Tax Details",
      step2:"Generate Form",
      step3:"Submit Tax Form",
      step4:"Tax Form Verified",
      pageLabel1:"Your tax for ",
    },

    status:{
      notProcessed:"Not Processed",
      pending:"Pending",
      filled : "Tax Filed!",
    },
    error:{
      emailError:"ser email not found. Please log in again.",
      failedDataFetch:"Failed to fetch data.",
      pdfError:"Error generating PDF.",
      taxSubmitError:"Error submitting tax return."
    },
    toast:{
      requiredTaxCalculation:"Please complete tax calculation first before generating the PDF.",
      pdfSuccessMessage:"Your tax filing PDF has been generated successfully.",
      requiredPdf:"Please complete tax calculation first before submitting your tax return",
      taxSubmitSuccessMessage:"Your tax return has been submitted successfully.",
    },
  },
};
  
  export default labels;
  