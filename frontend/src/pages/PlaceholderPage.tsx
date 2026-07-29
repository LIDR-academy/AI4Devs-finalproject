import './PlaceholderPage.css';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="placeholder-page__note">Este módulo está previsto en una versión futura.</p>
    </div>
  );
}
