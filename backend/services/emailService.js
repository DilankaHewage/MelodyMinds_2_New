import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const generateReceiptId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `MM${timestamp}${random}`.toUpperCase();
};

export const sendReceiptEmail = async (receiptData) => {
  try {
    const msg = {
      to: receiptData.userEmail,
      from: 'dilankahewage1@gmail.com', // Use a verified sender domain if possible
      subject: `MelodyMinds - Ticket Purchase Receipt ${receiptData.receiptId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">MelodyMinds</h1>
            <p style="color: #666; margin: 5px 0;">Your Music Event Platform</p>
          </div>
          <div style="padding: 20px; background-color: white;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              Purchase Receipt
            </h2>
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Receipt ID:</strong> ${receiptData.receiptId}</p>
              <p style="margin: 5px 0;"><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <h3 style="color: #333;">Event Details</h3>
            <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Event:</strong> ${receiptData.eventName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${receiptData.eventDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${receiptData.eventTime}</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> ${receiptData.eventVenue}</p>
            </div>
            <h3 style="color: #333;">Purchase Details</h3>
            <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Customer:</strong> ${receiptData.userName}</p>
              <p style="margin: 5px 0;"><strong>Number of Tickets:</strong> ${receiptData.numberOfTickets}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${receiptData.currency} ${receiptData.totalAmount}</p>
            </div>
            <div style="background-color: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> support@melodyminds.com</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> +94 11 234 5678</p>
              <p style="margin: 5px 0;"><strong>Website:</strong> www.melodyminds.com</p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa;">
              <p style="color: #666; margin: 0;">Thank you for choosing MelodyMinds!</p>
              <p style="color: #666; margin: 5px 0;">Enjoy your event!</p>
            </div>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('Receipt email sent successfully');
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
};