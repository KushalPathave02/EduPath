export interface Question {
  id: string;
  question: string;
  options: string[];
}

export interface RoadmapTopic {
  id: string;
  title: string;
}

export interface Interview {
  id: string;
  domain: string;
  interviewer: string;
  date: string;
  status: 'scheduled' | 'completed' | 'canceled';
}
