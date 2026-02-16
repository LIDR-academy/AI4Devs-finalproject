import { getTranslations } from 'next-intl/server';
import HomeHeroActions from '@/app/components/home/HomeHeroActions';

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('home');
  const { locale } = params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6">
      <section className="rounded-2xl bg-gradient-to-r from-[#0f9a86] to-[#17b69f] px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-medium uppercase tracking-wide text-white/90">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-2xl text-white/90">{t('subtitle')}</p>
        <HomeHeroActions
          locale={locale}
          ctaSearch={t('ctaSearch')}
          ctaDoctor={t('ctaDoctor')}
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">{t('kpiDoctors')}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">+350</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">{t('kpiAppointments')}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">+1,200</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">{t('kpiSpecialties')}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">+45</p>
        </article>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{t('feature1Title')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('feature1Body')}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{t('feature2Title')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('feature2Body')}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{t('feature3Title')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('feature3Body')}</p>
        </article>
      </section>
    </div>
  );
}
