```
    +-------------------------+         +-------------------------+
   |          User            |         |         Tokens          |
   | [Component: Go package]  |         | [Component: Go package] |
   +--------------------------+         +-------------------------+
              |                                     ^
              | generates                           | Request
              | magic link                          | token's room
              | [SDK]                               |
              v                                     |
   +------------------+                  +-------------------------+
   |   SuperTokens    |                  |        Streamer         |
   |    [System]      |                  |   [Container: Go API]   |
   +------------------+                  |      rooms, chat WS     |
                                         +-------------------------+

(User and Tokens are components inside the Security container; SuperTokens and Streamer are outside it)

```
