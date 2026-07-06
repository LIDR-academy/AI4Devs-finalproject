export type SlideKind = 'instructional' | 'activity';

export type Slide = {
  id: string;
  lessonId: string;
  kind: SlideKind;
  title: string;
  content: string;
  position: number;
};

export type Lesson = {
  id: string;
  userId: string;
  title: string;
  slides: Slide[];
  createdAt: string;
};
