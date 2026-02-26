import { Resend } from 'resend';

// Only init Resend if an API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendVerificationEmail = async (email: string, token: string) => {
    const backendUrl = process.env.NODE_ENV === 'production'
        ? 'https://lucky-adventure-production-5b97.up.railway.app'
        : 'http://localhost:3001';

    const verificationLink = `${backendUrl}/api/auth/verify-email?token=${token}`;

    // In dev mode without API key, just print the link to the console
    if (!resend) {
        console.log(`\n======================================================`);
        console.log(`[DEV MODE] 📧 Fake Email sent to: ${email}`);
        console.log(`[DEV MODE] 🔗 Verification Link: ${verificationLink}`);
        console.log(`======================================================\n`);
        return true;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'FinPilot Security <onboarding@resend.dev>', // Free tier uses resend.dev domain
            to: [email],
            subject: 'Vérifiez votre compte FinPilot',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0ea5e9;">Bienvenue sur FinPilot !</h2>
                    <p>Merci pour votre inscription. Pour activer votre compte et commencer à uploader vos factures, veuillez cliquer sur le lien sécurisé ci-dessous :</p>
                    <div style="margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Activer mon compte</a>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">
                        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur : <br/>
                        ${verificationLink}
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #94a3b8;">Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.</p>
                </div>
            `,
        });

        if (error) {
            console.error('Erreur Resend:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Erreur inattendue email:', err);
        return false;
    }
}
