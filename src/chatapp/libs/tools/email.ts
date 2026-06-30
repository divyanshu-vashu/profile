import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends/forwards an email query received from the portfolio chatbot.
 * Destined to support@sarugeek.com, sent via smtp2go SMTP configuration.
 *
 * @param query The message or inquiry text from the user.
 * @returns A JSON string summarizing success or failure.
 */
export interface SendEmailArgs {
  who: string;
  query: string;
  email?: string;
  why?: string;
}

export async function executeSendEmail(
  args: SendEmailArgs
): Promise<string> {
  const forwardTo = "support@sarugeek.com";
  const username = process.env.SM2P_USERNAME;
  const password = process.env.SM2P_PASSWORD;
  const gmailPassword = process.env.GMAIL_PASSWORD;

  const senderIdentity = username || "vashusingh2005.jan@gmail.com";

  // Construct formatted body
  const emailTextBody = `You received a new inquiry from your Portfolio Chatbot.

----------------------------------------
Sender Name: ${args.who}
Sender Email: ${args.email || "Not Provided"}
Reason / Context: ${args.why || "Not Provided"}
----------------------------------------

Message:
${args.query}
`;

  // Try SMTP2GO first if configured
  if (username && password) {
    try {
      console.log("Attempting email forwarding via SMTP2GO...");
      const transporter = nodemailer.createTransport({
        host: "mail.smtp2go.com",
        port: 2525,
        secure: false, // TLS is available on port 2525
        auth: {
          user: username,
          pass: password,
        },
      });

      const mailOptions = {
        from: `Portfolio Inquiry <${username}>`,
        to: forwardTo,
        subject: "this message from portfoilio chatbot",
        text: emailTextBody,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email forwarded successfully via SMTP2GO:", info.messageId);

      return JSON.stringify({
        success: true,
        message: "Email forwarded successfully to support@sarugeek.com via SMTP2GO.",
        messageId: info.messageId,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`SMTP2GO failed (${errMsg}). Trying Gmail fallback...`);
    }
  } else {
    console.log("SMTP2GO credentials not fully configured. Trying Gmail fallback...");
  }

  // Fallback to Gmail SMTP using App Password
  if (gmailPassword) {
    try {
      console.log("Attempting email forwarding via Gmail SMTP (vdkalife@gmail.com)...");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "vdkalife@gmail.com",
          pass: gmailPassword,
        },
      });

      const mailOptions = {
        from: `Portfolio Inquiry <vdkalife@gmail.com>`,
        to: forwardTo,
        subject: "this message from portfoilio chatbot",
        text: emailTextBody,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email forwarded successfully via Gmail SMTP:", info.messageId);

      return JSON.stringify({
        success: true,
        message: "Email forwarded successfully to support@sarugeek.com via Gmail.",
        messageId: info.messageId,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Gmail SMTP fallback failed:", err);
      return JSON.stringify({
        error: `Email forwarding failed for both SMTP2GO and Gmail. Gmail Error: ${errMsg}`,
      });
    }
  }

  return JSON.stringify({
    error: "Email forwarding failed. No valid SMTP2GO or Gmail SMTP configuration found.",
  });
}
