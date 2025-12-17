# Multiplayer Chess Engine

## Socket

- ws library is used (raw socket)
- namespace = /socket
- PORT = process.env.PORT (default 8080)
- socketIds are integers and are recycled

## Auth

- First come first server basis
- Connection not allowed when room is full

## Rooms

### Creation

- anyone can create room
- person can choose which color they want (defaults to white)
- roomIds are integers and are recycled

### Joining

- anyone who has roomId can join the room
- if the room is ful the person cannot join
- if the first player is white then the one joining gets black

### Leaving

- room auto-leave on diconnect (game stays where it was so it can be continued from that point)
- on leaving it informs the other player about player leaving
- if both players leave room is destroyed and roomId is recycled

## Chess Engine

### Move Validation

- Enforces move only on turn
- Should be within bounds
- Cannot move onto your own piece
- The "from" position must have a piece
- The piece should be yours
- Cannot Promote to Opponent's piece
- Cannot promote to pawn or king
- Cannot Promote anything other than pawn

### Engine

😭 i dont wanna write anymore documentation about engine , the rest is complete

## Protocol

**Structure**

```json
{
  "type": "Event",
  "data": "Params" | "Payload"
}
```

### Server (internal)

**connection**

- Triggered on client connection

**close**

- Triggered on client disconnection

### Server -> Client

- **Chess board**
  Event: board

  Payload:

  ```json
  { "board": [[]] }
  ```

  Body:
  A double dimensional array (8x8)
  which can have values :

  ```json
  null, "bk", "bn", "bb", "bq", "bp", "br",
  "wk", "wn", "wb", "wq", "wp", "wr"
  ```

  the first char denotes the color, and the rest denote the piece

### Client -> Server

- **ping**
  Params: none

  Response: pong

- **RoomCreation**
  Event = createRoom

  Params:

  ```jsonc
  {
    "color" : "white"  "black"  //default: white
  }
  ```

- **Joining Room**
  Event = joinRoom

  Params:

  ```json
  { "roomId": "number" }
  ```

  Responses:

  ```jsonc
  { "message": "Room not found" }

  { "message": "Joined Room Successfully" }

  { "message": "Room is full" }
  ```

- **Leaveing Room**
  Event = leaveRoom

  Response:

  ```json
  { "message": "Left Room Succesfully" }
  ```

  then alerts the other player

  ```jsonc
  {
    "color": "white" "black" //color of leaving player
   }
  ```

- **move**
  Event = move

  Params:

  ```jsonc
  {
    "from": { "x": "number", "y": "number" },
    "to": { "x": "number", "y": "number" },
    "promoteTo" : "Knight" "Queen" "Bisop" "Rook" //only when moving from to the last row
  }
  ```

  Response: sends chessboard to both when either takes the turn
