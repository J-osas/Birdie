import { Input, Label, TextArea } from '@/components/ui/Input';
import { SectionCard } from './SectionCard';

export function ContactSection({
  platformName,
  supportEmail,
  supportPhone,
  supportWhatsapp,
  officeAddress,
  gaId,
  setPlatformName,
  setSupportEmail,
  setSupportPhone,
  setSupportWhatsapp,
  setOfficeAddress,
  setGaId,
  onSave,
  saving,
  saved,
  error,
}: {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsapp: string;
  officeAddress: string;
  gaId: string;
  setPlatformName: (v: string) => void;
  setSupportEmail: (v: string) => void;
  setSupportPhone: (v: string) => void;
  setSupportWhatsapp: (v: string) => void;
  setOfficeAddress: (v: string) => void;
  setGaId: (v: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <SectionCard
      id="contact"
      title="Contact and tracking"
      hint="This is what families see on Contact and in the footer. Google Analytics only tracks the public pages."
      onSave={onSave}
      saving={saving}
      saved={saved}
      error={error}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Site name</Label>
          <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Support email</Label>
          <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="0800…" />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp (number or link)</Label>
          <Input value={supportWhatsapp} onChange={(e) => setSupportWhatsapp(e.target.value)} placeholder="23480…" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Office address</Label>
          <TextArea rows={2} value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Google Analytics ID (you can leave this empty)</Label>
          <Input placeholder="G-XXXXXXXX" value={gaId} onChange={(e) => setGaId(e.target.value)} />
        </div>
      </div>
    </SectionCard>
  );
}
