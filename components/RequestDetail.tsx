
import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  User, 
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { HireRequest, RequestStatus } from '../types';
import { GET_STATUS_STYLE } from '../constants';

interface Props {
  request: HireRequest;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
}

const RequestDetail: React.FC<Props> = ({ request, onClose, onUpdateStatus }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${GET_STATUS_STYLE(request.status)}`}>
                {request.status}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Request from {request.clientName}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Submitted on {request.submissionDate}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-[#660033] mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Service</span>
                </div>
                <p className="font-bold text-slate-900">{request.serviceRequested}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Date</span>
                </div>
                <p className="font-bold text-slate-900">{request.requestedDate}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MapPin size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Location</span>
              </div>
              <p className="font-bold text-slate-900">Lekki Phase 1, Lagos</p>
            </div>

            <div className="bg-[#660033]/5 p-5 rounded-2xl border border-[#660033]/10">
              <div className="flex items-center gap-2 text-[#660033] mb-2">
                <MessageSquare size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Client Notes</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                "{request.notes || 'Looking for someone experienced with children and light cooking. Reliability is our top priority.'}"
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {request.status === RequestStatus.PENDING && (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onUpdateStatus(request.id, RequestStatus.CANCELLED)}
                  className="py-4 rounded-2xl font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all active:scale-95"
                >
                  Decline
                </button>
                <button 
                  onClick={() => onUpdateStatus(request.id, RequestStatus.ACTIVE)}
                  className="py-4 bg-[#660033] rounded-2xl font-bold text-white hover:bg-[#2B0116] shadow-lg shadow-[#660033]/20 transition-all active:scale-95"
                >
                  Accept
                </button>
              </div>
            )}

            {request.status === RequestStatus.ACTIVE && (
              <button 
                onClick={() => onUpdateStatus(request.id, RequestStatus.COMPLETED)}
                className="w-full py-4 bg-emerald-600 rounded-2xl font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Check size={20} />
                Mark as Completed
              </button>
            )}

            {request.status === RequestStatus.COMPLETED && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">This job has been successfully finished.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
