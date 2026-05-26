const https = require('https');

/**
 * Send email utility using Resend API (HTTP POST) with a graceful console fallback
 * if no api key is present in environment variables.
 * 
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - Email body content in HTML
 * @returns {Promise<Object>}
 */
const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Authoryn <onboarding@resend.dev>';

  if (!apiKey) {
    console.log('\n=================== EMAIL SIMULATION ===================');
    console.log(`[EMAIL LOG] Target Recipient(s): ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------ HTML EMAIL CONTENT ------------------');
    console.log(html);
    console.log('========================================================\n');
    return { success: true, simulated: true };
  }

  return new Promise((resolve, reject) => {
    const recipients = Array.isArray(to) ? to : [to];
    
    // Resend API expects: from, to (array of strings or string), subject, html
    const postData = JSON.stringify({
      from,
      to: recipients,
      subject,
      html
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ success: true, data: parsed });
          } catch (e) {
            resolve({ success: true, raw: responseBody });
          }
        } else {
          console.error(`Resend API Error (Status Code: ${res.statusCode}):`, responseBody);
          reject(new Error(`Resend API response error. Status: ${res.statusCode}. Body: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('HTTPS request error in sendEmail:', err);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

module.exports = sendEmail;
