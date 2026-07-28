import { useQuery } from '@tanstack/react-query';
import { getAnnualGoal } from '../api/client';
import { AnnualGoalCard } from '../components/AnnualGoalCard';
import { HomeMonthlyKpisCard } from '../components/HomeMonthlyKpisCard';
import { HomeReadingCard } from '../components/HomeReadingCard';
import { HomeTbrCard } from '../components/HomeTbrCard';
import { PageHeader } from '../components/ui';
import './HomePage.css';

function currentUtcYear(): number {
  return new Date().getUTCFullYear();
}

export function HomePage() {
  const year = currentUtcYear();

  const { data, isLoading, error } = useQuery({
    queryKey: ['goals', year],
    queryFn: () => getAnnualGoal(year),
  });

  return (
    <div className="home-page">
      <PageHeader
        title="Analítica de lectura"
        subtitle="Resumen visual de tu progreso lector actual."
      />

      <main className="home-main" aria-label="Resumen de inicio">
        <section className="home-layout" aria-label="Secciones principales">
          <div className="home-layout__reading">
            <HomeReadingCard />
          </div>

          <div className="home-layout__side">
            <div className="home-layout__top">
              <HomeMonthlyKpisCard />

              <section
                className="home-card home-card--goal"
                aria-label={`Meta anual ${year}`}
              >
                <AnnualGoalCard
                  year={year}
                  data={data}
                  isLoading={isLoading}
                  error={error}
                />
              </section>
            </div>

            <HomeTbrCard />
          </div>
        </section>
      </main>
    </div>
  );
}
