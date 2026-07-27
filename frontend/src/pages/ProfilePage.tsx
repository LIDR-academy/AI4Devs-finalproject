import { useAuth } from '../auth/AuthContext';
import { AudienceSettingsSection } from '../components/settings/AudienceSettingsSection';
import { FormatSettingsSection } from '../components/settings/FormatSettingsSection';
import { GenreSettingsSection } from '../components/settings/GenreSettingsSection';
import { Card, PageHeader } from '../components/ui';
import './ProfilePage.css';

export function ProfilePage() {
  const { email } = useAuth();

  return (
    <div className="profile-page">
      <PageHeader
        title="Profile / Settings"
        subtitle="Gestiona tu cuenta y personaliza cómo clasificas tus lecturas."
      />

      <main className="profile-page__main" aria-label="Profile and settings">
        <Card title="Cuenta" className="profile-page__card">
          <dl className="profile-page__account">
            <div>
              <dt>Email</dt>
              <dd>{email ?? '—'}</dd>
            </div>
          </dl>
        </Card>

        <AudienceSettingsSection />
        <FormatSettingsSection />
        <GenreSettingsSection />
      </main>
    </div>
  );
}
