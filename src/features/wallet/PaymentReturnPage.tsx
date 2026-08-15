import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Button } from '@/components/ui/Button';

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref') || '';
  const hireId = params.get('hire') || '';
  const [state, setState] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('Checking your payment…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!reference) {
        setState('error');
        setMessage('We did not get anything back from the bank. Open your request and try again if money left your account.');
        return;
      }
      try {
        const result = await dataService.verifyPaystackPayment(reference);
        if (cancelled) return;
        if (result.paid) {
          setState('paid');
          setMessage(
            result.paymentType === 'consultation'
              ? 'We got your meeting fee. We will call you, then send you one clear bill for the job.'
              : 'We got your money and we are holding it safely. The job can start now, and we only pay the professional when it is done.'
          );
        } else {
          setState('pending');
          setMessage('The bank has not confirmed this yet. Check your payments page again in a minute.');
        }
      } catch (e) {
        if (cancelled) return;
        setState('error');
        setMessage(e instanceof Error ? e.message : 'We could not check this payment.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  const href = hireId ? `/app/hires/${hireId}` : '/app/payments';

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-6">
      {state === 'loading' && <Loader2 className="mx-auto animate-spin text-[#660033]" size={40} />}
      {state === 'paid' && <CheckCircle2 className="mx-auto text-emerald-500" size={48} />}
      {(state === 'error' || state === 'pending') && <XCircle className="mx-auto text-amber-500" size={48} />}
      <h1 className="text-3xl font-bold text-[#0A0A0A]">
        {state === 'paid' ? 'Thank you, we got it' : state === 'loading' ? 'One moment' : 'About your payment'}
      </h1>
      <p className="text-slate-500 font-medium">{message}</p>
      <Link to={href}>
        <Button size="lg">{hireId ? 'Open my request' : 'See my payments'}</Button>
      </Link>
    </div>
  );
}
