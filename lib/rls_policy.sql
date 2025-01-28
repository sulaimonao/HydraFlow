-- lib/rls_policy.sql
-- This file contains the row-level security policies for the database.
-- It is intended to be run as a single script to ensure that all policies are applied.
-- API key need to be manually applied to CUSTOMGPT_API_KEY 

-- ✅ Allow anon users to access their own data
CREATE POLICY "Access own data in contexts"
ON public.contexts
FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = contexts.user_id 
               AND user_sessions.chatroom_id = contexts.chatroom_id));

CREATE POLICY "Allow access if IDs are present"
ON public.debug_logs
FOR SELECT
TO anon, authenticated
USING (true);  -- Adjust the condition as needed

CREATE POLICY "Allow access if IDs are present"
ON public.feedback_entries
FOR SELECT
TO anon, authenticated
USING (true);  -- Adjust the condition as needed

CREATE POLICY "Allow access if IDs are present"
ON public.gauge_metrics
FOR SELECT
TO anon, authenticated
USING (true);  -- Adjust the condition as needed

CREATE POLICY "Allow access if IDs are present"
ON public.heads
FOR SELECT
TO anon, authenticated
USING (true);  -- Adjust the condition as needed

CREATE POLICY "Access own data in memories"
ON public.memories
FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = memories.user_id 
               AND user_sessions.chatroom_id = memories.chatroom_id));

CREATE POLICY "Access own data in task_cards"
ON public.task_cards
FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = task_cards.user_id 
               AND user_sessions.chatroom_id = task_cards.chatroom_id));

-- ✅ Modify policies to match user_sessions instead of auth.uid()
CREATE OR REPLACE POLICY "Strict access to heads for select"
ON public.heads
FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = heads.user_id 
               AND user_sessions.chatroom_id = heads.chatroom_id));

CREATE OR REPLACE POLICY "Strict access to task_cards for select"
ON public.task_cards
FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = task_cards.user_id 
               AND user_sessions.chatroom_id = task_cards.chatroom_id));

-- ✅ Ensure anon users can read their own data
CREATE POLICY "Allow anon users to read own data"
ON public.contexts
FOR SELECT
TO anon
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = contexts.user_id 
               AND user_sessions.chatroom_id = contexts.chatroom_id));

CREATE POLICY "Allow anon users to read own data"
ON public.memories
FOR SELECT
TO anon
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = memories.user_id 
               AND user_sessions.chatroom_id = memories.chatroom_id));

CREATE POLICY "Allow anon users to read own data"
ON public.task_cards
FOR SELECT
TO anon
USING (EXISTS (SELECT 1 FROM user_sessions 
               WHERE user_sessions.user_id = task_cards.user_id 
               AND user_sessions.chatroom_id = task_cards.chatroom_id));