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
      welcomeBack: string;
      createAccountPrompt: string;
      termsOfService: string;
      privacyPolicy: string;
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

  // Landing / marketing content
  landing: {
    heroBadge: string;
    featuresHeadline: string;
    featuresSubtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    downloadFree: string;
    watchDemo: string;
    socialProof: string;
    mockupGreeting: string;
    mockupStatus: string;
    devotionalCardTitle: string;
    devotionalCardQuote: string;
    devotionalCardButton: string;
    statsDevotionals: string;
    statsPrayers: string;
    statsQuestions: string;
    prayerRequestTitle: string;
    prayerRequestDescription: string;
    getStarted: string;
    learnMore: string;
    navFeatures: string;
    navTestimonials: string;
    navFaq: string;
    featuresSectionTitle: string;
    testimonialsSectionTitle: string;
    faqSectionTitle: string;
    whySectionTitle: string;
    whyHeadline: string;
    whySubtitle: string;
    testimonialsBadge: string;
    testimonialsSubtitle: string;
    faqBadge: string;
    faqSubtitle: string;
    ctaTitle: string;
    ctaText: string;
    freeForever: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    newsletterEmailPlaceholder: string;
    newsletterButton: string;
    newsletterInvalidEmail: string;
    newsletterSubscribeSuccess: string;
    newsletterSubscribeFailure: string;
    features: Array<{
      title: string;
      description: string;
      color: string;
      image: string;
    }>;
    testimonials: Array<{
      name: string;
      location: string;
      image: string;
      quote: string;
      married: string;
    }>;
    faq: Array<{
      question: string;
      answer: string;
    }>;
    whyItems: Array<{
      title: string;
      desc: string;
      icon: string;
    }>;
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
    moodRecorded: string;
    prayerTime: string;
    openingPrayer: string;
    failedToOpenPrayer: string;
    profileUpdatedSynced: string;
    profileUpdated: string;
    failedToUpdateProfile: string;
    failedToLoadJournal: string;
    codeCopied: string;
    copyFailed: string;
    generating: string;
    link: string;
    inviteCode: string;
    createPartnerAccount: string;
    connectedWithPartner: string;
    pleaseEnterPartnerEmail: string;
    failedToConnectPartner: string;
    failedToCreatePartnerAccount: string;
    pleaseFillAllFields: string;
  };

  settings: {
    profileHeaderPlaceholder: string;
    connectedWith: string;
    tabs: {
      personal: string;
      couple: string;
      privacy: string;
      notifications: string;
      app: string;
    };
    personalInfoTitle: string;
    personalInfoDescription: string;
    fullName: string;
    emailAddress: string;
    emailCannotChange: string;
    phoneNumber: string;
    location: string;
    bio: string;
    tellUsAboutYourself: string;
    saveChanges: string;
    saving: string;
    accountActionsTitle: string;
    adminPanel: string;
    debugQuestions: string;
    debugResponses: string;
    testingDashboard: string;
    exportData: string;
    helpSupport: string;
    contactUs: string;
    signOut: string;
    coupleInfoTitle: string;
    coupleInfoDescription: string;
    partnerStatus: string;
    noPartnerConnected: string;
    linkByCodeTitle: string;
    linkByCodeDescription: string;
    enterPartnerCode: string;
    link: string;
    myInviteCodeTitle: string;
    shareThisCode: string;
    copy: string;
    generateInviteCode: string;
    relationshipStarted: string;
    dangerZoneTitle: string;
    dangerZoneDescription: string;
    requestPartnerDisconnect: string;
    deleteAccount: string;
    deleteWarning: string;
    deleteConfirmPrompt: string;
    typeDeleteToConfirm: string;
    deleteMyAccount: string;
    deleting: string;
    needAssistance: string;
    getInTouch: string;
    subject: string;
    message: string;
    sendMessage: string;
    notificationPreferencesTitle: string;
    notificationPreferencesDescription: string;
    dailyDevotional: string;
    prayerReminders: string;
    partnerActivity: string;
    communityUpdates: string;
    saveNotificationSettings: string;
    notificationChannelsTitle: string;
    notificationChannelsDescription: string;
    pushNotifications: string;
    emailNotifications: string;
    legalDocumentsTitle: string;
    legalDocumentsDescription: string;
    privacyPolicy: string;
    termsOfService: string;
    legalAgreementNotice: string;
    dataSecurityTitle: string;
    dataSecurityDescription: string;
    changePassword: string;
    downloadMyData: string;
    twoFactorAuthentication: string;
    helpAndSupport: string;
    adminPanelDescription: string;
  };

  partnerSetup: {
    connectWithYourPartner: string;
    addPartnerToStart: string;
    connectPartner: string;
    enterPartnerEmail: string;
    enterPartnersName: string;
    relationshipStarted: string;
    tempPasswordCreated: string;
    temporaryPassword: string;
    back: string;
    creating: string;
    createAndConnect: string;
    allSet: string;
    nowConnectedWith: string;
    relationshipStartedDate: string;
    createPartnerAccount: string;
    partnerEmailNotFound: string;
    createAccountForPartner: string;
    createdAccountFor: string;
    failedToConnect: string;
    failedToCreateAccount: string;
    pleaseEnterPartnerEmail: string;
    pleaseFillAllFields: string;
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
      retry: 'Retry',
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
      fixErrors: 'Please fix the errors below',
      welcomeBack: 'Welcome back! Sign in to continue.',
      createAccountPrompt: 'Create an account to get started.',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
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

    landing: {
      heroTitle: 'Grow closer with your partner through faith-based daily devotionals and guided conversations.',
      heroSubtitle: 'The app for Christian couples who want to build a stronger relationship rooted in prayer, communication, and shared spiritual growth.',
      getStarted: 'Get Started Free',
      learnMore: 'Learn More',
      navFeatures: 'Features',
      navTestimonials: 'Testimonials',
      navFaq: 'FAQ',
      heroBadge: 'Where Faith Meets Love',
      featuresHeadline: 'Built for Christian Couples',
      featuresSubtitle: 'Every feature is designed to help you grow closer to God and each other. No fluff, just meaningful tools for your relationship.',
      downloadFree: 'Download Free',
      watchDemo: 'Watch Demo',
      socialProof: 'Loved by 10,000+ couples',
      mockupGreeting: 'Good Morning! ☀️',
      mockupStatus: 'Sarah & Mike • Day 45 Streak 🔥',
      devotionalCardTitle: "Today's Devotional",
      devotionalCardQuote: 'Love is patient and kind; love does not envy or boast...',
      devotionalCardButton: 'Read Together',
      statsDevotionals: 'Devotionals',
      statsPrayers: 'Prayers',
      statsQuestions: 'Questions',
      prayerRequestTitle: 'New Prayer Request',
      prayerRequestDescription: 'Mike needs prayer for work project',
      featuresSectionTitle: 'Built for Couples Who Want to Grow Together',
      testimonialsSectionTitle: 'What Couples Are Saying',
      faqSectionTitle: 'Frequently Asked Questions',
      whySectionTitle: 'Why Couples Love TwoBeOne',
      whyHeadline: 'More Than Just an App',
      whySubtitle: 'We built TwoBeOne because we believe that when Christ is at the center of a relationship, that relationship becomes unbreakable. But staying connected spiritually requires intentionality.',
      testimonialsBadge: 'Real Stories, Real Impact',
      testimonialsSubtitle: "Don't just take our word for it. Here's how TwoBeOne is transforming marriages.",
      faqBadge: 'Got Questions?',
      faqSubtitle: 'Everything you need to know about TwoBeOne',
      ctaTitle: 'Ready to Grow Together?',
      ctaText: 'Join thousands of Christian couples who are building stronger, faith-centered relationships with TwoBeOne.',
      freeForever: '✨ Free forever. No credit card required. ✨',
      newsletterTitle: 'Stay connected with updates and relationship growth tips',
      newsletterSubtitle: 'Weekly inspiration, new features, and encouragement sent straight to your inbox.',
      newsletterEmailPlaceholder: 'Enter your email',
      newsletterButton: 'Subscribe',
      newsletterInvalidEmail: 'Please enter a valid email address',
      newsletterSubscribeSuccess: '🎉 Thanks for subscribing! Check your email soon.',
      newsletterSubscribeFailure: 'Failed to subscribe. Please try again.',
      features: [
        {
          title: 'Daily Devotionals',
          description: 'Scripture-based devotions written specifically for couples to strengthen your spiritual foundation together.',
          color: 'from-amber-500 to-orange-500',
          image: '📖'
        },
        {
          title: 'Shared Journaling',
          description: 'Express your hearts, reflect on your journey, and share intimate thoughts in a private, secure space.',
          color: 'from-blue-500 to-cyan-500',
          image: '📝'
        },
        {
          title: 'Prayer Together',
          description: 'Create prayer requests, pray for each other daily, and celebrate when God answers. Build faith together.',
          color: 'from-rose-500 to-pink-500',
          image: '🙏'
        },
        {
          title: '100+ Meaningful Questions',
          description: 'Deep, faith-based conversation starters across multiple categories to help you truly know each other.',
          color: 'from-purple-500 to-indigo-500',
          image: '💬'
        },
        {
          title: 'Learning Modules',
          description: 'Biblical guidance on communication, conflict resolution, intimacy, and spiritual growth.',
          color: 'from-green-500 to-emerald-500',
          image: '🎓'
        },
        {
          title: 'Progress Tracking',
          description: 'Track devotional streaks, milestones, and spiritual growth. Celebrate your journey together!',
          color: 'from-violet-500 to-purple-500',
          image: '📈'
        }
      ],
      testimonials: [
        {
          name: 'Sarah & Mike',
          location: 'Austin, TX',
          image: '💑',
          quote: 'TwoBeOne transformed our marriage! We pray together daily now and our conversations have never been deeper. This app brought us closer to God and each other.',
          married: '3 years'
        },
        {
          name: 'Emily & David',
          location: 'Nashville, TN',
          image: '👫',
          quote: 'As a newly engaged couple, TwoBeOne is helping us build a Christ-centered foundation before we say "I do." The questions sparked conversations we never would have had!',
          married: 'Engaged'
        },
        {
          name: 'Rachel & Jonathan',
          location: 'Colorado Springs, CO',
          image: '💏',
          quote: 'After 10 years of marriage, we thought we knew everything about each other. TwoBeOne proved us wrong in the best way possible. We\'re falling in love all over again!',
          married: '10 years'
        }
      ],
      faq: [
        {
          question: 'Is TwoBeOne free?',
          answer: 'Yes! TwoBeOne is completely free to download and use. We believe every couple deserves access to faith-based relationship tools.'
        },
        {
          question: 'Do we both need to download the app?',
          answer: 'Yes, both partners need the app. You\'ll connect via a unique invite code, and all your shared content will sync automatically between your devices.'
        },
        {
          question: 'Is our data private and secure?',
          answer: 'Absolutely! We use bank-level encryption, and your data is only shared between you and your partner. We never sell your information or use it for advertising.'
        },
        {
          question: 'What makes TwoBeOne different from other relationship apps?',
          answer: 'TwoBeOne is specifically designed for Christian couples with faith at the center. Every feature is rooted in biblical principles, and our content is written with a Christ-centered perspective.'
        },
        {
          question: 'Can we use it if we\'re not married yet?',
          answer: 'Absolutely! TwoBeOne is perfect for engaged couples, dating couples, newlyweds, and married couples of any duration. If you\'re in a committed Christian relationship, this is for you!'
        },
        {
          question: 'How much time does it take daily?',
          answer: 'As little or as much as you want! A daily devotional takes 5-10 minutes. Questions and journaling are flexible. The key is consistency, not perfection.'
        }
      ],
      whyItems: [
        { title: 'Private & Secure', desc: 'Bank-level encryption. Your data stays between you and your partner.' },
        { title: 'Real-Time Sync', desc: 'Instant synchronization across all devices. Stay connected anywhere.' },
        { title: 'Works Everywhere', desc: 'Web, iOS, and Android. Access from any device, anytime.' }
      ]
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
      moodRecorded: 'Mood recorded!',
      prayerTime: 'Prayer time! 🙏',
      openingPrayer: 'Opening Prayer Together...',
      failedToOpenPrayer: 'Failed to open prayer',
      profileUpdatedSynced: 'Profile updated! Your partner\'s relationship start date has been synced too. 💕',
      profileUpdated: 'Profile updated successfully!',
      failedToUpdateProfile: 'Failed to update profile',
      failedToLoadJournal: 'Failed to load journal entries. Some data may not be available.',
      codeCopied: '✅ Code copied to clipboard!',
      copyFailed: 'Failed to copy. Please select and copy manually.',
      generating: 'Generating...',
      link: 'Link',
      inviteCode: 'Invite Code',
      createPartnerAccount: 'Create Partner Account',
      connectedWithPartner: 'Connected with',
      pleaseEnterPartnerEmail: 'Please enter partner email',
      failedToConnectPartner: 'Failed to connect with partner',
      failedToCreatePartnerAccount: 'Failed to create partner account',
      pleaseFillAllFields: 'Please fill in all fields',
    },

    settings: {
      profileHeaderPlaceholder: 'Your Name',
      connectedWith: 'Connected with',
      tabs: {
        personal: 'Personal',
        couple: 'Couple',
        privacy: 'Privacy',
        notifications: 'Alerts',
        app: 'App',
      },
      personalInfoTitle: 'Personal Information',
      personalInfoDescription: 'Update your personal details and profile information',
      fullName: 'Full Name *',
      emailAddress: 'Email Address',
      emailCannotChange: 'Email cannot be changed',
      phoneNumber: 'Phone Number',
      location: 'Location',
      bio: 'Bio',
      tellUsAboutYourself: 'Tell us a bit about yourself...',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      accountActionsTitle: 'Account Actions',
      adminPanel: 'Admin Panel',
      debugQuestions: 'Debug Questions',
      debugResponses: 'Debug Responses',
      testingDashboard: 'Testing Dashboard',
      exportData: 'Export My Data',
      helpSupport: 'Help & Support',
      contactUs: 'Contact Us',
      signOut: 'Sign Out',
      coupleInfoTitle: 'Couple Information',
      coupleInfoDescription: 'Manage your relationship details and connection',
      partnerStatus: 'Partner Status',
      noPartnerConnected: 'No partner connected',
      linkByCodeTitle: 'Link by Code',
      linkByCodeDescription: 'Connect with your partner using their invite code',
      enterPartnerCode: "Enter partner's code",
      link: 'Link',
      myInviteCodeTitle: 'My Invite Code',
      shareThisCode: 'Share this code with your partner:',
      copy: 'Copy',
      generateInviteCode: 'Generate My Invite Code',
      relationshipStarted: 'Relationship Started',
      dangerZoneTitle: 'Danger Zone',
      dangerZoneDescription: 'Irreversible actions that affect your account',
      requestPartnerDisconnect: 'Request Partner Disconnect',
      deleteAccount: 'Delete Account',
      deleteWarning: '⚠️ Permanently delete your account and all associated data. This action cannot be undone.',
      deleteConfirmPrompt: 'Type DELETE to confirm:',
      typeDeleteToConfirm: 'Type DELETE to confirm',
      deleteMyAccount: 'Delete My Account',
      deleting: 'Deleting...',
      needAssistance: 'Need assistance?',
      getInTouch: 'Get in touch with us',
      subject: 'Subject',
      message: 'Message',
      sendMessage: 'Send Message',
      notificationPreferencesTitle: 'Notification Preferences',
      notificationPreferencesDescription: 'Choose what notifications you want to receive',
      dailyDevotional: 'Daily Devotional',
      prayerReminders: 'Prayer Reminders',
      partnerActivity: 'Partner Activity',
      communityUpdates: 'Community Updates',
      saveNotificationSettings: 'Save Notification Settings',
      notificationChannelsTitle: 'Notification Channels',
      notificationChannelsDescription: 'Choose how you want to receive notifications',
      pushNotifications: 'Push Notifications',
      emailNotifications: 'Email Notifications',
      legalDocumentsTitle: 'Legal Documents',
      legalDocumentsDescription: 'View our Privacy Policy and Terms of Service',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      legalAgreementNotice: 'You agreed to these documents when you created your account.',
      dataSecurityTitle: 'Data & Security',
      dataSecurityDescription: 'Manage your data and security preferences',
      changePassword: 'Change Password',
      downloadMyData: 'Download My Data',
      twoFactorAuthentication: 'Two-Factor Authentication',
      helpAndSupport: 'Help & Support',
      adminPanelDescription: 'Admin tools and debugging utilities for your account',
    },

    partnerSetup: {
      connectWithYourPartner: 'Connect with Your Partner',
      addPartnerToStart: 'Add your partner to start your journey together',
      connectPartner: 'Connect Partner',
      enterPartnerEmail: 'Partner Email',
      enterPartnersName: "Partner's Name",
      relationshipStarted: 'Relationship Started',
      tempPasswordCreated: 'A temporary password will be created. Share it with your partner so they can sign in and change it.',
      temporaryPassword: 'Temporary password',
      partnerEmailPlaceholder: 'partner@example.com',
      back: 'Back',
      creating: 'Creating...',
      createAndConnect: 'Create & Connect',
      allSet: 'All Set! 💕',
      nowConnectedWith: 'You\'re now connected with',
      relationshipStartedDate: 'Relationship started:',
      createPartnerAccount: 'Create Partner Account',
      partnerEmailNotFound: 'Partner account not found. Create one for them?',
      partnerAccountHelp: 'If your partner doesn\'t have an account yet, we\'ll help you create one for them',
      createAccountForPartner: 'Create an account for',
      createdAccountFor: 'Created account for',
      failedToConnect: 'Failed to connect with partner',
      failedToCreateAccount: 'Failed to create partner account',
      pleaseEnterPartnerEmail: 'Please enter partner email',
      pleaseFillAllFields: 'Please fill in all fields',
    },

    dashboard: {
      addPartner: 'Add Partner',
      devotionalStreak: 'Devotional Streak',
      journalEntries: 'Journal Entries',
      prayers: 'Prayers',
      questions: 'Questions',
      shared: 'shared',
      answered: 'answered',
      readFullChapter: 'Read Full Chapter',
      todaysMood: "Today's Mood",
      shareHowYouFeelingWithPartner: "Share how you're feeling with your partner",
      yourMood: 'Your Mood',
      tapEmojiToSetMood: 'Tap an emoji to set your mood',
      moodLabel: "'s Mood",
      today: 'Today',
      moodNotSetYet: 'Not set yet',
      relationshipMilestones: 'Relationship Milestones',
      celebrateYourJourneyTogether: 'Celebrate your journey together',
      noMilestonesYet: 'No milestones yet',
      addYourFirstMilestone: 'Add Your First Milestone',
      yourJourneyTogether: 'Your Journey Together',
      buildingStrongFoundationInFaith: 'Building a strong foundation in faith',
      dailyDevotionals: 'Daily Devotionals',
      knowEachOtherQuestions: 'Know Each Other Questions',
      sharedJournalEntries: 'Shared Journal Entries',
      recentJournalEntries: 'Recent Journal Entries',
      byLabel: 'by',
      quickActions: 'Quick Actions',
      continueYourSpiritualJourney: 'Continue your spiritual journey',
      scriptureMemory: 'Scripture Memory',
      memorizeGodsWordTogether: "Memorize God's Word together",
      featuredVerse: 'Featured Verse',
      startLearning: 'Start Learning',
      growingTogetherInFaith: 'Growing together in faith',
      connectWithYourPartnerBegin: 'Connect with your partner to begin your journey together',
      viewAll: 'View All',
      dailyVerse: 'Daily Verse',
      firstDayTogether: 'First Day Together',
      beginningOfJourney: 'The beginning of your beautiful journey',
      firstMilestoneAdded: 'First milestone added!',
    },

    prayers: {
      requests: 'Requests',
      answered: 'Answered',
      together: 'Together',
      searchPrayerRequests: 'Search prayer requests...',
      connectWithYourPartner: 'Connect with Your Partner',
      prayerSharingAvailable: 'Prayer sharing is available when you\'re connected as a couple. Share your invite code or enter your partner\'s code to start praying together.',
      noPrayersTogether: 'No Prayers Together Yet',
      noAnsweredPrayers: 'No Answered Prayers',
      noPrayerRequests: 'No Prayer Requests',
      answeredPrayersWillAppear: 'Answered prayers will appear here',
      prayTogetherAsCouple: 'Pray together as a couple to strengthen your bond',
      startByAddingPrayerRequest: 'Start by adding a prayer request',
      youLabel: 'You',
      partnerLabel: 'Partner',
      prayerCountSingular: 'prayer',
      prayerCountPlural: 'prayers',
      newPrayerRequest: 'New Prayer Request',
      bringNeedsAndConcernsBefore: 'Bring your needs and concerns before God. Pray together as a couple.',
      categoryLabel: 'Category',
      prayerTitleLabel: 'Prayer Title',
      whatAreYouPrayingFor: 'What are you praying for?',
      detailsLabel: 'Details',
      shareMoreAboutThisPrayer: 'Share more about this prayer request...',
      setReminderOptional: 'Set Reminder (Optional)',
      shareWithCommunity: 'Share with Community',
      allowOtherCouplesToSee: 'Allow other couples to see and pray for this request',
      cancelButton: 'Cancel',
      savingButton: 'Saving...',
      addPrayerButton: 'Add Prayer',
      updateButton: 'Update',
      editButton: 'Edit',
      markActiveButton: 'Mark Active',
      markAnsweredButton: 'Mark Answered',
      deleteButton: 'Delete',
      deleteThisPrayer: 'Delete this prayer?',
      prayerUpdated: 'Prayer updated!',
      prayerRequestAdded: 'Prayer request added!',
      failedToSavePrayer: 'Failed to save prayer request',
      praiseGodPrayerAnswered: 'Praise God! Prayer answered! 🎉',
    },

    mood: {
      howAreWeToday: 'How are we today?',
      youLabel: 'You',
      partnerLabel: 'Partner',
      great: 'Great',
      okay: 'Okay',
      sad: 'Sad',
      moodSaved: 'Mood saved!',
      failedToSaveMood: 'Failed to save mood',
    },

    devotional: {
      todaysDevotion: "Today's Devotional",
      completedToday: 'Completed Today',
      markAsRead: 'Mark as Read',
    },

    conversation: {
      dailyConversation: 'Daily Conversation',
      nextIn: 'Next in',
      results: 'Results',
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
      fixErrors: 'እባክዎን በታች ያሉትን እብድነቶች ያስተካክሉ',
      welcomeBack: 'ወደ ቀድሞ እንኳን በደህና መጡ! እባክዎን ይግቡ።',
      createAccountPrompt: 'መለያ ለመፍጠር ይጀምሩ።',
      termsOfService: 'የአገልግሎት ውሎታዎች',
      privacyPolicy: 'የግል ደህንነት ፖሊሲ',
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

    landing: {
      heroTitle: 'እርስዎን ከባልደረባዎ ጋር በእምነት እንዲያገኙ የተሠራ የአፕ ስርዓት',
      heroSubtitle: 'የክሪስትና ጋብቻ ጥምረት ለማንበብ፣ ለመጸሎትና ለመድረስ የተመረጡ የቅዱሳን ቋንቋ የቀን እምነት ጥናቶች።',
      getStarted: 'ነፃ ይጀምሩ',
      learnMore: 'እርምጃ ይማሩ',
      navFeatures: 'ባለስልጣናት',
      navTestimonials: 'ማስረጃዎች',
      navFaq: 'ብዙ የሚጠየቁ ጥያቄዎች',
      heroBadge: 'በእምነት እና በፍቅር የሚቀርበው',
      featuresHeadline: 'ለክሪስቲያን ጋብቻዎች የተሠራ',
      featuresSubtitle: 'ሁሉም ባለስልጣናችን እንዲረዱና እንዲያገኙ የተዘጋጅቷ ነው። ምንም ማስተካከያ የለም፣ እውነተኛ ስራዎች ብቻ ነው።',
      downloadFree: 'ነፃ ይውሰዱ',
      watchDemo: 'የሚያሳየንን ቪዲዎ ተመልከቱ',
      socialProof: '10,000+ ጋብቻዎች ወደእኛ ፈለጉ',
      mockupGreeting: 'እንደምን አደርኩ! ☀️',
      mockupStatus: 'ሳራ እና ማይክ • ቀን 45 ስትሪክ 🔥',
      devotionalCardTitle: 'የዛሬ ጥናት',
      devotionalCardQuote: 'ፍቅር ታደጋ እና ሻምራ ነው፤ ፍቅር አይስነስን ወይም አይጧልም...',
      devotionalCardButton: 'አብረን ንብብ',
      statsDevotionals: 'ጥናቶች',
      statsPrayers: 'ጸሎቶች',
      statsQuestions: 'ጥያቄዎች',
      prayerRequestTitle: 'አዲስ የጸሎት ጥያቄ',
      prayerRequestDescription: 'ማይክ ለየት ጋር ስራ እንዲሠራ ጸሎት ይፈልጋሉ',
      featuresSectionTitle: 'ለእርስዎ እና ለባልደረባዎ የተሰራ',
      testimonialsSectionTitle: 'ጥምረታችንን የሚያሳዩ ባለጌዎች',
      faqSectionTitle: 'ብዙ የሚጠየቁ ጥያቄዎች',
      whySectionTitle: 'የለምንም ምክንያት',
      whyHeadline: 'ከአፕ በላይ ነን',
      whySubtitle: 'TwoBeOne ምንም ሳይኖረው እንዲገንባ እና እምነት ከልብ ውስጥ ያለ ሲሆን መገናኘት ይሻላል።',
      testimonialsBadge: 'እውነተኛ ታሪኮች፣ እውነት ተፅዕኖ',
      testimonialsSubtitle: 'የእኛን ታሪክ እንዲገልጹ አይችሉም። ይህንን እንዴት እንጠቀም እንረዳዋለን።',
      faqBadge: 'ጥያቄዎች አሉ?',
      faqSubtitle: 'TwoBeOne ስለ ምን እንደሚሰራ ሁሉንም እውቀት እንሰጥዎታለን',
      ctaTitle: 'እርስዎን ከእንዲሁ ጋር ወደፊት ለማስገባት ዝግጁ ነን?',
      ctaText: 'ከአንድ ሺ የሚበልጡ ክሪስቲያን ጋብቻዎች ጋር በእምነት ተያይዞ የተዋረደ የግንኙነት ጥሩ ርዕስ በማድረግ እየኖረዋቸው ነው።',
      freeForever: '✨ ለዘላለም ነፃ። የብድር ካርድ የለም። ✨',
      newsletterTitle: 'ማስታወቂያዎችን እና የግንኙነት ምክርን ይቀበሉ',
      newsletterSubtitle: 'ሳምንታዊ ማስታወቂያዎች፣ አዲስ ስራዎችና ምክር በኢሜይልዎ ይደርሳሉ።',
      newsletterEmailPlaceholder: 'ኢሜይልዎን ያስገቡ',
      newsletterButton: 'ይመዝገቡ',
      newsletterInvalidEmail: 'እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ',
      newsletterSubscribeSuccess: '🎉 እናመሰግናለን! እባኮትን ኢሜይልዎን ይፈትሹ።',
      newsletterSubscribeFailure: 'ማመዝገብ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
      features: [
        {
          title: 'ዕለታዊ ጥናቶች',
          description: 'በቅዱሳን ጽሑፍ የተመሠረቱ ጥናቶች ለጥምር ጋብቻ እርስዎን እና ባልደረባዎን እንዲያበረታቱ ተዘጋጅተዋል።',
          color: 'from-amber-500 to-orange-500',
          image: '📖'
        },
        {
          title: 'የተጋራ ጀርናል',
          description: 'ልብዎን ይናገሩ፣ ጉዞዎን ይወቁ፣ ግል እና ደህና ባለ ቦታ ላይ ያካፍሉ።',
          color: 'from-blue-500 to-cyan-500',
          image: '📝'
        },
        {
          title: 'በአንድነት ጸሎት',
          description: 'የጸሎት ጥያቄዎችን ይፈጥሩ፣ የዕለቱን ጸሎት ይደርጉ፣ እና እግዚአብሔር ሲመልስ ይብሩ።',
          color: 'from-rose-500 to-pink-500',
          image: '🙏'
        },
        {
          title: '100+ አስፈላጊ ጥያቄዎች',
          description: 'ከርስትያን እምነት ጋር የተያያዙ የውይይት ጥምረቶች እና የማንነት ጥያቄዎች።',
          color: 'from-purple-500 to-indigo-500',
          image: '💬'
        },
        {
          title: 'የመማር ሞጁሎች',
          description: 'በቅዱሳን መሠረት ላይ የተገነቡ የንግግር፣ የግጭት መፍታት፣ የቅርብነትና የመንፈሳዊ እድገት መመሪያዎች።',
          color: 'from-green-500 to-emerald-500',
          image: '🎓'
        },
        {
          title: 'የእድገት እይታ',
          description: 'የጥናት ቀጣይነት፣ ክስተቶች እና መንፈሳዊ እድገት ይከታተሉ። ጉዞዎን እንከብራለን!',
          color: 'from-violet-500 to-purple-500',
          image: '📈'
        }
      ],
      testimonials: [
        {
          name: 'ሳራ እና ማይክ',
          location: 'ኦስቲን፣ ቲኤክስ',
          image: '💑',
          quote: 'TwoBeOne ጋብቻችንን ቀይረውናል! እኛ የዕለቱን ጸሎት ብለን እንደምንሰማ እና ውይይታችን የፈጠነን እያለን ነው. ይህ መተግበሪያ እግዚአብሔርን እና እርስዎን በአብሮነት አካብረናል።',
          married: '3 ዓመታት'
        },
        {
          name: 'ኤሚሊ እና ዳቪድ',
          location: 'ናሽቪል፣ ቲኤክስ',
          image: '👫',
          quote: 'እንደ አዲስ ተገቢነት ያለን ጋብቻ ለእርስታዊ መሠረት ለመገንባት TwoBeOne እንዴት ርዳን እንደሚረዳን እና ጥያቄዎች ልዩ ውይይትን እንዳሳዩን እናወቅለናለን!',
          married: 'ተጋባሪ'
        },
        {
          name: 'ራከል እና ጆናታን',
          location: 'ኮሎራዶ ስፕሪንግስ፣ ኮሎራዶ',
          image: '💏',
          quote: '10 ዓመታት ከጋብቻ በኋላ ሁሉንም እንደምናውቀው አለን፣ ግን TwoBeOne በምርጥ መንገድ ያሳየን እና እኛን እንደገና እወዳለን!',
          married: '10 ዓመታት'
        }
      ],
      faq: [
        {
          question: 'TwoBeOne ነፃ ነው፣?',
          answer: 'አዎ! TwoBeOne ሙሉ በሙሉ ነፃ ነው ለማውረድና ለመጠቀም። የክሪስትና ግንኙነት መሣሪያዎች ለሁሉም ብዙሃን እንዲደርሱ እናምናለን።'
        },
        {
          question: 'ሁለቱም ወንዶች መተግበርያውን ማውረድ አለባቸው?',
          answer: 'አዎ, ሁለቱም ባልደረባዎች መተግበሪያውን እንዲያገኙ አስፈላጊ ነች። በልዩ አርእስት የተለየ ኢንቫይት ኮድ ይገናኛሉ፣ እና ሁሉም የተጋሩ ይዘቶች በራሳቸው መሣሪያዎች ላይ በማቀናበር ይስማማሉ።'
        },
        {
          question: 'ዳታችን ከፍተኛ ይጠበቃል እና የግል ነው እንደሚሆን እኛን፣?',
          answer: 'እውነት ነው! የባንክ ደረጃ ኢንክሪፕሽን እንጠብቃለን፣ ዳታዎችህ ከእርስዎና ከባልደረባዎ ብቻ ይጋለጣሉ። መረጃዎችን ለማስቶላት ወይም ለማሳወቅ አንሳይም።'
        },
        {
          question: 'ሳይገባን እንደማን እንጠቀማለን?',
          answer: 'እርግጠኛ ነው! TwoBeOne ለተጋዶች ጋብቻ ለቅርብ ግንኙነት፣ ለተጋባሪዎች፣ ለአዲስ የጋብቻ ፍልስፍና ለማረጋገጥ በግርማ የተዘጋጁ ነው።'
        },
        {
          question: 'ዕለታዊ ጊዜ ስንት ይወስዳል?',
          answer: 'ከፍተኛ ወይም ከታች እንደ ደስታዎ ይሰራል! የዕለቱ ጥናት 5-10 ደቂቃ ይወስዳል። ጥያቄዎች እና ጀርናል ተስማሚ ናቸው። ቁርጸ ቁጥጥር እንጂ ፍጥነት አይደለም።'
        }
      ],
      whyItems: [
        { title: 'ግል እና ደህና', desc: 'የባንክ ደረጃ ኢንክሪፕሽን። ዳታዎችዎ በእርስዎና ባልደረባዎ መካከል ብቻ ይቆያሉ።' },
        { title: 'እውቅና ዘገባ', desc: 'በሁሉም መሣሪያዎች በእጅ ደርሶ ዛሬ እና የሚቀጥለው በቅድሚያ ማስተናገድ።' },
        { title: 'በሁሉም ቦታ ይሰራል', desc: 'በድህረ ገጽ፣ iOS እና Android። ከእርስዎ ጋር በየቦታው ይደርሳል።' }
      ]
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
      moodRecorded: 'ስሜት ተመዝግቧል!',
      prayerTime: 'የጸሎት ጊዜ! 🙏',
      openingPrayer: 'እርስዎን ጸሎት እንዲደግፉ እየተዘጋጀ ነው...',
      failedToOpenPrayer: 'ጸሎት አልተከፈተም',
      profileUpdatedSynced: 'መገለጫዎ ተከፋፈለ! የአጋርዎ የግንኙነት መጀመሪያ ቀን አስተካክሏል። 💕',
      profileUpdated: 'መገለጫዎ በተሳካ ሁኔታ ታድሷል!',
      failedToUpdateProfile: 'መገለጫዎን ማሻሻል አልተቻለም',
      failedToLoadJournal: 'የማስታወሻ ግቤቶችን ማንበብ አልተቻለም። አንዳንድ ውሂብ ሊጎድል ይችላል።',
      codeCopied: '✅ ኮድ ወደ ቅፅ ተቀምጧል!',
      copyFailed: 'አዎንታዊ እንዲቀይር ከማይቻል ጋር አንገዳጅ ጽሁፍን ይምረጡ።',
      generating: 'እየፈጠረ ነው...',
      link: 'ይገናኙ',
      inviteCode: 'የግንኙነት ኮድ',
      createPartnerAccount: 'ለአጋርዎ መለያ ይፍጠሩ',
      connectedWithPartner: 'ከ... ጋር ተገናኝቷል',
      pleaseEnterPartnerEmail: 'እባክዎ የአጋርዎን ኢሜይል ያስገቡ',
      failedToConnectPartner: 'ከአጋርዎ ጋር ማገናኘት አልተቻለም',
      failedToCreatePartnerAccount: 'ለአጋርዎ መለያ ማፍጠር አልተቻለም',
      pleaseFillAllFields: 'እባክዎ መስኮቶቹን ይሙሉ',
    },

    settings: {
      profileHeaderPlaceholder: 'ስምዎ',
      connectedWith: 'ከ... ጋር ተገናኝቷል',
      tabs: {
        personal: 'የግል',
        couple: 'የጥምቀት',
        privacy: 'ግላዊነት',
        notifications: 'ማሳወቂያዎች',
        app: 'አፕ',
      },
      personalInfoTitle: 'የግል መረጃ',
      personalInfoDescription: 'የግል ዝርዝሮችን እና የመገለጫ መረጃን ያሻሽሉ',
      fullName: 'ሙሉ ስም *',
      emailAddress: 'የኢሜይል አድራሻ',
      emailCannotChange: 'ኢሜይል ማሻሻያ አይችልም',
      phoneNumber: 'የስልክ ቁጥር',
      location: 'ቦታ',
      bio: 'እንግዳ',
      tellUsAboutYourself: 'ስለ ራስዎ ትንሽ ይንገሩን...',
      saveChanges: 'ለውጦችን አስቀምጥ',
      saving: 'እየማስቀምጥ ነው...',
      accountActionsTitle: 'የመለያ እርምጃዎች',
      adminPanel: 'አስተዳደር ጣቢያ',
      debugQuestions: 'የጥያቄ እንግዳ',
      debugResponses: 'የምላሽ እንግዳ',
      testingDashboard: 'የሙከራ አስተዳደር',
      exportData: 'ውሂብ አስወግድ',
      helpSupport: 'እገዛ እና ድጋፍ',
      contactUs: 'ከእኛ ጋር ይገናኙ',
      signOut: 'ውጣ',
      coupleInfoTitle: 'የእርስዎ ጥምቀት መረጃ',
      coupleInfoDescription: 'የግንኙነትዎን ዝርዝሮች እና ግንኙነት ያስተዳድሩ',
      partnerStatus: 'የአጋር ሁኔታ',
      noPartnerConnected: 'አጋር አልተገናኘም',
      linkByCodeTitle: 'በኮድ ይገናኙ',
      linkByCodeDescription: 'ከአጋርዎ ጋር በእነሱ የግንኙነት ኮድ ይገናኙ',
      enterPartnerCode: 'የአጋርዎን ኮድ ያስገቡ',
      link: 'ይገናኙ',
      myInviteCodeTitle: 'የእኔ የግንኙነት ኮድ',
      shareThisCode: 'ይህን ኮድ ከአጋርዎ ጋር አጋራ:',
      copy: 'ቅፅ አውጥ',
      generateInviteCode: 'የግንኙነት ኮድ ፍጠር',
      relationshipStarted: 'ግንኙነት ተጀመረ',
      dangerZoneTitle: 'አስጠናቀቀ ክስት',
      dangerZoneDescription: 'የመለያዎን ላይ የሚጎዳ እርምጃዎች',
      requestPartnerDisconnect: 'ከአጋር ይቈረጡ',
      deleteAccount: 'መለያ ሰርዝ',
      deleteWarning: '⚠️ መለያዎን እና ከዚህ ጋር የተያያዙ ሁሉንም ውሂብ በቋሚነት ይሰርዛል። ይህ እርምጃ አይመለስም።',
      deleteConfirmPrompt: 'DELETE በማለት ያረጋግጡ:',
      typeDeleteToConfirm: 'DELETE ይተይቡ',
      deleteMyAccount: 'መለያዬን ሰርዝ',
      deleting: 'እየሰረዝ ነው...',
      needAssistance: 'እርዳታ ይፈልጋሉ?',
      getInTouch: 'ከእኛ ጋር ይገናኙ',
      subject: 'ርዕስ',
      message: 'መልእክት',
      sendMessage: 'መልእክት ላክ',
      notificationPreferencesTitle: 'የማሳወቂያ ቅንብሮች',
      notificationPreferencesDescription: 'የሚወስዱትን ማሳወቂያዎች ይምረጡ',
      dailyDevotional: 'ዕለታዊ እግዚአብሔር እምነት',
      prayerReminders: 'የጸሎት ማሳሰቢያዎች',
      partnerActivity: 'የአጋር እንቅስቃሴ',
      communityUpdates: 'የማህበረሰብ ዝርዝሮች',
      saveNotificationSettings: 'የማሳወቂያ ቅንብሮችን አስቀምጥ',
      notificationChannelsTitle: 'የማሳወቂያ ቻናሎች',
      notificationChannelsDescription: 'ማሳወቂያዎችን እንዴት እንደሚቀበሉ ይምረጡ',
      pushNotifications: 'የእጅ ማሳወቂያዎች',
      emailNotifications: 'የኢሜይል ማሳወቂያዎች',
      legalDocumentsTitle: 'ህጋዊ ሰነዶች',
      legalDocumentsDescription: 'የግላዊነት መመሪያ እና የአገልግሎት ውሎች ይመልከቱ',
      privacyPolicy: 'የግላዊነት መመሪያ',
      termsOfService: 'የአገልግሎት ውሎች',
      legalAgreementNotice: 'እንደ መለያ ሲፈጥሩ እነዚህን ሰነዶች ተስማሙ።',
      dataSecurityTitle: 'ውሂብ እና ደህንነት',
      dataSecurityDescription: 'ውሂብዎን እንዴት እንደምንከታተል ይምረጡ',
      changePassword: 'የይለፍ ቃል ቀይር',
      downloadMyData: 'ውሂቤን አውርድ',
      twoFactorAuthentication: 'ሁለት-እጅ ማረጋገጫ',
      helpAndSupport: 'እገዛ እና ድጋፍ',
      adminPanelDescription: 'ለመለያዎ አስተዳደር መሣሪያዎች እና የመገናኛ ጥቅሞች',
    },

    partnerSetup: {
      connectWithYourPartner: 'ከአጋርዎ ጋር ይገናኙ',
      addPartnerToStart: 'ግንኙነትዎን ለመጀመር አጋርዎን ያክሉ',
      connectPartner: 'አጋርን ይገናኙ',
      enterPartnerEmail: 'የአጋር ኢሜይል',
      enterPartnersName: 'የአጋር ስም',
      relationshipStarted: 'ግንኙነቱ ጀጀመ',
      tempPasswordCreated: 'የጊዜያዊ የይለፍ ቃል ይፈጠራል። እባክዎ እሱን ከአጋርዎ ጋር ያጋሩ።',
      temporaryPassword: 'የጊዜያዊ የይለፍ ቃል',
      partnerEmailPlaceholder: 'partner@example.com',
      back: 'ተመለስ',
      creating: 'እየፈጠረ ነው...',
      createAndConnect: 'ፍጠር እና ይገናኙ',
      allSet: 'ሁሉም ተደርጓል! 💕',
      nowConnectedWith: 'አሁን ከ... ጋር ተገናኝቷል',
      relationshipStartedDate: 'ግንኙነቱ ተጀምሯል:',
      createPartnerAccount: 'ለአጋርዎ መለያ ይፍጠሩ',
      partnerEmailNotFound: 'የአጋርዎ መለያ አልተገኘም። ለእሱ አንድ እንፈጥር?',
      partnerAccountHelp: 'እርስዎ አጋርዎ እስከዚህ ድረስ መለያ የሌለው ከሆነ፣ እንረዳዎታለን።',
      createAccountForPartner: 'ለ... መለያ ይፍጠሩ',
      createdAccountFor: 'ለ... መለያ ፈጠርሁ',
      failedToConnect: 'ከአጋርዎ ጋር ማገናኘት አልተቻለም',
      failedToCreateAccount: 'ለአጋርዎ መለያ ማፍጠር አልተቻለም',
      pleaseEnterPartnerEmail: 'እባክዎ የአጋርዎን ኢሜይል ያስገቡ',
      pleaseFillAllFields: 'እባክዎ ሬርዕይቱን ይሙሉ',
    },

    dashboard: {
      addPartner: 'አጋር ያክሉ',
      devotionalStreak: 'የእግዚአብሔር እምነት ተከታታይ',
      journalEntries: 'የማስታወሻ ግቤቶች',
      prayers: 'ጸሎቶች',
      questions: 'ጥያቄዎች',
      shared: 'ተጋርቷል',
      answered: 'መልሶ ተሰጠ',
      readFullChapter: 'ሙሉውን ምዕራፍ ያንብቡ',
      todaysMood: 'ዛሬ የእዝ ዓይነት',
      shareHowYouFeelingWithPartner: 'ስሜትዎን ከአጋርዎ ጋር ያጋሩ',
      yourMood: 'የእዝ ዓይነት',
      tapEmojiToSetMood: 'የእዝ ዓይነትዎን ለማስቀመጥ ኢሞጂ መታ ይንካ',
      moodLabel: "የ... ስሜት",
      today: 'ዛሬ',
      moodNotSetYet: 'ገና አልተቀመጠም',
      relationshipMilestones: 'የግንኙነት ሚሊዮን',
      celebrateYourJourneyTogether: 'ርቀታችሁን ወደ አንድ ነገር ይገናኙ',
      noMilestonesYet: 'ገና ሚሊዮን የለም',
      addYourFirstMilestone: 'የመጀመሪያ ሚሊዮን ያክሉ',
      yourJourneyTogether: 'እርስዎ የናንተ ጉዞ ክፍተፃወትም',
      buildingStrongFoundationInFaith: 'በእምነት ውስጥ ጠንካራ መሠረት በመገንባት',
      dailyDevotionals: 'ዕለታዊ እግዚአብሔር እምነት',
      knowEachOtherQuestions: 'ስለ ራስ ጥያቄዎች',
      sharedJournalEntries: 'የተጋራ የማስታወሻ ግቤቶች',
      recentJournalEntries: 'ቅርብ ወቅት የማስታወሻ ግቤቶች',
      byLabel: 'በ',
      quickActions: 'ፈጣን እርምጃዎች',
      continueYourSpiritualJourney: 'መንፈሳዊ ጉዞአ ይቀጥሉ',
      scriptureMemory: 'ሐ-ቃል ትዕዝ',
      memorizeGodsWordTogether: "የእግዚአብሔር ቃል አንድ ላይ ያስታውሱ",
      featuredVerse: 'ታዋቂ ሙያ',
      startLearning: 'ለመማር ጀምር',
      growingTogetherInFaith: 'በእምነት ውስጥ አንድ ላይ ያድጋሉ',
      connectWithYourPartnerBegin: 'ጉዞ ለመጀመር ከአጋርዎ ጋር ይገናኙ',
      viewAll: 'ሁሉ ይመልከቱ',
      dailyVerse: 'ዕለታዊ ሙያ',
      firstDayTogether: 'መጀመሪያ ቀን አንድ ላይ',
      beginningOfJourney: 'ውብ ጉዞእ ጅምር',
      firstMilestoneAdded: 'መጀመሪያ ሚሊዮን ታክሏል!',
    },

    prayers: {
      requests: 'ጥያቄዎች',
      answered: 'መልሶ ተሰጠ',
      together: 'አንድ ላይ',
      searchPrayerRequests: 'ጸሎት ጥያቄ ሩ...',
      connectWithYourPartner: 'ከአጋርዎ ጋር ይገናኙ',
      prayerSharingAvailable: 'ጸሎት ተጋርቶ የሚቻለው እርስ አንድ ላይ ሲገናኙ ነው። የአጋርዎን ኮድ ያጋሩ ወይም ይገቡ።',
      noPrayersTogether: 'ገና አንድ ላይ ጸሎት የለም',
      noAnsweredPrayers: 'መልሶ ተሰጠ ጸሎት የለም',
      noPrayerRequests: 'ጸሎት ጥያቄ የለም',
      answeredPrayersWillAppear: 'መልሶ ተሰጠ ጸሎት እዚህ ይታያል',
      prayTogetherAsCouple: 'አንድ ላይ ጸሎት ይበሉ ከአጋርዎ ጋር ግንኙነትዎን ለማጠናከር',
      startByAddingPrayerRequest: 'ጸሎት ጥያቄ በመጨምር ጀምር',
      youLabel: 'እርስዎ',
      partnerLabel: 'አጋር',
      prayerCountSingular: 'ጸሎት',
      prayerCountPlural: 'ጸሎቶች',
      newPrayerRequest: 'አዲስ ጸሎት ጥያቄ',
      bringNeedsAndConcernsBefore: 'ፍላጎትና ስጋታችሁን በእግዚአብሔር ፊት ያቀርቡ። አንድ ላይ ጸሎት ይበሉ።',
      categoryLabel: 'ምድብ',
      prayerTitleLabel: 'ጸሎት ርዕስ',
      whatAreYouPrayingFor: 'ምን ላይ ነው ሊጸልዩ ያሰቡበት?',
      detailsLabel: 'ዝርዝሮች',
      shareMoreAboutThisPrayer: 'ስለ ይህ ጸሎት ተጨማሪ ይወቅ...',
      setReminderOptional: 'ማሳሰቢያ ያስቀምጡ (አርቂ)',
      shareWithCommunity: 'ከማህበረሰብ ጋር ያጋሩ',
      allowOtherCouplesToSee: 'ሌሎች የናንተ ጸሎት ደግስ የሚያቁ ለማየት ይፈቅዱ',
      cancelButton: 'ሰርዝ',
      savingButton: 'እየቀመጠ ነው...',
      addPrayerButton: 'ጸሎት ያክሉ',
      updateButton: 'ያስቀምጡ',
      editButton: 'ቀይር',
      markActiveButton: 'ንቁ አድርግ',
      markAnsweredButton: 'መልስ ተሰጠ አድርግ',
      deleteButton: 'ሰርዝ',
      deleteThisPrayer: 'ይህን ጸሎት ሰርዝ?',
      prayerUpdated: 'ጸሎት ተከፋፈለ!',
      prayerRequestAdded: 'ጸሎት ጥያቄ ታክሏል!',
      failedToSavePrayer: 'ጸሎት ጥያቄ ማስቀመጥ አልተቻለም',
      praiseGodPrayerAnswered: 'እግዚአብሔር ይሸለም! ጸሎት መልሷል! 🎉',
    },

    mood: {
      howAreWeToday: 'ዛሬ ምን ሁኔታ ውስጥ ነንታል?',
      youLabel: 'እርስዎ',
      partnerLabel: 'አጋር',
      great: 'ታላቅ',
      okay: 'መሪ',
      sad: 'ሞጣር',
      moodSaved: 'ስሜት ተቀመጠ!',
      failedToSaveMood: 'ስሜት ማስቀመጥ አልተቻለም',
    },

    devotional: {
      todaysDevotion: "ዛሬ የእግዚአብሔር እምነት",
      completedToday: 'ዛሬ ጨርስቷል',
      markAsRead: 'ክፍት ላይ ምልክት ያድርጉ',
    },

    conversation: {
      dailyConversation: 'ዕለታዊ ንግግር',
      nextIn: 'በ... ውስጥ ቀጥታ',
      results: 'ውጤቶች',
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
