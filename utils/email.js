const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: `Mystery Dine-In <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

const sendOrderReceipt = async (order, customerEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EF4444;">Order Confirmation</h1>
      <p>Thank you for your order!</p>
      
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <h2>Order #${order.orderNumber}</h2>
        <p><strong>Table:</strong> ${order.tableNumber}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
      </div>

      <h3>Order Items:</h3>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>
        `).join('')}
      </ul>

      <p style="margin-top: 30px;">
        Your food will be served shortly!
      </p>
    </div>
  `;

  await sendEmail({
    email: customerEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html
  });
};

module.exports = { sendEmail, sendOrderReceipt };
