/**
 * Razorpay Payment Utility
 * Handles Razorpay payment flow and verification
 */

/**
 * Load Razorpay SDK script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};

/**
 * Initialize and display Razorpay payment modal
 * @param {Object} options
 * @param {string} options.orderId - Razorpay order ID from server
 * @param {number} options.amount - Amount in paise (amount * 100)
 * @param {string} options.currency - Currency code (e.g., 'INR')
 * @param {string} options.keyId - Razorpay public key ID
 * @param {Object} options.user - User details object
 * @param {string} options.user.name - User's name
 * @param {string} options.user.email - User's email
 * @param {string} options.user.phone - User's phone number
 * @param {Function} options.onPaymentSuccess - Callback on successful payment
 * @param {Function} options.onPaymentFailure - Callback on failed payment
 * @param {Function} options.onPaymentClosed - Callback when user closes payment modal
 * @returns {Promise}
 */
export const initiateRazorpayPayment = async (options) => {
  const {
    orderId,
    amount,
    currency = 'INR',
    keyId,
    user = {},
    onPaymentSuccess,
    onPaymentFailure,
    onPaymentClosed,
    levelName = 'Course Enrollment'
  } = options;

  try {
    // Load Razorpay SDK if not already loaded
    await loadRazorpayScript();

    // Razorpay payment options
    const paymentOptions = {
      key: keyId,
      order_id: orderId,
      amount: amount,
      currency: currency,
      name: 'LanguageUni',
      description: levelName,
      image: '/logo.png', // Add your logo URL here
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || ''
      },
      theme: {
        color: '#6366f1' // Indigo color, adjust as needed
      },
      handler: function (response) {
        // Payment successful
        if (onPaymentSuccess) {
          onPaymentSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      },
      modal: {
        ondismiss: function () {
          // User closed the payment modal without completing payment
          if (onPaymentClosed) {
            onPaymentClosed();
          }
        }
      },
      retry: {
        enabled: true,
        max_count: 3
      },
      timeout: 900, // 15 minutes in seconds
      notes: {
        note_key_1: 'Course Enrollment',
        note_key_2: 'LanguageUni Payment'
      }
    };

    // Create and open payment modal
    const razorpay = new window.Razorpay(paymentOptions);
    razorpay.open();

    // Handle payment errors
    razorpay.on('payment.failed', function (response) {
      if (onPaymentFailure) {
        onPaymentFailure({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason
        });
      }
    });

  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    if (onPaymentFailure) {
      onPaymentFailure({
        code: 'SCRIPT_LOAD_ERROR',
        description: error.message
      });
    }
    throw error;
  }
};

/**
 * Verify payment with server
 * @param {Object} paymentData - Payment data from Razorpay response
 * @param {string} paymentData.razorpay_order_id
 * @param {string} paymentData.razorpay_payment_id
 * @param {string} paymentData.razorpay_signature
 * @param {string} paymentData.transactionId - Backend transaction ID
 * @param {Function} verifyFn - Function to call backend verification endpoint
 * @returns {Promise<Object>} - Server response
 */
export const verifyRazorpayPayment = async (paymentData, verifyFn) => {
  try {
    const response = await verifyFn(paymentData);
    
    if (!response.success) {
      throw new Error(response.message || 'Payment verification failed');
    }

    return response;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Handle Razorpay payment errors
 * @param {Object} error - Error object from Razorpay
 * @returns {string} - User-friendly error message
 */
export const getRazorpayErrorMessage = (error) => {
  const errorMessages = {
    'BAD_REQUEST_ERROR': 'Invalid payment details. Please try again.',
    'GATEWAY_DOWN': 'Payment gateway is temporarily unavailable. Please try again.',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'TIMEOUT': 'Payment request timed out. Please try again.',
    'CANCELLED': 'Payment was cancelled.',
    'SCRIPT_LOAD_ERROR': 'Failed to load payment service. Please refresh and try again.'
  };

  return errorMessages[error?.code] || 
         error?.description || 
         'Payment failed. Please try again later.';
};
