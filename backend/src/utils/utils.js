function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
  return otp.toString(); // Convert to string and return
}

function getOtpHtml(otp) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#e9efec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#10252d;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e9efec;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:2px solid #10252d;border-radius:12px;box-shadow:6px 6px 0 #10252d;overflow:hidden;">
                <tr>
                  <td style="background-color:#10252d;padding:24px 28px;text-align:center;">
                    <h2 style="margin:0;color:#ffd84d;font-size:22px;letter-spacing:1px;">DAYBOOK</h2>
                    <p style="margin:4px 0 0;color:#fafbf9;font-size:13px;opacity:0.85;">Daily Consistency & Clarity</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 28px;text-align:center;">
                    <h1 style="margin:0 0 12px;font-size:20px;color:#10252d;">Email Verification Code</h1>
                    <p style="margin:0 0 24px;font-size:15px;color:#4a5f66;line-height:1.5;">
                      Please use the 6-digit verification code below to complete your email verification and unlock your account.
                    </p>
                    <div style="display:inline-block;padding:14px 32px;background-color:#fafbf9;border:2px dashed #10252d;border-radius:8px;margin:8px 0 24px;">
                      <span style="font-family:monospace,'Courier New',Courier;font-size:32px;font-weight:800;letter-spacing:8px;color:#10252d;">${otp}</span>
                    </div>
                    <p style="margin:0;font-size:13px;color:#8a9a9f;">
                      This code is valid for 10 minutes. If you did not request this, please disregard this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#fafbf9;border-top:1px solid #e2e8e5;padding:16px 28px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#8a9a9f;">© Daybook. Designed for daily focus.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getWelcomeClubHtml(userName = 'Friend', profession = 'trader') {
  const capProf = profession ? profession.charAt(0).toUpperCase() + profession.slice(1) : 'Journal';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Daybook Club</title>
      </head>
      <body style="margin:0;padding:0;background-color:#e9efec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#10252d;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e9efec;padding:36px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#ffffff;border:2px solid #10252d;border-radius:14px;box-shadow:8px 8px 0 #10252d;overflow:hidden;">
                
                <!-- Header Banner -->
                <tr>
                  <td style="background-color:#10252d;padding:32px 28px;text-align:center;border-bottom:3px solid #ffd84d;">
                    <div style="display:inline-block;padding:6px 14px;background-color:rgba(255,216,77,0.15);border:1px solid #ffd84d;border-radius:999px;margin-bottom:12px;">
                      <span style="color:#ffd84d;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">★ DAYBOOK CLUB MEMBER</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Welcome to the Club!</h1>
                    <p style="margin:6px 0 0;color:#fafbf9;font-size:14px;opacity:0.85;">Your official verified membership is now active</p>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding:36px 32px;">
                    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#10252d;">
                      Hello ${userName}, 👋
                    </p>
                    
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334a52;">
                      Thank you for connecting with us and verifying your email. You have officially become a recognized member of <strong>Daybook Club</strong>!
                    </p>

                    <div style="background-color:#f4f7f5;border-left:4px solid #ffd84d;border-radius:4px 8px 8px 4px;padding:16px 18px;margin:20px 0;">
                      <p style="margin:0;font-size:15px;line-height:1.6;color:#10252d;font-style:italic;">
                        "We bless your future bright, prosperous, and filled with unbroken focus in whatever you do."
                      </p>
                    </div>

                    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334a52;">
                      Whether you are navigating market trends as a <strong>${capProf}</strong>, writing clean code, logging miles, or building enduring daily discipline — writing down your thoughts while they are fresh is the secret to compound growth.
                    </p>

                    <!-- What's in Store Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafbf9;border:1.5px solid #10252d;border-radius:10px;padding:18px 20px;margin:24px 0;">
                      <tr>
                        <td>
                          <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#10252d;text-transform:uppercase;letter-spacing:0.8px;">
                            🏛️ Your Member Perks:
                          </p>
                          <ul style="margin:0;padding-left:20px;color:#334a52;font-size:14px;line-height:1.7;">
                            <li><strong>Structured Logging:</strong> Real fields tailored to your daily workflow.</li>
                            <li><strong>7-Day Consistency Master Pass:</strong> Build a 7-day streak to claim your official digital Certificate.</li>
                            <li><strong>Private & Isolated Cloud Sync:</strong> Your authentic records, secured and synced across all your devices.</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <div style="text-align:center;margin:32px 0 16px;">
                      <a href="https://daybook-journal.vercel.app/app" style="display:inline-block;padding:14px 32px;background-color:#ffd84d;color:#10252d;font-size:15px;font-weight:700;text-decoration:none;border:2px solid #10252d;border-radius:8px;box-shadow:4px 4px 0 #10252d;">
                        Open Your Daybook &rarr;
                      </a>
                    </div>

                    <p style="margin:28px 0 0;font-size:14px;color:#4a5f66;line-height:1.5;text-align:center;">
                      May your discipline compound into lasting success. We are proud to walk this journey with you!
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#10252d;color:#fafbf9;padding:22px 28px;text-align:center;border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#ffd84d;">
                      Daybook Club — Designed for Daily Focus
                    </p>
                    <p style="margin:0;font-size:12px;color:#8a9a9f;">
                      © ${new Date().getFullYear()} Daybook. Crafted with care for your bright future.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getWelcomeClubText(userName = 'Friend', profession = 'trader') {
  return `Hello ${userName},

Thank you for connecting with us! You have officially become a member of the Daybook Club.

We bless your future bright, prosperous, and filled with unbroken focus in whatever you do.

Whether you are mastering your craft as a ${profession}, shipping projects, or building daily discipline — write it down while you still remember it and let the numbers do the rest.

Your Member Perks:
- Structured daily logbook entries
- 7-Day Consistency Master Pass & Certificate
- Private cloud synchronization across your phone and laptop

Log in to your account and start your streak today:
https://daybook-journal.vercel.app/app

With warm blessings and best wishes for your future,
The Daybook Team`;
}

function getReminderEmailHtml(userName = 'Friend', profession = 'trader', streak = 1) {
  const capProf = profession ? profession.charAt(0).toUpperCase() + profession.slice(1) : 'Journal';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Keep Your Streak Alive - Daybook</title>
      </head>
      <body style="margin:0;padding:0;background-color:#e9efec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#10252d;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e9efec;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background-color:#ffffff;border:2px solid #10252d;border-radius:14px;box-shadow:6px 6px 0 #10252d;overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color:#10252d;padding:26px 28px;text-align:center;border-bottom:3px solid #ffd84d;">
                    <div style="display:inline-block;padding:5px 12px;background-color:rgba(255,216,77,0.15);border:1px solid #ffd84d;border-radius:999px;margin-bottom:10px;">
                      <span style="color:#ffd84d;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">🔥 STREAK SHIELD ACTIVE</span>
                    </div>
                    <h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Don't Break the Chain!</h2>
                    <p style="margin:4px 0 0;color:#fafbf9;font-size:13px;opacity:0.85;">Today ends at midnight • 60 seconds to log</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:32px 28px;">
                    <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:#10252d;">
                      Hey ${userName}, 👋
                    </p>
                    
                    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334a52;">
                      You haven't written today's <strong>${capProf}</strong> logbook entry yet. A good day is easy to forget and a bad one is easy to repeat — log your progress before you sleep!
                    </p>

                    <div style="background-color:#fafbf9;border:1.5px solid #10252d;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
                      <span style="font-size:13px;color:#4a5f66;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Current Active Streak</span>
                      <div style="font-size:32px;font-weight:800;color:#ffd84d;text-shadow:1px 1px 0 #10252d;margin:4px 0;">
                        ${streak} DAY${streak === 1 ? '' : 'S'}
                      </div>
                      <span style="font-size:13px;color:#10252d;font-weight:600;">Keep going towards your 7-Day Master Pass!</span>
                    </div>

                    <!-- CTA -->
                    <div style="text-align:center;margin:28px 0 14px;">
                      <a href="https://daybook-journal.vercel.app/app/new/${profession}" style="display:inline-block;padding:13px 30px;background-color:#ffd84d;color:#10252d;font-size:15px;font-weight:700;text-decoration:none;border:2px solid #10252d;border-radius:8px;box-shadow:4px 4px 0 #10252d;">
                        Log Today's Entry &rarr;
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#10252d;color:#fafbf9;padding:16px 28px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#8a9a9f;">
                      © ${new Date().getFullYear()} Daybook. Daily consistency made simple.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getReminderEmailText(userName = 'Friend', profession = 'trader', streak = 1) {
  return `Hey ${userName},

Don't lose your ${streak}-day Daybook streak!

You haven't logged today's ${profession} entry yet. Take 60 seconds to write it down while it's fresh in your mind before midnight.

Log your entry now:
https://daybook-journal.vercel.app/app/new/${profession}

Keep your momentum alive!
The Daybook Team`;
}

function getForgotPasswordOtpText(userName = 'User', otp) {
  return `Hello ${userName},

We received a request to reset the password for your Daybook account.

Your Password Reset Code is: ${otp}

This code is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email.

Best regards,
The Daybook Team`;
}

function getForgotPasswordOtpHtml(userName = 'User', otp) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#e9efec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#10252d;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e9efec;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:2px solid #10252d;border-radius:12px;box-shadow:6px 6px 0 #10252d;overflow:hidden;">
                <tr>
                  <td style="background-color:#10252d;padding:24px 28px;text-align:center;">
                    <h2 style="margin:0;color:#ffd84d;font-size:22px;letter-spacing:1px;">DAYBOOK</h2>
                    <p style="margin:4px 0 0;color:#fafbf9;font-size:13px;opacity:0.85;">Password Recovery</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 28px;text-align:center;">
                    <h1 style="margin:0 0 12px;font-size:20px;color:#10252d;">Reset Your Password</h1>
                    <p style="margin:0 0 20px;font-size:15px;color:#4a5f66;line-height:1.5;">
                      Hello ${userName}, we received a request to reset your Daybook account password. Use the 6-digit code below to set a new password.
                    </p>
                    <div style="display:inline-block;padding:14px 32px;background-color:#fafbf9;border:2px dashed #10252d;border-radius:8px;margin:8px 0 24px;">
                      <span style="font-family:monospace,'Courier New',Courier;font-size:32px;font-weight:800;letter-spacing:8px;color:#10252d;">${otp}</span>
                    </div>
                    <p style="margin:0;font-size:13px;color:#8a9a9f;line-height:1.4;">
                      This code is valid for 10 minutes. If you did not request this, you can safely ignore this email — your account remains secure.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#fafbf9;border-top:1px solid #e2e8e5;padding:16px 28px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#8a9a9f;">© Daybook. Designed for daily focus.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export { 
  generateOtp, 
  getOtpHtml, 
  getWelcomeClubHtml, 
  getWelcomeClubText, 
  getReminderEmailHtml, 
  getReminderEmailText,
  getForgotPasswordOtpHtml,
  getForgotPasswordOtpText
};



