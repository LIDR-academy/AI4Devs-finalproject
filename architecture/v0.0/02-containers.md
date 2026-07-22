```
        O                    O
       /|\                  /|\
       / \                  / \
   publishers           subscribers
       |                    |
       +---------+----------+
                 v
   +-------------------------------+        +-----------------------------+
   |        QuickChat Portal        | -----> |         LiveKit SFU          |
   |   [Container: TS, Vite, VanJS] |        |  [Container: WebRTC media]   |
   +-------------------------------+        +-----------------------------+
          |              |                            |
          |              | list/manage streams        | (media)
          | ask for      | [JSON, HTTP]               v
          | magic link   |              +-----------------------------+      +---------+
          | to auth      |              |          Streamer            | ---> | Valkey  |
          | [JSON,HTTP]  |              |    [Container: Go API]       |      +---------+
          |              |              |       rooms, chat WS         |
          |              +------------> |                              |
          |                             +-----------------------------+
          |                                          |
          v                                          | Ask for JWT
   +-------------------------+                        | stream-room
   |        Security          | <----------------------+
   |   [Container: Go API]    |
   +-------------------------+
       |            ^
       |            | commands for
       |            | user creation
       |            | when it's new
       |            |
       |     +-------------------------+
       |     |         Users            |
       |     |   [Container: Go API]    |
       |     +-------------------------+
       |                 |
       |                 v
       |          +-------------+
       |          |  [MongoDB]  |
       |          +-------------+
       v
   +------------------+
   |   SuperTokens     |
   |    [System]       |
   +------------------+

  (dashed boundary = QuickChat system; all containers except the two [System] externals sit inside it)
  ```
