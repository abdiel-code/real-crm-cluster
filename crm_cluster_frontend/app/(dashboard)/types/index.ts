export type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  account_id: number | null;
  user_id: number;
  created_at: string;
};

export type Account = {
  id: number;
  name: string;
  industry: string | null;
  user_id: number;
  created_at: string;
};

export type Business = {
  id: number;
  contact_id: number | null;
  user_id: number;
  title: string;
  amount: string;
  stage: string;
  created_at: string;
};
