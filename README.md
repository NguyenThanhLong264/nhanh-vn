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
   git clone https://github.com/yourusername/nhanh-vn.git
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

1. Start ngrok to create a secure tunnel to your local server:

   ```bash
   ngrok http 3000
   ```

2. Copy the HTTPS URL provided by ngrok (e.g., `https://a1b2c3d4.ngrok.io`)

3. Configure webhooks in Nhanh.vn:
   - Go to [https://open.nhanh.vn](https://open.nhanh.vn)
   - Navigate to **Settings > Webhooks**
   - Create two webhooks with the following endpoints:
     - **Order Creation**: `your-ngrok-url/api/orderAdd`
     - **Order Updates**: `your-ngrok-url/api/orderUpdate`

## Database

The application uses SQLite to store mappings between Nhanh.vn orders and CareSoft deals. The database is automatically created and managed by the application.

## Troubleshooting

- **Webhook not receiving data**: Ensure ngrok is running and the webhook URLs are correctly configured in Nhanh.vn
- **API errors**: Verify your API credentials are correct in the application settings
- **Mapping issues**: Check the field mappings in the configuration page

## Support

For questions or feedback, please contact [support@caresoft.vn](mailto:support@caresoft.vn)

## License

© 2024 CareSoft. All rights reserved.