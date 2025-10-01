# 🚀 SendGrid Email Setup Guide

## Step 1: Create SendGrid Account

1. **Sign up for SendGrid**: Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. **Create a free account** (allows 100 emails/day forever)
3. **Verify your account** via email

## Step 2: Get API Key

1. **Login to SendGrid Console**: [https://app.sendgrid.com/](https://app.sendgrid.com/)
2. **Navigate to Settings** → **API Keys**
3. **Create API Key**:
   - Name: `NestJS App`
   - Permissions: `Full Access` (or `Mail Send` only for security)
4. **Copy the API Key** (you'll only see it once!)

## Step 3: Set Up Sender Authentication

### Option A: Single Sender Verification (Quick & Easy)
1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. **Add a Sender** with your email address (e.g., `verifiedsengridsender@email.com`)
3. **Verify the email** by clicking the link SendGrid sends you
4. Use this email as your `SENDGRID_FROM_EMAIL`

### Option B: Domain Authentication (Professional)
1. Go to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Add your domain and follow DNS setup instructions
3. Use any email from your verified domain

## Step 4: Update Environment Variables

Update your `.env` file with:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=verifiedsengridsender@email.com  # Your verified sender email on sendgrid
```

## Step 5: Test Email Sending

After setting up the environment variables, restart your application and test:

```bash
# Restart the application
npm run start:dev

# Send a test email
curl -X POST http://localhost:3001/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"to": "<yourtestemail.com>", "name": "Santiago Granada"}'
```

## 🔧 Current Configuration

Your application is now configured to use SendGrid with these features:

- ✅ **Professional email delivery** via SendGrid
- ✅ **Reliable delivery** (no spam issues like Gmail SMTP)
- ✅ **Detailed logging** and error handling
- ✅ **100 free emails/day** with SendGrid free tier
- ✅ **Easy scaling** for production use

## 📧 Email Templates Available

1. **Welcome Email**: `POST /email/welcome`
2. **Notification Email**: `POST /email/notification`
3. **Custom Email**: `POST /email/custom`
4. **Delayed Email**: `POST /email/delayed`

## 🚨 Important Notes

- **Free Tier Limit**: 100 emails/day (more than enough for testing)
- **Sender Verification**: You MUST verify your sender email address
- **API Key Security**: Keep your API key secret, never commit it to git
- **Deliverability**: SendGrid has excellent deliverability rates vs SMTP

## 🎯 Next Steps

1. **Create SendGrid account** → **Get API key** → **Verify sender email**
2. **Update .env file** with your actual credentials
3. **Restart application** and test email sending
4. **Check SendGrid dashboard** for delivery statistics

SendGrid is much more reliable than Gmail SMTP and provides detailed analytics!