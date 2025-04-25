# Nhanh.vn to CareSoft Integration

## Overview

A middleware application that seamlessly integrates Nhanh.vn orders with CareSoft deals. This application serves as a bridge between Nhanh.vn's e-commerce platform and CareSoft's CRM system, automatically converting orders into deals while maintaining data synchronization.

## Key Features

- **Custom Field Mapping**: Flexible mapping configuration between Nhanh.vn and CareSoft fields
- **Automated Deal Creation**: Automatic deal creation in CareSoft from Nhanh.vn orders
- **Real-time Updates**: Synchronous order status updates between platforms
- **Customer Management**: Automatic customer information updates based on phone numbers
- **Configurable Settings**: Easy-to-use interface for API credentials and mapping setup

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- ngrok (for webhook testing)
- Nhanh.vn API credentials (AppID, Version, BusinessID, AccessToken)
- CareSoft API credentials (Domain, API Token)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/NguyenThanhLong264/nhanh-vn.git
   ```

2. Navigate to the project directory:

   ```bash
   cd nhanh-vn
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

1. Set up your API credentials:

   - Open the application in your browser
   - Enter your Nhanh.vn credentials (AppID, Version, BusinessID, AccessToken)
   - Enter your CareSoft credentials (Domain, API Token)
   - Click "Save" to store your credentials

2. Configure field mappings:
   - Navigate to the mapping configuration page
   - Map Nhanh.vn fields to CareSoft fields
   - Set up custom field mappings as needed
   - Save your configuration

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

## Webhook Setup

For the integration to work, you need to set up webhooks in Nhanh.vn to notify this application when orders are created or updated:

1. Configure webhooks in Nhanh.vn:
   - Go to [https://open.nhanh.vn](https://open.nhanh.vn)
   - Navigate to **Settings > Webhooks**
   - Create two webhooks with the following endpoints:
     - `https://your-domain/api/webhookNhanhVN`

Note: Replace `your-domain` with your actual domain name. Ensure your endpoint is accessible via HTTPS as required by Nhanh.vn's webhook system.

## Database

The application uses SQLite to store mappings between Nhanh.vn orders and CareSoft deals. The database is automatically created and managed by the application.

## Troubleshooting

- **Webhook not receiving data**: Ensure ngrok is running and the webhook URLs are correctly configured in Nhanh.vn
- **API errors**: Verify your API credentials are correct in the application settings
- **Mapping issues**: Check the field mappings in the configuration page

## How to Use

1. **Initial Setup**

   - Install and configure the application following the installation steps above
   - Start the application using either development or production mode
   - Access the application interface at `http://localhost:3000`

2. **API Configuration**

   - In the application interface, navigate to the API settings page
   - Enter your Nhanh.vn credentials:
     - AppID (e.g., "75230")
     - Version (e.g., "2.0")
     - BusinessID
     - AccessToken
   - Enter your CareSoft credentials:
     - Domain (e.g., "thammydemo")
     - API Token
   - Save your configuration

3. **Field Mapping Setup**

   - Go to the mapping configuration page
   - Map essential fields between Nhanh.vn and CareSoft:
     - Customer information (name, phone, email)
     - Order details (products, prices, shipping)
     - Status mappings
   - Configure any custom field mappings
   - Save your mapping configuration

4. **Webhook Configuration**

   - Access your Nhanh.vn account at [https://open.nhanh.vn](https://open.nhanh.vn)
   - Navigate to Settings > Webhooks
   - Add a new webhook with endpoint: `https://your-domain/api/webhookNhanhVN`
   - Replace `your-domain` with your actual domain
   - Ensure your endpoint is accessible via HTTPS

5. **Testing the Integration**

   - Create a test order in Nhanh.vn
   - Check your CareSoft account for the new deal
   - Verify all mapped fields are correctly populated
   - Test order status updates to ensure synchronization

6. **Monitoring and Maintenance**
   - Regularly check the application logs for any errors
   - Monitor webhook delivery status in Nhanh.vn
   - Verify deal creation and updates in CareSoft
   - Update field mappings as needed
