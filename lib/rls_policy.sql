-- Drop existing policies for Feedback Entries
DROP POLICY IF EXISTS "Allow feedback select" ON feedback_entries;
DROP POLICY IF EXISTS "Allow feedback insert" ON feedback_entries;

-- Drop existing policies for Contexts
DROP POLICY IF EXISTS "Allow context select" ON contexts;
DROP POLICY IF EXISTS "Allow context insert" ON contexts;

-- Drop existing policies for Task Cards
DROP POLICY IF EXISTS "Allow task card select" ON task_cards;
DROP POLICY IF EXISTS "Allow task card insert" ON task_cards;

-- Drop existing policies for Heads (previously Subpersonas)
DROP POLICY IF EXISTS "Allow head select" ON heads;
DROP POLICY IF EXISTS "Allow head insert" ON heads;

-- Drop existing policies for Subtasks
DROP POLICY IF EXISTS "Allow subtask select" ON subtasks;
DROP POLICY IF EXISTS "Allow subtask insert" ON subtasks;

-- Drop existing policies for Task Dependencies
DROP POLICY IF EXISTS "Allow task dependency select" ON task_dependencies;

-- Drop existing policies for Memories
DROP POLICY IF EXISTS "Allow memory select" ON memories;
DROP POLICY IF EXISTS "Allow memory insert" ON memories;

-- Drop existing policies for Gauge Metrics
DROP POLICY IF EXISTS "Allow gauge metric select" ON gauge_metrics;
DROP POLICY IF EXISTS "Allow gauge metric insert" ON gauge_metrics;

-- Drop existing policies for Debug Logs
DROP POLICY IF EXISTS "Allow debug log select" ON debug_logs;
DROP POLICY IF EXISTS "Allow debug log insert" ON debug_logs;

-- Drop existing policies for Templates
DROP POLICY IF EXISTS "Allow template select" ON templates;
DROP POLICY IF EXISTS "Allow template insert" ON templates;

-- Feedback Entries
CREATE POLICY "Allow feedback select" ON feedback_entries
  FOR SELECT
  USING (response_id IS NOT NULL);

CREATE POLICY "Allow feedback insert" ON feedback_entries
  FOR INSERT
  WITH CHECK (response_id IS NOT NULL);

-- Contexts
CREATE POLICY "Allow context select" ON contexts
  FOR SELECT
  USING ((user_id IS NOT NULL) AND (chatroom_id IS NOT NULL));

CREATE POLICY "Allow context insert" ON contexts
  FOR INSERT
  WITH CHECK ((user_id IS NOT NULL) AND (chatroom_id IS NOT NULL));

-- Task Cards
CREATE POLICY "Allow task card select" ON task_cards
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.user_id = task_cards.user_id
      AND contexts.chatroom_id = task_cards.chatroom_id
  ));

CREATE POLICY "Allow task card insert" ON task_cards
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.user_id = task_cards.user_id
      AND contexts.chatroom_id = task_cards.chatroom_id
  ));

-- Heads
CREATE POLICY "Allow head select" ON heads
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.user_id = heads.user_id
      AND contexts.chatroom_id = heads.chatroom_id
  ));

CREATE POLICY "Allow head insert" ON heads
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.user_id = heads.user_id
      AND contexts.chatroom_id = heads.chatroom_id
  ));

-- Subtasks
CREATE POLICY "Allow subtask select" ON subtasks
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM task_cards
    WHERE task_cards.id = subtasks.task_card_id
      AND EXISTS (
        SELECT 1
        FROM contexts
        WHERE contexts.user_id = task_cards.user_id
          AND contexts.chatroom_id = task_cards.chatroom_id
      )
  ));

CREATE POLICY "Allow subtask insert" ON subtasks
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM task_cards
    WHERE task_cards.id = subtasks.task_card_id
  ));

-- Task Dependencies
CREATE POLICY "Allow task dependency select" ON task_dependencies
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM subtasks
    WHERE subtasks.id = task_dependencies.subtask_id
      AND EXISTS (
        SELECT 1
        FROM task_cards
        WHERE task_cards.id = subtasks.task_card_id
          AND EXISTS (
            SELECT 1
            FROM contexts
            WHERE contexts.user_id = task_cards.user_id
              AND contexts.chatroom_id = task_cards.chatroom_id
          )
      )
  ));

-- Memories
CREATE POLICY "Allow memory select" ON memories
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.user_id = memories.user_id
      AND contexts.chatroom_id = memories.chatroom_id
  ));

CREATE POLICY "Allow memory insert" ON memories
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.user_id = memories.user_id
      AND contexts.chatroom_id = memories.chatroom_id
  ));

-- Gauge Metrics
CREATE POLICY "Allow gauge metric select" ON gauge_metrics
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM heads
    WHERE heads.id = gauge_metrics.head_id
      AND EXISTS (
        SELECT 1
        FROM contexts
        WHERE contexts.user_id = heads.user_id
          AND contexts.chatroom_id = heads.chatroom_id
      )
  ));

CREATE POLICY "Allow gauge metric insert" ON gauge_metrics
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM heads
    WHERE heads.id = gauge_metrics.head_id
  ));

-- Debug Logs
CREATE POLICY "Allow debug log select" ON debug_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.id = debug_logs.context_id
  ));

CREATE POLICY "Allow debug log insert" ON debug_logs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM contexts
    WHERE contexts.id = debug_logs.context_id
  ));

-- Templates
CREATE POLICY "Allow template select" ON templates
  FOR SELECT
  USING (true);

CREATE POLICY "Allow template insert" ON templates
  FOR INSERT
  WITH CHECK (true);