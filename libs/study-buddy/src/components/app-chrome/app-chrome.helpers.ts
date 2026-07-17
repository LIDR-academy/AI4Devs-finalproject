export const getMobileTitleKey = (pathname: string) => {
  if (pathname === '/upload') return 'nav.newLesson';
  if (pathname === '/settings') return 'nav.settings';
  return 'nav.myLessons';
};
