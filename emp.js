const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, 'employees.txt');
const usersFilePath = path.join(__dirname, 'users.txt'); // New file for storing user credentials

// Load users from text file
function loadUsers() {
    if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath, 'utf-8');
        return data.trim().split('\n').map(line => {
            const [username, password] = line.split('|');
            return { username, password };
        });
    }
    return [];
}

// Save users to text file
function saveUsers(users) {
    const data = users.map(user => `${user.username}|${user.password}`).join('\n');
    fs.writeFileSync(usersFilePath, data, 'utf-8');
}

let employees = loadEmployees();
let users = loadUsers();

// Simple session management
let session = {};

function loadEmployees() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return data.trim().split('\n').map((line) => {
            const [id, name, role, salary] = line.split('|');
            return { id: parseInt(id), name, role, salary: parseInt(salary) };
        });
    }
    return [];
}

function saveEmployees(employees) {
    const data = employees.map(emp => `${emp.id}|${emp.name}|${emp.role}|${emp.salary}`).join('\n');
    fs.writeFileSync(dataFilePath, data, 'utf-8');
}

function displayLogin(req, res) {
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #2c3e50;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
        }
        .container {
            width: 400px;
            padding: 40px;
            background-color: #34495e;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            transition: box-shadow 0.5s ease-in-out;
        }
        .container:focus-within {
            box-shadow: 0 0 20px 5px navy;
        }
        h2 {
            text-align: center;
            margin: 0 0 20px;
            color: #ecf0f1;
        }
        .input-container {
            position: relative;
            width: 100%;
            margin: 10px 0;
        }
        input {
            width: 0;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #bdc3c7;
            outline: none;
            opacity: 0;
            transition: width 0.4s ease, opacity 0.4s ease;
            box-sizing: border-box;
        }
        .input-container:hover input, input:focus {
            width: 100%;
            opacity: 1;
        }
        .placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 10px;
            pointer-events: none;
            color: #bdc3c7;
            transition: opacity 0.4s ease;
            box-sizing: border-box;
        }
        .input-container:hover .placeholder, input:focus + .placeholder {
            opacity: 0;
        }
        button {
            width: 100%;
            padding: 10px;
            margin-top: 20px;
            background-color: #3498db;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, #3498db, transparent);
            z-index: -1;
            transform: scale(0);
            transition: transform 0.4s ease-in-out;
        }
        button:hover::before {
            transform: scale(3);
        }
        button.shatter {
            background-color: transparent;
            animation: shatter 0.5s ease-out forwards;
        }
        @keyframes shatter {
            to {
                transform: translateY(1000px) rotate(720deg);
                opacity: 0;
            }
        }
        a {
            display: block;
            margin-top: 15px;
            text-align: center;
            color: #3498db;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Login</h2>
        <form method="POST" action="/login">
            <div class="input-container">
                <input type="text" name="username" required>
                <span class="placeholder">Username</span>
            </div>
            <div class="input-container">
                <input type="password" name="password" required>
                <span class="placeholder">Password</span>
            </div>
            <button type="submit" onclick="shatterButton(this)">Log In</button>
            <a href="/signup">Don't have an account? Sign Up</a>
        </form>
    </div>

    <script>
        function shatterButton(button) {
            button.classList.add('shatter');
            setTimeout(() => {
                button.disabled = true;
            }, 500);
        }
    </script>
</body>
</html>

    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function displaySignup(req, res) {
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #2c3e50;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            overflow: hidden;
        }
        .container {
            width: 400px;
            padding: 40px;
            background-color: #34495e;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            transition: box-shadow 0.5s ease-in-out;
        }
        .container:focus-within {
            box-shadow: 0 0 20px 5px navy;
        }
        h2 {
            text-align: center;
            margin: 0 0 20px;
            color: #ecf0f1;
        }
        .input-container {
            position: relative;
            width: 100%;
            margin: 10px 0;
        }
        input {
            width: 0;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #bdc3c7;
            outline: none;
            opacity: 0;
            transition: width 0.4s ease, opacity 0.4s ease;
            box-sizing: border-box;
        }
        .input-container:hover input, input:focus {
            width: 100%;
            opacity: 1;
        }
        .placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 10px;
            pointer-events: none;
            color: #bdc3c7;
            transition: opacity 0.4s ease;
            box-sizing: border-box;
        }
        .input-container:hover .placeholder, input:focus + .placeholder {
            opacity: 0;
        }
        button {
            width: 100%;
            padding: 10px;
            margin-top: 20px;
            background-color: #3498db;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, #3498db, transparent);
            z-index: -1;
            transform: scale(0);
            transition: transform 0.4s ease-in-out;
        }
        button:hover::before {
            transform: scale(3);
        }
        button.shatter {
            background-color: transparent;
            animation: shatter 0.5s ease-out forwards;
        }
        @keyframes shatter {
            to {
                transform: translateY(1000px) rotate(720deg);
                opacity: 0;
            }
        }
        a {
            display: block;
            margin-top: 15px;
            text-align: center;
            color: #3498db;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Sign Up</h2>
        <form method="POST" action="/signup">
            <div class="input-container">
                <input type="text" name="username" required>
                <span class="placeholder">Username</span>
            </div>
            <div class="input-container">
                <input type="password" name="password" required>
                <span class="placeholder">Password</span>
            </div>
            <button type="submit" onclick="shatterButton(this)">Sign Up</button>
            <a href="/login">Back to Login</a>
        </form>
    </div>

    <script>
        function shatterButton(button) {
            button.classList.add('shatter');
            setTimeout(() => {
                button.disabled = true;
            }, 500);
        }
    </script>
</body>
</html>

        `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function handleLogin(req, res) {
    parsePostData(req, (postData) => {
        const { username, password } = postData;

        // Simple authentication check
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            session.isAuthenticated = true;
            res.writeHead(302, { 'Location': '/' });
            res.end();
        } else {
            res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end('<h1>401 Unauthorized</h1><p>Invalid credentials</p>');
        }
    });
}

function handleSignup(req, res) {
    parsePostData(req, (postData) => {
        const { username, password } = postData;

        // Check if user already exists
        if (users.some(user => user.username === username)) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>400 Bad Request</h1><p>Username already exists</p>');
            return;
        }

        // Add new user and save to file
        users.push({ username, password });
        saveUsers(users);
        res.writeHead(302, { 'Location': '/login' });
        res.end();
    });
}

function displayEmployees(req, res) {
    if (!session.isAuthenticated) {
        res.writeHead(302, { 'Location': '/login' });
        res.end();
        return;
    }

    const html = `
    <html>
      <head>
        <title>Employee Salary Management</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f9f9f9; }
          .container { width: 80%; margin: auto; overflow: hidden; }
          header { background: #333; color: #fff; padding: 10px 0; text-align: center; }
          table { width: 100%; margin: 20px 0; border-collapse: collapse; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #333; color: white; }
          a { display: inline-block; margin: 10px 0; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <header>
          <h1>Employee Salary Management</h1>
        </header>
        <div class="container">
          <h1>Employee List</h1>
          <table>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Salary</th>
            </tr>
            ${employees.map((employee) => `
              <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>${employee.salary}</td>
              </tr>
            `).join('')}
          </table>
          <a href="/add">Add Employee</a>
          <a href="/update">Update Employee</a>
          <a href="/delete">Delete Employee</a>
        </div>
      </body>
    </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function parsePostData(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(querystring.parse(body));
    });
}

function handleRequest(req, res) {
    const urlParts = url.parse(req.url);

    switch (urlParts.pathname) {
        case '/':
            displayEmployees(req, res);
            break;
        case '/login':
            if (req.method === 'POST') {
                handleLogin(req, res);
            } else {
                displayLogin(req, res);
            }
            break;
        case '/signup':
            if (req.method === 'POST') {
                handleSignup(req, res);
            } else {
                displaySignup(req, res);
            }
            break;
        case '/add':
            // Add your existing logic for adding an employee here
            break;
        case '/update':
            // Add your existing logic for updating an employee here
            break;
        case '/delete':
            // Add your existing logic for deleting an employee here
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            break;
    }
}

const server = http.createServer(handleRequest);

server.listen(3000, () => {
    console.log('server is running at http://127.0.0.1:3000/');
});