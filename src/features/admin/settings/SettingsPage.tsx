import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { dataService } from '@/services/dataService';
import { UserRole } from '@/types';
import { MoneySection } from './MoneySection';
import { PaystackSection } from './PaystackSection';
import { OpenAiSection } from './OpenAiSection';
import { SwitchesSection } from './SwitchesSection';
import { ContactSection } from './ContactSection';
import { ScreenSection } from './ScreenSection';

const NAV = [
  { href: '#money', label: 'Money' },
  { href: '#payments', label: 'Card payments' },
  { href: '#openai', label: 'Page AI' },
  { href: '#switches', label: 'Switches' },
  { href: '#contact', label: 'Contact' },
  { href: '#screen', label: 'Your screen' },
];

export default function SettingsPage() {
  const { settings, user, refresh } = useAuth();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const isAdmin = user?.role === UserRole.ADMIN;

  const [fee, setFee] = useState('');
  const [commission, setCommission] = useState('');
  const [holdDays, setHoldDays] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState('');
  const [invoiceDueDays, setInvoiceDueDays] = useState('');
  const [regClient, setRegClient] = useState(true);
  const [regPro, setRegPro] = useState(true);
  const [emails, setEmails] = useState(true);
  const [hires, setHires] = useState(true);
  const [withdrawals, setWithdrawals] = useState(true);
  const [reviews, setReviews] = useState(true);
  const [staffOnly, setStaffOnly] = useState(false);
  const [bannerOn, setBannerOn] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [pageStudio, setPageStudio] = useState(false);
  const [platformName, setPlatformName] = useState('Birdie');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportWhatsapp, setSupportWhatsapp] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [gaId, setGaId] = useState('');

  const [moneySaving, setMoneySaving] = useState(false);
  const [moneySaved, setMoneySaved] = useState(false);
  const [moneyError, setMoneyError] = useState<string | null>(null);
  const [switchSaving, setSwitchSaving] = useState(false);
  const [switchSaved, setSwitchSaved] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setFee(String(settings.consultation_fee_ngn ?? 10000));
    setCommission(String(settings.commission_rate ?? 3.5));
    setHoldDays(String(settings.escrow_release_days ?? 3));
    setMinWithdrawal(String(settings.min_withdrawal_amount ?? 5000));
    setInvoiceDueDays(String(settings.invoice_due_days ?? 3));
    setRegClient(settings.reg_client_enabled !== false);
    setRegPro(settings.reg_pro_enabled !== false);
    setEmails(settings.email_notifications_enabled !== false);
    setHires(settings.hires_enabled !== false);
    setWithdrawals(settings.withdrawals_enabled !== false);
    setReviews(settings.reviews_enabled !== false);
    setStaffOnly(Boolean(settings.admin_only_access));
    setBannerOn(Boolean(settings.public_banner_enabled));
    setBannerText(settings.public_banner_text || '');
    setPageStudio(settings.page_studio_enabled === true);
    setPlatformName(settings.platform_name || 'Birdie');
    setSupportEmail(settings.support_email || '');
    setSupportPhone(settings.support_phone || '');
    setSupportWhatsapp(settings.support_whatsapp || '');
    setOfficeAddress(settings.office_address || '');
    setGaId(settings.ga_measurement_id || '');
  }, [settings]);

  if (!isStaff) {
    return <Navigate to="/app/account" replace />;
  }

  const savePatch = async (
    patch: Record<string, unknown>,
    section: string,
    setSaving: (v: boolean) => void,
    setSaved: (v: boolean) => void,
    setError: (v: string | null) => void
  ) => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await dataService.updatePlatformSettings(patch);
      await dataService.writeAuditLog({
        actorId: user?.id,
        action: 'settings.updated',
        entityType: 'platform_settings',
        entityId: 'global',
        meta: { section, keys: Object.keys(patch) },
      });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Settings</p>
        <h1 className="text-3xl font-bold text-[var(--app-ink)]">Control Birdie</h1>
        <p className="text-sm font-medium text-[var(--app-muted)] max-w-2xl">
          These knobs change the site for everyone: prices, card payments, what is open, and how families reach you.
          Blog posts, emails, and checking professionals have their own pages.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[#660033] hover:border-[#660033]/40"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="space-y-6 max-w-3xl">
        <MoneySection
          fee={fee}
          commission={commission}
          holdDays={holdDays}
          minWithdrawal={minWithdrawal}
          invoiceDueDays={invoiceDueDays}
          setFee={setFee}
          setCommission={setCommission}
          setHoldDays={setHoldDays}
          setMinWithdrawal={setMinWithdrawal}
          setInvoiceDueDays={setInvoiceDueDays}
          saving={moneySaving}
          saved={moneySaved}
          error={moneyError}
          onSave={() =>
            savePatch(
              {
                consultation_fee_ngn: Number(fee),
                commission_rate: Number(commission),
                escrow_release_days: Number(holdDays),
                min_withdrawal_amount: Number(minWithdrawal),
                invoice_due_days: Number(invoiceDueDays),
              },
              'money',
              setMoneySaving,
              setMoneySaved,
              setMoneyError
            )
          }
        />
        <PaystackSection
          isAdmin={Boolean(isAdmin)}
          mode={settings?.paystack_mode}
          secretSaved={
            settings?.paystack_mode === 'live'
              ? Boolean(settings?.paystack_secret_last4_live)
              : Boolean(settings?.paystack_secret_last4_test)
          }
        />
        <OpenAiSection isAdmin={Boolean(isAdmin)} last4={settings?.openai_secret_last4} />
        <SwitchesSection
          regClient={regClient}
          regPro={regPro}
          emails={emails}
          hires={hires}
          withdrawals={withdrawals}
          reviews={reviews}
          staffOnly={staffOnly}
          bannerOn={bannerOn}
          bannerText={bannerText}
          pageStudio={pageStudio}
          setRegClient={setRegClient}
          setRegPro={setRegPro}
          setEmails={setEmails}
          setHires={setHires}
          setWithdrawals={setWithdrawals}
          setReviews={setReviews}
          setStaffOnly={setStaffOnly}
          setBannerOn={setBannerOn}
          setBannerText={setBannerText}
          setPageStudio={setPageStudio}
          saving={switchSaving}
          saved={switchSaved}
          error={switchError}
          onSave={() =>
            savePatch(
              {
                reg_client_enabled: regClient,
                reg_pro_enabled: regPro,
                email_notifications_enabled: emails,
                hires_enabled: hires,
                withdrawals_enabled: withdrawals,
                reviews_enabled: reviews,
                admin_only_access: staffOnly,
                public_banner_enabled: bannerOn,
                public_banner_text: bannerText.trim() || null,
                page_studio_enabled: pageStudio,
              },
              'switches',
              setSwitchSaving,
              setSwitchSaved,
              setSwitchError
            )
          }
        />
        <ContactSection
          platformName={platformName}
          supportEmail={supportEmail}
          supportPhone={supportPhone}
          supportWhatsapp={supportWhatsapp}
          officeAddress={officeAddress}
          gaId={gaId}
          setPlatformName={setPlatformName}
          setSupportEmail={setSupportEmail}
          setSupportPhone={setSupportPhone}
          setSupportWhatsapp={setSupportWhatsapp}
          setOfficeAddress={setOfficeAddress}
          setGaId={setGaId}
          saving={contactSaving}
          saved={contactSaved}
          error={contactError}
          onSave={() =>
            savePatch(
              {
                platform_name: platformName.trim() || 'Birdie',
                support_email: supportEmail.trim() || 'support@birdie.ng',
                support_phone: supportPhone.trim() || null,
                support_whatsapp: supportWhatsapp.trim() || null,
                office_address: officeAddress.trim() || null,
                ga_measurement_id: gaId.trim() || null,
              },
              'contact',
              setContactSaving,
              setContactSaved,
              setContactError
            )
          }
        />
        <ScreenSection />
      </div>
    </div>
  );
}
