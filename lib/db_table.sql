-- contexts table
CREATE TABLE IF NOT EXISTS contexts (
  id          serial PRIMARY KEY,
  userId      text,
  chatroomId  text,
  data        jsonb,  -- Storing your "currentContext" as a JSON object
  updated_at  timestamptz DEFAULT now()
);

-- memories table
CREATE TABLE IF NOT EXISTS memories (
  id          serial PRIMARY KEY,
  userId      text,
  chatroomId  text,
  memory      text,    -- The conversation log stored as a TEXT or JSON
  updated_at  timestamptz DEFAULT now()
);

-- heads table (for sub-personas)
CREATE TABLE IF NOT EXISTS heads (
  id          serial PRIMARY KEY,
  name        text,
  status      text,
  createdAt   bigint,  -- or timestamptz if you prefer
  userId      text,
  chatroomId  text
);
