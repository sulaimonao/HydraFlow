ALTER TABLE contexts RENAME COLUMN "userid" TO user_id;
ALTER TABLE contexts RENAME COLUMN "chatroomid" TO chatroom_id;

ALTER TABLE memories RENAME COLUMN "userid" TO user_id;
ALTER TABLE memories RENAME COLUMN "chatroomid" TO chatroom_id;

ALTER TABLE heads RENAME COLUMN "userid" TO user_id;
ALTER TABLE heads RENAME COLUMN "chatroomid" TO chatroom_id;
