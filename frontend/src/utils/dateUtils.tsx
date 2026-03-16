import dayjs from 'dayjs';

export const validateAndFormatDate = (date: string): string | null => {
  const currentYear = dayjs().year();

  const patterns = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{2})-(\d{2})$/,
    /^(\d{4})-(\d{2})$/,
    /^(\d{2})$/,
    /^$/,
  ];

  for (const pattern of patterns) {
    const match = date.match(pattern);
    if (match) {
      if (pattern.source === /^(\d{4})-(\d{2})-(\d{2})$/.source) {
        return `${currentYear}-${match[2]}-${match[3]}`;
      } else if (pattern.source === /^(\d{2})-(\d{2})$/.source) {
        return `${currentYear}-${match[1]}-${match[2]}`;
      } else if (pattern.source === /^(\d{4})-(\d{2})$/.source) {
        return `${match[1]}-${match[2]}-01`;
      } else if (pattern.source === /^(\d{2})$/.source) {
        return `${currentYear}-${match[1]}-01`;
      } else if (pattern.source === /^$/.source) {
        return null;
      }
    }
  }

  return null;
};