import { init } from '@instantdb/admin';
import schema, { AppSchema } from '../instant/shcmea';

export const db = init<AppSchema>({
  appId: '1f16bfac-dee7-40f1-90e3-613be9c5685b',
  adminToken: 'c47889e2-9ae5-4385-aa3f-98fe8506c8a5',
  schema,
});