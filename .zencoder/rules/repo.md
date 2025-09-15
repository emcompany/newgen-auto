---
description: Repository Information Overview
alwaysApply: true
---

# Inventory Management System Information

## Summary
A full-stack inventory management system with purchase, item, supplier, and customer management capabilities. The application uses React for the frontend and Express.js with PostgreSQL for the backend. It provides functionality for managing inventory items, purchase transactions, and master data.

## Structure
- **frontend/**: React application with UI components for different modules
- **backend/**: Express.js server with API routes and database connectivity
- **MasterData/**: Contains CSV and Excel files with party master data

## Language & Runtime
**Frontend Language**: JavaScript (React)
**Frontend Version**: React 19.1.1
**Backend Language**: JavaScript (Node.js)
**Backend Framework**: Express 5.1.0
**Database**: PostgreSQL 8.16.3
**Package Manager**: npm

## Dependencies
**Frontend Main Dependencies**:
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.7.1
- axios: ^1.11.0
- framer-motion: ^12.23.12
- react-icons: ^5.5.0

**Backend Main Dependencies**:
- express: ^5.1.0
- pg: ^8.16.3
- bcryptjs: ^3.0.2
- jsonwebtoken: ^9.0.2
- cors: ^2.8.5
- nodemon: ^3.1.10

## Build & Installation
```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
npm install
node server.js
```

## Database
**Type**: PostgreSQL
**Tables**:
- tblMasItem: Item master data
- tblMasParty: Party (supplier/customer) data
- tblTrnPurchase: Purchase transaction headers
- tblTrnPurchaseDet: Purchase transaction details/line items

## Main Files
**Frontend Entry Point**: frontend/src/index.js
**Backend Entry Point**: backend/server.js
**Key Components**:
- PurchasePage.js: Purchase transaction management
- Itempage.js: Item master management
- SupplierPage.js: Supplier management
- CustomerPage.js: Customer management

**API Routes**:
- purchaseRoutes.js: Purchase transaction APIs
- itemRoutes.js: Item master APIs
- partyRoutes.js: Party (supplier/customer) APIs

## Current Implementation
The current purchase page implementation has a limitation in the item selection process. When a user clicks "Add Row" in the purchase form, it directly adds a new row to the table where the user must manually enter an item code without seeing additional item details.

## Required Enhancement
The purchase page needs to be modified so that when a user clicks "Add Row":
1. A new modal form should open
2. The form should allow searching and selecting items from the item master
3. The form should display additional item details (name, price, etc.)
4. Upon selection, the item details should populate the current row in the purchase form
5. The modal should close and return focus to the purchase form

This enhancement will improve usability by providing item details during selection rather than requiring users to know item codes.