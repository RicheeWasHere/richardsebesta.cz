'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const pwd = formData.get('pwd') as string;
  const cookieStore = await cookies();
  cookieStore.set('admin_pwd', pwd, { path: '/', maxAge: 60 * 60 * 24 });
  revalidatePath('/admin');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_pwd');
  revalidatePath('/admin');
}
