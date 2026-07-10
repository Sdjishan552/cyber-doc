/* ============================================================
   DocCounter - app.js
   Hash-router SPA. Data lives in localStorage only.
   ============================================================ */
(() => {
  "use strict";

  const DATA_KEY = "doccounter_data_v1";
  const PASS_KEY = "doccounter_admin_pass";
  const SESSION_KEY = "doccounter_admin_session";
  const CHECK_KEY = "doccounter_checks";
  const LANG_KEY = "doccounter_lang";
  const app = document.getElementById("app");

  const SEED = {
    cards: [
      { id: "c_aadhaar", name: "Aadhaar Card", icon: "ID", description: "UIDAI identity document" },
      { id: "c_voter", name: "Voter ID (EPIC)", icon: "VID", description: "Electoral photo identity card" },
      { id: "c_ration", name: "Ration Card", icon: "RC", description: "Public distribution system card" },
      { id: "c_pan", name: "PAN Card", icon: "PAN", description: "Permanent Account Number, Income Tax Dept." },
      { id: "c_passport", name: "Passport", icon: "PP", description: "Ministry of External Affairs" },
      { id: "c_dl", name: "Driving Licence", icon: "DL", description: "RTO / Transport department" },
    ],
    services: [
      { id: "s1", cardId: "c_aadhaar", type: "new", typeLabel: "New Apply", charge: 50, chargeNote: "Counter service charge. UIDAI enrolment itself is free",
        documents: ["Proof of identity (PAN / Passport / existing Voter ID)", "Proof of address (utility bill / bank passbook / rent agreement)", "Proof of date of birth (birth certificate / 10th marksheet)", "One recent passport-size photo", "Mobile number for OTP verification"],
        notes: "Child enrolment (below 5 yrs) needs the parent's Aadhaar and the child's birth certificate. No separate photo needed for the child." },
      { id: "s2", cardId: "c_aadhaar", type: "correction", typeLabel: "Correction / Update", charge: 80, chargeNote: "Counter charge + UIDAI update fee (approx. Rs 50) collected separately",
        documents: ["Original Aadhaar copy (printout or PVC card)", "Proof supporting the correction (address / DOB / name proof as applicable)", "New passport photo, only if photo update is requested", "Mobile number - linked number needed for OTP, or biometric update at centre"],
        notes: "Name or DOB changes beyond a small limit may need a gazette notice or affidavit. Check current UIDAI limits before committing a charge." },

      { id: "s3", cardId: "c_voter", type: "new", typeLabel: "New Apply (Form 6)", charge: 30, chargeNote: "Counter service charge. Enrolment is free at ECI",
        documents: ["Age proof (birth certificate / 10th marksheet / Aadhaar)", "Address proof (Aadhaar / utility bill / rent agreement)", "One recent passport-size photo", "Filled Form 6 (can be done online on the NVSP/Voter Helpline app)"],
        notes: "Applicant must be 18 years or older on the qualifying date." },
      { id: "s4", cardId: "c_voter", type: "correction", typeLabel: "Correction (Form 8)", charge: 30, chargeNote: "Counter service charge",
        documents: ["Existing EPIC (Voter ID) copy", "Proof supporting the correction requested", "One recent passport-size photo, if photo update"],
        notes: "Same Form 8 is used for correction, address change within the same constituency, and marking as PwD." },

      { id: "s5", cardId: "c_ration", type: "new", typeLabel: "New Apply", charge: 100, chargeNote: "Counter charge. State food dept. fee varies by state",
        documents: ["Aadhaar of all family members", "Address proof", "Income certificate", "Passport-size photos of head of family", "Bank passbook copy", "Surrender certificate, if migrated from another state's ration card"],
        notes: "Category (APL / BPL / AAY) depends on the income certificate and local eligibility rules. Verify current state rules." },
      { id: "s6", cardId: "c_ration", type: "correction", typeLabel: "Correction / Member update", charge: 60, chargeNote: "Counter service charge",
        documents: ["Existing ration card", "Aadhaar of the family", "Proof for the specific correction - marriage certificate for addition, death certificate for removal, etc."],
        notes: "" },

      { id: "s7", cardId: "c_pan", type: "new", typeLabel: "New Apply", charge: 120, chargeNote: "Counter charge + NSDL/UTIITSL processing fee",
        documents: ["Aadhaar card", "One recent passport-size photo", "Signature (blank white paper / on screen)", "Date of birth proof (if Aadhaar DOB not usable)"],
        notes: "" },
      { id: "s8", cardId: "c_pan", type: "correction", typeLabel: "Correction", charge: 120, chargeNote: "Counter charge + NSDL/UTIITSL processing fee",
        documents: ["Existing PAN card copy", "Aadhaar card", "Proof supporting the requested change"],
        notes: "" },

      { id: "s9", cardId: "c_passport", type: "new", typeLabel: "New Apply", charge: 150, chargeNote: "Counter charge. Separate MEA passport fee applies",
        documents: ["Aadhaar card", "Address proof", "Birth certificate / 10th marksheet as DOB proof", "One recent passport-size photo (as per photo spec)", "Appointment booking confirmation (Passport Seva)"],
        notes: "" },
      { id: "s10", cardId: "c_passport", type: "correction", typeLabel: "Reissue / Correction", charge: 150, chargeNote: "Counter charge. Separate MEA passport fee applies",
        documents: ["Old passport", "Aadhaar card", "Proof supporting the change (marriage certificate for name change, etc.)", "One recent passport-size photo"],
        notes: "" },

      { id: "s11", cardId: "c_dl", type: "new", typeLabel: "New Apply (Learner's + Permanent)", charge: 150, chargeNote: "Counter charge. Separate RTO fee applies",
        documents: ["Age & address proof (Aadhaar)", "Passport-size photos", "Medical certificate (Form 1A) - required for transport vehicles or applicants above 50", "Learner's licence, before applying for permanent DL"],
        notes: "" },
      { id: "s12", cardId: "c_dl", type: "correction", typeLabel: "Correction / Renewal", charge: 100, chargeNote: "Counter charge. Separate RTO fee applies",
        documents: ["Existing DL copy", "Address proof", "Aadhaar card", "Medical certificate, for renewal above 40 / transport vehicles"],
        notes: "" },
    ],
  };

  const UI = {
    en: {
      brandSub: "Document & Charges Register",
      languageLabel: "Language",
      installApp: "Install app",
      counterAdmin: "Counter admin",
      footer: "Works offline once installed. Data is stored only on this device.",
      counterReference: "Counter reference",
      homeTitle: "What does the customer need?",
      homeIntro: "Pick the card or document. You'll see exactly what's required, and what to charge, for a new application or a correction.",
      searchPlaceholder: "Search e.g. Aadhaar, Ration, PAN...",
      noMatch: "No match",
      noMatchHelp: "Try a different search, or add it from Counter admin.",
      serviceListedOne: "{count} service listed",
      serviceListedMany: "{count} services listed",
      allDocuments: "All documents",
      chooseService: "Choose the service the customer needs.",
      noServices: "No services yet",
      addServiceHelp: "Add New Apply or Correction for {name} from Counter admin.",
      documentOne: "{count} document",
      documentMany: "{count} documents",
      collected: "{done}/{total} collected",
      documentsRequired: "Documents required",
      charges: "Charges",
      serviceCharge: "{label} - service charge",
      noCharge: "No charge",
      notesForCounter: "Notes for the counter",
      resetChecklist: "Reset checklist",
      printSlip: "Print slip",
      shareCustomer: "Share with customer",
      documentsNeeded: "Documents needed:",
      shareCharge: "Service charge:",
      note: "Note:",
      copied: "Copied - paste it in WhatsApp",
      copyFail: "Could not copy. Please select and copy manually.",
      checklistReset: "Checklist reset",
      newApply: "New Apply",
      correction: "Correction",
      service: "Service",
      customService: "Other / custom",
      backCounter: "Back to counter view",
      manageTitle: "Manage documents & charges",
      logout: "Log out",
      cardsTab: "Cards / documents",
      servicesTab: "Services & charges",
      settingsTab: "Settings",
      loggedOut: "Logged out",
      loginIntro: "Enter the admin password to manage cards, services and charges.",
      password: "Password",
      defaultPasswordHint: "Default password is admin123. Change it from Settings after logging in.",
      login: "Log in",
      wrongPassword: "Wrong password",
      changePassword: "Change admin password",
      currentPassword: "Current password",
      newPassword: "New password",
      updatePassword: "Update password",
      passwordUpdated: "Password updated",
      passwordIncorrect: "Current password is incorrect",
      resetAllData: "Reset all data",
      resetHelp: "Restores the built-in list of cards and services. Anything you've added or edited will be lost.",
      restoreDefaults: "Restore defaults",
      restoreConfirm: "This will replace all cards and services with the defaults. Continue?",
      restored: "Restored defaults",
      cardsIntro: "These are the big boxes on the counter home screen.",
      addCard: "Add card / document",
      cardDeleted: "Card deleted",
      deleteCard: "Delete this card?",
      deleteCardLinked: "Delete this card and its {count} service(s)?",
      noCards: "No cards yet",
      noCardsHelp: "Add your first document type.",
      edit: "Edit",
      delete: "Delete",
      editCard: "Edit card",
      addCardTitle: "Add card / document",
      name: "Name",
      namePlaceholder: "e.g. Domicile Certificate",
      icon: "Short icon",
      desc: "Short description",
      descPlaceholder: "e.g. Revenue department",
      cancel: "Cancel",
      saveChanges: "Save changes",
      addCardButton: "Add card",
      nameRequired: "Name is required",
      cardUpdated: "Card updated",
      cardAdded: "Card added",
      allCards: "All cards",
      addService: "Add service",
      noServiceAdminHelp: "Add New Apply or Correction for a card.",
      serviceDeleted: "Service deleted",
      deleteService: "Delete this service?",
      addCardFirst: "Add a card first",
      editService: "Edit service",
      addServiceTitle: "Add service",
      cardDocument: "Card / document",
      serviceType: "Service type",
      labelShown: "Label shown to you",
      labelPlaceholder: "e.g. New Apply, Address Correction, Duplicate Copy",
      documentsField: "Documents required",
      docPlaceholder: "Type a document",
      addDocument: "Add",
      docHint: "Press Enter or tap Add after each document.",
      chargeField: "Service charge (Rs)",
      chargeNote: "Charge note (optional)",
      chargeNotePlaceholder: "e.g. + govt fee extra",
      notesOptional: "Notes for the counter (optional)",
      addDocFirst: "Add at least one document",
      serviceUpdated: "Service updated",
      serviceAdded: "Service added",
      backupTitle: "Backup & transfer",
      backupHelp: "Save all cards, services, documents and charges as an Excel file. Share it over WhatsApp or Gmail, then open the same file on another phone to load everything there.",
      exportExcel: "Export to Excel",
      importExcel: "Import from Excel",
      exportPreparing: "Preparing Excel file...",
      exportShared: "Shared as Excel file",
      exportSaved: "Excel file saved. Share it from your downloads or files app.",
      exportFail: "Could not create the Excel file",
      libMissing: "Excel tool not loaded. Connect to the internet once and reopen the app, then try again.",
      importConfirm: "This will replace all cards and services on this phone with the data from the Excel file. Continue?",
      importReading: "Reading Excel file...",
      importSuccess: "Data imported successfully",
      importFail: "Could not read this file. Make sure it is a DocCounter Excel export.",
      importEmpty: "The Excel file has no cards to import",
      importPickFile: "Choose the Excel file exported from DocCounter (Settings -> Export to Excel).",
    },
    bn: {
      brandSub: "ডকুমেন্ট ও চার্জ রেজিস্টার",
      languageLabel: "ভাষা",
      installApp: "অ্যাপ ইনস্টল",
      counterAdmin: "কাউন্টার অ্যাডমিন",
      footer: "ইনস্টল করার পর অফলাইনেও চলে। ডেটা শুধু এই ডিভাইসেই থাকে।",
      counterReference: "কাউন্টার রেফারেন্স",
      homeTitle: "গ্রাহকের কী প্রয়োজন?",
      homeIntro: "কার্ড বা ডকুমেন্ট বেছে নিন। নতুন আবেদন বা সংশোধনের জন্য কী লাগবে এবং কত চার্জ হবে তা দেখুন।",
      searchPlaceholder: "সার্চ করুন যেমন Aadhaar, Ration, PAN...",
      noMatch: "কিছু পাওয়া যায়নি",
      noMatchHelp: "অন্যভাবে সার্চ করুন, অথবা কাউন্টার অ্যাডমিন থেকে যোগ করুন।",
      serviceListedOne: "{count}টি সার্ভিস আছে",
      serviceListedMany: "{count}টি সার্ভিস আছে",
      allDocuments: "সব ডকুমেন্ট",
      chooseService: "গ্রাহকের প্রয়োজনীয় সার্ভিস বেছে নিন।",
      noServices: "এখনও সার্ভিস নেই",
      addServiceHelp: "{name}-এর জন্য New Apply বা Correction কাউন্টার অ্যাডমিন থেকে যোগ করুন।",
      documentOne: "{count}টি ডকুমেন্ট",
      documentMany: "{count}টি ডকুমেন্ট",
      collected: "{done}/{total} সংগ্রহ হয়েছে",
      documentsRequired: "প্রয়োজনীয় ডকুমেন্ট",
      charges: "চার্জ",
      serviceCharge: "{label} - সার্ভিস চার্জ",
      noCharge: "চার্জ নেই",
      notesForCounter: "কাউন্টারের নোট",
      resetChecklist: "চেকলিস্ট রিসেট",
      printSlip: "স্লিপ প্রিন্ট",
      shareCustomer: "গ্রাহককে শেয়ার",
      documentsNeeded: "যে ডকুমেন্ট লাগবে:",
      shareCharge: "সার্ভিস চার্জ:",
      note: "নোট:",
      copied: "কপি হয়েছে - WhatsApp-এ পেস্ট করুন",
      copyFail: "কপি করা যায়নি। হাতে সিলেক্ট করে কপি করুন।",
      checklistReset: "চেকলিস্ট রিসেট হয়েছে",
      newApply: "নতুন আবেদন",
      correction: "সংশোধন",
      service: "সার্ভিস",
      customService: "অন্যান্য / কাস্টম",
      backCounter: "কাউন্টার ভিউতে ফিরুন",
      manageTitle: "ডকুমেন্ট ও চার্জ ম্যানেজ করুন",
      logout: "লগ আউট",
      cardsTab: "কার্ড / ডকুমেন্ট",
      servicesTab: "সার্ভিস ও চার্জ",
      settingsTab: "সেটিংস",
      loggedOut: "লগ আউট হয়েছে",
      loginIntro: "কার্ড, সার্ভিস ও চার্জ ম্যানেজ করতে অ্যাডমিন পাসওয়ার্ড দিন।",
      password: "পাসওয়ার্ড",
      defaultPasswordHint: "ডিফল্ট পাসওয়ার্ড admin123। লগইনের পর Settings থেকে বদলে নিন।",
      login: "লগ ইন",
      wrongPassword: "পাসওয়ার্ড ভুল",
      changePassword: "অ্যাডমিন পাসওয়ার্ড বদলান",
      currentPassword: "বর্তমান পাসওয়ার্ড",
      newPassword: "নতুন পাসওয়ার্ড",
      updatePassword: "পাসওয়ার্ড আপডেট",
      passwordUpdated: "পাসওয়ার্ড আপডেট হয়েছে",
      passwordIncorrect: "বর্তমান পাসওয়ার্ড ঠিক নয়",
      resetAllData: "সব ডেটা রিসেট",
      resetHelp: "বিল্ট-ইন কার্ড ও সার্ভিস ফিরিয়ে আনবে। আপনার যোগ বা এডিট করা ডেটা মুছে যাবে।",
      restoreDefaults: "ডিফল্ট ফিরিয়ে আনুন",
      restoreConfirm: "সব কার্ড ও সার্ভিস ডিফল্ট দিয়ে বদলে যাবে। চালিয়ে যাবেন?",
      restored: "ডিফল্ট ফিরেছে",
      cardsIntro: "এগুলো কাউন্টার হোম স্ক্রিনের বড় বক্স।",
      addCard: "কার্ড / ডকুমেন্ট যোগ",
      cardDeleted: "কার্ড ডিলিট হয়েছে",
      deleteCard: "এই কার্ড ডিলিট করবেন?",
      deleteCardLinked: "এই কার্ড ও এর {count}টি সার্ভিস ডিলিট করবেন?",
      noCards: "এখনও কার্ড নেই",
      noCardsHelp: "প্রথম ডকুমেন্ট টাইপ যোগ করুন।",
      edit: "এডিট",
      delete: "ডিলিট",
      editCard: "কার্ড এডিট",
      addCardTitle: "কার্ড / ডকুমেন্ট যোগ",
      name: "নাম",
      namePlaceholder: "যেমন Domicile Certificate",
      icon: "ছোট আইকন",
      desc: "ছোট বিবরণ",
      descPlaceholder: "যেমন Revenue department",
      cancel: "বাতিল",
      saveChanges: "সেভ করুন",
      addCardButton: "কার্ড যোগ",
      nameRequired: "নাম দরকার",
      cardUpdated: "কার্ড আপডেট হয়েছে",
      cardAdded: "কার্ড যোগ হয়েছে",
      allCards: "সব কার্ড",
      addService: "সার্ভিস যোগ",
      noServiceAdminHelp: "কোনো কার্ডের জন্য New Apply বা Correction যোগ করুন।",
      serviceDeleted: "সার্ভিস ডিলিট হয়েছে",
      deleteService: "এই সার্ভিস ডিলিট করবেন?",
      addCardFirst: "আগে কার্ড যোগ করুন",
      editService: "সার্ভিস এডিট",
      addServiceTitle: "সার্ভিস যোগ",
      cardDocument: "কার্ড / ডকুমেন্ট",
      serviceType: "সার্ভিস টাইপ",
      labelShown: "আপনার কাছে যে লেবেল দেখাবে",
      labelPlaceholder: "যেমন New Apply, Address Correction, Duplicate Copy",
      documentsField: "প্রয়োজনীয় ডকুমেন্ট",
      docPlaceholder: "ডকুমেন্ট লিখুন",
      addDocument: "যোগ",
      docHint: "প্রতি ডকুমেন্টের পর Enter চাপুন বা যোগ ট্যাপ করুন।",
      chargeField: "সার্ভিস চার্জ (Rs)",
      chargeNote: "চার্জ নোট (ঐচ্ছিক)",
      chargeNotePlaceholder: "যেমন + সরকারি ফি আলাদা",
      notesOptional: "কাউন্টারের নোট (ঐচ্ছিক)",
      addDocFirst: "কমপক্ষে একটি ডকুমেন্ট যোগ করুন",
      serviceUpdated: "সার্ভিস আপডেট হয়েছে",
      serviceAdded: "সার্ভিস যোগ হয়েছে",
      backupTitle: "ব্যাকআপ ও ট্রান্সফার",
      backupHelp: "সব কার্ড, সার্ভিস, ডকুমেন্ট ও চার্জ Excel ফাইল হিসেবে সেভ করুন। WhatsApp বা Gmail দিয়ে শেয়ার করুন, তারপর অন্য ফোনে একই ফাইল খুলে সব ডেটা লোড করুন।",
      exportExcel: "Excel-এ Export করুন",
      importExcel: "Excel থেকে Import করুন",
      exportPreparing: "Excel ফাইল তৈরি হচ্ছে...",
      exportShared: "Excel ফাইল শেয়ার হয়েছে",
      exportSaved: "Excel ফাইল সেভ হয়েছে। আপনার downloads বা files app থেকে শেয়ার করুন।",
      exportFail: "Excel ফাইল তৈরি করা যায়নি",
      libMissing: "Excel টুল লোড হয়নি। একবার ইন্টারনেটে কানেক্ট করে অ্যাপ আবার খুলুন, তারপর চেষ্টা করুন।",
      importConfirm: "এই ফোনের সব কার্ড ও সার্ভিস Excel ফাইলের ডেটা দিয়ে বদলে যাবে। চালিয়ে যাবেন?",
      importReading: "Excel ফাইল পড়া হচ্ছে...",
      importSuccess: "ডেটা import সফল হয়েছে",
      importFail: "এই ফাইল পড়া যায়নি। এটা DocCounter-এর Excel export কিনা দেখুন।",
      importEmpty: "Excel ফাইলে কোনো কার্ড নেই",
      importPickFile: "DocCounter থেকে export করা Excel ফাইল বেছে নিন (Settings -> Export to Excel)।",
    },
  };

  const BN_TEXT = {
    "Aadhaar Card": "আধার কার্ড",
    "Voter ID (EPIC)": "ভোটার আইডি (EPIC)",
    "Ration Card": "রেশন কার্ড",
    "PAN Card": "প্যান কার্ড",
    "Passport": "পাসপোর্ট",
    "Driving Licence": "ড্রাইভিং লাইসেন্স",
    "UIDAI identity document": "UIDAI পরিচয়পত্র",
    "Electoral photo identity card": "নির্বাচনী ছবি-সহ পরিচয়পত্র",
    "Public distribution system card": "পাবলিক ডিস্ট্রিবিউশন সিস্টেম কার্ড",
    "Permanent Account Number, Income Tax Dept.": "ইনকাম ট্যাক্স বিভাগের Permanent Account Number",
    "Ministry of External Affairs": "বিদেশ মন্ত্রক",
    "RTO / Transport department": "RTO / পরিবহন দপ্তর",
    "New Apply": "নতুন আবেদন",
    "Correction": "সংশোধন",
    "Correction / Update": "সংশোধন / আপডেট",
    "New Apply (Form 6)": "নতুন আবেদন (Form 6)",
    "Correction (Form 8)": "সংশোধন (Form 8)",
    "Correction / Member update": "সংশোধন / সদস্য আপডেট",
    "Reissue / Correction": "রিইস্যু / সংশোধন",
    "New Apply (Learner's + Permanent)": "নতুন আবেদন (Learner's + Permanent)",
    "Correction / Renewal": "সংশোধন / রিনিউয়াল",
    "Counter service charge. UIDAI enrolment itself is free": "কাউন্টার সার্ভিস চার্জ। UIDAI enrolment নিজে ফ্রি",
    "Counter charge + UIDAI update fee (approx. Rs 50) collected separately": "কাউন্টার চার্জ + UIDAI আপডেট ফি (প্রায় Rs 50) আলাদা",
    "Counter service charge. Enrolment is free at ECI": "কাউন্টার সার্ভিস চার্জ। ECI-তে enrolment ফ্রি",
    "Counter service charge": "কাউন্টার সার্ভিস চার্জ",
    "Counter charge. State food dept. fee varies by state": "কাউন্টার চার্জ। রাজ্য অনুযায়ী food dept. ফি বদলায়",
    "Counter charge + NSDL/UTIITSL processing fee": "কাউন্টার চার্জ + NSDL/UTIITSL processing fee",
    "Counter charge. Separate MEA passport fee applies": "কাউন্টার চার্জ। MEA passport fee আলাদা",
    "Counter charge. Separate RTO fee applies": "কাউন্টার চার্জ। RTO fee আলাদা",
    "Proof of identity (PAN / Passport / existing Voter ID)": "পরিচয়ের প্রমাণ (PAN / Passport / existing Voter ID)",
    "Proof of address (utility bill / bank passbook / rent agreement)": "ঠিকানার প্রমাণ (utility bill / bank passbook / rent agreement)",
    "Proof of date of birth (birth certificate / 10th marksheet)": "জন্মতারিখের প্রমাণ (birth certificate / 10th marksheet)",
    "One recent passport-size photo": "একটি সাম্প্রতিক passport-size photo",
    "Mobile number for OTP verification": "OTP verification-এর জন্য mobile number",
    "Original Aadhaar copy (printout or PVC card)": "আধার কার্ডের original copy (printout বা PVC card)",
    "Proof supporting the correction (address / DOB / name proof as applicable)": "সংশোধনের প্রমাণ (address / DOB / name proof যেটা প্রযোজ্য)",
    "New passport photo, only if photo update is requested": "Photo update চাইলে নতুন passport photo",
    "Mobile number - linked number needed for OTP, or biometric update at centre": "Mobile number - OTP-এর জন্য linked number, অথবা centre-এ biometric update",
    "Age proof (birth certificate / 10th marksheet / Aadhaar)": "বয়সের প্রমাণ (birth certificate / 10th marksheet / Aadhaar)",
    "Address proof (Aadhaar / utility bill / rent agreement)": "ঠিকানার প্রমাণ (Aadhaar / utility bill / rent agreement)",
    "Filled Form 6 (can be done online on the NVSP/Voter Helpline app)": "ভরা Form 6 (NVSP/Voter Helpline app-এ online করা যায়)",
    "Existing EPIC (Voter ID) copy": "বর্তমান EPIC (Voter ID) copy",
    "Proof supporting the correction requested": "যে সংশোধন চাইছেন তার প্রমাণ",
    "One recent passport-size photo, if photo update": "Photo update হলে একটি সাম্প্রতিক passport-size photo",
    "Aadhaar of all family members": "পরিবারের সকল সদস্যের Aadhaar",
    "Address proof": "ঠিকানার প্রমাণ",
    "Income certificate": "Income certificate",
    "Passport-size photos of head of family": "পরিবারের প্রধানের passport-size photos",
    "Bank passbook copy": "Bank passbook copy",
    "Surrender certificate, if migrated from another state's ration card": "অন্য রাজ্যের ration card থেকে এলে surrender certificate",
    "Existing ration card": "বর্তমান ration card",
    "Aadhaar of the family": "পরিবারের Aadhaar",
    "Proof for the specific correction - marriage certificate for addition, death certificate for removal, etc.": "নির্দিষ্ট সংশোধনের প্রমাণ - addition-এর জন্য marriage certificate, removal-এর জন্য death certificate ইত্যাদি",
    "Aadhaar card": "Aadhaar card",
    "Signature (blank white paper / on screen)": "Signature (blank white paper / on screen)",
    "Date of birth proof (if Aadhaar DOB not usable)": "জন্মতারিখের প্রমাণ (Aadhaar DOB ব্যবহার না হলে)",
    "Existing PAN card copy": "বর্তমান PAN card copy",
    "Proof supporting the requested change": "চাওয়া পরিবর্তনের প্রমাণ",
    "Birth certificate / 10th marksheet as DOB proof": "DOB proof হিসেবে birth certificate / 10th marksheet",
    "One recent passport-size photo (as per photo spec)": "Photo spec অনুযায়ী একটি সাম্প্রতিক passport-size photo",
    "Appointment booking confirmation (Passport Seva)": "Appointment booking confirmation (Passport Seva)",
    "Old passport": "পুরনো passport",
    "Proof supporting the change (marriage certificate for name change, etc.)": "পরিবর্তনের প্রমাণ (name change-এর জন্য marriage certificate ইত্যাদি)",
    "Age & address proof (Aadhaar)": "Age ও address proof (Aadhaar)",
    "Passport-size photos": "Passport-size photos",
    "Medical certificate (Form 1A) - required for transport vehicles or applicants above 50": "Medical certificate (Form 1A) - transport vehicles বা 50-এর বেশি বয়সে লাগে",
    "Learner's licence, before applying for permanent DL": "Permanent DL-এর আগে Learner's licence",
    "Existing DL copy": "বর্তমান DL copy",
    "Medical certificate, for renewal above 40 / transport vehicles": "40-এর বেশি renewal / transport vehicles-এর জন্য medical certificate",
    "Child enrolment (below 5 yrs) needs the parent's Aadhaar and the child's birth certificate. No separate photo needed for the child.": "শিশুর enrolment (5 বছরের নিচে) হলে parent-এর Aadhaar ও শিশুর birth certificate লাগে। শিশুর আলাদা photo লাগে না।",
    "Name or DOB changes beyond a small limit may need a gazette notice or affidavit. Check current UIDAI limits before committing a charge.": "Name বা DOB বেশি বদলাতে হলে gazette notice বা affidavit লাগতে পারে। চার্জ বলার আগে UIDAI-এর current limit দেখে নিন।",
    "Applicant must be 18 years or older on the qualifying date.": "Qualifying date-এ applicant-এর বয়স 18 বছর বা তার বেশি হতে হবে।",
    "Same Form 8 is used for correction, address change within the same constituency, and marking as PwD.": "Correction, একই constituency-তে address change, এবং PwD marking-এর জন্য একই Form 8 লাগে।",
    "Category (APL / BPL / AAY) depends on the income certificate and local eligibility rules. Verify current state rules.": "Category (APL / BPL / AAY) income certificate ও local eligibility rules-এর উপর নির্ভর করে। current state rules দেখে নিন।",
  };

  let lang = localStorage.getItem(LANG_KEY) || "en";
  if (!UI[lang]) lang = "en";

  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hasMojibake = (s) => /[ÂâðÃ]/.test(String(s || ""));
  const l10n = (s) => (lang === "bn" ? (BN_TEXT[s] || s) : s);
  const fmt = (key, values = {}) => {
    const template = (UI[lang] && UI[lang][key]) || UI.en[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
  };
  const rupee = (n) => "Rs " + Number(n || 0).toLocaleString(lang === "bn" ? "bn-IN" : "en-IN");
  const countLabel = (count, oneKey, manyKey) => fmt(count === 1 ? oneKey : manyKey, { count });
  const typeBaseLabel = (type) => ({ new: "New Apply", correction: "Correction", custom: "Service" }[type] || "Service");
  const typeMeta = (type) => ({
    new: { label: fmt("newApply"), cls: "type-new" },
    correction: { label: fmt("correction"), cls: "type-correction" },
    custom: { label: fmt("service"), cls: "type-custom" },
  }[type] || { label: fmt("service"), cls: "type-custom" });
  const serviceLabel = (service) => l10n(service.typeLabel || typeMeta(service.type).label);

  function setLang(nextLang) {
    lang = UI[nextLang] ? nextLang : "en";
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle("lang-bn", lang === "bn");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = fmt(el.dataset.i18n);
    });
    const select = document.getElementById("langSelect");
    if (select) select.value = lang;
  }

  function migrateData(data) {
    let changed = false;
    const seedCards = new Map(SEED.cards.map((c) => [c.id, c]));
    const seedServices = new Map(SEED.services.map((s) => [s.id, s]));
    data.cards = Array.isArray(data.cards) ? data.cards : structuredClone(SEED.cards);
    data.services = Array.isArray(data.services) ? data.services : structuredClone(SEED.services);

    data.cards.forEach((card) => {
      const seed = seedCards.get(card.id);
      if (!seed) return;
      ["name", "icon", "description"].forEach((field) => {
        if (hasMojibake(card[field])) {
          card[field] = seed[field];
          changed = true;
        }
      });
    });

    data.services.forEach((service) => {
      const seed = seedServices.get(service.id);
      if (!seed) return;
      const serviceText = JSON.stringify(service);
      if (hasMojibake(serviceText)) {
        Object.assign(service, structuredClone(seed));
        changed = true;
      }
    });
    return { data, changed };
  }

  const DB = {
    read() {
      try {
        const raw = localStorage.getItem(DATA_KEY);
        if (!raw) {
          localStorage.setItem(DATA_KEY, JSON.stringify(SEED));
          return structuredClone(SEED);
        }
        const migrated = migrateData(JSON.parse(raw));
        if (migrated.changed) localStorage.setItem(DATA_KEY, JSON.stringify(migrated.data));
        return migrated.data;
      } catch (e) {
        console.error("DB read failed", e);
        return structuredClone(SEED);
      }
    },
    write(data) { localStorage.setItem(DATA_KEY, JSON.stringify(data)); },
    uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); },
  };

  /* ----------------------------------------------------------------
     Excel backup / transfer
     Cards + services are written to an .xlsx workbook (via the
     bundled SheetJS library) so a counter operator can share the
     file through WhatsApp/Gmail and load the same data on another
     phone by importing it back.
     ---------------------------------------------------------------- */
  const DOC_SEP = " | ";

  function dataToWorkbook(data) {
    const cardRows = data.cards.map((c) => ({
      id: c.id,
      name: c.name || "",
      icon: c.icon || "",
      description: c.description || "",
    }));
    const serviceRows = data.services.map((s) => ({
      id: s.id,
      cardId: s.cardId,
      type: s.type || "custom",
      typeLabel: s.typeLabel || "",
      charge: Number(s.charge) || 0,
      chargeNote: s.chargeNote || "",
      documents: (s.documents || []).join(DOC_SEP),
      notes: s.notes || "",
    }));
    const wb = XLSX.utils.book_new();
    const wsCards = XLSX.utils.json_to_sheet(cardRows, { header: ["id", "name", "icon", "description"] });
    const wsServices = XLSX.utils.json_to_sheet(serviceRows, { header: ["id", "cardId", "type", "typeLabel", "charge", "chargeNote", "documents", "notes"] });
    wsCards["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 10 }, { wch: 32 }];
    wsServices["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 26 }, { wch: 10 }, { wch: 30 }, { wch: 60 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsCards, "Cards");
    XLSX.utils.book_append_sheet(wb, wsServices, "Services");
    return wb;
  }

  function workbookToData(wb) {
    const cardsSheet = wb.Sheets["Cards"] || wb.Sheets[wb.SheetNames[0]];
    const servicesSheet = wb.Sheets["Services"] || wb.Sheets[wb.SheetNames[1]];
    if (!cardsSheet) return null;
    const cardRows = XLSX.utils.sheet_to_json(cardsSheet, { defval: "" });
    const serviceRows = servicesSheet ? XLSX.utils.sheet_to_json(servicesSheet, { defval: "" }) : [];

    const cards = cardRows
      .filter((r) => String(r.name || "").trim())
      .map((r) => ({
        id: String(r.id || "").trim() || DB.uid("c"),
        name: String(r.name || "").trim(),
        icon: String(r.icon || "").trim(),
        description: String(r.description || "").trim(),
      }));

    const services = serviceRows
      .filter((r) => String(r.cardId || "").trim())
      .map((r) => ({
        id: String(r.id || "").trim() || DB.uid("s"),
        cardId: String(r.cardId || "").trim(),
        type: ["new", "correction", "custom"].includes(String(r.type || "").trim()) ? String(r.type).trim() : "custom",
        typeLabel: String(r.typeLabel || "").trim(),
        charge: Number(r.charge) || 0,
        chargeNote: String(r.chargeNote || "").trim(),
        documents: String(r.documents || "")
          .split(DOC_SEP)
          .map((d) => d.trim())
          .filter(Boolean),
        notes: String(r.notes || "").trim(),
      }));

    return { cards, services };
  }

  async function exportExcelData() {
    if (typeof XLSX === "undefined") { toast(fmt("libMissing")); return; }
    try {
      toast(fmt("exportPreparing"));
      const data = DB.read();
      const wb = dataToWorkbook(data);
      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const stamp = new Date().toISOString().slice(0, 16).replace(/[-T:]/g, "").replace(/(\d{8})(\d{4})/, "$1-$2");
      const filename = `doccounter-backup-${stamp}.xlsx`;
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const file = new File([blob], filename, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "DocCounter backup", text: "DocCounter data export" });
          toast(fmt("exportShared"));
          return;
        } catch (shareErr) {
          if (shareErr && shareErr.name === "AbortError") return; // user cancelled the share sheet
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast(fmt("exportSaved"));
    } catch (e) {
      console.error("Export failed", e);
      toast(fmt("exportFail"));
    }
  }

  function importExcelFile(file) {
    if (typeof XLSX === "undefined") { toast(fmt("libMissing")); return; }
    if (!file) return;
    if (!confirm(fmt("importConfirm"))) return;
    toast(fmt("importReading"));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const parsed = workbookToData(wb);
        if (!parsed || parsed.cards.length === 0) { toast(fmt("importEmpty")); return; }
        DB.write(parsed);
        toast(fmt("importSuccess"));
        renderAdminSettings();
      } catch (err) {
        console.error("Import failed", err);
        toast(fmt("importFail"));
      }
    };
    reader.onerror = () => toast(fmt("importFail"));
    reader.readAsArrayBuffer(file);
  }

  const Checks = {
    all() { try { return JSON.parse(localStorage.getItem(CHECK_KEY) || "{}"); } catch (e) { return {}; } },
    get(serviceId) { return this.all()[serviceId] || {}; },
    set(serviceId, docIndex, val) {
      const all = this.all();
      all[serviceId] = all[serviceId] || {};
      all[serviceId][docIndex] = val;
      localStorage.setItem(CHECK_KEY, JSON.stringify(all));
    },
    clear(serviceId) {
      const all = this.all();
      delete all[serviceId];
      localStorage.setItem(CHECK_KEY, JSON.stringify(all));
    },
  };

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function nav(hash) { location.hash = hash; }

  const Admin = {
    isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "1"; },
    login(pass) {
      const stored = localStorage.getItem(PASS_KEY) || "admin123";
      if (pass === stored) {
        sessionStorage.setItem(SESSION_KEY, "1");
        return true;
      }
      return false;
    },
    logout() { sessionStorage.removeItem(SESSION_KEY); },
    changePass(oldPass, newPass) {
      const stored = localStorage.getItem(PASS_KEY) || "admin123";
      if (oldPass !== stored) return false;
      localStorage.setItem(PASS_KEY, newPass);
      return true;
    },
  };

  function router() {
    setLang(lang);
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);
    if (parts[0] === "admin") return renderAdmin(parts.slice(1));
    if (parts[0] === "card" && parts[1]) return renderCardDetail(parts[1]);
    if (parts[0] === "service" && parts[1]) return renderService(parts[1]);
    return renderHome();
  }
  window.addEventListener("hashchange", router);

  function bindNav(root = app) {
    root.querySelectorAll("[data-nav]").forEach((el) => el.addEventListener("click", () => nav(el.dataset.nav)));
  }

  function renderHome() {
    const db = DB.read();
    app.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">${fmt("counterReference")}</span>
        <h1>${fmt("homeTitle")}</h1>
        <p>${fmt("homeIntro")}</p>
      </div>
      <div class="search-row">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>
        <input id="searchBox" type="search" placeholder="${esc(fmt("searchPlaceholder"))}" autocomplete="off" inputmode="search">
      </div>
      <div id="tileGrid" class="tile-grid"></div>
    `;
    const grid = document.getElementById("tileGrid");
    const search = document.getElementById("searchBox");

    function draw(filter = "") {
      const f = filter.trim().toLowerCase();
      const cards = db.cards.filter((c) => {
        const text = [c.name, c.description, l10n(c.name), l10n(c.description)].join(" ").toLowerCase();
        return !f || text.includes(f);
      });
      if (cards.length === 0) {
        grid.innerHTML = `<div class="empty-state"><h3>${fmt("noMatch")}</h3><p>${fmt("noMatchHelp")}</p></div>`;
        return;
      }
      grid.innerHTML = cards.map((c) => {
        const count = db.services.filter((s) => s.cardId === c.id).length;
        return `
          <button class="tile" data-nav="#/card/${c.id}">
            <span class="tile-icon" aria-hidden="true">${esc(c.icon || "DOC")}</span>
            <span class="tile-copy">
              <h3>${esc(l10n(c.name))}</h3>
              <p class="tile-meta">${esc(l10n(c.description || ""))}</p>
              <span class="tile-count">${countLabel(count, "serviceListedOne", "serviceListedMany")}</span>
            </span>
          </button>`;
      }).join("");
      bindNav(grid);
    }
    draw();
    search.addEventListener("input", () => draw(search.value));
  }

  function renderCardDetail(cardId) {
    const db = DB.read();
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) { nav("#/"); return; }
    const services = db.services.filter((s) => s.cardId === cardId);

    app.innerHTML = `
      <span class="back-link" data-nav="#/">&larr; ${fmt("allDocuments")}</span>
      <div class="page-head">
        <span class="eyebrow">${esc(l10n(card.description || ""))}</span>
        <h1>${esc(card.icon ? card.icon + " " : "")}${esc(l10n(card.name))}</h1>
        <p>${fmt("chooseService")}</p>
      </div>
      <div class="service-grid">
        ${services.map((s) => {
          const tm = typeMeta(s.type);
          return `
            <button class="service-tile" data-nav="#/service/${s.id}">
              <span class="type-badge ${tm.cls}">${esc(serviceLabel(s))}</span>
              <h4>${esc(serviceLabel(s))}</h4>
              <div class="charge-preview">${rupee(s.charge)} - ${countLabel(s.documents.length, "documentOne", "documentMany")}</div>
            </button>`;
        }).join("") || `<div class="empty-state"><h3>${fmt("noServices")}</h3><p>${fmt("addServiceHelp", { name: esc(l10n(card.name)) })}</p></div>`}
      </div>
    `;
    bindNav();
  }

  function renderService(serviceId) {
    const db = DB.read();
    const service = db.services.find((s) => s.id === serviceId);
    if (!service) { nav("#/"); return; }
    const card = db.cards.find((c) => c.id === service.cardId);
    const tm = typeMeta(service.type);
    const checks = Checks.get(serviceId);
    const doneCount = service.documents.filter((_, i) => checks[i]).length;
    const title = serviceLabel(service);

    app.innerHTML = `
      <span class="back-link" data-nav="#/card/${service.cardId}">&larr; ${esc(card ? l10n(card.name) : "Back")}</span>
      <div class="slip">
        <div class="slip-head">
          <div>
            <span class="type-badge ${tm.cls}">${esc(title)}</span>
            <h2>${esc(card ? l10n(card.name) : "")}</h2>
            <div class="card-name">${fmt("collected", { done: doneCount, total: service.documents.length })}</div>
          </div>
          <div class="slip-seal ${tm.cls}">${esc(card ? card.icon : "")}<br>${esc(title.slice(0, 10))}</div>
        </div>

        <div class="slip-perforation"></div>
        <div class="slip-section-title">${fmt("documentsRequired")}</div>
        <ul class="doc-list" id="docList">
          ${service.documents.map((d, i) => `
            <li class="${checks[i] ? "checked" : ""}" data-i="${i}">
              <span class="doc-index">${i + 1}.</span>
              <input type="checkbox" id="doc${i}" ${checks[i] ? "checked" : ""}>
              <label for="doc${i}">${esc(l10n(d))}</label>
            </li>`).join("")}
        </ul>

        <div class="slip-perforation"></div>
        <div class="slip-section-title">${fmt("charges")}</div>
        <div class="charge-row">
          <span class="label">${esc(fmt("serviceCharge", { label: title }))}</span>
          <span class="amount ${Number(service.charge) === 0 ? "free" : ""}">${service.charge ? rupee(service.charge) : fmt("noCharge")}</span>
        </div>
        ${service.chargeNote ? `<p class="charge-note">${esc(l10n(service.chargeNote))}</p>` : ""}

        ${service.notes ? `
          <div class="slip-section-title">${fmt("notesForCounter")}</div>
          <div class="notes-box">${esc(l10n(service.notes))}</div>
        ` : ""}

        <div class="slip-actions">
          <button class="btn btn-outline btn-light" id="resetBtn">${fmt("resetChecklist")}</button>
          <button class="btn btn-primary" id="printBtn">${fmt("printSlip")}</button>
          <button class="btn btn-ghost btn-soft" id="shareBtn">${fmt("shareCustomer")}</button>
        </div>
      </div>
    `;
    bindNav();

    app.querySelectorAll("#docList input[type=checkbox]").forEach((cb, i) => {
      cb.addEventListener("change", () => {
        Checks.set(serviceId, i, cb.checked);
        cb.closest("li").classList.toggle("checked", cb.checked);
        const total = service.documents.length;
        const done = service.documents.filter((_, idx) => Checks.get(serviceId)[idx]).length;
        app.querySelector(".card-name").textContent = fmt("collected", { done, total });
      });
    });
    document.getElementById("resetBtn").addEventListener("click", () => { Checks.clear(serviceId); renderService(serviceId); toast(fmt("checklistReset")); });
    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("shareBtn").addEventListener("click", async () => {
      const lines = [
        `${card ? l10n(card.name) : ""} - ${title}`,
        "",
        fmt("documentsNeeded"),
        ...service.documents.map((d, i) => `${i + 1}. ${l10n(d)}`),
        "",
        `${fmt("shareCharge")} ${service.charge ? rupee(service.charge) : fmt("noCharge")}${service.chargeNote ? " (" + l10n(service.chargeNote) + ")" : ""}`,
        service.notes ? `\n${fmt("note")} ${l10n(service.notes)}` : "",
      ].filter(Boolean).join("\n");
      if (navigator.share) {
        try { await navigator.share({ title: card ? l10n(card.name) : "Document checklist", text: lines }); return; } catch (e) { return; }
      }
      try { await navigator.clipboard.writeText(lines); toast(fmt("copied")); }
      catch (e) { toast(fmt("copyFail")); }
    });
  }

  function renderAdmin(sub) {
    if (!Admin.isLoggedIn()) return renderAdminLogin();
    const tab = sub[0] || "cards";
    if (tab === "cards") return renderAdminCards();
    if (tab === "services") return renderAdminServices(sub[1]);
    if (tab === "settings") return renderAdminSettings();
    return renderAdminCards();
  }

  function adminShell(activeTab, bodyHtml) {
    return `
      <span class="back-link" data-nav="#/">&larr; ${fmt("backCounter")}</span>
      <div class="page-head row-between">
        <div>
          <span class="eyebrow">${fmt("counterAdmin")}</span>
          <h1>${fmt("manageTitle")}</h1>
        </div>
        <button class="btn btn-outline btn-light" id="logoutBtn">${fmt("logout")}</button>
      </div>
      <div class="tabs">
        <button class="tab ${activeTab === "cards" ? "active" : ""}" data-nav="#/admin/cards">${fmt("cardsTab")}</button>
        <button class="tab ${activeTab === "services" ? "active" : ""}" data-nav="#/admin/services">${fmt("servicesTab")}</button>
        <button class="tab ${activeTab === "settings" ? "active" : ""}" data-nav="#/admin/settings">${fmt("settingsTab")}</button>
      </div>
      ${bodyHtml}
    `;
  }

  function wireAdminShell() {
    bindNav();
    document.getElementById("logoutBtn")?.addEventListener("click", () => { Admin.logout(); nav("#/"); toast(fmt("loggedOut")); });
  }

  function renderAdminLogin() {
    app.innerHTML = `
      <div class="login-wrap card-surface">
        <h2>${fmt("counterAdmin")}</h2>
        <p>${fmt("loginIntro")}</p>
        <form id="loginForm" class="form-grid">
          <div class="field">
            <label for="pass">${fmt("password")}</label>
            <input type="password" id="pass" autocomplete="current-password" autofocus>
            <p class="hint">${fmt("defaultPasswordHint")}</p>
          </div>
          <button class="btn btn-primary btn-block" type="submit">${fmt("login")}</button>
        </form>
      </div>
    `;
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (Admin.login(document.getElementById("pass").value)) nav("#/admin/cards");
      else toast(fmt("wrongPassword"));
    });
  }

  function renderAdminSettings() {
    app.innerHTML = adminShell("settings", `
      <div class="card-surface narrow">
        <h3>${fmt("changePassword")}</h3>
        <form id="passForm" class="form-grid">
          <div class="field"><label>${fmt("currentPassword")}</label><input type="password" id="oldPass" required></div>
          <div class="field"><label>${fmt("newPassword")}</label><input type="password" id="newPass" required minlength="4"></div>
          <button class="btn btn-primary btn-block" type="submit">${fmt("updatePassword")}</button>
        </form>
      </div>
      <div class="card-surface narrow mt-16">
        <h3>${fmt("backupTitle")}</h3>
        <p>${fmt("backupHelp")}</p>
        <div class="btn-row">
          <button class="btn btn-primary" id="exportExcelBtn">${fmt("exportExcel")}</button>
          <button class="btn btn-outline btn-light" id="importExcelBtn">${fmt("importExcel")}</button>
        </div>
      </div>
      <div class="card-surface narrow mt-16">
        <h3>${fmt("resetAllData")}</h3>
        <p>${fmt("resetHelp")}</p>
        <button class="btn btn-danger" id="resetDataBtn">${fmt("restoreDefaults")}</button>
      </div>
    `);
    wireAdminShell();
    document.getElementById("exportExcelBtn").addEventListener("click", exportExcelData);
    document.getElementById("importExcelBtn").addEventListener("click", () => {
      toast(fmt("importPickFile"));
      const input = document.getElementById("importFileInput");
      input.value = "";
      input.onchange = () => importExcelFile(input.files[0]);
      input.click();
    });
    document.getElementById("passForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = Admin.changePass(document.getElementById("oldPass").value, document.getElementById("newPass").value);
      if (ok) { toast(fmt("passwordUpdated")); e.target.reset(); } else toast(fmt("passwordIncorrect"));
    });
    document.getElementById("resetDataBtn").addEventListener("click", () => {
      if (confirm(fmt("restoreConfirm"))) {
        localStorage.setItem(DATA_KEY, JSON.stringify(SEED));
        toast(fmt("restored"));
        renderAdminSettings();
      }
    });
  }

  function renderAdminCards() {
    app.innerHTML = adminShell("cards", `
      <div class="row-between admin-tools">
        <p>${fmt("cardsIntro")}</p>
        <button class="btn btn-primary" id="addCardBtn">+ ${fmt("addCard")}</button>
      </div>
      <div class="admin-list" id="cardList"></div>
    `);
    wireAdminShell();

    function draw() {
      const list = document.getElementById("cardList");
      const data = DB.read();
      list.innerHTML = data.cards.map((c) => {
        const count = data.services.filter((s) => s.cardId === c.id).length;
        return `
          <div class="admin-row">
            <div class="info">
              <strong>${esc(c.icon || "DOC")} ${esc(l10n(c.name))}</strong>
              <span>${esc(l10n(c.description || ""))} - ${countLabel(count, "serviceListedOne", "serviceListedMany")}</span>
            </div>
            <div class="actions">
              <button class="icon-btn" data-edit="${c.id}" title="${fmt("edit")}" aria-label="${fmt("edit")}"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg></button>
              <button class="icon-btn" data-del="${c.id}" title="${fmt("delete")}" aria-label="${fmt("delete")}"><svg viewBox="0 0 24 24"><path d="M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Zm3-3h6l1 2h4v2H4V6h4l1-2Z"/></svg></button>
            </div>
          </div>`;
      }).join("") || `<div class="empty-state"><h3>${fmt("noCards")}</h3><p>${fmt("noCardsHelp")}</p></div>`;

      list.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => openCardModal(b.dataset.edit)));
      list.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
        const data = DB.read();
        const linked = data.services.filter((s) => s.cardId === b.dataset.del).length;
        if (!confirm(linked ? fmt("deleteCardLinked", { count: linked }) : fmt("deleteCard"))) return;
        data.cards = data.cards.filter((c) => c.id !== b.dataset.del);
        data.services = data.services.filter((s) => s.cardId !== b.dataset.del);
        DB.write(data);
        toast(fmt("cardDeleted"));
        draw();
      }));
    }
    draw();
    document.getElementById("addCardBtn").addEventListener("click", () => openCardModal(null));

    function openCardModal(cardId) {
      const data = DB.read();
      const editing = cardId ? data.cards.find((c) => c.id === cardId) : null;
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal">
          <h3>${editing ? fmt("editCard") : fmt("addCardTitle")}</h3>
          <form id="cardForm" class="form-grid">
            <div class="field"><label>${fmt("name")}</label><input type="text" id="cName" required value="${editing ? esc(editing.name) : ""}" placeholder="${esc(fmt("namePlaceholder"))}"></div>
            <div class="field"><label>${fmt("icon")}</label><input type="text" id="cIcon" value="${editing ? esc(editing.icon || "") : "DOC"}" maxlength="4"></div>
            <div class="field"><label>${fmt("desc")}</label><input type="text" id="cDesc" value="${editing ? esc(editing.description || "") : ""}" placeholder="${esc(fmt("descPlaceholder"))}"></div>
          </form>
          <div class="modal-actions">
            <button class="btn btn-outline btn-light" id="cancelBtn">${fmt("cancel")}</button>
            <button class="btn btn-primary" id="saveBtn">${editing ? fmt("saveChanges") : fmt("addCardButton")}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector("#cancelBtn").addEventListener("click", () => overlay.remove());
      overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector("#saveBtn").addEventListener("click", () => {
        const name = overlay.querySelector("#cName").value.trim();
        if (!name) { toast(fmt("nameRequired")); return; }
        const data = DB.read();
        if (editing) {
          const c = data.cards.find((item) => item.id === editing.id);
          c.name = name;
          c.icon = overlay.querySelector("#cIcon").value.trim() || "DOC";
          c.description = overlay.querySelector("#cDesc").value.trim();
        } else {
          data.cards.push({ id: DB.uid("c"), name, icon: overlay.querySelector("#cIcon").value.trim() || "DOC", description: overlay.querySelector("#cDesc").value.trim() });
        }
        DB.write(data);
        overlay.remove();
        toast(editing ? fmt("cardUpdated") : fmt("cardAdded"));
        draw();
      });
    }
  }

  function renderAdminServices(filterCardId) {
    const data = DB.read();
    app.innerHTML = adminShell("services", `
      <div class="row-between admin-tools">
        <select id="cardFilter" class="select-pill">
          <option value="">${fmt("allCards")}</option>
          ${data.cards.map((c) => `<option value="${c.id}" ${filterCardId === c.id ? "selected" : ""}>${esc(l10n(c.name))}</option>`).join("")}
        </select>
        <button class="btn btn-primary" id="addServiceBtn">+ ${fmt("addService")}</button>
      </div>
      <div class="admin-list" id="serviceList"></div>
    `);
    wireAdminShell();

    function draw() {
      const data = DB.read();
      const filter = document.getElementById("cardFilter").value;
      const list = document.getElementById("serviceList");
      const services = data.services.filter((s) => !filter || s.cardId === filter);
      list.innerHTML = services.map((s) => {
        const card = data.cards.find((c) => c.id === s.cardId);
        return `
          <div class="admin-row">
            <div class="info">
              <strong>${esc(card ? card.icon : "")} ${esc(card ? l10n(card.name) : "-")} - ${esc(serviceLabel(s))}</strong>
              <span>${rupee(s.charge)} - ${countLabel(s.documents.length, "documentOne", "documentMany")}</span>
            </div>
            <div class="actions">
              <button class="icon-btn" data-edit="${s.id}" title="${fmt("edit")}" aria-label="${fmt("edit")}"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg></button>
              <button class="icon-btn" data-del="${s.id}" title="${fmt("delete")}" aria-label="${fmt("delete")}"><svg viewBox="0 0 24 24"><path d="M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Zm3-3h6l1 2h4v2H4V6h4l1-2Z"/></svg></button>
            </div>
          </div>`;
      }).join("") || `<div class="empty-state"><h3>${fmt("noServices")}</h3><p>${fmt("noServiceAdminHelp")}</p></div>`;

      list.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => openServiceModal(b.dataset.edit)));
      list.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
        if (!confirm(fmt("deleteService"))) return;
        const data = DB.read();
        data.services = data.services.filter((s) => s.id !== b.dataset.del);
        DB.write(data);
        toast(fmt("serviceDeleted"));
        draw();
      }));
    }
    draw();
    document.getElementById("cardFilter").addEventListener("change", draw);
    document.getElementById("addServiceBtn").addEventListener("click", () => openServiceModal(null));

    function openServiceModal(serviceId) {
      const data = DB.read();
      const editing = serviceId ? data.services.find((s) => s.id === serviceId) : null;
      if (data.cards.length === 0) { toast(fmt("addCardFirst")); return; }
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      let docs = editing ? [...editing.documents] : [];
      overlay.innerHTML = `
        <div class="modal">
          <h3>${editing ? fmt("editService") : fmt("addServiceTitle")}</h3>
          <form id="svcForm" class="form-grid">
            <div class="field">
              <label>${fmt("cardDocument")}</label>
              <select id="sCard" required>
                ${data.cards.map((c) => `<option value="${c.id}" ${editing && editing.cardId === c.id ? "selected" : (!editing && c.id === filterCardId) ? "selected" : ""}>${esc(l10n(c.name))}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>${fmt("serviceType")}</label>
              <select id="sType">
                <option value="new" ${editing && editing.type === "new" ? "selected" : ""}>${fmt("newApply")}</option>
                <option value="correction" ${editing && editing.type === "correction" ? "selected" : ""}>${fmt("correction")}</option>
                <option value="custom" ${editing && editing.type === "custom" ? "selected" : ""}>${fmt("customService")}</option>
              </select>
            </div>
            <div class="field"><label>${fmt("labelShown")}</label><input type="text" id="sLabel" value="${editing ? esc(editing.typeLabel || "") : ""}" placeholder="${esc(fmt("labelPlaceholder"))}"></div>
            <div class="field">
              <label>${fmt("documentsField")}</label>
              <div class="chip-input" id="chipInput">
                <input type="text" id="docEntry" placeholder="${esc(fmt("docPlaceholder"))}" enterkeyhint="done" autocomplete="off">
                <button type="button" class="chip-add" id="docAddBtn">${fmt("addDocument")}</button>
              </div>
              <p class="hint">${fmt("docHint")}</p>
            </div>
            <div class="field"><label>${fmt("chargeField")}</label><input type="number" id="sCharge" min="0" step="1" inputmode="numeric" value="${editing ? editing.charge : 0}"></div>
            <div class="field"><label>${fmt("chargeNote")}</label><input type="text" id="sChargeNote" value="${editing ? esc(editing.chargeNote || "") : ""}" placeholder="${esc(fmt("chargeNotePlaceholder"))}"></div>
            <div class="field"><label>${fmt("notesOptional")}</label><textarea id="sNotes">${editing ? esc(editing.notes || "") : ""}</textarea></div>
          </form>
          <div class="modal-actions">
            <button class="btn btn-outline btn-light" id="cancelBtn">${fmt("cancel")}</button>
            <button class="btn btn-primary" id="saveBtn">${editing ? fmt("saveChanges") : fmt("addService")}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      const chipInput = overlay.querySelector("#chipInput");
      const docEntry = overlay.querySelector("#docEntry");
      const docAddBtn = overlay.querySelector("#docAddBtn");

      function addDocFromEntry() {
        const v = docEntry.value.trim();
        if (!v) return;
        docs.push(v);
        docEntry.value = "";
        drawChips();
        docEntry.focus();
      }

      function drawChips() {
        chipInput.querySelectorAll(".chip").forEach((c) => c.remove());
        docs.forEach((d, i) => {
          const chip = document.createElement("span");
          chip.className = "chip";
          chip.innerHTML = `${esc(d)} <button type="button" data-i="${i}" aria-label="Remove">&times;</button>`;
          chipInput.insertBefore(chip, docEntry);
        });
        chipInput.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
          docs.splice(Number(b.dataset.i), 1);
          drawChips();
        }));
      }
      drawChips();

      docEntry.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addDocFromEntry();
        }
      });
      docEntry.addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          addDocFromEntry();
        }
      });
      docAddBtn.addEventListener("click", addDocFromEntry);

      overlay.querySelector("#cancelBtn").addEventListener("click", () => overlay.remove());
      overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector("#saveBtn").addEventListener("click", () => {
        addDocFromEntry();
        if (docs.length === 0) { toast(fmt("addDocFirst")); return; }
        const data = DB.read();
        const type = overlay.querySelector("#sType").value;
        const payload = {
          cardId: overlay.querySelector("#sCard").value,
          type,
          typeLabel: overlay.querySelector("#sLabel").value.trim() || typeBaseLabel(type),
          documents: docs,
          charge: Number(overlay.querySelector("#sCharge").value) || 0,
          chargeNote: overlay.querySelector("#sChargeNote").value.trim(),
          notes: overlay.querySelector("#sNotes").value.trim(),
        };
        if (editing) Object.assign(data.services.find((s) => s.id === editing.id), payload);
        else data.services.push({ id: DB.uid("s"), ...payload });
        DB.write(data);
        overlay.remove();
        toast(editing ? fmt("serviceUpdated") : fmt("serviceAdded"));
        draw();
      });
    }
  }

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById("installBtn");
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      btn.hidden = true;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }, { once: true });
  });

  document.getElementById("langSelect")?.addEventListener("change", (e) => {
    setLang(e.target.value);
    router();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => console.warn("Service worker failed:", err));
    });
  }

  setLang(lang);
  router();
})();
