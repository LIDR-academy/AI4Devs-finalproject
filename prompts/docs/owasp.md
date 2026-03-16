# OWASP Top 10 Secure Coding Guidelines with Examples

This document provides 10 key security guidelines based on OWASP principles, with code examples demonstrating both vulnerable and secure implementations.

## 1. Input Validation: Prevent Injection Attacks

**Vulnerable Code (SQL Injection):**
```java
// Java example
String query = "SELECT * FROM users WHERE username='" + request.getParameter("username") + "' AND password='" + request.getParameter("password") + "'";
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery(query);
```

**Secure Code:**
```java
// Java example using PreparedStatement
String query = "SELECT * FROM users WHERE username=? AND password=?";
PreparedStatement preparedStatement = connection.prepareStatement(query);
preparedStatement.setString(1, request.getParameter("username"));
preparedStatement.setString(2, request.getParameter("password"));
ResultSet resultSet = preparedStatement.executeQuery();
```

**Key Principle:** Never trust user input. Always validate, sanitize, and parameterize queries to prevent injection attacks.

## 2. Authentication and Password Management

**Vulnerable Code:**
```javascript
// JavaScript - weak password storage
function storeUserPassword(username, password) {
  const users = db.getCollection('users');
  users.insert({
    username: username,
    password: password  // Storing plain text password
  });
}
```

**Secure Code:**
```javascript
// JavaScript with bcrypt for password hashing
const bcrypt = require('bcrypt');

async function storeUserPassword(username, password) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const users = db.getCollection('users');
  users.insert({
    username: username,
    password: hashedPassword  // Storing hashed password
  });
}
```

**Key Principle:** Never store passwords in plain text. Use strong, adaptive hashing algorithms with salt.

## 3. Cross-Site Scripting (XSS) Prevention

**Vulnerable Code:**
```javascript
// JavaScript - Vulnerable to XSS
document.getElementById('userProfile').innerHTML = 'Welcome, ' + userName;
```

**Secure Code:**
```javascript
// JavaScript with proper encoding
import { encode } from 'html-entities';

// Option 1: Encode user input
document.getElementById('userProfile').innerHTML = 'Welcome, ' + encode(userName);

// Option 2: Use safer DOM methods
const userProfileElement = document.getElementById('userProfile');
userProfileElement.textContent = 'Welcome, ' + userName;
```

**Key Principle:** Always encode/escape output and use context-appropriate encoding for the correct interpreter.

## 4. Secure Session Management

**Vulnerable Code:**
```python
# Python Flask - Insecure session configuration
app = Flask(__name__)
app.secret_key = "hardcoded_secret_key"  # Weak, hardcoded secret

@app.route('/login', methods=['POST'])
def login():
    session['user_id'] = user.id
    session['is_admin'] = user.is_admin
    # No session expiration set
    return redirect('/dashboard')
```

**Secure Code:**
```python
# Python Flask - Secure session configuration
import os
import datetime

app = Flask(__name__)
app.secret_key = os.urandom(32)  # Strong, random secret
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=datetime.timedelta(hours=1)
)

@app.route('/login', methods=['POST'])
def login():
    session.permanent = True  # Use the expiration time set above
    session['user_id'] = user.id
    session['is_admin'] = user.is_admin
    session['created_at'] = datetime.datetime.now().timestamp()
    return redirect('/dashboard')
```

**Key Principle:** Use secure cookies, implement proper session expiration, and protect session data from theft and manipulation.

## 5. Access Control Implementation

**Vulnerable Code:**
```java
// Java - Inadequate access control
@RequestMapping("/user/{userId}/account")
public String getUserAccount(@PathVariable("userId") String userId, Model model) {
    // No verification if the requesting user has permission to access this userId
    UserAccount account = accountService.getAccount(userId);
    model.addAttribute("account", account);
    return "userAccount";
}
```

**Secure Code:**
```java
// Java - Proper access control checks
@RequestMapping("/user/{userId}/account")
public String getUserAccount(@PathVariable("userId") String userId, 
                           @AuthenticationPrincipal User currentUser, 
                           Model model) {
    // Check if current user has permission
    if (!currentUser.getId().equals(userId) && !currentUser.isAdmin()) {
        throw new AccessDeniedException("Not authorized to access this account");
    }
    
    UserAccount account = accountService.getAccount(userId);
    model.addAttribute("account", account);
    return "userAccount";
}
```

**Key Principle:** Implement access controls consistently across the application and deny access by default.

## 6. Secure File Handling

**Vulnerable Code:**
```php
<?php
// PHP - Insecure file upload
if ($_FILES['file']['size'] > 0) {
    $fileName = $_FILES['file']['name'];
    $destination = '/uploads/' . $fileName;
    move_uploaded_file($_FILES['file']['tmp_name'], $destination);
    echo "File uploaded successfully";
}
?>
```

**Secure Code:**
```php
<?php
// PHP - Secure file handling
if ($_FILES['file']['size'] > 0) {
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $detectedType = mime_content_type($_FILES['file']['tmp_name']);
    
    if (!in_array($detectedType, $allowedTypes)) {
        die("Invalid file type");
    }
    
    // Generate safe filename
    $fileExtension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $newFileName = bin2hex(random_bytes(16)) . '.' . $fileExtension;
    $destination = '/uploads/' . $newFileName;
    
    // Ensure the destination is still within the intended directory
    $realDestination = realpath(dirname($destination)) . '/' . basename($destination);
    if (strpos($realDestination, realpath('/uploads')) !== 0) {
        die("Invalid destination");
    }
    
    if (move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
        echo "File uploaded successfully";
    }
}
?>
```

**Key Principle:** Validate file types, use secure file names, scan content for malware, and store files outside the webroot when possible.

## 7. Secure Communication (TLS/HTTPS)

**Vulnerable Code:**
```javascript
// JavaScript - Insecure API call
fetch('http://api.example.com/user/data', {
  method: 'POST',
  body: JSON.stringify({ userId: '12345' })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Secure Code:**
```javascript
// JavaScript - Secure API call with HTTPS
fetch('https://api.example.com/user/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId: '12345' })
})
.then(response => {
  // Check for certificate issues
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Server-side HTTPS configuration (Node.js)
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt'),
  ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256',
  minVersion: 'TLSv1.2'
};

https.createServer(options, app).listen(443);
```

**Key Principle:** Use HTTPS for all communications, configure TLS properly, and enforce HTTPS through redirects and HSTS.

## 8. Error Handling and Logging

**Vulnerable Code:**
```python
# Python - Insecure error handling
@app.route('/process')
def process_request():
    try:
        # Process the request
        result = do_something()
        return result
    except Exception as e:
        # Exposes potentially sensitive information
        return f"An error occurred: {str(e)}"
```

**Secure Code:**
```python
# Python - Secure error handling and logging
import logging
import traceback
import uuid

logger = logging.getLogger(__name__)

@app.route('/process')
def process_request():
    request_id = str(uuid.uuid4())
    try:
        # Process the request
        result = do_something()
        logger.info(f"Request {request_id} processed successfully")
        return result
    except Exception as e:
        # Log the detailed error with the request ID
        logger.error(f"Request {request_id} failed: {str(e)}\n{traceback.format_exc()}")
        # Return a generic error to the user with the ID for reference
        return f"An error occurred. Reference ID: {request_id}", 500
```

**Key Principle:** Implement centralized error handling, don't expose sensitive information in errors, and maintain proper logging with appropriate detail levels.

## 9. Data Protection and Privacy

**Vulnerable Code:**
```javascript
// JavaScript - Insecure data storage
localStorage.setItem('userToken', token);
localStorage.setItem('userCreditCard', creditCardNumber);
```

**Secure Code:**
```javascript
// JavaScript - More secure data handling
// Use sessionStorage for sensitive session data
sessionStorage.setItem('userToken', token);

// Don't store sensitive data like credit cards in browser storage
// For payment processing, use a tokenization service
async function processPayment(creditCardNumber) {
  // Send directly to payment processor over HTTPS for tokenization
  const response = await fetch('https://payment-processor.com/tokenize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      cardNumber: creditCardNumber,
      // other card details
    })
  });
  
  const { token } = await response.json();
  
  // Only store the token, not the actual card data
  return token;
}

// Example of client-side encryption when necessary
// (Note: Server-side encryption is generally preferred)
import { encrypt } from 'crypto-library';

function encryptSensitiveData(data, publicKey) {
  return encrypt(data, publicKey);
}
```

**Key Principle:** Minimize collection of sensitive data, implement proper data classification, and use appropriate encryption both in transit and at rest.

## 10. Security Configuration and Dependency Management

**Vulnerable Code:**
```json
// package.json with vulnerable dependencies
{
  "name": "my-application",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.15.2",
    "lodash": "4.17.11",
    "jquery": "1.12.4"
  }
}
```

**Secure Code:**
```javascript
// Updated package.json with security practices
{
  "name": "my-application",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.17.3",
    "lodash": "4.17.21",
    "jquery": "3.6.0"
  },
  "scripts": {
    "audit": "npm audit",
    "outdated": "npm outdated",
    "security-scan": "npm run audit && npm run outdated"
  }
}

// Example of Content Security Policy implementation (Node.js with Helmet)
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
    styleSrc: ["'self'", 'trusted-cdn.com'],
    imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
    connectSrc: ["'self'", 'api.example.com'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
}));
```

**Key Principle:** Maintain a secure configuration for all frameworks, platforms, and dependencies. Use automated tools to check for vulnerabilities in dependencies and keep them updated.

## Summary of OWASP Secure Coding Principles

1. **Input Validation**: Never trust user input; validate, sanitize, and encode all inputs.
2. **Authentication**: Use strong password hashing and implement multi-factor authentication when possible.
3. **Output Encoding**: Prevent XSS by properly encoding output based on context.
4. **Session Management**: Use secure cookies and implement proper timeouts.
5. **Access Control**: Implement the principle of least privilege and verify authorization consistently.
6. **File Handling**: Validate file types, sanitize filenames, and use secure storage locations.
7. **Secure Communications**: Use HTTPS/TLS for all transmissions of sensitive data.
8. **Error Handling**: Implement centralized error handling without exposing system details.
9. **Data Protection**: Minimize data collection, classify data properly, and use appropriate encryption.
10. **Security Configuration**: Keep dependencies updated and use secure configuration by default.

These guidelines represent core OWASP security principles that should be applied across all applications.
