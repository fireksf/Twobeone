// Internationalization utility for TwoBeOne
// Supports English and Amharic (አማርኛ)

export type Language = 'en' | 'am';

export interface Translations {
  // Common
  common: {
    welcome: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    share: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    yes: string;
    no: string;
    ok: string;
    error: string;
    success: string;
    today: string;
    yesterday: string;
    tomorrow: string;
  };

  // Navigation
  nav: {
    home: string;
    devotions: string;
    journal: string;
    prayer: string;
    questions: string;
    profile: string;
    settings: string;
    bible: string;
    community: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
    forgotPassword: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    enterEmail: string;
    enterPassword: string;
    enterName: string;
    passwordMismatch: string;
    invalidEmail: string;
    weakPassword: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    growingTogetherInFaith: string;
    daysTogether: string;
    devotionalStreak: string;
    journalEntries: string;
    prayers: string;
    questions: string;
    answered: string;
    shared: string;
    quickActions: string;
    continueJourney: string;
    dailyVerse: string;
    readFullChapter: string;
    todaysMood: string;
    yourMood: string;
    partnersMood: string;
    relationshipMilestones: string;
    celebrateJourney: string;
    yourJourneyTogether: string;
    buildingFoundation: string;
    recentActivity: string;
    viewAll: string;
    addPartner: string;
    connectWithPartner: string;
    noPartnerYet: string;
  };

  // Devotionals
  devotionals: {
    title: string;
    todaysDevotional: string;
    dailyReflection: string;
    scriptureReading: string;
    prayerPrompt: string;
    discussionQuestions: string;
    markComplete: string;
    shareWithPartner: string;
    partnerCompleted: string;
    yourThoughts: string;
    writeReflection: string;
    saveReflection: string;
    streak: string;
    days: string;
    keepGoing: string;
  };

  // Journal
  journal: {
    title: string;
    newEntry: string;
    myEntries: string;
    sharedEntries: string;
    writeTitle: string;
    writeContent: string;
    shareWithPartner: string;
    private: string;
    shared: string;
    save: string;
    delete: string;
    edit: string;
    noEntries: string;
    startWriting: string;
  };

  // Prayer
  prayer: {
    title: string;
    prayerRequests: string;
    newRequest: string;
    myPrayers: string;
    partnersPrayers: string;
    prayTogether: string;
    markAnswered: string;
    answered: string;
    pending: string;
    writeRequest: string;
    noRequests: string;
    addFirstPrayer: string;
    praiseReport: string;
    howAnswered: string;
  };

  // Questions
  questions: {
    title: string;
    knowEachOther: string;
    selectCategory: string;
    answerQuestion: string;
    yourAnswer: string;
    partnersAnswer: string;
    notAnsweredYet: string;
    writeAnswer: string;
    saveAnswer: string;
    questionsAnswered: string;
    viewResponses: string;
    categories: {
      faith: string;
      values: string;
      dreams: string;
      family: string;
      intimacy: string;
      conflict: string;
      finance: string;
      daily: string;
    };
  };

  // Profile
  profile: {
    title: string;
    myProfile: string;
    editProfile: string;
    partnerCode: string;
    enterPartnerCode: string;
    linkPartner: string;
    relationshipStart: string;
    linkedWith: string;
    notLinked: string;
    preferences: string;
    language: string;
    notifications: string;
    theme: string;
    about: string;
    version: string;
  };

  // Bible
  bible: {
    title: string;
    selectBook: string;
    selectChapter: string;
    oldTestament: string;
    newTestament: string;
    search: string;
    bookmarks: string;
    highlights: string;
    addHighlight: string;
    addNote: string;
    shareVerse: string;
    copyVerse: string;
  };

  // Notifications
  notifications: {
    title: string;
    enableNotifications: string;
    disableNotifications: string;
    notificationsOn: string;
    notificationsOff: string;
    youllBeNotified: string;
    sharedVerse: string;
    newPrayer: string;
    journalEntry: string;
    devotionalComplete: string;
    milestone: string;
    dailyReminder: string;
    pushNotifications: string;
    stayConnected: string;
    permissionRequired: string;
    enableInSettings: string;
  };

  // Milestones
  milestones: {
    title: string;
    addMilestone: string;
    editMilestone: string;
    deleteMilestone: string;
    milestoneTitle: string;
    milestoneDescription: string;
    milestoneDate: string;
    selectIcon: string;
    noMilestones: string;
    addFirstMilestone: string;
  };

  // Mood
  mood: {
    title: string;
    great: string;
    good: string;
    okay: string;
    sad: string;
    notSetYet: string;
    analytics: string;
    weeklyReport: string;
    moodTrends: string;
  };

  // Messages
  messages: {
    savedSuccessfully: string;
    deletedSuccessfully: string;
    sharedSuccessfully: string;
    errorOccurred: string;
    noInternetConnection: string;
    tryAgainLater: string;
    confirmDelete: string;
    areYouSure: string;
    cannotUndo: string;
  };

  // Time
  time: {
    second: string;
    seconds: string;
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    year: string;
    years: string;
    ago: string;
    justNow: string;
  };

  // Install Banner
  install: {
    title: string;
    subtitle: string;
    iosInstructions: string;
    iosStep1: string;
    iosStep2: string;
    iosStep3: string;
    androidInstructions: string;
    installButton: string;
    gotIt: string;
    dismiss: string;
    benefit1Title: string;
    benefit1Desc: string;
    benefit2Title: string;
    benefit2Desc: string;
    benefit3Title: string;
    benefit3Desc: string;
  };

  // Community
  community: {
    title: string;
    myGroups: string;
    joinGroup: string;
    createGroup: string;
    groupName: string;
    groupDescription: string;
    members: string;
    posts: string;
    noPosts: string;
    writePost: string;
    sendMessage: string;
    leaveGroup: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      share: 'Share',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
    },

    nav: {
      home: 'Home',
      devotions: 'Devotions',
      journal: 'Journal',
      prayer: 'Prayer',
      questions: 'Questions',
      profile: 'Profile',
      settings: 'Settings',
      bible: 'Bible',
      community: 'Community',
    },

    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      enterName: 'Enter your name',
      passwordMismatch: 'Passwords do not match',
      invalidEmail: 'Invalid email address',
      weakPassword: 'Password must be at least 6 characters',
    },

    dashboard: {
      title: 'Dashboard',
      growingTogetherInFaith: 'Growing together in faith',
      daysTogether: 'Days Together',
      devotionalStreak: 'Devotional Streak',
      journalEntries: 'Journal Entries',
      prayers: 'Prayers',
      questions: 'Questions',
      answered: 'answered',
      shared: 'shared',
      quickActions: 'Quick Actions',
      continueJourney: 'Continue your spiritual journey',
      dailyVerse: 'Daily Verse',
      readFullChapter: 'Read Full Chapter',
      todaysMood: "Today's Mood",
      yourMood: 'Your Mood',
      partnersMood: "Partner's Mood",
      relationshipMilestones: 'Relationship Milestones',
      celebrateJourney: 'Celebrate your journey together',
      yourJourneyTogether: 'Your Journey Together',
      buildingFoundation: 'Building a strong foundation in faith',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      addPartner: 'Add Partner',
      connectWithPartner: 'Connect with your partner to begin your journey together',
      noPartnerYet: 'No partner connected yet',
    },

    devotionals: {
      title: 'Daily Devotionals',
      todaysDevotional: "Today's Devotional",
      dailyReflection: 'Daily Reflection',
      scriptureReading: 'Scripture Reading',
      prayerPrompt: 'Prayer Prompt',
      discussionQuestions: 'Discussion Questions',
      markComplete: 'Mark Complete',
      shareWithPartner: 'Share with Partner',
      partnerCompleted: 'Partner Completed',
      yourThoughts: 'Your Thoughts',
      writeReflection: 'Write your reflection...',
      saveReflection: 'Save Reflection',
      streak: 'Streak',
      days: 'days',
      keepGoing: 'Keep going!',
    },

    journal: {
      title: 'Journal',
      newEntry: 'New Entry',
      myEntries: 'My Entries',
      sharedEntries: 'Shared Entries',
      writeTitle: 'Entry title...',
      writeContent: 'Write your thoughts...',
      shareWithPartner: 'Share with Partner',
      private: 'Private',
      shared: 'Shared',
      save: 'Save Entry',
      delete: 'Delete Entry',
      edit: 'Edit Entry',
      noEntries: 'No journal entries yet',
      startWriting: 'Start writing your first entry',
    },

    prayer: {
      title: 'Prayer',
      prayerRequests: 'Prayer Requests',
      newRequest: 'New Request',
      myPrayers: 'My Prayers',
      partnersPrayers: "Partner's Prayers",
      prayTogether: 'Pray Together',
      markAnswered: 'Mark as Answered',
      answered: 'Answered',
      pending: 'Pending',
      writeRequest: 'Write your prayer request...',
      noRequests: 'No prayer requests yet',
      addFirstPrayer: 'Add your first prayer',
      praiseReport: 'Praise Report',
      howAnswered: 'How was this prayer answered?',
    },

    questions: {
      title: 'Know Each Other',
      knowEachOther: 'Get to know each other better',
      selectCategory: 'Select a Category',
      answerQuestion: 'Answer Question',
      yourAnswer: 'Your Answer',
      partnersAnswer: "Partner's Answer",
      notAnsweredYet: 'Not answered yet',
      writeAnswer: 'Write your answer...',
      saveAnswer: 'Save Answer',
      questionsAnswered: 'Questions Answered',
      viewResponses: 'View Responses',
      categories: {
        faith: 'Faith & Beliefs',
        values: 'Values & Goals',
        dreams: 'Dreams & Future',
        family: 'Family & Children',
        intimacy: 'Love & Intimacy',
        conflict: 'Conflict Resolution',
        finance: 'Money & Finance',
        daily: 'Daily Life',
      },
    },

    profile: {
      title: 'Profile',
      myProfile: 'My Profile',
      editProfile: 'Edit Profile',
      partnerCode: 'Partner Code',
      enterPartnerCode: 'Enter partner code',
      linkPartner: 'Link Partner',
      relationshipStart: 'Relationship Start Date',
      linkedWith: 'Linked with',
      notLinked: 'Not linked',
      preferences: 'Preferences',
      language: 'Language',
      notifications: 'Notifications',
      theme: 'Theme',
      about: 'About',
      version: 'Version',
    },

    bible: {
      title: 'Bible',
      selectBook: 'Select a Book',
      selectChapter: 'Select Chapter',
      oldTestament: 'Old Testament',
      newTestament: 'New Testament',
      search: 'Search',
      bookmarks: 'Bookmarks',
      highlights: 'Highlights',
      addHighlight: 'Add Highlight',
      addNote: 'Add Note',
      shareVerse: 'Share Verse',
      copyVerse: 'Copy Verse',
    },

    notifications: {
      title: 'Notifications',
      enableNotifications: 'Enable Notifications',
      disableNotifications: 'Disable Notifications',
      notificationsOn: 'Notifications On',
      notificationsOff: 'Enable Notifications',
      youllBeNotified: "You'll be notified about:",
      sharedVerse: 'Shared Bible verses and highlights',
      newPrayer: 'New prayer requests from your partner',
      journalEntry: 'Journal entries and devotional completions',
      devotionalComplete: 'Daily devotional reminders',
      milestone: 'Milestone celebrations and achievements',
      dailyReminder: 'Daily reminders',
      pushNotifications: 'Push Notifications',
      stayConnected: 'Stay connected with your partner through instant notifications',
      permissionRequired: 'Permission Required',
      enableInSettings: 'Enable notifications in your browser settings',
    },

    milestones: {
      title: 'Milestones',
      addMilestone: 'Add Milestone',
      editMilestone: 'Edit Milestone',
      deleteMilestone: 'Delete Milestone',
      milestoneTitle: 'Milestone Title',
      milestoneDescription: 'Description',
      milestoneDate: 'Date',
      selectIcon: 'Select Icon',
      noMilestones: 'No milestones yet',
      addFirstMilestone: 'Add your first milestone',
    },

    mood: {
      title: 'Mood',
      great: 'Great',
      good: 'Good',
      okay: 'Okay',
      sad: 'Sad',
      notSetYet: 'Not set yet',
      analytics: 'Analytics',
      weeklyReport: 'Weekly Report',
      moodTrends: 'Mood Trends',
    },

    messages: {
      savedSuccessfully: 'Saved successfully',
      deletedSuccessfully: 'Deleted successfully',
      sharedSuccessfully: 'Shared successfully',
      errorOccurred: 'An error occurred',
      noInternetConnection: 'No internet connection',
      tryAgainLater: 'Please try again later',
      confirmDelete: 'Confirm Delete',
      areYouSure: 'Are you sure?',
      cannotUndo: 'This action cannot be undone',
    },

    time: {
      second: 'second',
      seconds: 'seconds',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      day: 'day',
      days: 'days',
      week: 'week',
      weeks: 'weeks',
      month: 'month',
      months: 'months',
      year: 'year',
      years: 'years',
      ago: 'ago',
      justNow: 'just now',
    },

    install: {
      title: 'Install TwoBeOne',
      subtitle: 'Add to your home screen for the best experience',
      iosInstructions: 'To install on iOS:',
      iosStep1: 'Tap the Share button below',
      iosStep2: 'Scroll and tap "Add to Home Screen"',
      iosStep3: 'Tap "Add" to confirm',
      androidInstructions: 'Tap the button below to install TwoBeOne on your device',
      installButton: 'Install App',
      gotIt: 'Got it!',
      dismiss: 'Dismiss',
      benefit1Title: 'Faster',
      benefit1Desc: 'Instant access',
      benefit2Title: 'Native',
      benefit2Desc: 'App-like feel',
      benefit3Title: 'Alerts',
      benefit3Desc: 'Get notified',
    },

    community: {
      title: 'Community',
      myGroups: 'My Groups',
      joinGroup: 'Join Group',
      createGroup: 'Create Group',
      groupName: 'Group Name',
      groupDescription: 'Description',
      members: 'Members',
      posts: 'Posts',
      noPosts: 'No posts yet',
      writePost: 'Write a post...',
      sendMessage: 'Send',
      leaveGroup: 'Leave Group',
    },
  },

  am: {
    common: {
      welcome: 'እንኳን ደህና መጡ',
      loading: 'በመጫን ላይ...',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      delete: 'ሰርዝ',
      edit: 'አስተካክል',
      share: 'አጋራ',
      close: 'ዝጋ',
      back: 'ተመለስ',
      next: 'ቀጣይ',
      previous: 'ቀዳሚ',
      yes: 'አዎ',
      no: 'አይ',
      ok: 'እሺ',
      error: 'ስህተት',
      success: 'ተሳክቷል',
      today: 'ዛሬ',
      yesterday: 'ትናንት',
      tomorrow: 'ነገ',
    },

    nav: {
      home: 'መነሻ',
      devotions: 'የእምነት ጥናት',
      journal: 'ማስታወሻ',
      prayer: 'ጸሎት',
      questions: 'ጥያቄዎች',
      profile: 'መገለጫ',
      settings: 'ቅንብሮች',
      bible: 'መጽሐፍ ቅዱስ',
      community: 'ማህበረሰብ',
    },

    auth: {
      signIn: 'ግባ',
      signUp: 'ይመዝገቡ',
      signOut: 'ውጣ',
      email: 'ኢሜይል',
      password: 'የይለፍ ቃል',
      name: 'ስም',
      confirmPassword: 'የይለፍ ቃል አረጋግጥ',
      forgotPassword: 'የይለፍ ቃል ረስተዋል?',
      createAccount: 'መለያ ፍጠር',
      alreadyHaveAccount: 'መለያ አለዎት?',
      dontHaveAccount: 'መለያ የለዎትም?',
      enterEmail: 'ኢሜይልዎን ያስገቡ',
      enterPassword: 'የይለፍ ቃልዎን ያስገቡ',
      enterName: 'ስምዎን ያስገቡ',
      passwordMismatch: 'የይለፍ ቃሎች አይዛመዱም',
      invalidEmail: 'የተሳሳተ ኢሜይል አድራሻ',
      weakPassword: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት',
    },

    dashboard: {
      title: 'መነሻ ገጽ',
      growingTogetherInFaith: 'በእምነት አብረን እናድጋለን',
      daysTogether: 'አብረን የቆይንበት ቀናት',
      devotionalStreak: 'የቀጣይነት ጥናት',
      journalEntries: 'የማስታወሻ ግቤቶች',
      prayers: 'ጸሎቶች',
      questions: 'ጥያቄዎች',
      answered: 'ተመልሷል',
      shared: 'ተጋርቷል',
      quickActions: 'ፈጣን እርምጃዎች',
      continueJourney: 'መንፈሳዊ ጉዞዎን ይቀጥሉ',
      dailyVerse: 'የዛሬው ጥቅስ',
      readFullChapter: 'ምዕራፉን በሙሉ አንብብ',
      todaysMood: 'የዛሬው ስሜት',
      yourMood: 'የእርስዎ ስሜት',
      partnersMood: 'የባልደረባዎ ስሜት',
      relationshipMilestones: 'የግንኙነት ክስተቶች',
      celebrateJourney: 'ጉዞዎን አብረው ያክብሩ',
      yourJourneyTogether: 'የእርስዎ ጉዞ አብረን',
      buildingFoundation: 'በእምነት ጠንካራ መሰረት መገንባት',
      recentActivity: 'የቅርብ ጊዜ እንቅስቃሴ',
      viewAll: 'ሁሉንም ይመልከቱ',
      addPartner: 'ባልደረባ ጨምር',
      connectWithPartner: 'ጉዞዎን ለመጀመር ከባልደረባዎ ጋር ይገናኙ',
      noPartnerYet: 'እስካሁን ባልደረባ አልተገናኘም',
    },

    devotionals: {
      title: 'የእለት ጥናት',
      todaysDevotional: 'የዛሬው ጥናት',
      dailyReflection: 'የእለት ማሰላሰል',
      scriptureReading: 'የመጽሐፍ ቅዱስ ንባብ',
      prayerPrompt: 'የጸሎት መመሪያ',
      discussionQuestions: 'የውይይት ጥያቄዎች',
      markComplete: 'እንደተጠናቀቀ አድርግ',
      shareWithPartner: 'ለባልደረባ አጋራ',
      partnerCompleted: 'ባልደረባ አጠናቋል',
      yourThoughts: 'ሃሳብዎ',
      writeReflection: 'ማሰላሰልዎን ይጻፉ...',
      saveReflection: 'ማሰላሰል አስቀምጥ',
      streak: 'ቀጣይነት',
      days: 'ቀናት',
      keepGoing: 'ይቀጥሉ!',
    },

    journal: {
      title: 'ማስታወሻ',
      newEntry: 'አዲስ ግቤት',
      myEntries: 'የእኔ ግቤቶች',
      sharedEntries: 'የተጋሩ ግቤቶች',
      writeTitle: 'የግቤት ርዕስ...',
      writeContent: 'ሃሳብዎን ይጻፉ...',
      shareWithPartner: 'ለባልደረባ አጋራ',
      private: 'ግላዊ',
      shared: 'የተጋራ',
      save: 'ግቤት አስቀምጥ',
      delete: 'ግቤት ሰርዝ',
      edit: 'ግቤት አስተካክል',
      noEntries: 'እስካሁን ምንም ግቤቶች የሉም',
      startWriting: 'የመጀመሪያ ግቤትዎን ይጻፉ',
    },

    prayer: {
      title: 'ጸሎት',
      prayerRequests: 'የጸሎት ጥያቄዎች',
      newRequest: 'አዲስ ጥያቄ',
      myPrayers: 'የእኔ ጸሎቶች',
      partnersPrayers: 'የባልደረባ ጸሎቶች',
      prayTogether: 'አብረን እንጸልይ',
      markAnswered: 'እንደተመለሰ አድርግ',
      answered: 'ተመልሷል',
      pending: 'በመጠባበቅ ላይ',
      writeRequest: 'የጸሎት ጥያቄዎን ይጻፉ...',
      noRequests: 'እስካሁን የጸሎት ጥያቄዎች የሉም',
      addFirstPrayer: 'የመጀመሪያ ጸሎትዎን ይጨምሩ',
      praiseReport: 'የምስጋና ሪፖርት',
      howAnswered: 'ይህ ጸሎት እንዴት ተመልሷል?',
    },

    questions: {
      title: 'እርስ በእርስ እናውቃለን',
      knowEachOther: 'እርስ በእርሳችን በደንብ እናውቃለን',
      selectCategory: 'ምድብ ይምረጡ',
      answerQuestion: 'ጥያቄ መልስ',
      yourAnswer: 'የእርስዎ መልስ',
      partnersAnswer: 'የባልደረባ መልስ',
      notAnsweredYet: 'እስካሁን አልተመለሰም',
      writeAnswer: 'መልስዎን ይጻፉ...',
      saveAnswer: 'መልስ አስቀምጥ',
      questionsAnswered: 'የተመለሱ ጥያቄዎች',
      viewResponses: 'መልሶችን ይመልከቱ',
      categories: {
        faith: 'እምነት እና እምነቶች',
        values: 'እሴቶች እና ግቦች',
        dreams: 'ህልሞች እና ወደፊት',
        family: 'ቤተሰብ እና ልጆች',
        intimacy: 'ፍቅር እና ቅርበት',
        conflict: 'ግጭት አፈታት',
        finance: 'ገንዘብ እና ፋይናንስ',
        daily: 'የእለት ተእለት ህይወት',
      },
    },

    profile: {
      title: 'መገለጫ',
      myProfile: 'የእኔ መገለጫ',
      editProfile: 'መገለጫ አስተካክል',
      partnerCode: 'የባልደረባ ኮድ',
      enterPartnerCode: 'የባልደረባ ኮድ ያስገቡ',
      linkPartner: 'ባልደረባን አገናኝ',
      relationshipStart: 'የግንኙነት መጀመሪያ ቀን',
      linkedWith: 'ተገናኝቷል ከ',
      notLinked: 'አልተገናኘም',
      preferences: 'ምርጫዎች',
      language: 'ቋንቋ',
      notifications: 'ማሳወቂያዎች',
      theme: 'ገፅታ',
      about: 'ስለ',
      version: 'ስሪት',
    },

    bible: {
      title: 'መጽሐፍ ቅዱስ',
      selectBook: 'መጽሐፍ ይምረጡ',
      selectChapter: 'ምዕራፍ ይምረጡ',
      oldTestament: 'ብሉይ ኪዳን',
      newTestament: 'አዲስ ኪዳን',
      search: 'ፈልግ',
      bookmarks: 'ዕልባቶች',
      highlights: 'ድምቀቶች',
      addHighlight: 'ድምቀት ጨምር',
      addNote: 'ማስታወሻ ጨምር',
      shareVerse: 'ጥቅስ አጋራ',
      copyVerse: 'ጥቅስ ቅዳ',
    },

    notifications: {
      title: 'ማሳወቂያዎች',
      enableNotifications: 'ማሳወቂያዎችን አንቃ',
      disableNotifications: 'ማሳወቂያዎችን አሰናክል',
      notificationsOn: 'ማሳወቂያዎች በርተዋል',
      notificationsOff: 'ማሳወቂያዎችን አንቃ',
      youllBeNotified: 'የሚሰጡዎት ማሳወቂያዎች:',
      sharedVerse: 'የተጋሩ የመጽሐፍ ቅዱስ ጥቅሶች እና ድምቀቶች',
      newPrayer: 'ከባልደረባዎ አዲስ የጸሎት ጥያቄዎች',
      journalEntry: 'የማስታወሻ ግቤቶች እና የጥናት ማጠናቀቂያዎች',
      devotionalComplete: 'የእለት ጥናት አስታዋሾች',
      milestone: 'የክስተት በዓላት እና ስኬቶች',
      dailyReminder: 'የእለት አስታዋሾች',
      pushNotifications: 'የፑሽ ማሳወቂያዎች',
      stayConnected: 'በፈጣን ማሳወቂያዎች ከባልደረባዎ ጋር ተገናኝተው ይቆዩ',
      permissionRequired: 'ፈቃድ ያስፈልጋል',
      enableInSettings: 'በአሳሽዎ ቅንብሮች ውስጥ ማሳወቂያዎችን አንቃ',
    },

    milestones: {
      title: 'ክስተቶች',
      addMilestone: 'ክስተት ጨምር',
      editMilestone: 'ክስተት አስተካክል',
      deleteMilestone: 'ክስተት ሰርዝ',
      milestoneTitle: 'የክስተት ርዕስ',
      milestoneDescription: 'መግለጫ',
      milestoneDate: 'ቀን',
      selectIcon: 'አዶ ይምረጡ',
      noMilestones: 'እስካሁን ክስተቶች የሉም',
      addFirstMilestone: 'የመጀመሪያ ክስተትዎን ይጨምሩ',
    },

    mood: {
      title: 'ስሜት',
      great: 'በጣም ጥሩ',
      good: 'ጥሩ',
      okay: 'እሺ',
      sad: 'ሀዘን',
      notSetYet: 'እስካሁን አልተዘጋጀም',
      analytics: 'ትንታኔ',
      weeklyReport: 'ሳምንታዊ ሪፖርት',
      moodTrends: 'የስሜት አዝማሚያዎች',
    },

    messages: {
      savedSuccessfully: 'በተሳካ ሁኔታ ተቀምጧል',
      deletedSuccessfully: 'በተሳካ ሁኔታ ተሰርዟል',
      sharedSuccessfully: 'በተሳካ ሁኔታ ተጋርቷል',
      errorOccurred: 'ስህተት ተከስቷል',
      noInternetConnection: 'የበይነመረብ ግንኙነት የለም',
      tryAgainLater: 'እባክዎ ቆይተው ይሞክሩ',
      confirmDelete: 'መሰረዝን አረጋግጥ',
      areYouSure: 'እርግጠኛ ነዎት?',
      cannotUndo: 'ይህ እርምጃ መልሶ መቀልበስ አይቻልም',
    },

    time: {
      second: 'ሰከንድ',
      seconds: 'ሰከንዶች',
      minute: 'ደቂቃ',
      minutes: 'ደቂቃዎች',
      hour: 'ሰዓት',
      hours: 'ሰዓታት',
      day: 'ቀን',
      days: 'ቀናት',
      week: 'ሳምንት',
      weeks: 'ሳምንታት',
      month: 'ወር',
      months: 'ወራት',
      year: 'ዓመት',
      years: 'ዓመታት',
      ago: 'በፊት',
      justNow: 'አሁን ብቻ',
    },

    install: {
      title: 'TwoBeOne ጫን',
      subtitle: 'ለተሻለ ተሞክሮ ወደ መነሻ ስክሪንዎ ያክሉ',
      iosInstructions: 'በ iOS ላይ ለመጫን:',
      iosStep1: 'ከታች ያለውን የማጋራት ቁልፍ መታ ያድርጉ',
      iosStep2: 'ይሸብልሉ እና "ወደ መነሻ ስክሪን አክል" ን ይጫኑ',
      iosStep3: 'ለማረጋገጥ "አክል" ን ይጫኑ',
      androidInstructions: 'TwoBeOne በመሳሪያዎ ላይ ለመጫን ከታች ያለውን ቁልፍ ይጫኑ',
      installButton: 'መተግበሪያ ጫን',
      gotIt: 'ገባኝ!',
      dismiss: 'አሰናብት',
      benefit1Title: 'ፈጣን',
      benefit1Desc: 'ፈጣን መዳረሻ',
      benefit2Title: 'አገናኝ',
      benefit2Desc: 'እንደ መተግበሪያ',
      benefit3Title: 'ማሳወቂያዎች',
      benefit3Desc: 'ማሳወቂያ ይደርስዎታል',
    },

    community: {
      title: 'ማህበረሰብ',
      myGroups: 'የእኔ ቡድኖች',
      joinGroup: 'ቡድን ተቀላቀል',
      createGroup: 'ቡድን ፍጠር',
      groupName: 'የቡድን ስም',
      groupDescription: 'መግለጫ',
      members: 'አባላት',
      posts: 'ልጥፎች',
      noPosts: 'እስካሁን ምንም ልጥፎች የሉም',
      writePost: 'ልጥፍ ይጻፉ...',
      sendMessage: 'ላክ',
      leaveGroup: 'ቡድን ለቅቅ',
    },
  },
};

// Get translation by key path
export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${lang}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Get all translations for a language
export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

// Language metadata
export const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'am' as Language, name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
];
