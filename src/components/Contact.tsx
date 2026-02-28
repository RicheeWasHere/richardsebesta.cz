'use client';

import { useState } from 'react';
import { submitContact } from '@/lib/actions';
import { Dictionary } from '@/dictionaries/en';

export function Contact({ dict }: { dict: Dictionary }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function action(formData: FormData) {
    setStatus('loading');
    const res = await submitContact(formData);
    if (res.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(res.error || dict.contact.error);
    }
  }

  return (
    <section className="flex flex-col gap-6 border-t border-zinc-900 pt-16">
      <h2 className="text-sm tracking-widest uppercase text-zinc-500 font-medium">
        {dict.contact.title}
      </h2>
      <form action={action} className="flex flex-col gap-6">
        <input 
          type="text" 
          name="name" 
          placeholder={dict.contact.name}
          required 
          className="w-full bg-transparent border-b border-zinc-800 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
        <input 
          type="email" 
          name="email" 
          placeholder={dict.contact.email}
          required 
          className="w-full bg-transparent border-b border-zinc-800 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
        <textarea 
          name="message" 
          placeholder={dict.contact.message}
          required 
          rows={3}
          className="w-full bg-transparent border-b border-zinc-800 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
        />

        <div className="flex items-center gap-4 mt-2">
          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="w-fit border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 py-2 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? '...' : status === 'success' ? '✓' : dict.contact.send}
          </button>
          
          {status === 'success' && (
            <span className="text-sm text-zinc-400">{dict.contact.success}</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-500">{errorMessage}</span>
          )}
        </div>
      </form>
    </section>
  );
}
