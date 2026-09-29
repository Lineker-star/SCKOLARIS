// English knowledge base for the SCKOLARIS assistant — mirrors
// chatbotKnowledge.fr.js entry for entry (same order, same role logic), but
// with English keywords: the matching only works if the keywords are in the
// language the visitor is actually typing in, so this can't just be a
// translated *answer* list — the search terms themselves must be English.
export const knowledgeBase = [
  // --- Greetings / meta ---
  {
    keywords: [['hello'], ['hi'], ['good', 'evening'], ['hey']],
    answer:
      "Hello! I'm the SCKOLARIS assistant, the Universite ZTF digital library. I can explain in detail how to search, read, and download a document, manage your account, or (depending on your role) deposit a course or administer the platform. Ask away.",
  },
  {
    keywords: [['thanks'], ['thank', 'you']],
    answer: "You're welcome! Feel free to ask if you have another question, even a small detail.",
  },
  {
    keywords: [['who', 'are', 'you'], ['what', 'can', 'you', 'do'], ['what', 'are', 'you', 'for'], ['assistant']],
    answer:
      "I'm the assistant built into SCKOLARIS. I answer from a list of known topics about how the platform works — search, reading, downloading, accounts, depositing materials, administration depending on your role. I'm not a general-purpose AI: for anything outside SCKOLARIS, or a specific issue not covered here, the Contact page (biblio@iu-ztf.cm) will put you in touch with a real person.",
  },

  // --- Search / catalog ---
  {
    keywords: [
      ['search', 'book'],
      ['find', 'book'],
      ['search', 'document'],
      ['catalog'],
      ['how', 'search'],
      ['filter'],
    ],
    answer:
      "To search for a document: open \"Catalog\" from the menu, type a word from the title or author's name in the search bar, then narrow it down if needed with the two Domain and Subdomain dropdowns (the second fills in once a domain is chosen). Click a result to open its full page: summary, author, domain, and the \"Read online\" / \"Download\" buttons.",
  },
  {
    keywords: [['domain'], ['subdomain'], ['classify', 'subject'], ['category', 'document']],
    answer:
      "Each document belongs to a subdomain, itself attached to a domain (for example: domain \"Health Sciences\" › subdomain \"General Medicine\"). This two-level organization is used to filter the catalog. It's managed by administrators from the \"Domains\" page — creating, renaming, or deleting is only possible if the subdomain no longer contains any documents.",
  },

  // --- Reading ---
  {
    keywords: [
      ['read', 'online'],
      ['online', 'reading'],
      ['open', 'book'],
      ['how', 'read'],
      ['view', 'document'],
    ],
    answer:
      "On a document's page, the \"Read online\" button opens it directly in the page, without downloading it to your device and without requiring you to already have it in your library — you see the document exactly as it was published, original layout and images included (not just reformatted text). An internet connection is needed for this live reading, unless the document has already been downloaded into \"My library\", in which case it stays readable offline.",
  },
  {
    keywords: [['blank', 'page'], ['not', 'loading'], ['reading', 'error'], ['unable', 'load']],
    answer:
      "If a document doesn't display: first check your internet connection (reading a non-downloaded document online needs it). If the problem persists across several documents, try reloading the page; if one specific document consistently fails, report it via the Contact page with its title — it may be an issue specific to that file.",
  },

  // --- Downloading / offline library ---
  {
    keywords: [['download', 'document'], ['downloading'], ['how', 'download']],
    answer:
      "The \"Download\" button on a document's page saves it into \"My library\" and makes it available offline on this device. Downloading requires a validated account (not just pending) — otherwise the button returns an error explaining that validation is required.",
  },
  {
    keywords: [
      ['offline'],
      ['without', 'connection'],
      ['no', 'internet'],
      ['sync'],
      ['several', 'devices'],
      ['same', 'account', 'other'],
    ],
    answer:
      "Documents downloaded into \"My library\" remain readable without an internet connection on the device they were downloaded on. Your library syncs automatically across all your devices connected to the same account (website, mobile app, desktop app): whatever you download on one appears on the others as soon as they reconnect, and whatever you remove on one side also disappears from the others.",
  },
  {
    keywords: [['my', 'library'], ['remove', 'library'], ['delete', 'download']],
    answer:
      "\"My library\" lists every document you've downloaded, with offline access. You can remove one at any time from this screen — it will also be removed from your other devices the next time they sync.",
  },

  // --- Account: registration, login, password ---
  {
    keywords: [['create', 'account'], ['registration'], ['sign', 'up'], ['register'], ['new', 'account']],
    answer:
      "From the home page, tap \"Sign up\". Two chips, \"Student\" / \"Teacher\", let you pick your role — this choice changes one detail of the form: the registration number stays required for a student, but becomes optional for a teacher (Universite ZTF doesn't systematically assign one to teaching staff). Everything else (name, email, password, ID photo) is the same for both. An internet connection is needed to create an account. Your account is then created with \"pending\" status — even for a teacher, see below for what happens next.",
  },
  {
    keywords: [['log', 'in'], ['how', 'to', 'login'], ['sign', 'in']],
    answer:
      "Logging in needs your password plus either your registration number or your email address — both work the same way. This mainly matters for a teacher without a registration number (optional at sign-up): they log in with their email instead.",
  },
  {
    keywords: [
      ['account', 'pending'],
      ['account', 'validation'],
      ['validate', 'account'],
      ['how', 'long', 'account'],
      ['why', 'pending'],
    ],
    answer: "A newly created account (student or teacher) stays \"pending\" until it is validated by an Universite ZTF administrator. While pending, you can browse the catalog, but downloading and depositing documents remain blocked.",
    roles: {
      teacher:
        "New accounts (student or teacher) stay \"pending\" until validated by an administrator — as a teacher, you cannot validate or reject an account yourself, that action is reserved for administrators.",
      admin:
        "New accounts (student or teacher) stay \"pending\" until validated. From \"Pending accounts\", you can validate or reject them. A rejection is final and irreversible — the account is then banned from the system, no new validation is possible even later. You can also manage all accounts (including changing a role, deactivating/reactivating) from \"Users\". In every case (validation, rejection, deactivation, reactivation), the user automatically receives an email at their primary address about the change.",
    },
  },
  {
    keywords: [['forgot', 'password'], ['lost', 'password'], ['reset', 'password']],
    answer: "On the login screen, the \"Forgot password\" link lets you reset it by email.",
  },
  {
    keywords: [['change', 'password'], ['edit', 'profile'], ['profile', 'photo'], ['avatar'], ['secondary', 'email']],
    answer:
      "From \"Profile\" in the menu, you can edit your name, your program, add a secondary email, change your profile photo, and update your password.",
  },
  {
    keywords: [['account', 'deactivated'], ['account', 'blocked'], ['why', 'blocked']],
    answer: "An account deactivated by an administrator can no longer log in or perform any action requiring a validated account (downloading, depositing...) until it is reactivated.",
    roles: {
      teacher:
        "A deactivated account can no longer do anything requiring a validated account. As a teacher, you don't manage account deactivation — that's reserved for administrators, via \"Users\".",
      admin:
        "You can deactivate or reactivate an account from its page in \"Users\" (you cannot deactivate your own account). Once deactivated, the user is blocked as of their next action — even if already logged in — until reactivated. Unlike a rejection, a deactivation is reversible.",
    },
  },
  {
    keywords: [['role'], ['student', 'teacher'], ['account', 'difference'], ['permission'], ['account', 'rights']],
    answer:
      "SCKOLARIS has three roles: student (browse the catalog, read and download, manage their personal library), teacher (in addition, deposit course materials and manage their own deposits, validate/reject pending accounts), and administrator (in addition, manage all accounts and their roles, manage domains/subdomains, moderate the whole catalog, view statistics).",
  },
  {
    keywords: [['registration', 'number', 'format'], ['student', 'id', 'format'], ['invalid', 'registration'], ['registration', 'number', 'example']],
    answer:
      "The registration number follows a fixed official format: 2 digits (enrollment year) + 3 letters (program code) + 3 digits (sequential number), for example \"26SWE001\". A registration number that doesn't match this exact form is rejected at sign-up — the error message under the field explains precisely what's wrong. Required for a student ; optional for a teacher, but still checked against this format if provided anyway.",
  },
  {
    keywords: [['password', 'rule'], ['password', 'security'], ['invalid', 'password'], ['password', 'format'], ['password', 'rejected']],
    answer:
      "A password must contain at least 4 letters, 3 digits and 1 symbol (a character that's neither a letter nor a digit, like \"!\" or \"-\") — order doesn't matter. Those three combined minimums naturally require at least 8 characters. This rule applies at sign-up, when resetting a password by email, and when changing a password from the profile page.",
  },
  {
    keywords: [['id', 'photo'], ['photo', 'required'], ['photo', '4x4'], ['photo', 'sign-up'], ['no', 'photo']],
    answer:
      "An ID-style photo (4x4 format, like for an official document) is required to create an account — sign-up is blocked until a photo is provided. Two ways to provide it: \"Take a photo\" (opens the camera) or \"From library\" (picks an existing image) — each only asks for its matching permission at the moment you choose it. This photo directly becomes the account's profile photo, editable afterwards from \"Profile\". Maximum size: 2 MB.",
  },
  {
    keywords: [['change', 'language'], ['english', 'french'], ['switch', 'language'], ['translation']],
    answer:
      "SCKOLARIS is available in French and English. The globe icon (in the sidebar) opens a menu to choose the language — the whole interface updates instantly. The choice is remembered on the device.",
  },
  {
    keywords: [['dark', 'mode'], ['light', 'mode'], ['theme'], ['app', 'appearance']],
    answer:
      "A button (usually next to the language selector) switches the app between light and dark appearance. The choice is remembered on the device.",
  },
  {
    keywords: [['user', 'guide'], ['tutorial'], ['how', 'to', 'use'], ['user', 'manual']],
    answer:
      "A detailed step-by-step user guide (including for administration) is available on the SCKOLARIS website, accessible with the same account.",
  },

  // --- Content deposit (teacher / admin) ---
  {
    keywords: [['deposit'], ['upload', 'material'], ['deposit', 'course'], ['add', 'document'], ['publish', 'document']],
    answer:
      "Depositing materials is reserved for teachers and administrators — a student account doesn't see this option.",
    roles: {
      student:
        "Depositing documents is reserved for teachers and administrators. As a student, you cannot deposit material, but you can report a missing or problematic document via the Contact page.",
      teacher:
        "From \"Deposit a course\", fill in the title, choose the subdomain, add a summary, select the file (PDF, up to 500 MB) and, if you wish, a cover image. You remain responsible for the deposited content, including copyright. You'll then find all your deposits in \"My deposits\".",
      admin:
        "From \"Deposit a course\", fill in the title, choose the subdomain, add a summary, select the file (PDF, up to 500 MB) and, if you wish, a cover image. As an administrator, you can also edit or delete any document in the catalog, not just your own, from its page.",
    },
  },
  {
    keywords: [['my', 'deposits'], ['edit', 'deposit'], ['delete', 'deposit']],
    answer:
      "\"My deposits\" lists the materials you've deposited. You can edit their information (title, subdomain, summary, file, cover) or request deletion from this screen — deleting a document already live must be approved by an administrator, it is not immediate.",
  },
  {
    keywords: [['deletion', 'request'], ['delete', 'permanently']],
    answer: "A deletion request concerns a document already live: it must be approved by an administrator before the document actually disappears from the catalog.",
    roles: {
      admin:
        "Deletion requests sent by teachers appear in \"Deletion requests\". You can review each request there (document concerned, teacher, date) and approve or reject it.",
    },
  },

  // --- Administration (domains, users, stats) ---
  {
    keywords: [['manage', 'users'], ['user', 'list'], ['change', 'role'], ['promote']],
    answer: "Managing user accounts (full list, search, role changes, deactivation) is reserved for administrators.",
    roles: {
      admin:
        "From \"Users\", you have the full list of accounts with search by name/registration number and filters by role or status. Each account's page lets you change its role, deactivate/reactivate it, and shows its download history.",
    },
  },
  {
    keywords: [['manage', 'domain'], ['create', 'domain'], ['add', 'subdomain'], ['delete', 'domain'], ['rename', 'domain']],
    answer: "Creating/editing/deleting domains and subdomains is reserved for administrators, from the \"Domains\" page.",
    roles: {
      admin:
        "From \"Domains\", the \"+ New domain\" button creates one ; on each domain, the pencil icon renames it, the trash icon deletes it, and \"+ Add subdomain\" creates one under it. Important rule: a domain that still has subdomains can't be deleted, nor can a subdomain that still has documents — they must be moved or removed first, so no document is ever left orphaned.",
    },
  },
  {
    keywords: [['statistics'], ['data', 'analysis'], ['admin', 'dashboard'], ['admin', 'chart']],
    answer: "The Statistics page (computed in the R language) is reserved for administrators: downloads and reads per day, users currently online, new registrations, account breakdown, and catalog by domain.",
    roles: {
      admin:
        "The \"Statistics\" page shows platform activity over the last 90 days in charts: downloads, online reads, registrations and active users per day, who is online right now, the account breakdown by status, and the exact number of documents per domain/subdomain. The \"See conclusions in plain language\" button at the top of this page translates all these numbers into simple sentences, no jargon — handy for a quick overview without reading the charts.",
    },
  },

  // --- Mobile / desktop applications ---
  {
    keywords: [
      ['mobile', 'app'],
      ['desktop', 'app'],
      ['download', 'app'],
      ['apk'],
      ['pc', 'setup'],
      ['install', 'app'],
      ['android'],
      ['computer'],
    ],
    answer:
      "The Android and Windows apps are available from \"Download the app\" in the menu. They log in with the same account and show the same library as the website — whatever you download on one appears on the others. On Android, a terms-of-use screen appears on first launch; on Windows, the installer shows a license agreement to accept before continuing.",
    roles: {
      admin:
        "The Android and Windows apps are available from \"Download the app\". As an administrator, you also see the publishing controls for each platform: enter a version number (X.Y.Z format), pick the file (.exe or .apk) and tap \"Publish\" — a new upload replaces the previous installer, there is no version history. The \"Delete\" button removes a published installer. Devices already installed automatically detect the new version at their next launch.",
    },
  },

  // --- Privacy / legal ---
  {
    keywords: [['cookie'], ['privacy'], ['personal', 'data'], ['audience', 'tracking']],
    answer:
      "SCKOLARIS only collects the data necessary for your account and library to work. Audience tracking (to know how many people visit the site) is optional: you choose to accept or decline it via the banner shown at the bottom of the page, and you can change your mind at any time via \"Manage cookies\" in the footer. Full details are in the privacy policy.",
  },
  {
    keywords: [['terms', 'use'], ['legal', 'notice'], ['copyright'], ['tos']],
    answer:
      "The terms of use, privacy policy, and legal notice are accessible from the links at the bottom of every page on the site.",
  },

  // --- Contact ---
  {
    keywords: [['contact'], ['human', 'help'], ['talk', 'someone'], ['technical', 'issue'], ['bug'], ['report']],
    answer:
      "For personalized help or to report a specific issue (missing document, technical error...), use the \"Contact\" page or write directly to biblio@iu-ztf.cm — a real person will get back to you.",
  },
]

export const fallbackAnswer =
  "I don't have a ready answer for that specific question. Try rephrasing it with different words (e.g. \"how to download a book\" rather than \"how do I get it\"), or contact us directly via the Contact page (biblio@iu-ztf.cm) — a real person will get back to you."

export const greetingKnown =
  "Hello! I'm the SCKOLARIS assistant — you're logged in as {{role}}, so my answers take that into account. Ask your question."
export const greetingAnonymous =
  "Hello! I'm the SCKOLARIS assistant. Ask me a question about searching, reading, downloading, or creating an account."
export const roleLabels = { student: 'student', teacher: 'teacher', admin: 'administrator' }
