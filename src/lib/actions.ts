'use server';

import { prisma } from './prisma';

export async function submitContact(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return { success: false, error: 'Vyplňte všechna pole prosím.' };
    }

    await prisma.contactMessage.create({
      data: { name, email, message },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Chyba při odesílání zprávy.' };
  }
}

export async function getMessages(password: string) {
  // Super simple admin password check (e.g. from env)
  if (password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return { success: false, data: [] };
  }
  const data = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return { success: true, data };
}
