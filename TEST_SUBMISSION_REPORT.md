# SE Project Test Submission Report (Dev Branch)

Date: 2026-04-25  
Branch tested: Dev

## Test Code Location
- Backend smoke tests: backend/test/module-smoke.test.js
- Backend test script: backend/package.json (script: test)
- Shared comprehensive suite: tests/**
- Shared suite runner: backend/package.json (script: test:system)

## Full-System Validation (Shared Tests Folder)
- Command: `npm run test:system` (from `backend`)
- Result: PASS
- Totals: 28 suites passed, 218 tests passed, 0 failed

### Newly Added Missing Module Integration Tests
- tests/integration/user.test.js
- tests/integration/roomRequest.test.js
- tests/integration/vacate.test.js
- tests/integration/warden.test.js
- tests/integration/report.test.js
- tests/integration/hostel.test.js
- tests/integration/support.test.js

## How Tests Were Run
1. Backend: `npm test` in `backend`
2. Frontend lint: `npm run lint` in `frontend`
3. Frontend build: `npm run build` in `frontend`

---

## Module-wise Status (Backend)

### 1. Auth Module
- Endpoint tested: `GET /api/v1/auth/me`
- Expected: 401 (anonymous blocked)
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Auth PASS

### 2. User Module
- Endpoint tested: `GET /api/v1/user/profile`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing User PASS

### 3. Payment Module
- Endpoint tested: `GET /api/v1/payments/key`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Payment PASS

### 4. Room Request Module
- Endpoint tested: `GET /api/v1/room-requests/me`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Room Request PASS

### 5. Mess Module
- Endpoint tested: `GET /api/v1/mess/plans`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Mess PASS

### 6. Notification Module
- Endpoint tested: `GET /api/v1/notifications`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Notification PASS

### 7. Vacate Module
- Endpoint tested: `GET /api/v1/vacate-requests/me`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Vacate PASS

### 8. Complaint Module
- Endpoint tested: `GET /api/v1/complaints`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Complaint PASS

### 9. Hostel Module
- Endpoint tested: `GET /api/v1/hostels`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Hostel PASS

### 10. Report Module
- Endpoint tested: `GET /api/v1/reports/dashboard/admin`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Report PASS

### 11. Warden Module
- Endpoint tested: `GET /api/v1/warden/dashboard`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: test case in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Warden PASS

### 12. Room Module
- Endpoint tested: `GET /api/v1/rooms/demo-room-id`
- Expected: 401
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: room test in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal line showing Room PASS

### 13. Support Module
- Endpoint tested: `POST /api/v1/support/contact` with empty body
- Expected: 400 validation error
- Actual: PASS
- Endpoint tested: `POST /api/v1/support/subscribe` with invalid email
- Expected: 400 validation error
- Actual: PASS
- Screenshot checklist:
  - Code screenshot: support tests in `backend/test/module-smoke.test.js`
  - Result screenshot: terminal lines showing both support PASS tests

---

## Frontend Status

### Lint Check
- Command: `npm run lint`
- Actual: PASS (no errors)
- Summary: 0 errors, 7 warnings

### Build Check
- Command: `npm run build`
- Actual: PASS
- Note: Bundle size warning (>500 kB chunks) shown.

### End-to-End Check
- Command: `npm run test:e2e` from `frontend`
- Actual: PASS
- Coverage: public auth pages, invalid login, student dashboard routes, hostel admin dashboard routes, warden dashboard routes, mess admin dashboard routes

---

## Final System Status (Current Dev Branch)
- Backend smoke tests: 14 PASS, 0 FAIL
- Shared comprehensive suite: 28 PASS suites, 218 PASS tests, 0 FAIL
- Frontend lint: PASS with warnings (0 errors, 7 warnings)
- Frontend production build: PASS
- Frontend Playwright e2e: PASS
