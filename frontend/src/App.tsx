import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { Asset, Business, BusinessProfile, DiscoveryForm, User } from './types';

const initialForm: DiscoveryForm = {
  businessName: '', category: '', services: '', products: '', targetAudience: '',
  tone: '', style: '', location: '', phone: '', website: '', gdprConsent: false,
};

const wizardSteps = [
  { key: 'business_identity', title: 'Business identity', fields: ['businessName', 'category'] },
  { key: 'offer', title: 'Offer', fields: ['services', 'products'] },
  { key: 'target_audience', title: 'Target audience', fields: ['targetAudience'] },
  { key: 'brand_voice', title: 'Brand voice', fields: ['tone', 'style'] },
  { key: 'contact_location', title: 'Contact and location', fields: ['location', 'phone', 'website'] },
  { key: 'consent', title: 'Consent', fields: ['gdprConsent'] },
] as const;

type View = 'auth' | 'business' | 'wizard' | 'profile' | 'assets';
type AuthMode = 'login' | 'register';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

function toPayload(form: DiscoveryForm) {
  return {
    businessName: form.businessName,
    category: form.category,
    services: form.services.split(',').map((value) => value.trim()).filter(Boolean),
    products: form.products.split(',').map((value) => value.trim()).filter(Boolean),
    targetAudience: form.targetAudience,
    tone: form.tone,
    style: form.style || undefined,
    location: form.location,
    phone: form.phone || undefined,
    website: form.website || undefined,
    gdprConsent: true as const,
  };
}

function profileToForm(nextProfile: BusinessProfile): DiscoveryForm {
  return {
    businessName: nextProfile.businessName,
    category: nextProfile.category,
    services: nextProfile.services.join(', '),
    products: nextProfile.products.join(', '),
    targetAudience: nextProfile.targetAudience,
    tone: nextProfile.tone,
    style: nextProfile.style ?? '',
    location: nextProfile.location,
    phone: nextProfile.phone ?? '',
    website: nextProfile.website ?? '',
    gdprConsent: nextProfile.gdprConsent,
  };
}

export function App() {
  const [view, setView] = useState<View>(localStorage.getItem('accessToken') ? 'business' : 'auth');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState({ email: '', name: '', password: '' });
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [form, setForm] = useState<DiscoveryForm>(initialForm);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedStep = wizardSteps[step];
  const businessLabel = useMemo(() => business?.name ?? 'Your business', [business]);

  useEffect(() => {
    if (view === 'business') {
      void loadBusinesses();
    }
  }, [view]);

  async function loadBusinesses(): Promise<void> {
    try {
      setBusinesses(await api.businesses());
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  function clearMessages(): void {
    setError('');
    setNotice('');
  }

  async function handleAuth(event: FormEvent): Promise<void> {
    event.preventDefault();
    clearMessages();
    setBusy(true);
    try {
      const response = authMode === 'login'
        ? await api.login({ email: authForm.email, password: authForm.password })
        : await api.register(authForm);
      localStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
      setView('business');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function selectBusiness(nextBusiness: Business): Promise<void> {
    clearMessages();
    setBusiness(nextBusiness);
    setBusy(true);
    try {
      const nextProfile = await api.profile(nextBusiness.id);
      setProfile(nextProfile);
      setForm(profileToForm(nextProfile));
      if (nextProfile.status === 'APPROVED') {
        setAssets(await api.assets(nextBusiness.id));
        setView('assets');
      } else {
        setView('profile');
      }
      if (nextProfile.status === 'NORMALIZED') {
        setNotice('Your canonical profile is ready for review.');
      }
    } catch (caught) {
      const message = errorMessage(caught);
      if (message.toLowerCase().includes('not found')) {
        setProfile(null);
        setForm({ ...initialForm, businessName: nextBusiness.name });
        setStep(0);
        setView('wizard');
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function createBusiness(event: FormEvent): Promise<void> {
    event.preventDefault();
    const target = event.currentTarget as HTMLFormElement;
    const input = target.elements.namedItem('businessName') as HTMLInputElement;
    clearMessages();
    setBusy(true);
    try {
      const created = await api.createBusiness(input.value);
      setBusiness(created);
      setForm({ ...initialForm, businessName: created.name });
      setProfile(null);
      setStep(0);
      setView('wizard');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  function validateStep(): string {
    if (step === 0 && (!form.businessName.trim() || !form.category.trim())) return 'Business name and category are required.';
    if (step === 1 && !form.services.split(',').map((value) => value.trim()).filter(Boolean).length) return 'Add at least one service or product.';
    if (step === 2 && form.targetAudience.trim().length < 10) return 'Target audience must be at least 10 characters.';
    if (step === 3 && form.tone.trim().length < 2) return 'Tone is required.';
    if (step === 4 && (form.location.trim().length < 2 || (form.website && !/^https?:\/\//.test(form.website)))) return 'Enter a location and a valid http(s) website, if applicable.';
    if (step === 5 && !form.gdprConsent) return 'Consent is required before continuing.';
    return '';
  }

  function nextStep(): void {
    clearMessages();
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }
    setStep((current) => Math.min(current + 1, wizardSteps.length - 1));
  }

  async function submitWizard(event: FormEvent): Promise<void> {
    event.preventDefault();
    clearMessages();
    const validation = validateStep();
    if (validation || !business) {
      setError(validation || 'Select a business first.');
      return;
    }
    setBusy(true);
    try {
      const nextProfile = await api.submitDiscovery(business.id, toPayload(form));
      setProfile(nextProfile);
      setNotice('Discovery saved and the canonical profile was normalized.');
      setView('profile');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function approveProfile(): Promise<void> {
    if (!business) return;
    clearMessages();
    setBusy(true);
    try {
      setProfile(await api.approveProfile(business.id));
      setNotice('Profile approved. Digital presence generation is now available.');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function generateAssets(): Promise<void> {
    if (!business) return;
    clearMessages();
    setBusy(true);
    try {
      await api.generate(business.id);
      setAssets(await api.assets(business.id));
      setView('assets');
      setNotice('Five assets generated and ready for review.');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function loadAssets(): Promise<void> {
    if (!business) return;
    clearMessages();
    setBusy(true);
    try {
      setAssets(await api.assets(business.id));
      setView('assets');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  function logout(): void {
    localStorage.removeItem('accessToken');
    setUser(null);
    setBusiness(null);
    setProfile(null);
    setAssets([]);
    setView('auth');
  }

  if (view === 'auth') {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <p className="eyebrow">AI BUSINESS PRESENCE BUILDER</p>
          <h1>Build a clear digital presence from what makes your business real.</h1>
          <p className="intro">A guided workspace for turning your business profile into five reviewable digital assets.</p>
          <form onSubmit={handleAuth} className="form-stack">
            {authMode === 'register' && <label>Name<input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} required minLength={2} /></label>}
            <label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label>
            <label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required minLength={8} /></label>
            {error && <p className="message error">{error}</p>}
            <button disabled={busy} type="submit">{busy ? 'Working...' : authMode === 'login' ? 'Log in' : 'Create account'}</button>
          </form>
          <button className="text-button" onClick={() => { clearMessages(); setAuthMode(authMode === 'login' ? 'register' : 'login'); }}>
            {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Log in'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">AI BUSINESS PRESENCE BUILDER</p><strong>{businessLabel}</strong></div>
        <div className="topbar-actions">{user && <span className="user-name">{user.name}</span>}<button className="secondary-button" onClick={logout}>Log out</button></div>
      </header>
      <div className="workspace">
        <nav className="step-nav" aria-label="Workflow">
          {['Business', 'Discovery', 'Profile', 'Assets'].map((label, index) => <button key={label} className={view === ['business', 'wizard', 'profile', 'assets'][index] ? 'active' : ''} onClick={() => { if (index === 0) setView('business'); if (index === 1 && business) setView('wizard'); if (index === 2 && profile) setView('profile'); if (index === 3 && profile?.status === 'APPROVED') void loadAssets(); }}>{label}</button>)}
        </nav>
        <section className="content">
          {error && <p className="message error">{error}</p>}
          {notice && <p className="message success">{notice}</p>}
          {view === 'business' && <BusinessView businesses={businesses} busy={busy} onCreate={createBusiness} onSelect={selectBusiness} />}
          {view === 'wizard' && business && <WizardView form={form} setForm={setForm} step={step} selectedStep={selectedStep} busy={busy} onBack={() => setStep((current) => Math.max(current - 1, 0))} onNext={nextStep} onSubmit={submitWizard} />}
          {view === 'profile' && profile && <ProfileView profile={profile} busy={busy} onEdit={() => setView('wizard')} onApprove={approveProfile} onGenerate={generateAssets} />}
          {view === 'assets' && <AssetsView assets={assets} busy={busy} onEdit={async (asset, title, content) => { setBusy(true); try { const updated = await api.editAsset(asset.id, title, content); setAssets((current) => current.map((item) => item.id === updated.id ? updated : item)); setNotice('Asset updated.'); } catch (caught) { setError(errorMessage(caught)); } finally { setBusy(false); } }} onRegenerate={async (asset) => { if (!business) return; setBusy(true); try { const updated = await api.regenerate(asset.id, business.id, asset.assetType); setAssets((current) => current.map((item) => item.id === updated.id ? updated : item)); setNotice('Asset regenerated from the approved profile.'); } catch (caught) { setError(errorMessage(caught)); } finally { setBusy(false); } }} />}
        </section>
      </div>
    </main>
  );
}

function BusinessView({ businesses, busy, onCreate, onSelect }: { businesses: Business[]; busy: boolean; onCreate: (event: FormEvent) => Promise<void>; onSelect: (business: Business) => Promise<void> }) {
  return <div className="section-view"><div className="section-heading"><p className="eyebrow">START HERE</p><h1>Your businesses</h1><p>Create a business, then complete the guided discovery to build its canonical profile.</p></div><form className="create-business" onSubmit={onCreate}><input name="businessName" placeholder="Business name" required minLength={2} /><button disabled={busy} type="submit">Create business</button></form>{businesses.length > 0 && <div className="business-list">{businesses.map((item) => <button className="business-row" key={item.id} onClick={() => void onSelect(item)}><span>{item.name}</span><span>{item.businessProfile?.status ?? 'DISCOVERY NEEDED'} <span aria-hidden="true">→</span></span></button>)}</div>}</div>;
}

function WizardView({ form, setForm, step, selectedStep, busy, onBack, onNext, onSubmit }: { form: DiscoveryForm; setForm: (form: DiscoveryForm) => void; step: number; selectedStep: typeof wizardSteps[number]; busy: boolean; onBack: () => void; onNext: () => void; onSubmit: (event: FormEvent) => Promise<void> }) {
  const update = (field: keyof DiscoveryForm, value: string | boolean) => setForm({ ...form, [field]: value });
  return <div className="section-view wizard-view"><div className="section-heading"><p className="eyebrow">DISCOVERY {step + 1} / {wizardSteps.length}</p><h1>{selectedStep.title}</h1><p>Answer the essentials. These validated fields become the canonical profile used for generation.</p></div><div className="progress"><span style={{ width: `${((step + 1) / wizardSteps.length) * 100}%` }} /></div><form className="form-stack" onSubmit={step === wizardSteps.length - 1 ? onSubmit : (event) => { event.preventDefault(); onNext(); }}>
    {selectedStep.key === 'business_identity' && <><label>Business name<input value={form.businessName} onChange={(event) => update('businessName', event.target.value)} required /></label><label>Category<input value={form.category} onChange={(event) => update('category', event.target.value)} required /></label></>}
    {selectedStep.key === 'offer' && <><label>Services or products offered <span className="hint">Separate items with commas</span><textarea value={form.services} onChange={(event) => update('services', event.target.value)} required /></label><label>Products <span className="hint">Optional, separate items with commas</span><textarea value={form.products} onChange={(event) => update('products', event.target.value)} /></label></>}
    {selectedStep.key === 'target_audience' && <label>Target audience<textarea value={form.targetAudience} onChange={(event) => update('targetAudience', event.target.value)} required minLength={10} /></label>}
    {selectedStep.key === 'brand_voice' && <><label>Tone<input value={form.tone} onChange={(event) => update('tone', event.target.value)} required /></label><label>Style <span className="hint">Optional</span><input value={form.style} onChange={(event) => update('style', event.target.value)} /></label></>}
    {selectedStep.key === 'contact_location' && <><label>Location<input value={form.location} onChange={(event) => update('location', event.target.value)} required /></label><label>Phone <span className="hint">Optional</span><input value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label><label>Website <span className="hint">Optional, include https://</span><input type="url" value={form.website} onChange={(event) => update('website', event.target.value)} /></label></>}
    {selectedStep.key === 'consent' && <label className="consent"><input type="checkbox" checked={form.gdprConsent} onChange={(event) => update('gdprConsent', event.target.checked)} /><span>I consent to processing this business profile for the generation workflow.</span></label>}
    <div className="form-actions">{step > 0 && <button className="secondary-button" type="button" onClick={onBack}>Back</button>}<button disabled={busy} type="submit">{busy ? 'Saving...' : step === wizardSteps.length - 1 ? 'Save discovery' : 'Continue'}</button></div>
  </form></div>;
}

function ProfileView({ profile, busy, onEdit, onApprove, onGenerate }: { profile: BusinessProfile; busy: boolean; onEdit: () => void; onApprove: () => Promise<void>; onGenerate: () => Promise<void> }) {
  return <div className="section-view"><div className="section-heading"><p className="eyebrow">CANONICAL PROFILE</p><h1>Review {profile.businessName}</h1><p>AI generation can use this profile only after you approve it.</p></div><div className="profile-grid">{[['Category', profile.category], ['Services', profile.services.join(', ')], ['Products', profile.products.join(', ') || 'Not provided'], ['Audience', profile.targetAudience], ['Tone', profile.tone], ['Style', profile.style || 'Not provided'], ['Location', profile.location], ['Phone', profile.phone || 'Not provided'], ['Website', profile.website || 'Not provided']].map(([label, value]) => <div className="profile-field" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="form-actions"><span className={`status status-${profile.status.toLowerCase()}`}>{profile.status}</span><button className="secondary-button" onClick={onEdit}>Edit discovery</button>{profile.status === 'NORMALIZED' && <button disabled={busy} onClick={() => void onApprove()}>Approve profile</button>}{profile.status === 'APPROVED' && <button disabled={busy} onClick={() => void onGenerate()}>Generate digital presence</button>}</div></div>;
}

function AssetsView({ assets, busy, onEdit, onRegenerate }: { assets: Asset[]; busy: boolean; onEdit: (asset: Asset, title: string, content: string) => Promise<void>; onRegenerate: (asset: Asset) => Promise<void> }) {
  const [drafts, setDrafts] = useState<Record<string, { title: string; content: string }>>({});
  useEffect(() => setDrafts(Object.fromEntries(assets.map((asset) => [asset.id, { title: asset.title, content: asset.content }]))), [assets]);
  return <div className="section-view"><div className="section-heading"><p className="eyebrow">DIGITAL PRESENCE</p><h1>Review your five assets</h1><p>Every asset is grounded in the approved canonical profile and can be edited before use.</p></div>{assets.length === 0 ? <div className="empty-state">No assets yet. Approve your profile and generate the digital presence.</div> : <div className="asset-list">{assets.map((asset) => { const draft = drafts[asset.id] ?? { title: asset.title, content: asset.content }; return <article className="asset-card" key={asset.id}><div className="asset-card-heading"><div><p className="asset-type">{asset.assetType.replace(/_/g, ' ')}</p><span className="status">{asset.status}</span></div><button className="secondary-button" disabled={busy} onClick={() => void onRegenerate(asset)}>Regenerate</button></div><label>Title<input value={draft.title} onChange={(event) => setDrafts({ ...drafts, [asset.id]: { ...draft, title: event.target.value } })} /></label><label>Content<textarea rows={6} value={draft.content} onChange={(event) => setDrafts({ ...drafts, [asset.id]: { ...draft, content: event.target.value } })} /></label><button disabled={busy} onClick={() => void onEdit(asset, draft.title, draft.content)}>Save edit</button></article>; })}</div>}</div>;
}
