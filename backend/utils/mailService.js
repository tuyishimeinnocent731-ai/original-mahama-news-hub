const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    console.log('--- SENDING PASSWORD RESET EMAIL ---');
    console.log(`To: ${name} <${to}>`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('------------------------------------');
    // In a real application, you would use a service like Nodemailer, SendGrid, etc.
    // For this demo, we just log to the console.
    return Promise.resolve();
};

module.exports = { sendPasswordResetEmail };