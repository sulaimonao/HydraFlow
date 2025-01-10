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
  USING (true); -- Assuming templates are universally accessible

CREATE POLICY "Allow template insert" ON templates
  FOR INSERT
  WITH CHECK (true); -- Assuming no user restrictions on template creation
