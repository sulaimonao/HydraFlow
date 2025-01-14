import supabase from './supabaseClient';

/**
 * Sets the user and chatroom context for Supabase.
 * @param {string} user_id - User's UUID.
 * @param {string} chatroom_id - Chatroom's UUID.
 */
export const setContext = async (user_id, chatroom_id) => {
  try {
    if (!user_id || !chatroom_id) {
      throw new Error("user_id and chatroom_id are required to set context.");
    }

    await supabase.rpc('set_config', { key: 'app.user_id', value: user_id });
    await supabase.rpc('set_config', { key: 'app.chatroom_id', value: chatroom_id });

    console.log(`🛠️ Context set: user_id=${user_id}, chatroom_id=${chatroom_id}`);
  } catch (err) {
    console.error("⚠️ Failed to set context:", err.message);
    throw err;
  }
};
