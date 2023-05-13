ALTER TABLE rankings DROP CONSTRAINT rankings_pkey;
ALTER TABLE rankings ADD PRIMARY KEY (username, created_at);
