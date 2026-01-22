
import React, { useState } from 'react';
import { 
  Mail, 
  Bell, 
  Settings, 
  History, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  X, 
  Save, 
  ChevronRight, 
  Search, 
  Filter, 
  AlertCircle,
  Database,
  Smartphone,
  RefreshCw,
  Plus,
  Users,
  User as UserIcon,
  ShieldCheck,
  Send,
  Lock,
  Globe,
  Trash2,
  PlayCircle
} from 'lucide-react';
import { 
  CommunicationStatus, 
  CommunicationType, 
  SystemEvent, 
  UserRole, 
  EmailTemplate, 
  TriggerConfig, 
  CommunicationLog 
} from '../types';

type CommTab = 'smtp' | 'triggers' | 'templates' | 'logs' | 'test';

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 't-1',
    slug: 'hire-request-received',
    name: 'Hire Request Received',
    subject: 'Booking Confirmed: Your Birdie Professional is ready!',
    body: 'Hi {{client_name}},\n\nGreat news! We\'ve successfully matched your request with one of our top-tier professionals.\n\nBooking Details:\n- Service: {{service_type}}\n- Date: {{start_date}}\n\nWarmly,\nThe Birdie Team',
    variables: ['client_name', 'service_type', 'start_date'],
    lastUpdated: '2 hours ago',
    status: 'ACTIVE'
  },
  {
    id: 't-2',
    slug: 'payment-confirmation',
    name: 'Payment Confirmation',
    subject: 'Receipt: Your payment of {{payment_amount}} was successful',
    body: 'Hi {{client_name}},\n\nYour payment of {{payment_amount}} for Hire #{{hire_id}} has been received.',
    variables: ['client_name', 'payment_amount', 'hire_id'],
    lastUpdated: 'Yesterday',
    status: 'ACTIVE'
  }
];

const MOCK_TRIGGERS: TriggerConfig[] = [
  { id: 'tr-1', event: SystemEvent.HIRE_REQUEST_SUBMITTED, clientEmailEnabled: true, professionalEmailEnabled: false, adminEmailEnabled: true, inAppEnabled: true, templateId: 't-1', status: 'ON' },
  { id: 'tr-2', event: SystemEvent.PAYMENT_SUCCESS, clientEmailEnabled: true, professionalEmailEnabled: false, adminEmailEnabled: true, inAppEnabled: false, templateId: 't-2', status: 'ON' },
  { id: 'tr-3', event: SystemEvent.HIRE_REQUEST_ASSIGNED, clientEmailEnabled: true, professionalEmailEnabled: true, adminEmailEnabled: false, inAppEnabled: true, templateId: 't-1', status: 'ON' }
];

const MOCK_LOGS: CommunicationLog[] = [
  { id: 'l-1', toEmail: 'sarah@birdie.ng', recipientRole: UserRole.CLIENT, subject: 'Hire Request Received', templateSlug: 'hire-request-received', status: CommunicationStatus.SENT, relatedEvent: SystemEvent.HIRE_REQUEST_SUBMITTED, sentAt: '12:45 PM', retryCount: 0 },
  { id: 'l-2', toEmail: 'tunde@birdie.ng', recipientRole: UserRole.PROFESSIONAL, subject: 'New Job Assigned', templateSlug: 'new-job-alert', status: CommunicationStatus.FAILED, error: 'SMTP Timeout', relatedEvent: SystemEvent.HIRE_REQUEST_ASSIGNED, sentAt: 'Yesterday', retryCount: 2 },
];

const AdminCommunications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommTab>('smtp');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [testEmail, setTestEmail] = useState('');
  const [testTemplateId, setTestTemplateId] = useState('');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const renderSMTP = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Settings */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><Lock size={20} /></div>
            <h3 className="text-lg font-bold">SMTP Connection Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                <input type="text" defaultValue="email-smtp.us-east-1.amazonaws.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Port</label>
                <input type="text" defaultValue="587" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Encryption</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm">
                <option>STARTTLS</option>
                <option>SSL/TLS</option>
                <option>None</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input type="text" defaultValue="AKIAxxxxxxxx" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input type="password" value="••••••••••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
            </div>
          </div>
        </div>

        {/* Sender Identity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2 bg-[#660033]/5 text-[#660033] rounded-lg"><UserIcon size={20} /></div>
            <h3 className="text-lg font-bold">Sender Identity</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From Name</label>
              <input type="text" defaultValue="Birdie Support" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From Email</label>
              <input type="email" defaultValue="support@birdie.ng" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reply-To Address</label>
              <input type="email" defaultValue="hello@birdie.ng" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
            </div>
          </div>
          
          <div className="pt-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-800">Connection Verified</p>
              </div>
              <button className="text-[10px] font-bold text-[#660033] uppercase underline">Re-Verify</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button onClick={handleSave} className="px-10 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all flex items-center gap-2">
          {saveStatus === 'saving' ? 'Saving...' : <><Save size={20} /> Save SMTP Config</>}
        </button>
      </div>
    </div>
  );

  const renderTriggers = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-xl font-bold">Email Trigger Engine</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Map events to notifications</span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Event</th>
              <th className="px-8 py-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">Client Email</th>
              <th className="px-8 py-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">Pro Email</th>
              <th className="px-8 py-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">Admin Email</th>
              <th className="px-8 py-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">In-App</th>
              <th className="px-8 py-5 text-right text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_TRIGGERS.map((trigger) => (
              <tr key={trigger.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{trigger.event.replace(/_/g, ' ')}</p>
                    <button className="text-[10px] font-bold text-[#660033] hover:underline uppercase">Edit Template</button>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <input type="checkbox" defaultChecked={trigger.clientEmailEnabled} className="w-5 h-5 accent-[#660033]" />
                </td>
                <td className="px-8 py-5 text-center">
                  <input type="checkbox" defaultChecked={trigger.professionalEmailEnabled} className="w-5 h-5 accent-[#660033]" />
                </td>
                <td className="px-8 py-5 text-center">
                  <input type="checkbox" defaultChecked={trigger.adminEmailEnabled} className="w-5 h-5 accent-[#660033]" />
                </td>
                <td className="px-8 py-5 text-center">
                  <input type="checkbox" defaultChecked={trigger.inAppEnabled} className="w-5 h-5 accent-[#660033]" />
                </td>
                <td className="px-8 py-5 text-right">
                   <button className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase ${trigger.status === 'ON' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                     {trigger.status}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {editingTemplate ? (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between border-b border-slate-50 pb-6">
             <div className="space-y-1">
               <h3 className="text-2xl font-bold text-slate-900">Edit Template: {editingTemplate.name}</h3>
               <p className="text-slate-500 font-medium text-sm italic">Last updated {editingTemplate.lastUpdated}</p>
             </div>
             <button onClick={() => setEditingTemplate(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900"><X size={24} /></button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Subject</label>
                  <input 
                    type="text" 
                    defaultValue={editingTemplate.subject} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 outline-none font-bold text-slate-900" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Body (Rich Content)</label>
                  <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-inner">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supported Variables</div>
                        <div className="flex flex-wrap gap-2">
                          {editingTemplate.variables.map(v => (
                            <span key={v} className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-500">{"{{" + v + "}}"}</span>
                          ))}
                        </div>
                     </div>
                     <textarea 
                       rows={12} 
                       defaultValue={editingTemplate.body}
                       className="w-full px-8 py-6 bg-white outline-none resize-none font-medium text-slate-600 leading-relaxed" 
                     />
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                   <h4 className="font-bold text-slate-900 text-sm">Template Info</h4>
                   <div className="space-y-2">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trigger Mapping</p>
                     <p className="text-sm font-bold text-slate-700">{editingTemplate.slug.replace(/-/g, ' ')}</p>
                   </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button onClick={handleSave} className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all flex items-center justify-center gap-2">
                    {saveStatus === 'saving' ? 'Publishing...' : <><Save size={20} /> Save & Publish</>}
                  </button>
                  <button onClick={() => setEditingTemplate(null)} className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    Discard Changes
                  </button>
                </div>
             </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_TEMPLATES.map(template => (
            <div key={template.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 hover:border-[#660033]/30 transition-all group">
              <div className="flex items-center justify-between">
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-bold uppercase tracking-widest">{template.status}</div>
                 <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{template.slug}</div>
              </div>
              <div className="space-y-1">
                 <h4 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-[#660033] transition-colors">{template.name}</h4>
                 <p className="text-xs text-slate-400 font-medium line-clamp-1">{template.subject}</p>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                 <button onClick={() => setEditingTemplate(template)} className="text-[10px] font-bold text-[#660033] uppercase tracking-widest flex items-center gap-1 hover:underline">Edit Template <ChevronRight size={12} /></button>
                 <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
              </div>
            </div>
          ))}
          <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-4 hover:border-[#660033]/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-[#660033] shadow-sm transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Create New Template</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderLogs = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900">Email Transmission Logs</h3>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search by email..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
           </div>
           <button className="p-2 text-slate-400 hover:text-[#660033]"><Filter size={18} /></button>
           <button className="flex items-center gap-2 px-4 py-2 bg-[#660033]/5 text-[#660033] rounded-xl text-[10px] font-bold uppercase tracking-widest border border-[#660033]/10">
             <RefreshCw size={14} /> Refresh
           </button>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Recipient</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Subject</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Event</th>
              <th className="px-8 py-5 text-right text-[10px] font-bold uppercase text-slate-400 tracking-widest">Sent At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-900">{log.toEmail}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{log.recipientRole}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-slate-600 truncate max-w-[200px]">{log.subject}</td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                    log.status === CommunicationStatus.SENT ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {log.status} {log.status === CommunicationStatus.FAILED && `(${log.retryCount} Retries)`}
                  </span>
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{log.relatedEvent.replace(/_/g, ' ')}</td>
                <td className="px-8 py-5 text-right whitespace-nowrap text-xs font-bold text-slate-900">{log.sentAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTestEmail = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#660033]/5 text-[#660033] rounded-2xl flex items-center justify-center mx-auto mb-4">
             <PlayCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Email Sandbox</h3>
          <p className="text-slate-500 font-medium">Verify your SMTP configuration and template rendering safely.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="email" 
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 outline-none transition-all font-medium" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Template</label>
            <select 
              value={testTemplateId}
              onChange={(e) => setTestTemplateId(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 outline-none font-bold text-sm"
            >
              <option value="">Select a template...</option>
              {MOCK_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button 
              disabled={!testEmail || !testTemplateId}
              className="w-full py-5 bg-[#660033] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#660033]/20 hover:bg-[#2B0116] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Send size={20} /> Send Test Email
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#660033]/5 border border-[#660033]/10 rounded-[2rem] flex items-center gap-4">
          <AlertCircle size={24} className="text-[#660033] shrink-0" />
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Test emails use production SMTP settings. Variables will be populated with placeholder "Sandbox Data".
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Email & Notifications</h2>
            <p className="text-slate-500 font-medium italic">Internal control hub for Birdie's messaging engine.</p>
         </div>
         <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {[
              { id: 'smtp', label: 'SMTP Config', icon: Settings },
              { id: 'triggers', label: 'Email Triggers', icon: PlayCircle },
              { id: 'templates', label: 'Email Templates', icon: Mail },
              { id: 'logs', label: 'Transmission Logs', icon: History },
              { id: 'test', label: 'Test Tool', icon: Send },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as CommTab); setEditingTemplate(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeTab === tab.id ? 'bg-[#660033] text-white shadow-lg shadow-[#660033]/20 border-[#660033]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      {activeTab === 'smtp' && renderSMTP()}
      {activeTab === 'triggers' && renderTriggers()}
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'test' && renderTestEmail()}
    </div>
  );
};

export default AdminCommunications;
