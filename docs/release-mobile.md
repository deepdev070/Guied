# Mobile Build & Store Release Guide (Expo EAS & Play/App Store)

> **Document Scope**: Complete step-by-step operational runbook for compiling, signing, testing, and releasing the **India Paperwork Guide** mobile application (`in.gov.paperworkguide.mobile`) to the Google Play Store and Apple App Store using Expo Application Services (EAS). Conforms to Prompt 130 and civic trust policies.

---

## 1. EAS Build & Submit Configuration Overview

The project uses EAS CLI for deterministic cloud builds and automated submission. Configuration is centralized in `apps/mobile/eas.json`.

### Build Profiles

| Profile       | Target Environment      | Artifact Type                        | Use Case                                              |
| ------------- | ----------------------- | ------------------------------------ | ----------------------------------------------------- |
| `development` | Local / Emulators       | Android `.apk` / iOS Simulator       | Debugging with Expo Dev Client                        |
| `preview`     | QA / Internal Testing   | Android `.apk` / iOS Ad-Hoc          | Direct install for team verification & offline checks |
| `production`  | Google Play & App Store | Android `.aab` (Bundle) / iOS `.ipa` | Release track distribution                            |

### CLI Commands

```bash
# Build standalone preview APK for direct Android device testing
eas build --platform android --profile preview

# Build production Android App Bundle (AAB)
eas build --platform android --profile production

# Build production iOS IPA for TestFlight
eas build --platform ios --profile production

# Submit latest production build to Google Play Internal track
eas submit --platform android --profile production
```

---

## 2. Google Play Developer Account Setup

1. **Account Registration**:
   - Register at the [Google Play Console](https://play.google.com/console).
   - One-time registration fee: **$25 USD**.
   - Account Type: **Organization** (recommended for civic non-profits) or **Individual**.
2. **Identity Verification & D-U-N-S**:
   - For organization accounts: Provide official organization documents (CIN, NGO Darpan, or Trust Deed) and matching D-U-N-S number.
   - For individual accounts: Government-issued photo ID (Passport / Driving Licence / Voter ID) and recent address proof.
3. **API Access & Service Account**:
   - Navigate to **Google Play Console > API Access**.
   - Link or create a Google Cloud Project.
   - Create a Service Account with **Release Manager** permissions.
   - Download the JSON private key and store securely at `apps/mobile/google-services-key.json` (gitignored).

---

## 3. Apple Developer Account Setup

1. **Account Enrollment**:
   - Enroll via the Apple Developer App or at [developer.apple.com](https://developer.apple.com).
   - Annual subscription: **$99 USD/year**.
   - Requires D-U-N-S number for Organization accounts and legal binding authority.
2. **App Store Connect Credentials**:
   - Generate App Store Connect API Key (**Keys > App Store Connect API**).
   - Key Roles: **App Manager** or **Admin**.
   - Configure credentials in EAS:
     ```bash
     eas credentials
     ```
   - Record `appleId`, `ascAppId`, and `appleTeamId` in `apps/mobile/eas.json`.

---

## 4. App Signing & Keystore Management

### Android App Signing (Play Feature Delivery)

- **Google Play App Signing**: Enabled by default for all new apps.
- **Upload Key**: Generated automatically by EAS credentials manager:
  ```bash
  eas credentials --platform android
  ```
- **SHA-256 Fingerprint**:
  - Once generated, extract the SHA-256 fingerprint from Google Play Console (**Setup > App Integrity**).
  - Verify it matches `public/.well-known/assetlinks.json` on `https://indiapaperwork.in` to allow seamless Android App Links opening.

### iOS Code Signing

- Managed via EAS cloud credentials.
- EAS automatically creates Distribution Certificates, App IDs, and App Store Provisioning Profiles.

---

## 5. Store Listing Text & Civic Positioning

### App Identity

- **App Name**: `India Paperwork Guide: Citizen Portals & Fees`
- **Short Description (Max 80 characters)**:
  `Verified Indian document checklists, official fees & state portal links.`

### Full Description (Class 8 Plain Language)

```markdown
India Paperwork Guide is an independent, 100% free civic utility created to help every Indian citizen navigate official paperwork with confidence — without agents, bribes, or confusion.

🇮🇳 WHAT WE COVER:
• Vehicles & Driving: Learner Licences (LLR), Permanent DL, Renewals, and RC Transfers on Parivahan Sarathi.
• Identity & Travel: Passport Renewal (Normal & Tatkaal), Voter ID Form 6, Instant e-PAN, and Aadhaar updates.
• State Certificates (Launch State: Gujarat): Digital Gujarat Income Certificates, Domicile Certificates, Caste Certificates, Non-Creamy Layer (NCL), and Ration Card Services.

✨ KEY CITIZEN FEATURES:
• 100% Verified Statutory Fees: Exact official government fee breakdowns with zero agent markups.
• Complete Document Checklists: Never get turned away at an RTO or Seva Kendra for a missing xerox.
• Offline-Ready Mode: Saved checklists and top Gujarat guides work in full offline/airplane mode.
• Class 8 Simple Language: Explanations anyone can understand, in English, Hindi (हिन्दी), and Gujarati (ગુજરાતી).
• Direct Official Portal Links: One-tap access to official .gov.in and .nic.in departments.
• Polite Appointment Reminders: Local reminders 24h and 1h before your booked slot so you never miss an appointment.

⚠️ STATUTORY DISCLAIMER:
India Paperwork Guide is an independent civic portal. We are NOT affiliated with, endorsed by, or an official agency of the Government of India or the Government of Gujarat. All guides cite official gazettes and portals (sarathi.parivahan.gov.in, passportindia.gov.in, digitalgujarat.gov.in).
```

### Search Keywords

`india paperwork, driving licence gujarat, sarathi parivahan, passport renewal india, digital gujarat portal, voter id form 6, ration card gujarat, civic checklist, rto appointment reminder`

---

## 6. Screenshots Checklist (Phone & Tablet Sizes)

Google Play and Apple App Store require specific display resolutions. Ensure all screenshots are in **100% strict light mode**.

| Platform               | Target Screen              | Resolution       | Required View Content                                                                                                                                                                              |
| ---------------------- | -------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Android Phone**      | Standard (16:9 / 20:9)     | `1080 x 2400` px | 1. Home search & category badges<br>2. Gujarat Top 10 Guides<br>3. Document Checklist & Progress bar<br>4. Step-by-Step Procedure & Fee breakdown<br>5. Offline mode notice & appointment reminder |
| **Android 7" Tablet**  | 7-Inch Tablet              | `1200 x 1920` px | Home screen & Side-by-side Checklist layout                                                                                                                                                        |
| **Android 10" Tablet** | 10-Inch Tablet             | `2048 x 1536` px | Full task view with dual-column layout                                                                                                                                                             |
| **iOS 6.7" Display**   | iPhone 15/14 Pro Max       | `1290 x 2796` px | 1. Hero search & categories<br>2. Document checklist with toggles<br>3. Statutory fees breakdown<br>4. Saved lists & offline badge<br>5. Multilingual settings screen                              |
| **iOS 6.5" Display**   | iPhone 11 Pro Max / XS Max | `1242 x 2688` px | Core task flow and appointment reminder modal                                                                                                                                                      |
| **iOS 12.9" iPad**     | iPad Pro (6th Gen)         | `2048 x 2732` px | Expanded tablet interface                                                                                                                                                                          |

---

## 7. Privacy Policy URL & Data Safety Declarations

- **Official Privacy Policy URL**:
  `https://indiapaperwork.in/privacy-policy`

### Google Play Data Safety Questionnaire Answers

| Section                | Question                         | Answer                                | Reason / Justification                                                             |
| ---------------------- | -------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| **Data Collection**    | Does your app collect user data? | **No** (or Optional Diagnostics only) | We do not collect names, phone numbers, Aadhaar, or financial details.             |
| **Data Sharing**       | Is data shared with 3rd parties? | **No**                                | No user data is sold, rented, or transmitted to data brokers.                      |
| **Security Practices** | Is data encrypted in transit?    | **Yes**                               | All network requests to government portals and API use TLS 1.3 / HTTPS.            |
| **Account Creation**   | Can users create an account?     | **No**                                | 100% account-free. Checklists and preferences are stored locally on device.        |
| **Data Deletion**      | Can users request data deletion? | **Yes (Self-service)**                | Clear All Data button provided in More tab clears device SQLite/storage instantly. |

### Apple App Privacy Nutrition Labels

- **Category**: **Data Not Collected**.
- Declare zero tracking across apps and websites.

---

## 8. Content Rating (IARC Questionnaire)

Complete the International Age Rating Coalition (IARC) questionnaire in Google Play Console:

- Violence: **None**
- Sexual Content: **None**
- Profanity: **None**
- Controlled Substances: **None**
- Gambling: **None**
- User Interaction: **No unrestricted citizen-to-citizen messaging**
- **Resulting Ratings**:
  - Google Play: **PEGI 3** / **Everyone (E)**
  - Apple App Store: **4+** (Appropriate for all ages)

---

## 9. Testing Tracks & Phased Rollout Schedule

### Track 1: Internal Testing (Week 1)

- **Target**: Core engineering team (up to 100 users).
- **Goal**: Validate deep link routing, offline datapack synchronization, local notification triggers, and light theme rendering on Android 10-15 and iOS 16-18.

### Track 2: Closed Testing / 20-Tester Policy (Weeks 2–3)

- Google Play requirement: 20 opted-in testers for 14 continuous days.
- **Focus**: Real-world field testing across Gujarat (Ahmedabad, Surat, Rajkot, Vadodara) verifying regional Gujarati script readability and low-bandwidth 2G/3G performance.

### Track 3: Open Beta / Apple TestFlight (Week 4)

- Public testing link for citizen advocates and consumer grievance forums.
- Monitoring crash-free session rate (Target: > 99.8%).

### Track 4: Production Release (Phased Rollout)

- **Day 1**: 10% staged rollout.
- **Day 3**: 25% rollout (check crash metrics and ANR rates).
- **Day 5**: 50% rollout.
- **Day 7**: 100% Full production release across India.
