# Postman Setup & Workflow Guide

## 📋 Step 1: Create an Environment in Postman

### 1.1 Create a new environment
1. Click **Environments** (left sidebar)
2. Click **Create Environment** or **+** button
3. Name it: `Driving Test - Local` (or whatever you like)
4. Add these variables:

| Variable | Initial Value | Type |
|----------|---------------|------|
| `host` | `http://localhost:8080` | String |
| `student_token` | (leave empty) | String |
| `admin_token` | (leave empty) | String |
| `session_id` | (leave empty) | String |
| `exam_id` | (leave empty) | String |
| `user_id` | (leave empty) | String |
| `question_id` | (leave empty) | String |

5. Click **Save**

### 1.2 Select the environment
- In the top-right of Postman, find the **environment dropdown** (currently shows "No Environment")
- Select `Driving Test - Local`
- It should now show a blue dot indicating it's active

---

## 🚀 Step 2: Run the Complete Workflow

### Phase 1: Registration & Login (No Auth Required)

#### Request 1: Register a Student
```
Folder: AUTH
Request: Register - Student
```

**Steps:**
1. Click the request
2. The body already has sample data - modify if you want
3. Click **Send**
4. You should get a **201 Created** response

**Response looks like:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "STUDENT"
  }
}
```

#### ✅ Extract the Token
**How to populate `student_token`:**

1. In the response, find the `"token"` field
2. **Copy the entire token value** (long string starting with `eyJ...`)
3. Go to **Environments** tab (left sidebar)
4. Select `Driving Test - Local`
5. Find `student_token` row
6. Paste the token in the **Current Value** column
7. Click **Save**

**OR use a Postman script (automatic):**
- Add this in the request's **Tests** tab:
```javascript
var jsonData = pm.response.json();
pm.environment.set("student_token", jsonData.data.token);
pm.environment.set("user_id", jsonData.data.userId);
```
- Now when you run the request, the token is **automatically** saved!

---

#### Request 2: Login
```
Folder: AUTH
Request: Login - Success
```

**Steps:**
1. Use the same email/password from registration
2. Click **Send**
3. Get a new token (this will be different)
4. Update `student_token` environment variable with this token

**Why login again?** In production, people don't always use the token from registration. This tests the actual login flow.

---

### Phase 2: Practice Session (Auth Required ✅)

#### Request 3: Start Practice Session
```
Folder: PRACTICE SESSIONS
Request: Start Practice Session
```

**Notice:** 
- Authorization header is set to `Bearer {{student_token}}`
- This will use the token you just saved

**Steps:**
1. Make sure you've set `student_token` in environment
2. Click **Send**
3. You'll get a practice session with 20 questions

**Response:**
```json
{
  "success": true,
  "message": "Practice session started",
  "data": {
    "id": 1,
    "status": "IN_PROGRESS",
    "totalQuestions": 20,
    "correctCount": 0,
    "questions": [...]
  }
}
```

#### ✅ Extract the Session ID
Add to your request's **Tests** tab:
```javascript
var jsonData = pm.response.json();
pm.environment.set("session_id", jsonData.data.id);
```

Now `{{session_id}}` is automatically populated for the next request!

---

#### Request 4-6: Submit Practice Answers
```
Folder: PRACTICE SESSIONS
Requests: Submit Practice Answer - Correct/Wrong/Skip
```

**Run 3 different answer submissions:**

1. **Submit Correct Answer**
   - Body: `{"questionId": 1, "selectedOptionId": 5}`
   - Click **Send**

2. **Submit Wrong Answer**
   - Body: `{"questionId": 2, "selectedOptionId": 10}`
   - Click **Send**

3. **Skip Question**
   - Body: `{"questionId": 3, "selectedOptionId": null}`
   - Click **Send**

**Each returns instant feedback:**
```json
{
  "data": {
    "isCorrect": true,
    "correctOptionId": 5,
    "correctOptionText": "Stop here"
  }
}
```

---

### Phase 3: Exam (Auth Required ✅)

#### Request 7: Start Exam
```
Folder: EXAMS
Request: Start Exam
```

**Steps:**
1. Click **Send**
2. You'll get an exam with 20 questions and a 20-minute timer
3. Extract `exam_id`

**Add to Tests tab:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("exam_id", jsonData.data.id);
```

---

#### Request 8-10: Save Exam Answers
```
Folder: EXAMS
Requests: Save Exam Answer / Change Exam Answer / Skip Exam Question
```

Run these 3 times (simulate the student answering questions):

1. **Save Answer**
   - Body: `{"questionId": 1, "selectedOptionId": 5}`

2. **Change Answer** 
   - Body: `{"questionId": 1, "selectedOptionId": 6}` (different option)

3. **Skip Question**
   - Body: `{"questionId": 2, "selectedOptionId": null}`

**Important:** Exam answers are **NOT graded yet** - just stored!

---

#### Request 11: Submit Exam
```
Folder: EXAMS
Request: Submit Exam
```

**This is where grading happens!**

**Steps:**
1. Click **Send**
2. You'll get the score

**Response:**
```json
{
  "data": {
    "status": "SUBMITTED",
    "totalQuestions": 20,
    "correctCount": 15,
    "scorePercent": 75.00,
    "passed": true,
    "passThreshold": 60.00
  }
}
```

---

#### Request 12: Get Exam Review
```
Folder: EXAMS
Request: Get Exam Review
```

**Now correct answers are revealed!**

**Steps:**
1. Click **Send**
2. See all questions with correct answers highlighted

---

### Phase 4: Admin Functions (Need Admin Token)

#### Problem: We need an admin account

👨‍💼 **How to create an admin?**

Option 1: **Manually insert into database**
```sql
INSERT INTO users (first_name, last_name, email, password_hash, role, is_active) 
VALUES ('Admin', 'User', 'admin@example.com', 'hashed_password_here', 'ADMIN', true);
```

Option 2: **Use SQL script if provided**
- Check if there's a `data.sql` in your project

Option 3: **For now, skip admin tests**
- Come back to this after setting up

---

#### Request: Admin Login
```
Folder: AUTH (if adding it)
```

**After you have an admin account:**
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

Then save the admin token to `{{admin_token}}` variable

---

## 📊 Complete Workflow Checklist

Print this out or follow the order:

```
[ ] 1. Environment setup (host, token variables)
[ ] 2. Register Student
[ ] 3. Extract & save student_token
[ ] 4. Start Practice Session
[ ] 5. Extract & save session_id
[ ] 6. Submit 3 practice answers
[ ] 7. Get practice history
[ ] 8. Start Exam
[ ] 9. Extract & save exam_id
[ ] 10. Save exam answer #1
[ ] 11. Change exam answer
[ ] 12. Skip exam question
[ ] 13. Submit exam (grades answers)
[ ] 14. Get exam review (see correct answers)
[ ] 15. Get exam history
[ ] 16. (Optional) Admin login & manage questions
```

---

## 🔄 How to Auto-Populate Variables

### Method 1: Use Postman Tests Tab (Recommended)

**For ANY request where you need to extract values:**

1. Click the request
2. Go to **Tests** tab
3. Add this code:

```javascript
var jsonData = pm.response.json();

// Save tokens
if (jsonData.data.token) {
    pm.environment.set("student_token", jsonData.data.token);
}

// Save IDs
if (jsonData.data.id) {
    pm.environment.set("session_id", jsonData.data.id);
    // OR for exam: pm.environment.set("exam_id", jsonData.data.id);
}

// Check if response was successful
if (pm.response.code === 200 || pm.response.code === 201) {
    console.log("✅ Success! Variables updated.");
}
```

4. **Send the request**
5. After successful response, the variables are **auto-saved** 🎉

---

### Method 2: Manual Copy-Paste

If you don't want to use scripts:

1. Click **Send**
2. Look at the JSON response
3. Find the value you need (e.g., `"token": "eyJ..."`)
4. Copy it
5. Go to **Environments** tab
6. Paste into the appropriate row
7. Click **Save**

---

## 🛠️ Troubleshooting

### ❌ "401 Unauthorized" Error
**Problem:** `student_token` environment variable is empty or expired

**Solution:**
1. Make sure `student_token` is set
2. Re-run "Register - Student" or "Login - Success"
3. Extract the new token into the environment

---

### ❌ "Cannot find session/exam"
**Problem:** `{{session_id}}` or `{{exam_id}}` is empty

**Solution:**
1. Run "Start Practice Session" first
2. Extract `session_id` from response
3. Save it to the environment variable
4. Now proceed to answer questions

---

### ❌ "Invalid question ID"
**Problem:** Question ID doesn't exist

**Solution:**
1. Start an exam first (gets real question IDs)
2. Look at the response - questions have actual IDs
3. Use those IDs in answer requests

---

### ❌ Postman won't save environment variables
**Problem:** Script not running

**Solution:**
1. Make sure you clicked **Tests** tab
2. The script is properly formatted (check for syntax errors)
3. Try running the request with **Send and Download** button
4. If still not working, manually copy-paste the values

---

## 📱 Quick Commands (for Reference)

### Register & Get Token
```
1. POST /api/auth/register
2. Extract token from response
3. Set {{student_token}}
```

### Start Practice
```
1. POST /api/practice/start
2. Extract id from response  
3. Set {{session_id}}
```

### Answer Questions
```
1. POST /api/practice/{{session_id}}/answer
2. Repeat for different questions
```

### Start Exam
```
1. POST /api/exams/start
2. Extract id from response
3. Set {{exam_id}}
```

### Save Exam Answers & Submit
```
1. POST /api/exams/{{exam_id}}/answer (multiple times)
2. POST /api/exams/{{exam_id}}/submit (grades)
3. GET /api/exams/{{exam_id}}/review (see answers)
```

---

## 🎯 Next Steps

1. ✅ Set up your Postman environment with 5 variables
2. ✅ Run "Register - Student" → extract token → save to env
3. ✅ Run "Start Practice Session" → extract session_id → save to env
4. ✅ Submit 3 practice answers
5. ✅ Run "Start Exam" → extract exam_id → save to env
6. ✅ Save 3 exam answers, then submit
7. ✅ View exam review
8. ⏭️ Optional: Set up admin, create questions

**The key:** Each response gives you data. Extract it and save it to an environment variable. Then the next request uses that variable.

It's like a **chain of requests** where each one feeds data to the next! 🔗

Good luck! Let me know if you get stuck on any step! 🚀

