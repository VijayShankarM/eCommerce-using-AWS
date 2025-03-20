# Serverless E-Commerce Website using AWS Free Tier

This project is a serverless e-commerce website built using AWS Free Tier services. It includes an admin panel for managing products and a frontend for customers to browse and place orders. The backend is powered by AWS Lambda, API Gateway, and DynamoDB, while the frontend is hosted on S3 with CloudFront.

## Features
- **Product Management**: Admin can add, edit, delete, and retrieve products.
- **Order Processing**: Customers can add products to the cart and place orders.
- **AWS Serverless Architecture**: Uses S3, API Gateway, Lambda, and DynamoDB.

---

## Project Structure
- **Frontend**: HTML, CSS, JavaScript (Hosted on S3 & CloudFront)
- **Backend**: AWS Lambda functions exposed via API Gateway
- **Database**: Two DynamoDB tables (Products & Orders)

---

## AWS Services Used
- **Amazon S3**: Hosts the frontend
- **Amazon CloudFront**: Distributes the frontend globally
- **AWS API Gateway**: Exposes APIs for backend services
- **AWS Lambda**: Handles backend logic
- **Amazon DynamoDB**: Stores product and order data

---

## Setup Instructions

### 1. Create DynamoDB Tables

#### Products Table
- Table Name: `Products`
- Primary Key: `productId` (String)
- Attributes: `name`, `price`, `stock`, `image`

#### Orders Table
- Table Name: `Orders`
- Primary Key: `orderId` (String)
- Attributes: `name`, `address`, `phone`, `email`, `cartItems`

---

### 2. Deploy Lambda Functions
Create the following five Lambda functions:

#### **1. getProducts** (Retrieve all products)
- Method: GET
- Endpoint: `/products`
- Fetches all products from the `Products` table.

#### **2. addProduct** (Add a new product)
- Method: POST
- Endpoint: `/products`
- Stores a new product in the `Products` table.

#### **3. editProduct** (Update an existing product)
- Method: PUT
- Endpoint: `/products/{productId}`
- Updates product details in the `Products` table.

#### **4. deleteProduct** (Delete a product)
- Method: DELETE
- Endpoint: `/products/{productId}`
- Removes a product from the `Products` table.

#### **5. processOrder** (Place an order)
- Method: POST
- Endpoint: `/orders`
- Stores order details in the `Orders` table.

---

### 3. Configure API Gateway
- Create a **REST API** in API Gateway.
- Add endpoints for each Lambda function.
- Enable **CORS** for all routes.
- Deploy the API and note the **Invoke URL**.

---

### 4. Deploy Frontend on S3 & CloudFront
- Upload `index.html`, `admin.html`, and other assets to an S3 bucket.
- Enable **Static Website Hosting** in S3.
- Configure **CloudFront** for faster global distribution.

---

## Usage
1. Open the website URL (CloudFront URL or S3 bucket URL).
2. Admin can log in to the admin panel to manage products.
3. Customers can browse products, add to cart, and place orders.

---

## Future Enhancements
- Implement authentication using AWS Cognito.
- Add a payment gateway for order processing.
- Improve UI/UX with better frontend frameworks.

---


