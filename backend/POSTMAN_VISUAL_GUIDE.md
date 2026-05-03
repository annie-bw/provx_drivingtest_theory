# Postman Quick Start - Visual Guide

## 🎯 The Flow (Simplified)

```
┌─────────────────────────────────────────────────┐
│        REGISTER STUDENT (No auth needed)         │
│  POST /api/auth/register                         │
│  ❌ No "Authorization" header                    │
│                                                  │
│  Body: { email, password, firstName, lastName } │
│  Response: { token, userId, ... }               │
│  ⬇️  Extract: student_token                     │
└─────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────┐
│     START PRACTICE SESSION (Auth required)       │
│  POST /api/practice/start                        │
│  ✅ Header: Authorization: Bearer {{student_token}}
│  ❌ No body                                      │
│                                                  │
│  Response: { id, questions: [...], ... }        │
│  ⬇️  Extract: session_id                        │
└─────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────┐
│  ANSWER PRACTICE QUESTIONS (Repeat 20x)         │
│  POST /api/practice/{{session_id}}/answer       │
│  ✅ Header: Authorization: Bearer {{student_token}}
│                                                  │
│  Body: { questionId: 1, selectedOptionId: 5 }   │
│  Response: { isCorrect: true, ... } (instant)   │
│  ⬇️  Student sees feedback immediately!         │
└─────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────┐
│      START EXAM (Auth required, auto-blocks)    │
│  POST /api/exams/start                           │
│  ✅ Header: Authorization: Bearer {{student_token}}
│  ❌ No body                                      │
│                                                  │
│  Response: { id, questions: [...], timer: 1200s }
│  ⬇️  Extract: exam_id                           │
│  ⚠️  20 minute timer starts!                    │
└─────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────┐
│  SAVE EXAM ANSWERS (No feedback, just stores)   │
│  POST /api/exams/{{exam_id}}/answer             │
│  ✅ Header: Authorization: Bearer {{student_token}}
│                                                  │
│  Body: { questionId: 1, selectedOptionId: 5 }   │
│  Response: { questionId: 1, ... }               │
│  ⬇️  Answers stored, NOT graded yet             │
│  ✅ Can change answer anytime before submit     │
└─────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────┐
│    SUBMIT EXAM (Grades all answers, calc score) │
│  POST /api/exams/{{exam_id}}/submit             │
│  ✅ Header: Authorization: Bearer {{student_token}}
│  ❌ No body                                      │
│                                                  │
│  Response: { passed: true, scorePercent: 75 }   │
│  ⬇️  Score calculated!                          │
│  ⚠️  60% = Pass, < 60% = Fail                   │
└─────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────┐
│   GET EXAM REVIEW (Correct answers revealed)    │
│  GET /api/exams/{{exam_id}}/review              │
│  ✅ Header: Authorization: Bearer {{student_token}}
│                                                  │
│  Response: Full exam with all answers + correct │
│  ⬇️  Student can learn from mistakes            │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables - Where to Find Them

### Step 1: Open Environment Editor

```
Postman Window:
┌────────────────────────────────────────────┐
│  [×] Collections    [Environments]  [APIs] │  ← Click here
│                                            │
│  • No Environment                          │
│  • Driving Test - Local  ✓ (selected)     │  ← Your env
└────────────────────────────────────────────┘
```

### Step 2: View/Edit Variables

```
Environment Editor:
┌─────────────────────────────────────────────┐
│ Driving Test - Local                         │
├─────────────────────────────────────────────┤
│ Variable       │ Current Value  │ Initial    │
├────────────────┼────────────────┼────────────┤
│ host           │ http://...     │ http://... │
│ student_token  │ eyJ... (paste) │ (empty)    │ ← PUT TOKEN HERE
│ admin_token    │ (empty)        │ (empty)    │
│ session_id     │ 1              │ (empty)    │ ← PUT SESSION ID HERE
│ exam_id        │ 5              │ (empty)    │ ← PUT EXAM ID HERE
│ user_id        │ (empty)        │ (empty)    │
│ question_id    │ (empty)        │ (empty)    │
└─────────────────────────────────────────────┘
                      ⬇️
          📌 Click Save to persist
```

---

## 📋 Extract Values from Response - Step by Step

### Example: Getting student_token from Register Response

```
1. Click: AUTH > Register - Student
2. Click: Send button
3. Look at Response pane (bottom):

{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huLmRvZUBl...",
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "STUDENT"
  }
}

4. Copy the FULL token string (long, starts with "eyJ")
5. Go to: Environments tab > Driving Test - Local
6. In the "student_token" row, paste the value
7. Save ✓
8. Now {{student_token}} variable is populated!
```

---

### Example: Getting session_id from Start Practice

```
1. Click: PRACTICE SESSIONS > Start Practice Session
2. Click: Send button
3. Look at Response:

{
  "success": true,
  "message": "Practice session started",
  "data": {
    "id": 123,  ← THIS IS THE SESSION ID
    "status": "IN_PROGRESS",
    "totalQuestions": 20,
    "correctCount": 0,
    "questions": [...]
  }
}

4. Copy: 123
5. Go to: Environments tab
6. Paste into "session_id" field
7. Save ✓
8. Now use {{session_id}} in answer endpoints!
```

---

## 🚀 Auto-Extract with Scripts (Optional but Recommended)

### Setup: Add Tests to Any Request

```
Request: Register - Student
Tabs: [Params] [Auth] [Headers] [Body] [Tests] ← Click here
                                               │
                                         ┌─────┘
                                         ⬇️
    ┌──────────────────────────────────────────┐
    │ Tests                                    │
    ├──────────────────────────────────────────┤
    │ // Auto-save token to environment        │
    │ var jsonData = pm.response.json();       │
    │ pm.environment.set(                      │
    │   "student_token",                       │
    │   jsonData.data.token                    │
    │ );                                       │
    │                                          │
    │ // Also save userId                      │
    │ pm.environment.set(                      │
    │   "user_id",                             │
    │   jsonData.data.userId                   │
    │ );                                       │
    └──────────────────────────────────────────┘
```

Now when you click **Send**, the token is **automatically** saved! ✨

---

## 📝 Order to Run Requests

### First Time Setup
```
✅ 1. POST /api/auth/register
   └─ Extract student_token → save to env

✅ 2. POST /api/practice/start
   └─ Extract session_id → save to env

✅ 3. POST /api/practice/{session_id}/answer  (×3)
   └─ Test correct, wrong, skip answers

✅ 4. GET /api/practice/history
   └─ See all practice sessions (optional)

✅ 5. POST /api/exams/start
   └─ Extract exam_id → save to env

✅ 6. POST /api/exams/{exam_id}/answer  (×3)
   └─ Save exam answer, change it, skip

✅ 7. POST /api/exams/{exam_id}/submit
   └─ Grade and get score

✅ 8. GET /api/exams/{exam_id}/review
   └─ See correct answers

✅ 9. GET /api/exams/history
   └─ See exam history (optional)
```

---

## 🆘 Common Issues & Fixes

### ❌ "401 Unauthorized" on Practice Requests

```
Error Response:
{
  "success": false,
  "message": "...",
  "status": 401
}

Fix:
1. Is {{student_token}} set in environment? 
   → Go to Environments tab, check student_token has value
   
2. If empty:
   → Run Register request again
   → Extract token from response
   → Copy it to environment
   
3. If still fails:
   → Token might be expired (unlikely in dev)
   → Try registering a NEW student account
   → Use that token instead
```

---

### ❌ "Cannot find session" Error

```
Error:
POST /api/practice/{session_id}/answer
404: Practice session not found

Fix:
1. Did you run "Start Practice Session" first?
2. Check {{session_id}} in environment - is it set?
3. If empty:
   → Run "Start Practice Session"
   → Copy the ID from response: "id": 123
   → Paste it into session_id environment variable
4. Try the request again
```

---

### ❌ "Questions not found"

```
Error:
POST /api/practice/1/answer
400: Question 1 is not part of this session

Fix:
1. Start a NEW practice session
2. Look at the questions in the response
3. Use their actual IDs in answer requests
4. Don't hardcode ID 1 - it might not exist!
```

---

## ⚡ Pro Tips

### 💡 Tip 1: Use Collections Runner
```
Instead of clicking each request manually:
1. Right-click the collection folder
2. Select "Run collection"
3. Postman runs all requests in order
4. See results in one view
```

### 💡 Tip 2: Save Response to Variable
```
In Tests tab:
var jsonData = pm.response.json();
pm.environment.set("my_variable", jsonData.data.someValue);
```

### 💡 Tip 3: Check Variable Value
```
While editing request:
- Look for {{variable}} in URL/Body
- Hover over it to see current value
- Or check in Environments tab
```

### 💡 Tip 4: Reset Environment
```
If variables get messed up:
1. Go to Environments
2. Click your environment
3. Set values back to blank
4. Save
5. Start over with Register
```

---

## 🎓 Learning Order

```
Start Here ──────────────────────── End Here
    │                                  │
    ⬇️                                 ⬇️
Understand:                       Can do:
- HTTP methods                    - Full workflow
- Headers & Auth                  - Extract responses
- Request/Response format         - Populate variables
- Environment variables           - All API testing
```

Good to go! 🚀

Let me know if you need clarification on any step!

