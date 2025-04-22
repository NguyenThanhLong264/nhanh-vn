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
- Nhanh.vn API credentials
- CareSoft API credentials

## Quick Start

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

## Webhook Setup

1. Start ngrok:
   ```bash
   ngrok http 3000
   ```
2. Copy the HTTPS URL provided by ngrok to set up your webhook in Nhanh.vn.

- eg: your-ngrok-url/api/webhook

3. Configure your webhook in Nhanh.vn:
   - Go to https://open.nhanh.vn.
   - Navigate to "Settings" > "Webhooks".
   - Create a new webhook with the HTTPS URL provided by ngrok.

## Usage

1. Start the application:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Contact

For questions or feedback, please contact [your-email@example.com].
