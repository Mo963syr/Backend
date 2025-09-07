// controllers/paymentController.js
const axios = require('axios');
const Order = require('../models/order.model');

const FATORA_BASE = 'https://egate-t.fatora.me/api'; 
const FATORA_USER = 'parttec'; 
const FATORA_PASS = 'parttec@123'; 
const AUTH_HEADER =
  'Basic ' + Buffer.from(`${FATORA_USER}:${FATORA_PASS}`).toString('base64');

async function getPaymentStatus(paymentId) {
  const url = `${FATORA_BASE}/get-payment-status/${paymentId}`;
  const res = await axios.get(url, {
    headers: { Authorization: AUTH_HEADER },
  });
  return res.data;
}

exports.initPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const body = {
      lang: 'ar',
      terminalId: '14740112',
      amount,
     callbackURL: `https://parttec.onrender.com/payment/callback/${orderId}`,
triggerURL: `https://parttec.onrender.com/payment/trigger/${orderId}`,
    };

    const response = await axios.post(`${FATORA_BASE}/create-payment`, body, {
      headers: {
        Authorization: AUTH_HEADER,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (data.ErrorCode !== 0) {
      return res.status(400).json({ error: data.ErrorMessage });
    }

   
    order.payment.paymentId = data.Data.paymentId;
    order.payment.status = 'pending';
    await order.save();

    res.json({
      url: data.Data.url,
      paymentId: data.Data.paymentId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};


exports.paymentCallback = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).send('Order not found');

  const statusData = await getPaymentStatus(order.payment.paymentId);

  if (statusData.ErrorCode === 0) {
    const status = statusData.Data.status;
    if (status === 'A') order.payment.status = 'paid';
    else if (status === 'F') order.payment.status = 'failed';
    else if (status === 'C') order.payment.status = 'canceled';
    await order.save();
  }

  res.send(`
    <html>
      <body style="text-align:center;font-family:Arial;">
        <h2>تمت معالجة عملية الدفع</h2>
        <p>Order ID: ${orderId}</p>
        <p>Status: ${order.payment.status}</p>
        <a href="parttec://payment-result/${orderId}">العودة إلى التطبيق</a>
      </body>
    </html>
  `);
};


exports.paymentTrigger = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const statusData = await getPaymentStatus(order.payment.paymentId);

  if (statusData.ErrorCode === 0) {
    const status = statusData.Data.status;
    if (status === 'A') order.payment.status = 'paid';
    else if (status === 'F') order.payment.status = 'failed';
    else if (status === 'C') order.payment.status = 'canceled';
    await order.save();
  }

  res.json({ message: 'Trigger received', status: order.payment.status });
};
