# Driving Test API - Postman Testing Guide

## Overview
This guide helps you test the entire Driving Test application using Postman. The collection includes 50+ requests covering all features.

## Quick Start

### 1. Import the Collection
- Open Postman
- Click **Import** → select `Driving_Test_API.postman_collection.json`
- The collection will appear in your Postman sidebar

### 2. Set Environment Variables
All requests use these variables (defined at collection level):
- `{{student_token}}` - JWT token for student (set after login)
- `{{admin_token}}` - JWT token for admin (set after admin login)
- `{{session_id}}` - Practice session ID (set after starting practice)
- `{{exam_id}}` - Exam ID (set after starting exam)

**How to set variables:**
After getting a response, extract the token/ID manually and:
1. Click the eye icon → "Edit" 
2. Find the variable in "Current Values"
3. Paste the token/ID value
4. Close the popup

---

## Testing Scenarios

### Scenario 1: Complete Student Flow (Practice)

**Step 1:** Register a student
```bash
POST /api/auth/register
Body: {
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```
**Expected:** 201 Created
- Save the `token` from response → paste into `{{student_token}}`

**Step 2:** Start a practice session
```bash
POST /api/practice/start
Authorization: Bearer {{student_token}}
```
**Expected:** 201 Created with 20 questions
- Save the `id` from response → paste into `{{session_id}}`

**Step 3:** Submit answers to practice questions
```bash
POST /api/practice/{{session_id}}/answer
Authorization: Bearer {{student_token}}
Body: {
  "questionId": 1,
  "selectedOptionId": 5
}
```
**Expected:** 200 OK with instant feedback
```json
{
  "success": true,
  "message": "Answer submitted",
  "data": {
    "questionId": 1,
    "selectedOptionId": 5,
    "isCorrect": true,
    "correctOptionId": 5,
    "correctOptionText": "Stop completely"
  }
}
```

**Step 4:** Get practice history
```bash
GET /api/practice/history
Authorization: Bearer {{student_token}}
```
**Expected:** 200 OK with list of all practice sessions

---

### Scenario 2: Complete Student Flow (Exam)

**Step 1:** Already registered student logs in
```bash
POST /api/auth/login
Body: {
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```
**Expected:** 200 OK
- Save the `token` → paste into `{{student_token}}`

**Step 2:** Start an exam
```bash
POST /api/exams/start
Authorization: Bearer {{student_token}}
```
**Expected:** 201 Created
- Exam has 20 questions and expires in 20 minutes
- Save the `id` → paste into `{{exam_id}}`

**Step 3:** Save answers (student can change anytime)
```bash
POST /api/exams/{{exam_id}}/answer
Authorization: Bearer {{student_token}}
Body: {
  "questionId": 1,
  "selectedOptionId": 5
}
```
**Expected:** 200 OK
- **Important:** Answers are NOT graded yet, just stored

**Step 4:** Change an answer
```bash
POST /api/exams/{{exam_id}}/answer
Authorization: Bearer {{student_token}}
Body: {
  "questionId": 1,
  "selectedOptionId": 7  # Different option
}
```
**Expected:** 200 OK

**Step 5:** Submit exam (grades all answers)
```bash
POST /api/exams/{{exam_id}}/submit
Authorization: Bearer {{student_token}}
```
**Expected:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "SUBMITTED",
    "totalQuestions": 20,
    "correctCount": 15,
    "scorePercent": 75.00,
    "passed": true,
    "passThreshold": 60.00,
    "startedAt": "2026-05-01T10:30:00",
    "submittedAt": "2026-05-01T10:45:30"
  }
}
```

**Step 6:** Get exam review (correct answers revealed)
```bash
GET /api/exams/{{exam_id}}/review
Authorization: Bearer {{student_token}}
```
**Expected:** 200 OK with all questions + correct answers + student's answers

**Step 7:** Get exam history
```bash
GET /api/exams/history
Authorization: Bearer {{student_token}}
```
**Expected:** 200 OK with list of all exams (sorted by newest first)

---

### Scenario 3: Admin - Question Management

**Step 1:** Admin logs in (one should exist in DB)
```bash
POST /api/auth/login
Body: {
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```
**Expected:** 200 OK
- Save the `token` → paste into `{{admin_token}}`

**Step 2:** Get all questions
```bash
GET /api/questions
Authorization: Bearer {{admin_token}}
```
**Expected:** 200 OK with all active questions (correct answers visible)

**Step 3:** Create a new text question
```bash
POST /api/questions
Authorization: Bearer {{admin_token}}
Body: {
  "questionNumber": 101,
  "textRw": "When should you use your headlights?",
  "isImageBased": false,
  "options": [
    {
      "optionLetter": "a",
      "textRw": "Only at night"
    },
    {
      "optionLetter": "b",
      "textRw": "In poor visibility conditions",
      "isCorrect": true
    },
    {
      "optionLetter": "c",
      "textRw": "Never - they drain the battery"
    }
  ]
}
```
**Expected:** 201 Created

**Step 4:** Create an image-based question
```bash
POST /api/questions
Authorization: Bearer {{admin_token}}
Body: {
  "questionNumber": 102,
  "textRw": "What does this traffic sign indicate?",
  "isImageBased": true,
  "imageFilename": "sign_p041_i00.png",
  "options": [
    {
      "optionLetter": "a",
      "textRw": "Yield to oncoming traffic"
    },
    {
      "optionLetter": "b",
      "textRw": "Stop here",
      "isCorrect": true
    },
    {
      "optionLetter": "c",
      "textRw": "Speed limit ahead"
    }
  ]
}
```
**Expected:** 201 Created
- Images already exist in `/static/images/signs/` directory

**Step 5:** Update a question
```bash
PUT /api/questions/1
Authorization: Bearer {{admin_token}}
Body: {
  "questionNumber": 101,
  "textRw": "When should you use your headlights? (Updated)",
  "isImageBased": false,
  "options": [
    {
      "optionLetter": "a",
      "textRw": "Always"
    },
    {
      "optionLetter": "b",
      "textRw": "In poor visibility conditions",
      "isCorrect": true
    },
    {
      "optionLetter": "c",
      "textRw": "At sunset"
    },
    {
      "optionLetter": "d",
      "textRw": "When you feel like it"
    }
  ]
}
```
**Expected:** 200 OK

**Step 6:** Deactivate a question
```bash
DELETE /api/questions/1
Authorization: Bearer {{admin_token}}
```
**Expected:** 200 OK
- Question removed from exam/practice pools but remains in DB

---

### Scenario 4: Admin Dashboard & User Management

**Step 1:** Get system-wide dashboard
```bash
GET /api/admin/dashboard
Authorization: Bearer {{admin_token}}
```
**Expected:** 200 OK
```json
{
  "success": true,
  "data": {
    "totalStudents": 25,
    "totalActiveStudents": 23,
    "totalQuestions": 150,
    "totalImageQuestions": 45,
    "totalExamsInSystem": 127,
    "totalPassedExamsInSystem": 95,
    "overallPassRate": 74.80,
    "recentExams": [...],
    "recentUsers": [...]
  }
}
```

**Step 2:** Get all students
```bash
GET /api/admin/users
Authorization: Bearer {{admin_token}}
```
**Expected:** 200 OK with list of all registered students

**Step 3:** Deactivate a student
```bash
PATCH /api/admin/users/1/toggle-active
Authorization: Bearer {{admin_token}}
```
**Expected:** 200 OK - student's active status is toggled

**Step 4:** View specific student's dashboard
```bash
GET /api/admin/users/1/dashboard
Authorization: Bearer {{admin_token}}
```
**Expected:** 200 OK
```json
{
  "success": true,
  "data": {
    "totalPracticeSessions": 12,
    "totalExamsTaken": 5,
    "totalExamsPassed": 4,
    "passRate": 80.00,
    "bestExamScore": 92.50,
    "bestPracticeScore": 95.00,
    "recentExams": [...]
  }
}
```

---

## Error Scenarios to Test

### 1. Invalid Email Format (Register)
```bash
POST /api/auth/register
Body: {
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "invalid-email",  # Invalid format
  "password": "SecurePass123"
}
```
**Expected:** 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email must be valid"
  }
}
```

### 2. Password Too Short (Register)
```bash
POST /api/auth/register
Body: {
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "short"  # Less than 8 characters
}
```
**Expected:** 400 Bad Request

### 3. Duplicate Email (Register)
```bash
POST /api/auth/register
Body: {
  "firstName": "Different",
  "lastName": "Person",
  "email": "john.doe@example.com",  # Already exists
  "password": "NewSecurePass123"
}
```
**Expected:** 409 Conflict
```json
{
  "success": false,
  "message": "Email already in use",
  "status": 409
}
```

### 4. Wrong Password (Login)
```bash
POST /api/auth/login
Body: {
  "email": "john.doe@example.com",
  "password": "WrongPassword"
}
```
**Expected:** 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password",
  "status": 401
}
```

### 5. No JWT Token (Unauthorized)
```bash
GET /api/practice/history
# No Authorization header
```
**Expected:** 403 Forbidden

### 6. Student Accessing Admin Endpoint
```bash
GET /api/admin/dashboard
Authorization: Bearer {{student_token}}  # Student token, not admin
```
**Expected:** 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource",
  "status": 403
}
```

### 7. Question with Invalid Answer Count
```bash
POST /api/questions
Authorization: Bearer {{admin_token}}
Body: {
  "questionNumber": 105,
  "textRw": "What's 2+2?",
  "isImageBased": false,
  "options": [
    {
      "optionLetter": "a",
      "textRw": "3"
    },
    {
      "optionLetter": "b",
      "textRw": "4",
      "isCorrect": true
    }
    # Missing at least 3 options
  ]
}
```
**Expected:** 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "options": "A question must have 3 or 4 options"
  }
}
```

### 8. Question with Multiple Correct Answers
```bash
POST /api/questions
Authorization: Bearer {{admin_token}}
Body: {
  "questionNumber": 106,
  "textRw": "Which are correct?",
  "isImageBased": false,
  "options": [
    {
      "optionLetter": "a",
      "textRw": "Option A",
      "isCorrect": true
    },
    {
      "optionLetter": "b",
      "textRw": "Option B",
      "isCorrect": true  # Two correct answers - invalid!
    }
  ]
}
```
**Expected:** 400 Bad Request
```json
{
  "success": false,
  "message": "Exactly one option must be marked as correct"
}
```

---

## Response Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/POST/PUT/PATCH |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Validation error or invalid data |
| 401 | Unauthorized | No/invalid JWT token or wrong password |
| 403 | Forbidden | User lacks permission (e.g., student accessing admin endpoint) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business logic violation (e.g., duplicate email) |
| 500 | Internal Server Error | Unexpected server error |

---

## Key Workflows

### Practice vs Exam Differences
| Feature | Practice | Exam |
|---------|----------|------|
| Feedback | **Immediate** (after each answer) | **No feedback** until review |
| Correct answer shown | ✅ Yes | ❌ No (until review) |
| Timer | ❌ None | ✅ 20 minutes |
| Time limit blocking | ❌ None | ✅ Auto-grades if time expires |
| Pass threshold | N/A | 60% (configurable) |
| Can change answer | ✅ Yes | ✅ Yes (until submit) |

### Answer States During Exam
1. **Initially:** `null` (unanswered)
2. **After saving:** `selectedOptionId` stored
3. **After changing:** New `selectedOptionId` stored (overwrites)
4. **After submitting:** Graded (`isCorrect` set to true/false)

### Question States
- **Active:** Used in exams/practice (default)
- **Inactive:** Deactivated by admin - not drawn in new sessions but visible in history

---

## Tips & Tricks

### 1. Bulk Testing with Variables
- Set all variables at the beginning
- Use them throughout all requests
- Makes it easy to test with different users

### 2. Save Tokens Quickly
- After login, open response → copy token value
- In Variables tab, paste into the relevant token field
- Refresh requests using that token

### 3. Test Multiple Students at Once
- Open 2 Postman tabs/windows
- Set different `{{student_token}}` in each
- Test concurrent exams, practice sessions

### 4. Debug Failed Requests
- Check Authorization header is present
- Verify token hasn't expired
- Validate request body against field requirements
- Look at error message in response

### 5. Generate Sample Data
- Create 10+ questions using "Create Question" request
- Bulk by copy-pasting and changing question numbers
- Use mix of text and image questions

---

## Question Numbers & Image Files

### Available Traffic Sign Images
The API includes 145 pre-loaded traffic sign images:
- `sign_p039_i00.png`
- `sign_p041_i00.png`, `sign_p041_i01.png`
- `sign_p042_i00.png`, `sign_p042_i01.png`, `sign_p042_i02.png`
- And many more...

### Recommended Question Numbers
- 1-50: Basic driving rules
- 51-100: Traffic signs
- 101+: Defensive driving techniques

---

## Next Steps

1. ✅ Import Postman collection
2. ✅ Register a student account
3. ✅ Start a practice session
4. ✅ Submit some answers
5. ✅ Start an exam
6. ✅ Submit exam and view review
7. ✅ Login as admin
8. ✅ Create/update questions
9. ✅ View dashboards
10. ✅ Test error scenarios

Happy testing! 🚗

