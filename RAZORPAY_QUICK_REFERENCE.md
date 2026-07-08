# Razorpay Integration - Quick Reference

## 🚀 Quick Start

### 1. Get API Keys
- Go to https://dashboard.razorpay.com/
- Navigate to Settings → API Keys
- Copy Key ID and Key Secret

### 2. Configure Backend `.env`
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Configure Frontend `.env.local` / `.env.production`
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 4. Install Dependencies
```bash
cd Languageunibackend
npm install razorpay
```

### 5. Set Up Webhook
- URL: `https://yourdomain.com/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`, `payment.authorized`, `order.paid`
- Copy Webhook Secret → Add to `.env`

## 📱 Payment Flow

```
User clicks "Enroll Now"
  ↓
[Payment Method Selector]  ← Choose: Razorpay or PayPal
  ↓
POST /razorpay/create-order  ← Backend creates transactio
  ↓
Razorpay Modal Opens
  ↓
User enters card/UPI/wallet
  ↓
[Success] → POST /razorpay/verify-payment
[Webhook] → POST /razorpay/webhook
  ↓
Update enrollment status
  ↓
✅ Course unlocked!
```

## 🧪 Test Cards

| Card Type | Number | Expiry | CVV | Result |
|-----------|--------|--------|-----|--------|
| Visa | 4111111111111111 | Any | Any | ✅ Success |
| Visa | 4000000000000002 | Any | Any | ❌ Fail |
| UPI Success | success@razorpay | - | - | ✅ Success |
| UPI Fail | fail@razorpay | - | - | ❌ Fail |

## 📡 API Endpoints

### Create Order
```bash
POST /razorpay/create-order
Headers: Authorization: Bearer <token>
Body: {
  "amount": 99.99,
  "levelId": "course_id",
  "instructor_id": "instructor_id"
}
```

### Verify Payment
```bash
POST /razorpay/verify-payment
Headers: Authorization: Bearer <token>
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "transactionId": "txn_id"
}
```

### Get Payment Details
```bash
GET /razorpay/payment/:paymentId
Headers: Authorization: Bearer <token>
```

### Webhook
```bash
POST /razorpay/webhook
Headers: X-Razorpay-Signature: <signature>
(NO authentication needed)
```

## 🔐 Security Checklist

- ✅ Never expose `RAZORPAY_KEY_SECRET` in frontend
- ✅ Always verify webhook signature
- ✅ Use HTTPS for webhook URL
- ✅ Validate signature: `sha256(body, secret) == header`
- ✅ Log all payment events
- ✅ Don't trust client data alone - verify on backend

## 🐛 Debugging

### Check Logs
```bash
# Backend logs
tail -f logs/error.log
tail -f logs/combined.log
```

### Test Webhook Locally
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Expose to internet
ngrok http 3000

# Terminal 3: Test webhook
curl -X POST http://localhost:3000/razorpay/webhook \
  -H "X-Razorpay-Signature: test_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test"
        }
      }
    }
  }'
```

### Common Issues

**Issue**: "Razorpay is not defined"
- Solution: Check `VITE_RAZORPAY_KEY_ID` in .env
- Verify SDK loaded: `window.Razorpay`

**Issue**: Signature verification failed
- Solution: Check `RAZORPAY_KEY_SECRET`
- Re-generate webhook secret in dashboard

**Issue**: Enrollment not updating after payment
- Solution: Check webhook is configured
- Test webhook response status is 200
- Check payment status in database

**Issue**: "Missing required payment verification data"
- Solution: Include all fields in verify-payment request
- Check razorpay_order_id matches order creation response

## 📊 Database Schema

### courseTransactionsModel
```javascript
{
  user_id: ObjectId,
  levelId: ObjectId,
  amount: Number,
  status: "pending|completed|failed",
  payment_type: "Razorpay|Paypal",
  transaction_id: String,
  country: String,
  userIp: String,
  payment_method: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment
```javascript
{
  user_id: ObjectId,
  instructor_id: ObjectId,
  course_id: ObjectId,
  payment_amount: Number,
  payment_status: "pending|completed|failed",
  courseTransactionId: ObjectId,
  status: "active",
  enrolled_date: Date,
  start_date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Webhook Events

### payment.captured ⭐ (Main)
Fired when payment is successfully captured.
- Updates transaction status to "completed"
- Updates enrollment payment_status to "completed"
- User gets course access

```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_29QQoUBi66xm2f",
        "order_id": "order_1234567890",
        "status": "captured",
        "amount": 10000,
        "notes": {
          "user_id": "...",
          "levelId": "...",
          "transaction_id": "..."
        }
      }
    }
  }
}
```

### payment.failed
Fired when payment fails.
- Updates transaction status to "failed"
- User can retry payment

### payment.authorized
Fired when payment is authorized but not captured yet.
- Used if manual capture is enabled
- Not used in current setup (auto-capture enabled)

### order.paid
Fired when order is marked as paid.
- Additional confirmation event

## 📈 Monitoring

### Check Transaction Status
```bash
# All transactions
GET /razorpay/payment/:paymentId

# Get enrollment status
GET /enrollment/:enrollmentId
```

### View Logs
```bash
# Error logs
grep "razorpay" logs/error.log

# All payment events
grep "Payment" logs/combined.log
```

## 🚢 Deployment

### Pre-deployment Checklist
- [ ] Created Razorpay live account
- [ ] Generated live API keys
- [ ] Updated backend `.env` with live keys
- [ ] Updated frontend `.env.production` with live key ID
- [ ] Configured webhook with production URL
- [ ] Tested payment flow with test cards
- [ ] Updated webhook secret in `.env`
- [ ] Verified HTTPS is enabled
- [ ] Set up monitoring for payment events

### Production Setup
1. Switch to live API keys in `.env`
2. Update webhook URL to production domain
3. Configure SSL certificate (HTTPS required)
4. Set up monitoring and alerts
5. Test payment flow end-to-end
6. Deploy and monitor first few payments

## 🎯 Next Steps

1. **Create Account**: Sign up at razorpay.com
2. **Get API Keys**: Copy from dashboard
3. **Update .env**: Add keys
4. **Configure Webhook**: Set up in dashboard
5. **Test Payment**: Use test cards
6. **Deploy**: Push to production
7. **Monitor**: Check logs/dashboard

## 📞 Support

- Razorpay Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Webhooks: https://razorpay.com/docs/webhooks/
- Support: support@razorpay.com

---

**Version**: 1.0 | **Last Updated**: March 2026
