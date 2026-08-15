import { Input, Label, TextArea } from '@/components/ui/Input';
import { SectionCard, ToggleRow } from './SectionCard';

export function SwitchesSection({
  regClient,
  regPro,
  emails,
  hires,
  withdrawals,
  reviews,
  staffOnly,
  bannerOn,
  bannerText,
  setRegClient,
  setRegPro,
  setEmails,
  setHires,
  setWithdrawals,
  setReviews,
  setStaffOnly,
  setBannerOn,
  setBannerText,
  onSave,
  saving,
  saved,
  error,
}: {
  regClient: boolean;
  regPro: boolean;
  emails: boolean;
  hires: boolean;
  withdrawals: boolean;
  reviews: boolean;
  staffOnly: boolean;
  bannerOn: boolean;
  bannerText: string;
  setRegClient: (v: boolean) => void;
  setRegPro: (v: boolean) => void;
  setEmails: (v: boolean) => void;
  setHires: (v: boolean) => void;
  setWithdrawals: (v: boolean) => void;
  setReviews: (v: boolean) => void;
  setStaffOnly: (v: boolean) => void;
  setBannerOn: (v: boolean) => void;
  setBannerText: (v: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <SectionCard
      id="switches"
      title="Switches"
      hint="Turn parts of Birdie on or off. Each switch says what happens next."
      onSave={onSave}
      saving={saving}
      saved={saved}
      error={error}
    >
      <ToggleRow
        label="Families can register"
        hint="Off: a family who tries to join sees that sign-up is closed."
        checked={regClient}
        onChange={setRegClient}
      />
      <ToggleRow
        label="Professionals can register"
        hint="Off: people looking for work cannot start the sign-up form."
        checked={regPro}
        onChange={setRegPro}
      />
      <ToggleRow
        label="New hires"
        hint="Off: Hire buttons say we are not taking new requests."
        checked={hires}
        onChange={setHires}
      />
      <ToggleRow
        label="Withdrawals"
        hint="Off: professionals cannot ask to take money out."
        checked={withdrawals}
        onChange={setWithdrawals}
      />
      <ToggleRow
        label="Reviews"
        hint="Off: families cannot send a new review."
        checked={reviews}
        onChange={setReviews}
      />
      <ToggleRow
        label="Emails"
        hint="Off: Birdie stops sending emails. The bell in the app still works."
        checked={emails}
        onChange={setEmails}
      />
      <ToggleRow
        label="Banner on the public site"
        hint="Shows a thin strip at the top of the public pages."
        checked={bannerOn}
        onChange={setBannerOn}
      />
      {bannerOn && (
        <div className="space-y-1.5">
          <Label>Banner text</Label>
          <TextArea
            rows={2}
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder="We are closed on Sunday. We open again on Monday."
          />
        </div>
      )}
      <ToggleRow
        label="Staff-only lock"
        hint="Families and professionals who sign in see a closed screen. Public pages still load. Use this only if you must shut the app."
        checked={staffOnly}
        onChange={setStaffOnly}
        danger
      />
    </SectionCard>
  );
}
