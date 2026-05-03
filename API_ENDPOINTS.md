# API Endpoints Reference with JWT Authentication

## Base URL
```
http://localhost:5000
```

## Authentication

All protected endpoints require either:
1. **Authorization Header**: `Authorization: Bearer <access_token>`
2. **HTTP-Only Cookie**: Automatically sent if logged in

---

## Authentication Endpoints

### 1. Register User
```
POST /users/register
Content-Type: application/json

Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (201):
{
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "message": "User registered successfully",
  "success": true
}
```

### 2. Login User
```
POST /users/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User logged in successfully",
  "success": true
}

Headers:
Set-Cookie: accessToken=<token>; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict
```

### 3. Logout User
```
POST /users/logout
Authorization: Bearer <access_token>

Response (200):
{
  "statusCode": 200,
  "data": null,
  "message": "User logged out successfully",
  "success": true
}

Headers:
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
```

### 4. Refresh Token
```
POST /users/refresh-token
Authorization: Bearer <access_token>

Response (200):
{
  "statusCode": 200,
  "data": null,
  "message": "Tokens refreshed successfully",
  "success": true
}

Headers:
Set-Cookie: accessToken=<new_token>; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=<new_token>; HttpOnly; Secure; SameSite=Strict
```

### 5. Change Password
```
POST /users/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

Body:
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}

Response (200):
{
  "statusCode": 200,
  "data": null,
  "message": "Password changed successfully",
  "success": true
}
```

---

## Transaction Endpoints

### 1. Create Transaction
```
POST /transactions
Authorization: Bearer <access_token>
Content-Type: application/json

Body:
{
  "amount": 50.00,
  "category": "Food",
  "type": "expense",
  "description": "Lunch at restaurant",
  "date": "2024-01-15T12:30:00Z"
}

Response (201):
{
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "amount": 50.00,
    "category": "Food",
    "type": "expense",
    "description": "Lunch at restaurant",
    "date": "2024-01-15T12:30:00Z",
    "createdAt": "2024-01-15T12:35:00Z"
  },
  "message": "Transaction created successfully",
  "success": true
}
```

### 2. Get All Transactions
```
GET /transactions
Authorization: Bearer <access_token>

Query Parameters (optional):
- category: "Food"
- startDate: "2024-01-01T00:00:00Z"
- endDate: "2024-01-31T23:59:59Z"

Example:
GET /transactions?category=Food&startDate=2024-01-01T00:00:00Z

Response (200):
{
  "statusCode": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "amount": 50.00,
      "category": "Food",
      "type": "expense",
      "description": "Lunch",
      "date": "2024-01-15T12:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "amount": 100.00,
      "category": "Transport",
      "type": "expense",
      "description": "Taxi fare",
      "date": "2024-01-16T18:45:00Z"
    }
  ],
  "message": "Transactions fetched successfully",
  "success": true
}
```

### 3. Get Transaction by ID
```
GET /transactions/:id
Authorization: Bearer <access_token>

Example:
GET /transactions/507f1f77bcf86cd799439012

Response (200):
{
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "amount": 50.00,
    "category": "Food",
    "type": "expense",
    "description": "Lunch at restaurant",
    "date": "2024-01-15T12:30:00Z",
    "createdAt": "2024-01-15T12:35:00Z",
    "updatedAt": "2024-01-15T12:35:00Z"
  },
  "message": "Transaction fetched successfully",
  "success": true
}
```

### 4. Update Transaction
```
PUT /transactions/:id
Authorization: Bearer <access_token>
Content-Type: application/json

Example:
PUT /transactions/507f1f77bcf86cd799439012

Body (all fields optional):
{
  "amount": 60.00,
  "category": "Dining",
  "description": "Lunch at new restaurant",
  "type": "expense"
}

Response (200):
{
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "amount": 60.00,
    "category": "Dining",
    "description": "Lunch at new restaurant",
    "type": "expense",
    "updatedAt": "2024-01-15T13:00:00Z"
  },
  "message": "Transaction updated successfully",
  "success": true
}
```

### 5. Delete Transaction
```
DELETE /transactions/:id
Authorization: Bearer <access_token>

Example:
DELETE /transactions/507f1f77bcf86cd799439012

Response (200):
{
  "statusCode": 200,
  "data": null,
  "message": "Transaction deleted successfully",
  "success": true
}
```

### 6. Get Transaction Summary
```
GET /transactions/summary
Authorization: Bearer <access_token>

Response (200):
{
  "statusCode": 200,
  "data": {
    "totalExpense": 1500.50,
    "totalIncome": 3000.00,
    "balance": 1499.50,
    "categoryBreakdown": {
      "Food": 250.50,
      "Transport": 150.00,
      "Entertainment": 100.00
    }
  },
  "message": "Summary fetched successfully",
  "success": true
}
```

### 7. Get Transaction Trends
```
GET /transactions/trends
Authorization: Bearer <access_token>

Response (200):
{
  "statusCode": 200,
  "data": {
    "monthlyTrend": [
      { "month": "2024-01", "expense": 500, "income": 2000 },
      { "month": "2024-02", "expense": 600, "income": 2200 }
    ],
    "categoryTrend": {
      "Food": [50, 60, 55],
      "Transport": [30, 35, 40]
    }
  },
  "message": "Trends fetched successfully",
  "success": true
}
```

### 8. Get Transaction Insights
```
GET /transactions/insights
Authorization: Bearer <access_token>

Response (200):
{
  "statusCode": 200,
  "data": {
    "topSpendingCategory": "Food",
    "averageTransaction": 125.50,
    "savingRate": 45,
    "recommendations": [
      "Your spending on Entertainment increased by 20%",
      "Consider reducing Food expenses to increase savings"
    ]
  },
  "message": "Insights fetched successfully",
  "success": true
}
```

---

## Health Check Endpoint

### Health Check
```
GET /health

Response (200):
{
  "status": "OK"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid input data",
  "success": false,
  "errors": ["Email is required", "Password must be at least 8 characters"]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "success": false
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied",
  "success": false
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Transaction not found",
  "success": false
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "success": false
}
```

---

## Curl Examples

### Login
```bash
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```

### Create Transaction with Token
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "category": "Food",
    "type": "expense",
    "description": "Lunch"
  }'
```

### Get All Transactions
```bash
curl -X GET http://localhost:5000/transactions \
  -H "Authorization: Bearer <access_token>"
```

### Update Transaction
```bash
curl -X PUT http://localhost:5000/transactions/<transaction_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 60, "description": "Updated lunch"}'
```

### Delete Transaction
```bash
curl -X DELETE http://localhost:5000/transactions/<transaction_id> \
  -H "Authorization: Bearer <access_token>"
```

---

## JavaScript/Fetch Examples

### Login and Get Tokens
```javascript
const login = async () => {
  const response = await fetch('http://localhost:5000/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Include cookies
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'Password123!'
    })
  });
  
  const data = await response.json();
  // Tokens are automatically in cookies
  return data;
};
```

### Make Authenticated Request
```javascript
const getTransactions = async (token) => {
  const response = await fetch('http://localhost:5000/transactions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'  // Include cookies
  });
  
  return response.json();
};
```

### Create Transaction
```javascript
const createTransaction = async (token, transaction) => {
  const response = await fetch('http://localhost:5000/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(transaction)
  });
  
  return response.json();
};
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing:
- 100 requests per minute per IP
- 50 login attempts per hour per email

---

## CORS

CORS is currently enabled for all origins. In production, restrict to:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

**Last Updated**: 2024
**API Version**: 1.0.0
