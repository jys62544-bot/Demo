CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT,
  storage_key TEXT,
  uploader_id INTEGER,
  uploader_name TEXT,
  device_name TEXT,
  process_name TEXT,
  scene_type TEXT,
  is_abnormal INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'none',
  tags TEXT,
  description TEXT,
  text_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  knowledge_type TEXT,
  source_file_id INTEGER,
  device_name TEXT,
  process_name TEXT,
  contributor_id INTEGER,
  contributor_name TEXT,
  tags TEXT,
  status TEXT DEFAULT 'pending',
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contribution_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  action_type TEXT,
  points INTEGER,
  related_file_id INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  role_type TEXT,
  question TEXT,
  answer TEXT,
  mode TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abnormal_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_file_id INTEGER,
  title TEXT,
  device_name TEXT,
  process_name TEXT,
  risk_level TEXT,
  uploader_id INTEGER,
  uploader_name TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  ai_suggestion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploader_id ON uploaded_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_source_file_id ON knowledge_items(source_file_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON contribution_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_abnormal_source_file_id ON abnormal_cases(source_file_id);
