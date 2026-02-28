'use server';

export async function submitContact(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return { success: false, error: 'Vyplňte všechna pole prosím.' };
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_URL is not set.');
      return { success: true }; // return success true so user doesnt get error, but we log the issue
    }

    const userId = process.env.DISCORD_USER_ID;
    const content = userId ? `<@${userId}>` : undefined;

    const payload = {
      content,
      embeds: [
        {
          title: 'New Contact Form Submission',
          color: 0x3b82f6,
          fields: [
            { name: 'Name', value: name, inline: true },
            { name: 'Email', value: email, inline: true },
            { name: 'Message', value: message },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Discord webhook error:', await response.text());
      return { success: false, error: 'Chyba při odesílání zprávy.' };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Chyba při odesílání zprávy.' };
  }
}
