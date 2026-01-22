
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Navigation, 
  Globe, 
  Layout, 
  Save, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronRight, 
  Search,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Type,
  Link,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Menu as MenuIcon
} from 'lucide-react';
import { MOCK_BLOG_POSTS } from './BlogArchive';

type CMSTab = 'pages' | 'blog' | 'faqs' | 'navigation' | 'seo';

interface AdminCMSProps {
  initialTab?: CMSTab;
  forceEditMode?: boolean;
}

const AdminCMS: React.FC<AdminCMSProps> = ({ initialTab = 'pages', forceEditMode = false }) => {
  const [activeTab, setActiveTab] = useState<CMSTab>(initialTab);
  const [selectedPage, setSelectedPage] = useState('homepage');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [isEditingBlog, setIsEditingBlog] = useState(forceEditMode);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (forceEditMode) setIsEditingBlog(true);
  }, [initialTab, forceEditMode]);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const renderPagesCMS = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-2">
        {['homepage', 'about', 'our-story', 'contact', 'legal'].map(page => (
          <button
            key={page}
            onClick={() => setSelectedPage(page)}
            className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              selectedPage === page ? 'bg-[#660033] text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {page.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <h3 className="text-xl font-bold text-slate-900 capitalize">{selectedPage.replace('-', ' ')} Editor</h3>
          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#660033] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#660033]/20 hover:bg-[#2B0116] transition-all disabled:opacity-50"
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <><CheckCircle2 size={18} /> Saved</> : <><Save size={18} /> Publish Changes</>}
          </button>
        </div>

        {selectedPage === 'homepage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hero Headline</label>
                <input type="text" defaultValue="Help Connecting Skilled Service Providers with the Right Homes." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hero Subtext</label>
                <textarea rows={3} defaultValue="Friendly and approachable, built with the professionalism you expect. Find vetted domestic staff and licensed therapists fast." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 focus:border-[#660033] outline-none transition-all font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Primary CTA Label</label>
                <input type="text" defaultValue="Hire a Professional" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secondary CTA Label</label>
                <input type="text" defaultValue="Apply as a Provider" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 space-y-6">
              <h4 className="font-bold text-slate-700">Platform Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                {['12k+', '96%', '48hrs'].map((val, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Metric {i+1}</label>
                    <input type="text" defaultValue={val} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedPage !== 'homepage' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <FileText size={32} />
            </div>
            <p className="text-slate-400 font-medium">Fields for the {selectedPage} editor are being generated.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBlogCMS = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isEditingBlog ? (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between border-b border-slate-50 pb-6">
             <div className="space-y-1">
               <h3 className="text-2xl font-bold text-slate-900">Article Editor</h3>
               <p className="text-slate-500 font-medium text-sm italic">Create compelling content for the Birdie network.</p>
             </div>
             <button onClick={() => setIsEditingBlog(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900"><X size={24} /></button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Post Title</label>
                  <input type="text" placeholder="e.g. Navigating Safety in Lagos" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 outline-none text-xl font-bold" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Content (WYSIWYG)</label>
                  <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 items-center">
                        <div className="flex gap-1 pr-4 border-r border-slate-200">
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><Bold size={18} /></button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><Italic size={18} /></button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><Underline size={18} /></button>
                        </div>
                        <div className="flex gap-1 pr-4 border-r border-slate-200">
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><AlignLeft size={18} /></button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><AlignCenter size={18} /></button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><AlignRight size={18} /></button>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><ListIcon size={18} /></button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><Link size={18} /></button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><ImageIcon size={18} /></button>
                        </div>
                     </div>
                     <textarea rows={16} placeholder="Start writing your article content here..." className="w-full px-8 py-6 bg-white outline-none resize-none font-medium text-slate-600 leading-relaxed" />
                  </div>
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Featured Image</label>
                  <div className="aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center p-8 space-y-4 group hover:border-[#660033]/30 transition-all cursor-pointer">
                     <ImageIcon size={40} className="text-slate-300" />
                     <p className="text-xs text-slate-500 font-medium">Click to upload featured image</p>
                     <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600">Choose File</button>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
                   <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                     <Globe size={16} className="text-[#660033]" /> SEO Settings
                   </h4>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Meta Title</label>
                        <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</label>
                        <textarea rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none" />
                      </div>
                   </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button onClick={handleSave} className="w-full py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 transition-all">Publish Post</button>
                  <button onClick={() => setIsEditingBlog(false)} className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold">Discard Draft</button>
                </div>
             </div>
           </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search posts..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#660033]/10 outline-none" />
            </div>
            <button 
              onClick={() => setIsEditingBlog(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#660033] text-white rounded-2xl font-bold shadow-lg shadow-[#660033]/20 hover:bg-[#2B0116] transition-all"
            >
              <Plus size={20} /> Add New Post
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Article</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Category</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Author</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_BLOG_POSTS.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                           <img src={post.image} alt="" className="w-full h-full object-cover" />
                         </div>
                         <p className="font-bold text-sm text-slate-900 max-w-[240px] truncate">{post.title}</p>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{post.category}</td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{post.author}</td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase">Published</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-[#660033] hover:bg-slate-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderFAQSCMS = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">Platform FAQs</h3>
          <p className="text-slate-500 text-sm font-medium italic">Update your help center content.</p>
        </div>
        {!isAddingFAQ && (
          <button 
            onClick={() => setIsAddingFAQ(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#660033] text-white rounded-2xl font-bold shadow-lg shadow-[#660033]/20 hover:bg-[#2B0116] transition-all"
          >
            <Plus size={18} /> Add New FAQ
          </button>
        )}
      </div>

      {isAddingFAQ && (
        <div className="p-8 border-2 border-slate-100 bg-slate-50/50 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center">
             <h4 className="font-bold text-slate-900">New FAQ Entry</h4>
             <button onClick={() => setIsAddingFAQ(false)} className="text-slate-400 hover:text-rose-600 transition-colors"><X size={20} /></button>
           </div>
           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Question</label>
                <input type="text" placeholder="e.g. How does Birdie vet professionals?" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Answer</label>
                <textarea rows={4} placeholder="Provide a helpful, detailed answer..." className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none" />
              </div>
           </div>
           <div className="flex justify-end gap-3">
             <button onClick={() => setIsAddingFAQ(false)} className="px-6 py-3 text-sm font-bold text-slate-500">Cancel</button>
             <button onClick={() => setIsAddingFAQ(false)} className="px-8 py-3 bg-[#660033] text-white rounded-2xl font-bold shadow-lg shadow-[#660033]/10">Save FAQ</button>
           </div>
        </div>
      )}

      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 border border-slate-100 bg-slate-50/30 rounded-[2rem] flex items-center justify-between group hover:border-[#660033]/20 transition-all">
            <div className="space-y-1 flex-1 min-w-0 pr-6">
               <p className="text-sm font-bold text-slate-900 truncate">How exactly does Birdie do?</p>
               <p className="text-xs text-slate-500 max-w-xl truncate font-medium">Birdie makes it easy for you to find trusted, skilled workers for your home or business.</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 hover:text-[#660033] border border-slate-100"><Edit3 size={16} /></button>
               <button className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-600 border border-slate-100"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNavigationCMS = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-12 animate-in fade-in duration-500">
       <div className="space-y-2">
         <h3 className="text-2xl font-bold text-slate-900">Navigation & Link Manager</h3>
         <p className="text-slate-500 font-medium italic">Control global menu links and contact schema.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <MenuIcon size={20} className="text-[#660033]" />
                <h4 className="font-bold text-slate-900">Header Menu Structure</h4>
             </div>
             <div className="space-y-4">
                {['Find Professionals', 'About Us', 'Our Story', 'Blog', 'Contact'].map((label, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-300 shadow-sm">{idx + 1}</div>
                     <input type="text" defaultValue={label} className="flex-1 bg-transparent font-bold text-sm text-slate-700 outline-none" />
                     <button className="text-slate-300 hover:text-[#660033] transition-colors"><X size={16} /></button>
                  </div>
                ))}
                <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:text-[#660033] transition-all">
                  + Add Link
                </button>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Layout size={20} className="text-[#660033]" />
                <h4 className="font-bold text-slate-900">Footer Details</h4>
             </div>
             <div className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                   <input type="email" defaultValue="support@birdie.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Office Address</label>
                   <input type="text" defaultValue="Lagos, Nigeria" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Copyright Statement</label>
                   <input type="text" defaultValue="Birdie Technologies. All rights reserved." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" />
                </div>
             </div>
          </div>
       </div>

       <div className="pt-8 border-t border-slate-50 flex justify-end">
          <button onClick={handleSave} className="px-10 py-4 bg-[#660033] text-white rounded-2xl font-bold shadow-xl shadow-[#660033]/20 transition-all">Save Navigation Schema</button>
       </div>
    </div>
  );

  const renderSEOCMS = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">Global SEO & Metadata</h3>
            <p className="text-slate-500 font-medium italic">Optimise how Birdie appears in search engines.</p>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#660033] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
            <Save size={16} /> Update SEO
          </button>
       </div>

       <div className="grid grid-cols-1 gap-6">
          {['Homepage', 'Professionals Archive', 'About Us', 'Contact Us'].map((page) => (
            <div key={page} className="p-8 border border-slate-100 bg-slate-50/50 rounded-[2.5rem] space-y-6 group hover:border-[#660033]/20 transition-all">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[#660033] shadow-sm"><Globe size={18} /></div>
                    <h4 className="text-lg font-bold text-slate-900">{page} Metadata</h4>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-emerald-100">Indexed</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Title</label>
                      <input type="text" defaultValue={`${page} | Birdie - Nigeria's #1 Service Marketplace`} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-medium text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                      <textarea rows={2} defaultValue={`Find vetted domestic staff on the Birdie ${page.toLowerCase()} page. Trust, safety, and reliability.`} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-medium text-sm resize-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">OpenGraph Image URL</label>
                      <input type="text" defaultValue={`https://birdie.com/og-${page.toLowerCase()}.jpg`} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-medium text-sm" />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                       <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                          <img src="https://picsum.photos/seed/og/100/100" alt="OG Preview" className="w-full h-full object-cover grayscale" />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">OG Preview Image loaded successfully.</p>
                    </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {[
          { id: 'pages', label: 'Pages', icon: Layout },
          { id: 'blog', label: 'Blog Editor', icon: FileText },
          { id: 'faqs', label: 'FAQs', icon: HelpCircle },
          { id: 'navigation', label: 'Navigation', icon: Navigation },
          { id: 'seo', label: 'SEO/Meta', icon: Globe }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as CMSTab); setIsAddingFAQ(false); setIsEditingBlog(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-[#660033]/5 text-[#660033] border border-[#660033]/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pages' && renderPagesCMS()}
      {activeTab === 'blog' && renderBlogCMS()}
      {activeTab === 'faqs' && renderFAQSCMS()}
      {activeTab === 'navigation' && renderNavigationCMS()}
      {activeTab === 'seo' && renderSEOCMS()}
    </div>
  );
};

export default AdminCMS;
