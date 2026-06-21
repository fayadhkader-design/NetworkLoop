export const CONTACT_STATUSES = [
  'Reached out',
  'Responded',
  'Call scheduled',
  'Spoke with them',
  'Follow-up needed',
  'Strong connection',
  'Not interested',
] as const;

export const CONVERSATION_TYPES = [
  'Networking call',
  'Interview',
  'Coffee chat',
  'Recruiter email',
  'Follow-up',
  'Other',
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  industry: string | null;
  status: ContactStatus;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  contact_id: string;
  conversation_date: string;
  conversation_type: ConversationType;
  notes: string | null;
  next_step: string | null;
  created_at: string;
};

export type ContactFormValues = {
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin_url: string;
  industry: string;
  status: ContactStatus;
  notes: string;
  follow_up_date: string;
};
