# 🎯 Postman Quick Reference Card

**Print this or keep it open while testing!**

---

## 📋 CHECKLIST - Do This First

```
[ ] 1. Start your Spring Boot app (localhost:8080)
[ ] 2. Open Postman
[ ] 3. Import: Driving_Test_API.postman_collection.json
[ ] 4. Create environment: "Driving Test - Local"
[ ] 5. Add variables:
      - host = http://localhost:8080
      - student_token = (empty, will fill)
      - session_id = (empty, will fill)
      - exam_id = (empty, will fill)
      - admin_token = (empty, will fill)
[ ] 6. Select it from dropdown (top right)
```

---

## 🔄 CORE WORKFLOW

### Every Request Follows This Pattern:

```
1️⃣  Click the request from the sidebar
2️⃣  Click "Send" button
3️⃣  Read the response (bottom panel)
4️⃣  Extract a value (if needed) → copy it
5️⃣  Go to Environments tab → paste into variable
6️⃣  Click "Save"
7️⃣  Move to next request
```

---

## 🚀 MINIMAL WORKING EXAMPLE (MWE)

Do this NOW to test everything works:

```bash
# Request 1: Register
POST /api/auth/register
Headers: Content-Type: application/json
Body: {
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "TestPass123"
}
→ Copy "token" from response
→ Paste into {{student_token}} environment variable
→ Save

# Request 2: Start Practice
POST /api/practice/start
Headers: Authorization: Bearer {{student_token}}
Body: (empty)
→ Copy "id" from response
→ Paste into {{session_id}} environment variable  
→ Save

# Request 3: Answer a Question
POST /api/practice/{{session_id}}/answer
Headers: Authorization: Bearer {{student_token}}
Body: {"questionId": 1, "selectedOptionId": 5}
→ Should get feedback (correct/wrong)

# ✅ If all 3 work → Your setup is correct!
```

---

## 📍 WHERE TO FIND THINGS IN POSTMAN

```
┌─ Collections               ← Your imported requests
├─ Environment              ← {{variable}} values stored here
├─ History                  ← Previous requests
└─ APIs                     ← (ignore for now)

Top Right:
└─ Environment Dropdown     ← Select "Driving Test - Local"

Bottom of Screen:
├─ Response/Body            ← JSON from server
├─ Headers                  ← Response headers
├─ Tests                    ← Where you add scripts
└─ Cookies                  ← (ignore for now)
```

---

## 🔐 ENVIRONMENT VARIABLES - QUICK FILL

When you see `{{variable}}` in a request:

| Variable | Set From | How | Example |
|----------|----------|-----|---------|
| `host` | Manual | `http://localhost:8080` | Use as-is |
| `student_token` | Response of Register/Login | `response.data.token` | `eyJ...` (long string) |
| `session_id` | Response of Start Practice | `response.data.id` | `123` |
| `exam_id` | Response of Start Exam | `response.data.id` | `456` |
| `admin_token` | Response of Admin Login | `response.data.token` | `eyJ...` (long string) |

---

## ⚡ SHORTCUTS

| Action | How |
|--------|-----|
| Run request | `Ctrl+Enter` |
| Format JSON | `Ctrl+Shift+M` |
| Save | `Ctrl+S` |
| Open environment | Click "Environments" tab |
| Edit variable | Click variable row |
| Copy response | Select → `Ctrl+C` |

---

## 📝 RESPONSE CODES YOU'LL SEE

| Code | Meaning | Action |
|------|---------|--------|
| 200 | ✅ Success | Continue |
| 201 | ✅ Created | Continue + extract ID/token |
| 400 | ⚠️ Bad request | Check body format |
| 401 | 🔴 Unauthorized | Check `{{student_token}}` is set |
| 403 | 🔴 Forbidden | Using wrong token (admin vs student) |
| 404 | 🔴 Not found | Resource doesn't exist (wrong ID) |
| 409 | 🔴 Conflict | Duplicate email or business logic error |

---

## 🎯 REQUEST BODIES TO COPY/PASTE

### Register
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Answer Question (Practice or Exam)
```json
{
  "questionId": 1,
  "selectedOptionId": 5
}
```

### Answer (Skip)
```json
{
  "questionId": 2,
  "selectedOptionId": null
}
```

### Create Question
```json
{
  "questionNumber": 101,
  "textRw": "What is 2+2?",
  "isImageBased": false,
  "options": [
    {"optionLetter": "a", "textRw": "3"},
    {"optionLetter": "b", "textRw": "4", "isCorrect": true},
    {"optionLetter": "c", "textRw": "5"}
  ]
}
```

---

## 🔍 DEBUGGING CHECKLIST

**Request fails?**

```
1. Is app running?
   → Check localhost:8080 in browser
   
2. Is environment selected?
   → Top right: Should show "Driving Test - Local"
   
3. Is token set?
   → Environments tab → student_token should have value
   
4. Is ID set?
   → Check {{session_id}} or {{exam_id}} has value
   
5. Are headers correct?
   → Authorization: Bearer {{student_token}}
   
6. Is body valid JSON?
   → Check for missing commas/braces
   
7. Check response error message
   → It usually tells you what's wrong
```

---

## 📊 EXPECTED FLOW RESPONSES

### Register ✅
```
Status: 201
Body: { data: { token, userId, role: "STUDENT" } }
```

### Start Practice ✅
```
Status: 201
Body: { data: { id: 1, questions: [...], status: "IN_PROGRESS" } }
```

### Answer Practice ✅
```
Status: 200
Body: { data: { isCorrect: true, correctOptionId: 5 } }
```

### Start Exam ✅
```
Status: 201
Body: { data: { id: 2, questions: [...], expiresAt: "..." } }
```

### Submit Exam ✅
```
Status: 200
Body: { data: { passed: true, scorePercent: 75 } }
```

---

## 🚫 COMMON MISTAKES

```
❌ "Cannot find my token"
   → Open Response tab, look for "token" field
   → Copy entire string (not just first part)

❌ "Variables not working"
   → Check {{}} - must have double braces
   → Make sure environment is selected (dropdown)

❌ "401 Unauthorized on every request"
   → Run Login/Register FIRST
   → Extract token
   → Put it in environment
   
❌ "Question not found"
   → Use actual question IDs from response
   → Don't hardcode ID 1 if it doesn't exist

❌ "Can't change token"
   → Don't edit collection variables
   → Use environment variables instead
```

---

## 🎓 LEARNING PATH

```
Day 1: Auth
├─ Register student
├─ Extract & save token
└─ Login

Day 2: Practice
├─ Start session
├─ Extract & save session_id
├─ Answer questions
└─ Check history

Day 3: Exam
├─ Start exam
├─ Extract & save exam_id
├─ Save answers
├─ Submit exam
└─ View review

Day 4+: Admin (optional)
├─ Create/edit questions
└─ View dashboards
```

---

## 💡 TIPS

```
💡 Use Notes field in requests to remember why they exist
💡 Create folders for different test scenarios
💡 Save responses (Request > "Save Response")
💡 Use Collections Runner for batch testing
💡 Check "Save response" for later reference
💡 Comment your Tests scripts for clarity
```

---

## 🏁 SUCCESS INDICATORS

You're doing it right when:

```
✅ Can register and get a token
✅ Can start practice session
✅ Get instant feedback on answers
✅ Can start exam with timer
✅ Can submit exam and see score
✅ Can view exam review
✅ Don't get auth errors
```

---

## 📞 NEED HELP?

```
1. Check response message (bottom right)
2. Check status code (200, 400, 401, etc.)
3. Look in POSTMAN_WORKFLOW.md for details
4. Print the VISUAL_GUIDE for diagrams
5. Search in POSTMAN_TESTING_GUIDE.md for your scenario
```

---

**Last updated: May 1, 2026**  
**For Driving Test API v1.0**  
**Backend: Spring Boot 3+ with JWT Auth**

🚀 **YOU GOT THIS!** 🚀

