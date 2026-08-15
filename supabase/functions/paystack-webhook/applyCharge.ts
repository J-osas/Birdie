// deno-lint-ignore-file no-explicit-any
export async function applyChargeSuccess(admin: any, payment: any, reference: string) {
  if (payment.status === 'success') return;

  await admin.from('payments').update({ status: 'success' }).eq('id', payment.id);

  if (payment.payment_type === 'consultation' && payment.hire_request_id) {
    await admin
      .from('hire_requests')
      .update({
        status: 'consultation_paid',
        payment_status: 'consultation_paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.hire_request_id);
    await admin
      .from('consultations')
      .update({ payment_status: 'success', paystack_reference: reference })
      .eq('hire_request_id', payment.hire_request_id);

    const { data: hire } = await admin
      .from('hire_requests')
      .select('professional_id, reference_code, client_name')
      .eq('id', payment.hire_request_id)
      .maybeSingle();

    const ref = hire?.reference_code || 'your hire';
    if (hire?.professional_id) {
      const { data: pro } = await admin
        .from('professional_profiles')
        .select('user_id')
        .eq('id', hire.professional_id)
        .maybeSingle();
      if (pro?.user_id) {
        await admin.from('notifications').insert({
          user_id: pro.user_id,
          type: 'hire',
        title: 'Meeting booked',
        body: `${hire.client_name || 'A family'} paid the meeting fee for ${ref}. Birdie will set up the call.`,
          related_entity: 'hire_request',
          related_id: payment.hire_request_id,
        });
      }
    }
    const { data: staff } = await admin.from('profiles').select('id').in('role', ['admin', 'operations']);
    for (const s of staff || []) {
      await admin.from('notifications').insert({
        user_id: s.id,
        type: 'hire',
        title: 'Meeting fee paid',
        body: `Request ${ref} — after the call, mark the meeting done and Birdie will prepare the bill.`,
        related_entity: 'hire_request',
        related_id: payment.hire_request_id,
      });
    }
  }

  if (payment.payment_type === 'escrow' && payment.hire_request_id) {
    const { data: existingTx } = await admin
      .from('wallet_transactions')
      .select('id')
      .eq('reference', reference)
      .eq('tx_type', 'escrow_credit')
      .maybeSingle();

    await admin
      .from('hire_requests')
      .update({
        status: 'funded',
        payment_status: 'escrowed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.hire_request_id);

    await admin
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('hire_request_id', payment.hire_request_id)
      .neq('status', 'paid');

    if (!existingTx) {
      const { data: hire } = await admin
        .from('hire_requests')
        .select('professional_id, escrow_amount, reference_code')
        .eq('id', payment.hire_request_id)
        .maybeSingle();

      if (hire?.professional_id) {
        const { data: pro } = await admin
          .from('professional_profiles')
          .select('user_id')
          .eq('id', hire.professional_id)
          .maybeSingle();
        if (pro?.user_id) {
          const { data: wallet } = await admin
            .from('wallets')
            .select('*')
            .eq('professional_id', pro.user_id)
            .maybeSingle();
          if (wallet) {
            const credit = Number(payment.amount);
            await admin
              .from('wallets')
              .update({ escrow_balance: Number(wallet.escrow_balance) + credit })
              .eq('id', wallet.id);
            await admin.from('wallet_transactions').insert({
              wallet_id: wallet.id,
              hire_request_id: payment.hire_request_id,
              tx_type: 'escrow_credit',
              amount: credit,
              status: 'in_escrow',
              reference,
              description: `Job fee held for ${hire.reference_code || 'hire'}`,
            });
          }
          await admin.from('notifications').insert({
            user_id: pro.user_id,
            type: 'hire',
            title: 'The family has paid',
            body: `Birdie is now holding the money for ${hire.reference_code || 'your job'}. Wait for Birdie to start the job.`,
            related_entity: 'hire_request',
            related_id: payment.hire_request_id,
          });
        }
      }
    }
  }
}

export async function applyChargeFailed(admin: any, payment: any) {
  if (payment.status === 'failed' || payment.status === 'success') return;
  await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id);
}
