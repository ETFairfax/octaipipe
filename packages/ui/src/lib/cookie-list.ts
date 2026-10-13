type OtherCookie = {
  id: string;
  name: string;
  description: string;
};

const COOKIE_LIST: OtherCookie[] = [
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Helps us understand how visitors use the site so we can improve it.'
  }
];

export type { OtherCookie };
export { COOKIE_LIST };
