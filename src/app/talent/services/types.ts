export type ServiceType = 'resume' | 'linkedin' | 'interview';

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // in SAR
  detailedDescription: string;
  icon: string;
  features: string[];
}

export interface QuestionnaireData {
  name: string;
  email: string;
  currentRole: string;
  yearsOfExperience: string;
  careerGoal: string;
  currentChallenge: string;
  resumeFile?: File;
}

export interface ScheduleData {
  date: string;
  time: string;
  timezone: string;
}

export interface BookingData {
  service: Service;
  questionnaire: QuestionnaireData;
  schedule: ScheduleData;
  paymentStatus: 'pending' | 'completed';
}

export const SERVICES: Service[] = [
  {
    id: 'resume',
    name: 'Resume Review + Call',
    description: 'Get expert feedback on your resume with a personalized consultation call',
    duration: 30,
    price: 200,
    detailedDescription: 'Our expert will review your resume and provide actionable feedback to help you stand out. The 30-minute call will cover structure, content, ATS optimization, and industry-specific best practices.',
    icon: '📄',
    features: [
      'Comprehensive resume review',
      'ATS optimization tips',
      'Content and structure feedback',
      '30-minute personalized call',
      'Written feedback summary'
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Optimization + Call',
    description: 'Optimize your LinkedIn profile to attract recruiters and opportunities',
    duration: 30,
    price: 200,
    detailedDescription: 'Transform your LinkedIn profile into a powerful personal brand. We\'ll optimize your headline, summary, experience, and skills to increase visibility and attract the right opportunities.',
    icon: '💼',
    features: [
      'Profile headline optimization',
      'Compelling summary writing',
      'Experience section enhancement',
      'Skills and endorsements strategy',
      '30-minute strategy call'
    ]
  },
  {
    id: 'interview',
    name: 'Interview Preparation',
    description: 'Ace your interviews with expert coaching and practice sessions',
    duration: 45,
    price: 300,
    detailedDescription: 'Prepare for your upcoming interviews with comprehensive coaching. We\'ll practice common questions, behavioral scenarios, technical discussions, and provide feedback on your responses and delivery.',
    icon: '🎯',
    features: [
      'Mock interview practice',
      'Behavioral question coaching',
      'Technical interview preparation',
      'Body language and delivery tips',
      '45-minute intensive session',
      'Post-session feedback document'
    ]
  }
];

export const YEARS_OF_EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
];


