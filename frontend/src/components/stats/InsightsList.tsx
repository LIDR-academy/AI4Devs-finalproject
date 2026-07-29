import type { StatsInsight } from '../../api/types';
import './InsightsList.css';

export interface InsightsListProps {
  insights: StatsInsight[];
  periodScope: string;
}

export function InsightsList({ insights, periodScope }: InsightsListProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <section
      className="insights-list"
      aria-label={`Insights automáticos ${periodScope}`}
    >
      <h2 className="insights-list__heading">Insights automáticos</h2>
      <ul className="insights-list__items">
        {insights.map((insight) => (
          <li key={insight.id}>
            <article className="insights-list__card" aria-labelledby={`insight-${insight.id}`}>
              <h3 className="insights-list__title" id={`insight-${insight.id}`}>
                {insight.title}
              </h3>
              <p className="insights-list__body">{insight.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
