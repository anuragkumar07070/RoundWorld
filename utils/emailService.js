// You'll need to install nodemailer: npm install nodemailer
const nodemailer = require('nodemailer');

class EmailService {
    static createTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    static async sendWelcomeEmail(email, username) {
        const transporter = this.createTransporter();
        
        const mailOptions = {
            from: `"RoundWorld" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to RoundWorld! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #fe424d;">Welcome to RoundWorld, ${username}!</h1>
                    <p>We're excited to have you on board. Start exploring amazing places today!</p>
                    <a href="${process.env.BASE_URL}/listings" style="background-color: #fe424d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Start Exploring
                    </a>
                </div>
            `
        };
        
        try {
            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email sending failed:', err);
        }
    }
}

module.exports = EmailService;