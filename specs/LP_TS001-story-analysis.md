# User Story Analysis — LP_TS001 (SAHAYOG Web Portal — Login Module)

## 1. Story Identity
- **Story ID:** LP_TS001
- **Title:** Login Module — Authentication Entry Point
- **Module:** Login (`user-stories/Login.md`)
- **Business Objective:** Authenticate registered users against the SAHAYOG portal (branded "Drutam Origination"), reject invalid/unauthorized attempts with clear messaging, establish a session/token on success, redirect to the dashboard, and support password recovery — this module is a reusable precondition for every other end-to-end scenario in the suite.

## 2. Application Context
- **URL:** `http://14.142.238.28:8989/radheAgentWeb/login`
- **Valid credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`
- **Confirmed via recon:** app title is "Drutam Origination"; successful login redirects to `http://14.142.238.28:8989/radheAgentWeb/HOME`.
- **Auth API (discovered):** `POST http://14.142.238.29:8081/radheUserManagementAPI/oauth2/token` (separate host/port from the web app). Post-login the app calls `GET .../001/user/data`, `POST .../admin/sidemenu/list`, and AOS APIs (`finco/logo/get/allLogo`, `aos/app/notification/list`, `aos/alert/get/list`).

## 3. Entities and Operations
| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| User Credentials | — (registration out of scope) | Validated on login | Password reset via "Forgot Password" flow | — |
| Session / Auth Token | Created on successful login (`oauth2/token`) | Used for all subsequent authenticated calls | Refreshed implicitly | Invalidated on logout (TC_05) |
| User Profile / Side Menu | — | Loaded post-login (`user/data`, `sidemenu/list`) | — | — |

## 4. State Transitions
1. **Unauthenticated / Login page loaded** → initial state
2. **Validating** → client-side check fires on submit (currently only checks "required", see BR gap below)
3. **Authenticating** → `oauth2/token` call in flight; button should be disabled
4. **Authenticated** → redirected to `/HOME`, session/token present, side menu + dashboard data loaded
5. **Auth Failed** → remains on login page, password field cleared/still masked, toast error shown (`role=alert`, PrimeReact `.p-toast-message-error`)
6. **Session Expired / Logged Out** → returns to Unauthenticated state

## 5. Business Rules (from story §8, verified against live app where possible)
| Rule | Description | Recon Verification |
|---|---|---|
| BR-001 | Email/User Id mandatory | ✅ Confirmed — blank User Id shows "Enter User Id" |
| BR-002 | Password mandatory | ✅ Confirmed — blank password shows "Enter password" |
| BR-003 | Valid email format enforced | ⚠️ **NOT enforced client-side** — `not-an-email` was submitted directly to the auth API instead of being blocked; see Defect DEF-001 |
| BR-004 | Password masked by default | ✅ Confirmed — `type="password"` by default |
| BR-005 | Authentication only after validations pass | Partially true — required-field validation runs, but format validation (BR-003) does not |
| BR-006 | Session only after successful login | ✅ Confirmed — wrong password never reaches `/HOME` |
| BR-007 | Unauthorized users cannot access dashboard | To verify via direct-URL navigation test |
| BR-008 | No sensitive authentication errors | ✅ Generic message shown ("The password you entered is incorrect" / "The credentials you entered are incorrect") — no stack traces or raw API payloads surfaced |
| BR-009 | Password never logged | To verify — no console/localStorage leakage observed in recon console capture |
| BR-010 | Enter key performs login | ✅ Confirmed — `Enter` on password field submits and redirects to `/HOME` with valid creds |

## 6. Third-Party / External Integrations
- **Auth Service** — `14.142.238.29:8081/radheUserManagementAPI/oauth2/token` (cross-origin from the web host)
- **User Management API** — user/data, sidemenu/list
- **AOS API** — logo, notifications, alerts (loaded on dashboard, not login-critical)
- **Email Service** — Forgot Password flow (link present; backend behavior not exercised in this pass — flagged as follow-up)
- **FCM (Firebase Cloud Messaging)** — console warns "FCM not supported in this browser" on every load; non-blocking, not a login defect

## 7. Acceptance Criteria (from Functional Workflow §7 + Business Rules §8 + Security §11)
| AC Ref | Criterion | Type |
|---|---|---|
| AC-01 | Login page loads with logo, User Id, Password, Login button, Forgot Password link | UI |
| AC-02 | Email/User Id field is mandatory (BR-001) | Business Rule |
| AC-03 | Password field is mandatory (BR-002) | Business Rule |
| AC-04 | Invalid email format is rejected before an auth call is made (BR-003) | Business Rule |
| AC-05 | Password is masked by default and toggleable (BR-004, Scenario 13/14) | UI |
| AC-06 | Tab order moves logically through User Id → Password → Login (Scenario 4) | Functional |
| AC-07 | Enter key submits the form (BR-010, Scenario 5) | Functional |
| AC-08 | Valid credentials redirect to Dashboard/HOME and establish a session (Scenario 6) | Functional |
| AC-09 | Invalid password shows a generic, non-sensitive error and does not authenticate (Scenario 8, BR-008) | Negative |
| AC-10 | Blank form submission shows both field validations without an API call (Scenario 9) | Negative |
| AC-11 | Login button/form is disabled while the auth request is in flight (state-aware) | Non-Functional |
| AC-12 | Forgot Password link is reachable and initiates its flow (Scenario 15) | Functional |
| AC-13 | No credentials appear in the URL, and traffic is inspectable only via POST body (Security §11) | Security |
| AC-14 | Layout is responsive across viewport sizes (UI Checklist §10) | Responsive |
| AC-15 | Direct navigation to `/HOME` while unauthenticated is blocked (BR-007) | Security |

---
*Note: Story reference in `prompts/loginprompt.md` points to `user-stories/EC-AUTH-LOGIN-001.md`, which does not exist in this repo. The actual story file is `user-stories/Login.md`; Story ID `LP_TS001` (from its own Traceability section) is used throughout this run instead of the placeholder `EC-AUTH-LOGIN-001`.*
