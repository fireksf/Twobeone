# Localization Analysis: Hardcoded English Strings

This document identifies all user-facing hardcoded English text in the 5 target components that need translation to Amharic.

---

## 1. CoupleDashboard.tsx

**Location:** `src/app/components/CoupleDashboard.tsx`

### Button Text & Actions
| Line | String | Category | Context |
|------|--------|----------|---------|
| 331 | "Add Partner" | Button Text | User action to connect with partner |
| 636 | "View All" | Button Text | Link to view all journal entries |

### Labels & Headers
| Line | String | Category | Context |
|------|--------|----------|---------|
| 351 | "Devotional Streak" | Stat Label | Title for daily devotional count |
| 353-354 | "day" / "days" | Label | Singular/plural for day count |
| 367 | "Journal Entries" | Stat Label | Title for journal entries count |
| 372 | "shared" | Label | Descriptor for shared entries |
| 382 | "Prayers" | Stat Label | Title for prayer statistics |
| 387, 403 | "answered" | Label | Descriptor for answered prayers |
| 398 | "Questions" | Stat Label | Title for questions answered |
| 417 | "Daily Verse" | Card Title | Bible verse section header |
| 458 | "Read Full Chapter" | Button Text | Action to open full Bible chapter |
| 470 | "Today's Mood" | Card Title | Mood tracking section header |
| 471 | "Share how you're feeling with your partner" | Card Description | Mood section instruction |
| 478 | "Your Mood" | Label | User mood section label |
| 493 | "Tap an emoji to set your mood" | Helper Text | Instruction for mood selection |
| 498 | "'s Mood" | Label Template | Partner mood label (concatenated) |
| 507 | "Today" | Label | Date label for mood entry |
| 512 | "Not set yet" | Status Text | When partner mood not set |
| 519 | "Relationship Milestones" | Card Title | Milestones section header |
| 527 | "Celebrate your journey together" | Card Description | Milestones section instruction |
| 542 | "No milestones yet" | Empty State | When no milestones exist |
| 571 | "Add Your First Milestone" | Button Text | Action to add first milestone |
| 579 | "Your Journey Together" | Card Title | Progress tracking section header |
| 581 | "Building a strong foundation in faith" | Card Description | Journey section instruction |
| 593 | "Daily Devotionals" | Progress Label | Devotional progress tracker |
| 605 | "Know Each Other Questions" | Progress Label | Questions progress tracker |
| 617 | "Shared Journal Entries" | Progress Label | Journal progress tracker |
| 628 | "Recent Journal Entries" | Card Title | Recent activity section header |
| 655 | "by " | Label Template | Author attribution (concatenated with name) |
| 663 | "Quick Actions" | Card Title | Quick actions section header |
| 664 | "Continue your spiritual journey" | Card Description | Quick actions instruction |
| 679 | "Scripture Memory" | Card Title | New feature header |
| 680 | "Memorize God's Word together" | Card Description | Scripture memory instruction |
| 688 | "Featured Verse" | Label | Featured verse sub-label |
| 689 | "Love is patient and kind..." | Scripture Quote | Sample verse text |
| 690 | "1 Corinthians 13:4" | Scripture Reference | Bible verse reference |
| 698 | "Start Learning" | Button Text | Action to begin scripture memory |
| 324 | "Growing together in faith" | Status Message | Relationship status display |
| 328 | "Connect with your partner to begin your journey together" | Helper Text | Message when no partner linked |

### Toast Messages
| Line | String | Category | Context |
|------|--------|----------|---------|
| 288 | "Mood saved!" | Toast Success | Confirmation after saving mood |
| 291 | "Failed to save mood" | Toast Error | Error when mood save fails |
| 381 | "Milestone added!" | Toast Success | Confirmation after adding milestone |

### Static Skill/Feature Names
| Line | String | Category | Context |
|------|--------|----------|---------|
| 560 | "First Day Together" | Milestone Title | Auto-generated first milestone |
| 562 | "The beginning of your beautiful journey" | Milestone Description | Auto-generated first milestone |
| 567 | "First milestone added!" | Toast Success | Confirmation after first milestone |

---

## 2. MoodTracker.tsx

**Location:** `src/app/components/MoodTracker.tsx`

### Headers & Labels
| Line | String | Category | Context |
|------|--------|----------|---------|
| 14 | "How are we today?" | Card Title | Main mood tracker header |
| 25 | "You" | Section Label | User's mood section |
| 36 | "Partner" | Section Label | Partner's mood section |

### Mood Labels
| Line | String | Category | Context |
|------|--------|----------|---------|
| 8 | "Great" | Mood Label | Mood option (great emoji 😊) |
| 9 | "Okay" | Mood Label | Mood option (okay emoji 😐) |
| 10 | "Sad" | Mood Label | Mood option (sad emoji 😔) |

### Toast Messages
| Line | String | Category | Context |
|------|--------|----------|---------|
| 28 | "Mood saved!" | Toast Success | Confirmation after saving mood |
| 31 | "Failed to save mood" | Toast Error | Error when mood save fails |

---

## 3. DailyDevotional.tsx

**Location:** `src/app/components/DailyDevotional.tsx`

### Headers & Labels
| Line | String | Category | Context |
|------|--------|----------|---------|
| 25 | "Today's Devotional" | Label | Devotional section label |

### Button Text
| Line | String | Category | Context |
|------|--------|----------|---------|
| 45 | "Completed Today" | Button Text (Completed State) | Shows when devotional is completed |
| 48 | "Mark as Read" | Button Text (Default State) | Action to mark devotional complete |

---

## 4. PrayerBoard.tsx

**Location:** `src/app/components/PrayerBoard.tsx`

### Tab Labels
| Line | String | Category | Context |
|------|--------|----------|---------|
| 143 | "Requests" | Tab Label | Prayer requests tab |
| 155 | "Answered" | Tab Label | Answered prayers tab |
| 167 | "Together" | Tab Label | Couple prayers tab |

### Search & Input
| Line | String | Category | Context |
|------|--------|----------|---------|
| 186 | "Search prayer requests..." | Placeholder Text | Search input placeholder |

### Empty States & Messages
| Line | String | Category | Context |
|------|--------|----------|---------|
| 210 | "Connect with Your Partner" | Empty State Title | When not connected as couple |
| 216 | "Prayer sharing is available when you're connected as a couple. Share your invite code or enter your partner's code to start praying together." | Empty State Description | Partnership required message |
| 223 | "No Prayers Together Yet" | Empty State Title | Together tab empty |
| 224 | "No Answered Prayers" | Empty State Title | Answered tab empty |
| 225 | "No Prayer Requests" | Empty State Title | Requests tab empty |
| 226 | "Answered prayers will appear here" | Empty State Description | Answered tab empty message |
| 227 | "Pray together as a couple to strengthen your bond" | Empty State Description | Together tab empty message |
| 228 | "Start by adding a prayer request" | Empty State Description | Requests tab empty message |

### Prayer Status & Metadata
| Line | String | Category | Context |
|------|--------|----------|---------|
| 260 | "You" | Label | User's prayer status indicator |
| 267 | "Partner" | Label | Partner's prayer status indicator |
| 252 | "prayer" / "prayers" | Label Template | Singular/plural prayer count |

### Dialog & Form
| Line | String | Category | Context |
|------|--------|----------|---------|
| 349 | "New Prayer Request" | Dialog Title | Add prayer dialog header |
| 350 | "Bring your needs and concerns before God. Pray together as a couple." | Dialog Description | Dialog instruction |
| 358 | "Category" | Form Label | Prayer category selection label |
| 376 | "Prayer Title" | Form Label | Prayer title input label |
| 381 | "What are you praying for?" | Input Placeholder | Title input placeholder |
| 387 | "Details" | Form Label | Prayer description label |
| 392 | "Share more about this prayer request..." | Textarea Placeholder | Details input placeholder |
| 401 | "Set Reminder (Optional)" | Form Label | Reminder date label |
| 409 | "Share with Community" | Toggle Label | Community sharing label |
| 411 | "Allow other couples to see and pray for this request" | Helper Text | Community sharing description |
| 418 | "Cancel" | Button Text | Dialog cancel button |
| 425 | "Saving..." | Button Text (Loading) | Submit button loading state |
| 425 | "Add Prayer" | Button Text (Default) | Submit button default state |
| 425 | "Update" | Button Text (Edit) | Submit button edit state |

### Action Buttons (Expanded)
| Line | String | Category | Context |
|------|--------|----------|---------|
| 316 | "Edit" | Button Text | Edit prayer action |
| 321 | "Mark Active" | Button Text | Toggle prayer status (answered) |
| 322 | "Mark Answered" | Button Text | Toggle prayer status (active) |
| 327 | "Delete" | Button Text | Delete prayer action |
| 326 | "Delete this prayer?" | Confirmation | Delete confirmation prompt |

### Toast Messages
| Line | String | Category | Context |
|------|--------|----------|---------|
| 134 | "Prayer updated!" | Toast Success | Confirmation after updating |
| 135 | "Prayer request added!" | Toast Success | Confirmation after adding |
| 139 | "Failed to save prayer request" | Toast Error | Error when save fails |
| (implied) | "Praise God! Prayer answered! 🎉" | Toast Success | Confirmation when marking answered |

---

## 5. DailyConversation.tsx

**Location:** `src/app/components/DailyConversation.tsx`

### Headers & Labels
| Line | String | Category | Context |
|------|--------|----------|---------|
| 18 | "Daily Conversation" | Card Title | Main component header |
| 29 | "Next in " | Timer Label | Time until next question (prefix) |

### Button Text
| Line | String | Category | Context |
|------|--------|----------|---------|
| 56 | "Results" | Button Text | View results action |

---

## Summary Statistics

| Component | Total Strings | Categories |
|-----------|---------------|-----------|
| **CoupleDashboard.tsx** | 40 | Headers, Labels, Buttons, Toast, Skill Names |
| **MoodTracker.tsx** | 8 | Headers, Labels, Mood Options, Toast |
| **DailyDevotional.tsx** | 3 | Headers, Button States |
| **PrayerBoard.tsx** | 37 | Tabs, Input, Empty States, Forms, Buttons, Toast |
| **DailyConversation.tsx** | 3 | Headers, Buttons |
| **TOTAL** | **91** | |

---

## Priority for Translation

### High Priority (User Interaction)
- Button text (Add, Edit, Delete, Mark as Read, etc.)
- Form labels and placeholders
- Tab names and navigation
- Toast messages
- Empty state messages
- Card titles and section headers

### Medium Priority (Status & Context)
- Mood labels
- Status indicators
- Timer/countdown text
- Helper text and descriptions

### Low Priority (Data-Driven)
- Prayer/journal counts (numerical)
- Auto-generated dates
- Scripture references (keep original)
- User names (personalization)

---

## Notes for Localization Implementation

1. **Hardcoded Strings**: All 91 strings should be moved to a centralized localization file (`useLanguage` hook or i18n)
2. **Pluralization**: Handle singular/plural forms (day/days, prayer/prayers)
3. **Templated Strings**: Some strings are concatenated (e.g., "'s Mood", "by ") - use proper templating
4. **Scripture References**: Keep Bible verse references in original English (standard practice)
5. **Emojis**: Keep emoji indicators, only translate text
6. **Date Formatting**: Use locale-aware date formatting instead of hardcoded format strings
7. **Fallback**: Ensure fallback to English if translations missing

---

## Files Affected
- `/src/app/components/CoupleDashboard.tsx`
- `/src/app/components/MoodTracker.tsx`
- `/src/app/components/DailyDevotional.tsx`
- `/src/app/components/PrayerBoard.tsx`
- `/src/app/components/DailyConversation.tsx`
