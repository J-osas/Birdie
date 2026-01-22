
import React from 'react';

export const COLORS = {
  background: '#f8fafb', // Light Gray/White
  card: '#ffffff',       // Pure White
  primary: '#660033',    // Deep Burgundy
  accent: '#660033',     // Deep Burgundy
  text: '#0a0a0a',       // Near Black
  textMuted: '#615a5c',  // Muted Gray
  success: '#059669',    
  warning: '#f59e0b',
  danger: '#dc2626'      
};

export const CATEGORIES = ['Security', 'Nanny', 'House Help', 'Gardener', 'Driver', 'Chef'];

// Helper for status styles using light theme backgrounds
export const GET_STATUS_STYLE = (status: string) => {
  switch(status) {
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACTIVE': return 'bg-[#660033]/5 text-[#660033] border-[#660033]/20';
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
