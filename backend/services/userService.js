import crypto from 'node:crypto';
import { supabase } from '../supabase.js';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createUser({ username, email, password }) {
  const userId = `user_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const passwordHash = hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      user_id: userId,
      username,
      email,
      password_hash: passwordHash
    })
    .select('id, user_id, username, email, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Username or email already exists');
    }
    throw new Error(error.message);
  }

  return data;
}

export async function loginUser({ email, password }) {
  const passwordHash = hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, username, email, password_hash, created_at')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('User not found');
  }

  if (data.password_hash !== passwordHash) {
    throw new Error('Wrong password');
  }

  return {
    id: data.id,
    user_id: data.user_id,
    username: data.username,
    email: data.email,
    created_at: data.created_at
  };
}

export async function getUserByInternalId(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, username, email, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('User not found');
  }

  return data;
}

export async function getUserByPublicId(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, username, email')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
