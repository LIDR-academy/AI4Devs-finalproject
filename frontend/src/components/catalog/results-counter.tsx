interface ResultsCounterProps {
  total: number;
}

export function ResultsCounter({ total }: ResultsCounterProps) {
  return (
    <p className="text-sm text-gray-500 mb-4">
      {total} productos encontrados
    </p>
  );
}
