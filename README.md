# 📚 Library Management System

## Overview

Library Management System is a web-based application designed to simplify and automate library operations. The system helps librarians manage books, members, book issuing, returns, fines, and reports efficiently through an easy-to-use dashboard.

## Features

### 📖 Book Management

* Add, edit, delete, and view books
* Search books by title, author, category, or ISBN
* Manage book availability and inventory

### 👥 Member Management

* Register new members
* Update member details
* View member borrowing history
* Manage student and staff records

### 🔄 Book Issue & Return

* Issue books to members
* Track issue and due dates
* Return books and update availability
* Maintain transaction records

### 💰 Fine Management

* Automatic fine calculation for overdue books
* Track fine payments
* Generate fine reports

### 📊 Dashboard & Reports

* Total Books
* Available Books
* Issued Books
* Returned Books
* Total Members
* Overdue Books
* Fine Collection Summary

### 🔐 User Authentication

* Secure Login System
* Role-Based Access Control
* Admin and Librarian Access

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* Supabase

## Database Structure

### Users

* User ID
* Name
* Email
* Password
* Role

### Books

* Book ID
* Title
* Author
* ISBN
* Category
* Publisher
* Quantity
* Available Quantity

### Members

* Member ID
* Name
* Department
* Contact Details

### Issued Books

* Issue ID
* Book ID
* Member ID
* Issue Date
* Due Date
* Status

### Returned Books

* Return ID
* Issue ID
* Return Date
* Fine Amount

## Project Modules

1. Authentication Module
2. Dashboard Module
3. Book Management Module
4. Member Management Module
5. Issue Book Module
6. Return Book Module
7. Fine Management Module
8. Reports Module

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/library-management-system.git
```

### Navigate to Project Folder

```bash
cd library-management-system
```

### Install Dependencies

```bash
npm install
```

### Run Application

```bash
npm start
```

## Future Enhancements

* QR Code Based Book Tracking
* Barcode Scanner Integration
* Email Notifications
* Mobile Application Support
* AI-Based Book Recommendations
* Advanced Analytics Dashboard

## Advantages

* Reduces Manual Work
* Improves Accuracy
* Faster Book Management
* Better Record Keeping
* Easy Report Generation
* User-Friendly Interface

## Conclusion

The Library Management System provides an efficient and reliable solution for managing library operations. It helps librarians and administrators handle books, members, and transactions effectively while improving overall productivity.

## License

This project is developed for educational and learning purposes.
