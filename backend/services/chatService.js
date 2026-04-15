import { supabase } from '../supabase.js';

function buildConversationKey(userA, userB) {
  return [userA, userB].sort().join('__');
}

export async function sendMessage({ fromUserId, toUserId, text }) {
  const conversationKey = buildConversationKey(fromUserId, toUserId);

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_key: conversationKey,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      text
    })
    .select('id, conversation_key, from_user_id, to_user_id, text, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getDialogs(currentUserId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_key, from_user_id, to_user_id, text, created_at')
    .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map();

  for (const message of data) {
    const partner = message.from_user_id === currentUserId ? message.to_user_id : message.from_user_id;
    if (!map.has(partner)) {
      map.set(partner, message);
    }
  }

  return Array.from(map.entries()).map(([partnerId, message]) => ({
    partnerId,
    lastMessage: message.text,
    createdAt: message.created_at,
    fromUserId: message.from_user_id,
    toUserId: message.to_user_id
  }));
}

export async function getMessages(currentUserId, partnerId) {
  const conversationKey = buildConversationKey(currentUserId, partnerId);

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_key, from_user_id, to_user_id, text, created_at')
    .eq('conversation_key', conversationKey)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
