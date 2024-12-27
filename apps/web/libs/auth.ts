import { cache } from 'react';
import { authConfig } from './authConfig';

export const { handlers, auth: _auth, signIn, signOut, unstable_update } = authConfig;
export const auth = cache(_auth);
