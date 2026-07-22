```
   +-------------+   +-------------+   +-------------+
   |    login    |   | streamings  |   |    room     |
   | [TS package]|   | [TS package]|   | [TS package]|
   +-------------+   +-------------+   +-------------+
          |                |              |   ^
          | login          | lists        |   | media
          | [JSON/HTTP]    | streams      |   | [WebRTC]
          |                | [JSON/HTTP]  |   |
          |                |        chats |   |
          |                |   [WebSocket]|   |
          v                v              v   |
   +-------------+      +------------------+  +------------------+
   |  Security   |      |     Streamer     |  |   LiveKit SFU    |
   | [Go API]    |      | [Go API]         |  | [WebRTC media]   |
   +-------------+      | rooms, chat WS   |  +------------------+
                        +------------------+

```
