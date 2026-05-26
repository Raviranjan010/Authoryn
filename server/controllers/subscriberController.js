const Subscriber = require('../models/Subscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Check email format basic validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find if already exists
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.active) {
        return res.status(400).json({
          success: false,
          message: 'You are already subscribed to our newsletter'
        });
      } else {
        // Re-activate if previously unsubscribed
        subscriber.active = true;
        await subscriber.save();
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        });
      }
    }

    // Create new subscriber
    subscriber = await Subscriber.create({ email });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!'
    });
  } catch (err) {
    console.error('Error in subscriber subscribe:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during subscription processing'
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   GET /api/subscribers/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send(`
        <html>
          <head>
            <title>Unsubscribe Error</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f7f9fb; color: #1a1a1a; }
              .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
              h1 { color: #e11d48; margin-top: 0; font-size: 1.5rem; }
              p { color: #666; font-size: 0.95rem; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Unsubscribe Failed</h1>
              <p>No email address was provided. Please check the link in your email newsletter and try again.</p>
            </div>
          </body>
        </html>
      `);
    }

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Subscription Not Found</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f7f9fb; color: #1a1a1a; }
              .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
              h1 { color: #d97706; margin-top: 0; font-size: 1.5rem; }
              p { color: #666; font-size: 0.95rem; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Not Found</h1>
              <p>We couldn't find a subscriber record for <strong>${email}</strong>. You may have already unsubscribed.</p>
            </div>
          </body>
        </html>
      `);
    }

    if (!subscriber.active) {
      return res.status(200).send(`
        <html>
          <head>
            <title>Already Unsubscribed</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f7f9fb; color: #1a1a1a; }
              .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
              h1 { color: #10b981; margin-top: 0; font-size: 1.5rem; }
              p { color: #666; font-size: 0.95rem; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Already Unsubscribed</h1>
              <p>The email address <strong>${email}</strong> is already unsubscribed from our updates.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Deactivate subscription
    subscriber.active = false;
    await subscriber.save();

    res.status(200).send(`
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f7f9fb; color: #1a1a1a; }
            .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: center; max-width: 420px; width: 90%; }
            h1 { color: #10b981; margin-top: 0; font-size: 1.5rem; }
            p { color: #4b5563; font-size: 0.95rem; line-height: 1.6; }
            .accent { color: #10b981; font-weight: 600; }
            .footer-info { margin-top: 2rem; font-size: 0.75rem; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed</h1>
            <p>You have been successfully unsubscribed. We will no longer send updates or newsletter emails to <strong class="accent">${email}</strong>.</p>
            <p class="footer-info">Changed your mind? You can subscribe again at any time from our website footer.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error in subscriber unsubscribe:', err);
    res.status(500).send('Server error processing unsubscription. Please try again later.');
  }
};
