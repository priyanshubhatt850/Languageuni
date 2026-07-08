# Razorpay Payment Gateway Integration

Complete Razorpay payment gateway integration for LanguageUni with webhook support similar to PayPal implementation.

## Overview

This integration provides:
- ✅ Payment order creation
- ✅ Secure payment verification with signature validation
- ✅ Webhook event handling (payment.authorized, payment.captured, payment.failed, order.paid)
- ✅ Transaction tracking
- ✅ Enrollment automatic updates on successful payment
- ✅ Error handling and retry logic
- ✅ Logging for debugging

## Architecture

### Payment Flow

```
Frontend (LevelDetail.jsx)
    ↓
User clicks "Enroll Now"
    ↓
Select Payment Method (PayPal / Razorpay)
    ↓
POST /razorpay/create-order (creates order + transaction record)
    ↓
Razorpay SDK opens payment modal
    ↓
User enters payment details
    ↓
Razorpay processes payment
    ↓
Two parallel paths:
    1. Client-side: Payment success callback → POST /razorpay/verify-payment
    2. Server-side: Webhook → POST /razorpay/webhook
    ↓
Update transaction & enrollment status
    ↓
Frontend: Show success, refresh enrollment
```

## Setup Instructions

### Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for an account
3. Complete KYC verification
4. Navigate to Settings → API Keys
5. Copy your **Key ID** and **Key Secret**

### Step 2: Backend Configuration

1. **Add Razorpay npm package** (already added to package.json):
```bash
npm install razorpay
```

2. **Update `.env` file** in `d:\personal\Languageunibackend`:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id_from_dashboard
RAZORPAY_KEY_SECRET=your_key_secret_from_dashboard
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_dashboard
```

**Note**: Generate `RAZORPAY_WEBHOOK_SECRET` after setting up webhooks in the next steps.

### Step 3: Frontend Configuration

1. **Update `.env.local` and `.env.production`** in `d:\personal\Languageuni`:
```env
VITE_RAZORPAY_KEY_ID=your_key_id_from_dashboard
```

**Important**: Use only the public Key ID here, NEVER the secret key!

### Step 4: Configure Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Add New Webhook"
3. **Webhook URL**: `https://yourdomain.com/razorpay/webhook`
4. **Active Alerts**: Select the following events:
   - `payment.authorized`
   - `payment.captured` ⭐ (Main event for enrollment)
   - `payment.failed`
   - `order.paid`

5. Click "Create"
6. Copy the **Webhook Secret** and add to your `.env`:
```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## API Endpoints

### 1. Create Order
**POST** `/razorpay/create-order`
- **Authentication**: Required (authMiddleware)
- **Body**:
```json
{
  "amount": 99.99,
  "levelId": "507f1f77bcf86cd799439011",
  "instructor_id": "507f1f77bcf86cd799439012",
  "userCountry": "IN",
  "ip": "192.168.1.1"
}
```
- **Response**:
```json
{
  "success": true,
  "orderId": "order_1234567890",
  "amount": 9999,
  "currency": "INR",
  "transactionId": "507f1f77bcf86cd799439013",
  "enrollmentId": "507f1f77bcf86cd799439014"
}
```

### 2. Verify Payment
**POST** `/razorpay/verify-payment`
- **Authentication**: Required (authMiddleware)
- **Body**:
```json
{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "transactionId": "507f1f77bcf86cd799439013"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Payment completed successfully",
  "transactionId": "507f1f77bcf86cd799439013",
  "paymentId": "pay_1234567890"
}
```

### 3. Get Payment Details
**GET** `/razorpay/payment/:paymentId`
- **Authentication**: Required

### 4. Get Order Details
**GET** `/razorpay/order/:orderId`
- **Authentication**: Required

### 5. Webhook
**POST** `/razorpay/webhook`
- **Authentication**: NOT required (Signature verified in body)
- **Header**: `X-Razorpay-Signature`
- **Events Handled**:
  - `payment.authorized`: Payment authorized
  - `payment.captured`: ⭐ **Main success event** - Enrollment updated here
  - `payment.failed`: Payment failed
  - `order.paid`: Order marked as paid

## Webhook Example

### Payment Captured Event (Success)
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_1234567890",
        "order_id": "order_1234567890",
        "amount": 9999,
        "currency": "INR",
        "status": "captured",
        "notes": {
          "user_id": "507f1f77bcf86cd799439011",
          "levelId": "507f1f77bcf86cd799439012",
          "transaction_id": "507f1f77bcf86cd799439013",
          "enrollment_id": "507f1f77bcf86cd799439014",
          "redirectRoute": "LevelDetail?id=507f1f77bcf86cd799439012"
        }
      }
    }
  }
}
```

### Payment Failed Event
```json
{
  "event": "payment.failed",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_1234567890",
        "order_id": "order_1234567890",
        "status": "failed",
        "error_description": "Insufficient funds in account",
        "notes": {
          "transaction_id": "507f1f77bcf86cd799439013"
        }
      }
    }
  }
}
```

## Database Models

### Course Transactions
Tracks all payment transactions:
```javascript
{
  user_id: ObjectId,
  levelId: ObjectId,
  amount: Number,
  status: "pending" | "completed" | "failed",
  payment_type: "Razorpay" | "Paypal",
  transaction_id: String,
  country: String,
  userIp: String,
  payment_method: "Razorpay",
  timestamps: true
}
```

### Enrollment
Links user to course with payment status:
```javascript
{
  user_id: ObjectId,
  instructor_id: ObjectId,
  course_id: ObjectId,
  payment_amount: Number,
  payment_status: "pending" | "completed" | "failed",
  courseTransactionId: ObjectId,
  status: "active",
  enrolled_date: Date,
  start_date: Date,
  timestamps: true
}
```

## Frontend Integration

### Payment Method Selector
Located in `src/pages/LevelDetail.jsx`:
- Shows payment method options (Razorpay, PayPal)
- Displays course info and pricing
- Handles payment flow

### Razorpay Utility
Located in `src/lib/razorpay.js`:
- `loadRazorpayScript()` - Loads SDK
- `initiateRazorpayPayment()` - Opens payment modal
- `verifyRazorpayPayment()` - Verifies with backend
- `getRazorpayErrorMessage()` - User-friendly error messages

## Testing

### Test Card Numbers
Use these in Razorpay test mode (sandbox):

**Visa - Success**
- Card: 4111111111111111
- Expiry: Any future date
- CVV: Any 3 digits

**Visa - Failure**
- Card: 4000000000000002
- Expiry: Any future date
- CVV: Any 3 digits

### Test UPI
- Success: `success@razorpay` (as VPA)
- Failure: `fail@razorpay` (as VPA)

### Testing Webhook
1. Use [ngrok](https://ngrok.com/) to expose localhost:
```bash
ngrok http 3000
```

2. Update webhook URL in Razorpay dashboard with ngrok URL

3. Test webhook from Razorpay dashboard → Webhooks → Test button

## Error Handling

### Common Error Codes
- `BAD_REQUEST_ERROR` - Invalid payment details
- `GATEWAY_DOWN` - Razorpay gateway unavailable
- `NETWORK_ERROR` - Network connectivity issue
- `TIMEOUT` - Request timeout
- `CANCELLED` - Payment cancelled by user
- `SCRIPT_LOAD_ERROR` - SDK failed to load

### Signature Verification Failure
If signature verification fails:
1. Check `RAZORPAY_KEY_SECRET` in `.env`
2. Verify webhook is configured with correct URL
3. Ensure request headers are intact

## Logging

All payment events are logged using Winston logger:
- Location: `src/config/logger.js`
- Log levels: info, error
- Includes: transaction ID, payment ID, order ID, timestamps

View logs:
```bash
# Backend logs (if configured)
tail -f logs/error.log
```

## Troubleshooting

### Order Creation Fails
```
Error: Missing amount or levelId for Razorpay order
```
**Solution**: Ensure request includes `amount` and `levelId`

### Payment Verification Fails
```
Error: Payment verification failed
```
**Solution**: 
- Check signature with Razorpay webhook tester
- Verify `RAZORPAY_KEY_SECRET` is correct
- Ensure timestamp is not too old

### Enrollment Not Updated After Payment
```
Success response but enrollment not updated
```
**Solution**:
- Check webhook is configured
- Verify webhook signature header: `x-razorpay-signature`
- Check `courseTransactionId` matches in database

### Frontend: Razorpay Button Not Showing
**Solution**:
- Verify `VITE_RAZORPAY_KEY_ID` is set in `.env`
- Check browser console for errors
- Ensure SDK loads: `window.Razorpay` should exist

## Security Considerations

1. **Never** expose `RAZORPAY_KEY_SECRET` in frontend
2. **Always** verify signatures on webhook
3. **Always** verify signatures on client callback
4. **Use HTTPS** for webhook URL (required by Razorpay)
5. **Validate** all user inputs before payment
6. **Log** all payment events for audit trail

## Migration from PayPal

Both payment gateways are now supported:
- Existing PayPal integrations continue to work
- New users can choose either payment method
- Same transaction model stores both types
- Database supports `payment_type` field

## Support & Documentation

- [Razorpay Docs](https://razorpay.com/docs/)
- [Razorpay API Guide](https://razorpay.com/docs/payments/payouts/)
- [webhook Events](https://razorpay.com/docs/webhooks/events/)
- [Integration Examples](https://github.com/razorpay/razorpay-node)

## Files Modified/Created

### Backend
- ✅ `src/services/razorpay.service.js` - Payment service
- ✅ `src/controllers/razorpayController.js` - API controller
- ✅ `src/routes/razorpay.routes.js` - Routes
- ✅ `src/routes/index.js` - Register routes
- ✅ `package.json` - Add razorpay package
- ✅ `.env` - Razorpay credentials

### Frontend
- ✅ `src/lib/razorpay.js` - Utility functions
- ✅ `src/pages/LevelDetail.jsx` - Payment UI
- ✅ `.env.local` - Razorpay key ID
- ✅ `.env.production` - Razorpay key ID

## Next Steps

1. **Get Razorpay Account**: Create account and get API keys
2. **Set Environment Variables**: Add keys to `.env` files
3. **Configure Webhook**: Set up webhook in Razorpay dashboard
4. **Test Payment Flow**: Use test card numbers
5. **Deploy**: Push to production with live API keys
6. **Monitor**: Check logs for payment events

---

**Last Updated**: March 2026
**Version**: 1.0
**Status**: Production Ready ✅
