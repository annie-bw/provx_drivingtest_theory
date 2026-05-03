# Driving Test API - cURL Command Reference

Quick reference for testing the API with cURL commands. Copy and modify as needed.

## Environment Variables (Set These First)

```bash
export HOST="http://localhost:8080"
export STUDENT_TOKEN=""  # Set after login
export ADMIN_TOKEN=""    # Set after admin login
export SESSION_ID=""     # Set after starting practice
export EXAM_ID=""        # Set after starting exam
```

---

## AUTH Endpoints

### Register a New Student
```bash
curl -X POST "$HOST/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST "$HOST/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'

# Extract token and set: export STUDENT_TOKEN="your_token_here"
```

---

## PRACTICE Endpoints

### Start Practice Session
```bash
curl -X POST "$HOST/api/practice/start" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Extract session ID: export SESSION_ID="session_id_from_response"
```

### Get Practice Session State
```bash
curl -X GET "$HOST/api/practice/$SESSION_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Submit Practice Answer (Correct)
```bash
curl -X POST "$HOST/api/practice/$SESSION_ID/answer" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedOptionId": 5
  }'
```

### Submit Practice Answer (Skip/Null)
```bash
curl -X POST "$HOST/api/practice/$SESSION_ID/answer" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 2,
    "selectedOptionId": null
  }'
```

### Get Practice History
```bash
curl -X GET "$HOST/api/practice/history" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## EXAM Endpoints

### Start Exam (20 questions, 20-minute timer)
```bash
curl -X POST "$HOST/api/exams/start" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Extract exam ID: export EXAM_ID="exam_id_from_response"
```

### Get Exam State
```bash
curl -X GET "$HOST/api/exams/$EXAM_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Save Exam Answer
```bash
curl -X POST "$HOST/api/exams/$EXAM_ID/answer" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedOptionId": 5
  }'
```

### Change Exam Answer
```bash
curl -X POST "$HOST/api/exams/$EXAM_ID/answer" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedOptionId": 7
  }'
```

### Submit Exam (Grades all answers)
```bash
curl -X POST "$HOST/api/exams/$EXAM_ID/submit" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Get Exam Review (Correct answers revealed)
```bash
curl -X GET "$HOST/api/exams/$EXAM_ID/review" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Get Exam History
```bash
curl -X GET "$HOST/api/exams/history" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## QUESTIONS Endpoints (Admin Only)

### Get All Questions
```bash
curl -X GET "$HOST/api/questions" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Question by ID
```bash
curl -X GET "$HOST/api/questions/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Create Text Question
```bash
curl -X POST "$HOST/api/questions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionNumber": 101,
    "textRw": "What is the speed limit in residential areas?",
    "isImageBased": false,
    "options": [
      {
        "optionLetter": "a",
        "textRw": "20 km/h"
      },
      {
        "optionLetter": "b",
        "textRw": "30 km/h",
        "isCorrect": true
      },
      {
        "optionLetter": "c",
        "textRw": "50 km/h"
      }
    ]
  }'
```

### Create Image Question
```bash
curl -X POST "$HOST/api/questions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionNumber": 102,
    "textRw": "What does this traffic sign mean?",
    "isImageBased": true,
    "imageFilename": "sign_p041_i00.png",
    "options": [
      {
        "optionLetter": "a",
        "textRw": "Yield"
      },
      {
        "optionLetter": "b",
        "textRw": "Stop",
        "isCorrect": true
      },
      {
        "optionLetter": "c",
        "textRw": "Speed Limit"
      }
    ]
  }'
```

### Update Question
```bash
curl -X PUT "$HOST/api/questions/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionNumber": 101,
    "textRw": "Updated question text?",
    "isImageBased": false,
    "options": [
      {
        "optionLetter": "a",
        "textRw": "Option A"
      },
      {
        "optionLetter": "b",
        "textRw": "Option B",
        "isCorrect": true
      }
    ]
  }'
```

### Deactivate Question
```bash
curl -X DELETE "$HOST/api/questions/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## ADMIN Endpoints

### Get Admin Dashboard
```bash
curl -X GET "$HOST/api/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get All Students
```bash
curl -X GET "$HOST/api/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Toggle Student Active Status
```bash
curl -X PATCH "$HOST/api/admin/users/1/toggle-active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Student Dashboard (Admin View)
```bash
curl -X GET "$HOST/api/admin/users/1/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get All Questions (Admin)
```bash
curl -X GET "$HOST/api/admin/questions" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Question by ID (Admin)
```bash
curl -X GET "$HOST/api/admin/questions/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Error Scenarios (Test These Too)

### Missing Authorization Header
```bash
curl -X GET "$HOST/api/practice/history"
# Expected: 403 Forbidden
```

### Invalid Email Format
```bash
curl -X POST "$HOST/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "invalid-email",
    "password": "SecurePass123"
  }'
# Expected: 400 Bad Request - "Email must be valid"
```

### Password Too Short
```bash
curl -X POST "$HOST/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "short"
  }'
# Expected: 400 Bad Request - "Password must be at least 8 characters"
```

### Duplicate Email
```bash
curl -X POST "$HOST/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Different",
    "lastName": "Person",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
# Expected: 409 Conflict - "Email already in use"
```

### Wrong Password
```bash
curl -X POST "$HOST/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword"
  }'
# Expected: 401 Unauthorized - "Invalid email or password"
```

### Student Accessing Admin Endpoint
```bash
curl -X GET "$HOST/api/admin/dashboard" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
# Expected: 403 Forbidden - "You do not have permission"
```

### Question with Multiple Correct Answers
```bash
curl -X POST "$HOST/api/questions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionNumber": 103,
    "textRw": "Test question?",
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
        "isCorrect": true
      }
    ]
  }'
# Expected: 400 Bad Request - "Exactly one option must be marked as correct"
```

---

## Useful cURL Flags

```bash
# Pretty print JSON response
-s | jq

# Save response to file
-o filename.json

# Follow redirects
-L

# Verbose (shows headers)
-v

# Ignore SSL certificate errors (dev only!)
-k

# Add custom header
-H "Header-Name: value"

# Show only headers, not body
-I

# Include response headers in output
-i

# Set custom user agent
-A "MyApp/1.0"
```

---

## Example: Full Test Flow in Bash

```bash
#!/bin/bash

HOST="http://localhost:8080"

echo "1️⃣  Registering student..."
REGISTER_RESP=$(curl -s -X POST "$HOST/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123"
  }')

STUDENT_TOKEN=$(echo $REGISTER_RESP | jq -r '.data.token')
echo "Token: $STUDENT_TOKEN"

echo "2️⃣  Starting practice session..."
PRACTICE_RESP=$(curl -s -X POST "$HOST/api/practice/start" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

SESSION_ID=$(echo $PRACTICE_RESP | jq -r '.data.id')
echo "Session ID: $SESSION_ID"

echo "3️⃣  Submitting answer..."
ANSWER_RESP=$(curl -s -X POST "$HOST/api/practice/$SESSION_ID/answer" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedOptionId": 5
  }')

echo $ANSWER_RESP | jq '.'

echo "✅ Flow complete!"
```

Save as `test_flow.sh`, then run:
```bash
chmod +x test_flow.sh
./test_flow.sh
```

---

## Tips for cURL Users

1. **Use variables** to avoid repeating tokens
2. **Save long JSON bodies** to files:
   ```bash
   curl -X POST "$HOST/api/questions" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d @question.json
   ```

3. **Use jq for parsing** JSON responses
4. **Create a `.bashrc` alias** for common patterns:
   ```bash
   alias api-get='curl -s -H "Authorization: Bearer $STUDENT_TOKEN"'
   ```

5. **Test with httpie** if you prefer simpler syntax:
   ```bash
   http POST localhost:8080/api/auth/login \
     email="john@example.com" \
     password="password"
   ```

Good luck! 🚀

