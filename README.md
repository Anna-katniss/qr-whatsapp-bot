
  # Digital Ticket Screen Layout

  This is a code bundle for Digital Ticket Screen Layout. The original project is available at https://www.figma.com/design/G7NaogrEAU9TsLgBELvmGQ/Digital-Ticket-Screen-Layout.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.


  # WhatsApp Restaurant Ordering Chatbot — n8n Workflow

An automated WhatsApp chatbot built with n8n that handles restaurant orders. When a customer sends a WhatsApp message, a webhook triggers the workflow which processes the message and sends back an automated reply — enabling end-to-end ordering without human intervention.

## How It Works

1. Customer sends a WhatsApp message to the restaurant's number
2. The webhook triggers the n8n workflow
3. The workflow processes the message and generates a response
4. The customer receives an automated reply instantly

## Prerequisites

- [n8n](https://n8n.io/) (self-hosted or cloud)
- WhatsApp Business API access (e.g., Meta Cloud API or Twilio)

## Import into n8n

1. Download `My workflow.json` from this repository
2. Open n8n
3. Click **Import from File**
4. Select the workflow file
5. Configure the required credentials and environment variables
6. Activate the workflow

## Required Credentials

After importing, configure the following in n8n:

- **WhatsApp API Key** — from your WhatsApp Business API provider
- **Webhook URL** — set this in your WhatsApp app settings to point to your n8n instance

## Notes

- Credentials are not included in the workflow export
- Make sure your n8n instance is publicly accessible for the webhook to receive messages
