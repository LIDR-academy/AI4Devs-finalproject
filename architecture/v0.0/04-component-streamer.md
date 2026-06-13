```
+--------------------------+   publisher stream     +-----------------------------+
|       LiveKit SFU         | <---------------------|           Stream            |
| [Container: WebRTC media] |                       |   [Component: Go package]   |
|                           | <---+                 +-----------------------------+
+--------------------------+     | subscribe
                                 | stream (watch)
                                 |                  +-----------------------------+           +----------+
                          create/delete   +-------> |           Rooms             |---------> |  Valkey  |
                          rooms [JSON,HTTP]|        |   [Component: Go package]   |           |          |
                                 |                  +-----------------------------+           |          |
                       +---------+                                                            |          |
                       |              write/read     +-----------------------------+          |          |
                       |              messages    +->|           Chats              |-------> |          |
                       |              [Websocket] |  |   [Component: Go package]    |         +----------+
+--------------------------+                      |  +-----------------------------+
|     QuickChat Portal      |----------------------+
| [Container: TS, Vite,     |                         +-----------------------------+
|  VanJS]                   |                         |            Auth              |
|                           |                         |   [Component: Go package]    |
+--------------------------+                          +-----------------------------+
                       |                                      ^            |
                       |   ask for room's token               |            | request for token
                       +--------------------------------------+            | [JSON, HTTP]
                           [JSON, HTTP]                                    v
                                                          +-------------------------+
                                                          |        Security         |
                                                          |   [Container: Go API]   |
                                                          +-------------------------+

(all Go-package components sit inside the Streamer container boundary; LiveKit, Valkey, and Security are outside it)


```
