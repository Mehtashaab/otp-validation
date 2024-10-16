import dotenv from "dotenv";
import express from 'express';
import axios from 'axios';
dotenv.config({path:"./.env"});

const app = express();
const port = 3000;

app.use(express.json());

app.post('/send-otp', async (req, res) => {
  try {
    const mobileNumber = req.body.mobileNumber;
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        variables_values: `Your OTP is ${otp}`,
        route: 'otp',
        numbers: mobileNumber
      }
    });
    
    res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});
const otpStore = {};

app.post('/verify-otp', (req, res) => {
  const { mobileNumber, otp } = req.body;

  // Check if the mobile number exists in the OTP store
  if (otpStore.hasOwnProperty(mobileNumber)) {
    // Get the stored OTP and its expiration time
    const { storedOTP, expirationTime } = otpStore[mobileNumber];

    // Verify the OTP and check if it's not expired
    if (storedOTP === otp && Date.now() < expirationTime) {
      // OTP verification successful
      res.json({ success: true, message: 'OTP verification successful!' });
    } else {
      // Invalid OTP or expired OTP
      res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
  } else {
    // Mobile number not found or OTP expired
    res.status(400).json({ success: false, message: 'Mobile number not found or OTP expired.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
