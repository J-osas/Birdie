
import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  User, 
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  CreditCard,
  PlayCircle,
  CheckCircle2,
  Scale,
  Clock,
  ArrowRight
} from 'lucide-react';
import { HireRequest, RequestStatus, UserRole } from '../types';
import { GET_STATUS_STYLE } from '../constants';
import { dataService } from '../services/dataService';

interface Props {
  request: HireRequest;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
  userRole: UserRole;
}

const RequestDetail: React.FC<Props> = ({ request, onClose, onUpdateStatus, userRole }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const isClient = userRole === UserRole.CLIENT;
  const isPro = userRole === UserRole.PROFESSIONAL;
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.OPERATIONS;

  const handleAction = async (action: () => Promise<any>, nextStatus: RequestStatus) => {
    setIsProcessing(true);
    try {
      await action();
      onUpdateStatus(request.id, nextStatus);
    } catch (e: any) {
      alert("Transition failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatusMask = () => {
    switch (request.status) {
      case RequestStatus.PENDING:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center space-y-2">
               <Clock className="mx-auto text-amber-500" size={32} />
               <p className="font-bold text-amber-800">Awaiting Response</p>
               <p className="text-xs text-amber-600 font-medium">The request is currently being reviewed by {request.professionalName || 'the matching team'}.</p>
            </div>
            {isClient && (
              <button 
                onClick={() => handleAction(() => dataService.updateHireRequestStatus(request.id, RequestStatus.CANCELLED), RequestStatus.CANCELLED)}
                className="w-full py-4 border border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all"
              >
                Cancel Hire Request
              </button>
            )}
            {isPro && (
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={onClose} className="py-4 border border-slate-200 text-slate-500 font-bold rounded-2xl">Later</button>
                 <button 
                  onClick={() => handleAction(() => dataService.acceptHireRequest(request.id), RequestStatus.ACCEPTED)}
                  className="py-4 bg-[#660033] text-white font-bold rounded-2xl shadow-xl shadow-[#660033]/20"
                 >
                   Accept Job
                 </button>
              </div>
            )}
          </div>
        );

      case RequestStatus.ASSIGNED:
        return (
          <div className="space-y-6">
             <div className="p-6 bg-[#660033]/5 border border-[#660033]/10 rounded-2xl text-center space-y-2">
                <User className="mx-auto text-[#660033]" size={32} />
                <p className="font-bold text-[#660033]">New Match Assigned</p>
                <p className="text-xs text-slate-500 font-medium">Please review the specifications and accept to proceed.</p>
             </div>
             {isPro && (
               <button 
                onClick={() => handleAction(() => dataService.acceptHireRequest(request.id), RequestStatus.ACCEPTED)}
                className="w-full py-5 bg-[#660033] text-white font-bold rounded-2xl shadow-xl shadow-[#660033]/20 flex items-center justify-center gap-2"
               >
                 <Check size={20} /> Accept Request
               </button>
             )}
          </div>
        );

      case RequestStatus.ACCEPTED:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2">
               <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
               <p className="font-bold text-emerald-800">Professional Agreed</p>
               <p className="text-xs text-emerald-600 font-medium">Agreement reached. Payment is required to secure the slot.</p>
            </div>
            {isClient && (
              <button 
                onClick={() => handleAction(() => dataService.initiatePaymentIntent(request.id), RequestStatus.AWAITING_ESCROW)}
                className="w-full py-5 bg-[#660033] text-white font-bold rounded-2xl shadow-xl shadow-[#660033]/20 flex items-center justify-center gap-2"
              >
                Proceed to Secure Payment <ArrowRight size={20} />
              </button>
            )}
          </div>
        );

      case RequestStatus.AWAITING_ESCROW:
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
               <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Ref</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{request.providerReference || 'REF-GEN...'}</span>
               </div>
               <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-600">Total Due</span>
                  <span className="font-black text-[#660033]">₦{(request.amount || 30000).toLocaleString()}</span>
               </div>
            </div>
            {isClient && (
              <button 
                onClick={() => handleAction(() => dataService.markEscrowFunded(request.id), RequestStatus.FUNDED)}
                className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard size={20} /> Securely Fund Escrow
              </button>
            )}
          </div>
        );

      case RequestStatus.FUNDED:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center space-y-2">
               <ShieldCheck className="mx-auto text-blue-500" size={32} />
               <p className="font-bold text-blue-800">Payment Secured</p>
               <p className="text-xs text-blue-600 font-medium">Funds are held in Birdie Escrow. Ready for commencement.</p>
            </div>
            {isPro && (
              <button 
                onClick={() => handleAction(() => dataService.updateHireRequestStatus(request.id, RequestStatus.ACTIVE), RequestStatus.ACTIVE)}
                className="w-full py-5 bg-[#660033] text-white font-bold rounded-2xl shadow-xl shadow-[#660033]/20 flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} /> Start Work Now
              </button>
            )}
          </div>
        );

      case RequestStatus.ACTIVE:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-[#660033]/5 border border-[#660033]/10 rounded-2xl text-center space-y-2">
               <PlayCircle className="mx-auto text-[#660033] animate-pulse" size={32} />
               <p className="font-bold text-[#660033]">Work In Progress</p>
               <p className="text-xs text-slate-500 font-medium">Commenced on {new Date(request.updatedAt).toLocaleDateString()}</p>
            </div>
            {isPro && (
              <button 
                onClick={() => handleAction(() => dataService.releaseEscrowToPending(request.id), RequestStatus.COMPLETED)}
                className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Check size={20} /> Mark Job Finished
              </button>
            )}
            {isClient && (
              <button className="w-full py-4 text-rose-600 font-bold border border-rose-100 rounded-2xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                <Scale size={18} /> Raise Dispute
              </button>
            )}
          </div>
        );

      case RequestStatus.COMPLETED:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2">
               <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
               <p className="font-bold text-emerald-800">Job Successfully Finished</p>
               <p className="text-xs text-emerald-600 font-medium italic">Funds move to Available Balance in 3 days (Dispute Window).</p>
            </div>
            {isClient && (
               <button className="w-full py-4 text-rose-600 font-bold border border-rose-100 rounded-2xl flex items-center justify-center gap-2">
                 <Scale size={18} /> Raise Dispute
               </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => handleAction(() => dataService.finalizeClearance('mock-wallet', request.id), RequestStatus.SETTLED)}
                className="w-full py-5 bg-[#660033] text-white font-bold rounded-2xl"
              >
                Override & Settle Now
              </button>
            )}
          </div>
        );

      case RequestStatus.SETTLED:
        return (
          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-center space-y-4">
             <ShieldCheck className="mx-auto text-emerald-400" size={48} />
             <div className="space-y-1">
                <h4 className="text-white font-bold text-xl">Hire Fully Settled</h4>
                <p className="text-white/50 text-sm font-medium">Financial transaction terminal reached. No further actions required.</p>
             </div>
             {isClient && (
               <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/20 transition-all">
                 Leave Professional Review
               </button>
             )}
          </div>
        );

      case RequestStatus.CANCELLED:
        return (
          <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center space-y-2">
             <X className="mx-auto text-slate-300" size={48} />
             <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Request Terminated</p>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-[0.1em] ${GET_STATUS_STYLE(request.status)}`}>
                {request.status}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{request.clientName}</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ID: {request.id.slice(0, 12)}...</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 group hover:border-[#660033]/20 transition-all">
                <div className="flex items-center gap-2 text-[#660033] mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Service</span>
                </div>
                <p className="font-bold text-slate-900">{request.serviceCategory}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 group hover:border-[#660033]/20 transition-all">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Calendar size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Start Date</span>
                </div>
                <p className="font-bold text-slate-900">{new Date(request.preferredStartDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#660033] shadow-sm"><MapPin size={20} /></div>
                 <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="font-bold text-slate-900">{request.location}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Value</p>
                 <p className="font-black text-[#660033]">₦{(request.amount || 30000).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#660033]/5 p-6 rounded-3xl border border-[#660033]/10">
              <div className="flex items-center gap-2 text-[#660033] mb-2">
                <MessageSquare size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Requirements</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                "{request.requirements?.notes || 'No extra notes provided.'}"
              </p>
              <div className="flex gap-2 mt-4">
                 <span className="px-2 py-1 bg-white border border-[#660033]/10 rounded-lg text-[9px] font-bold text-[#660033] uppercase">{request.requirements?.livingCondition || 'LIVE_OUT'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {isProcessing ? (
               <div className="flex flex-col items-center gap-3 py-8 text-[#660033]">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing State...</p>
               </div>
            ) : renderStatusMask()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
