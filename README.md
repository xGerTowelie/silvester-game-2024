# Silvester Game 2024

- Idea from: Duell um die Geld

- lobby with gamemonitor/player/gamemaster clients
- qr code to join game with session id
- player
- text input for guess
- quit round

- player
  - current player turn
  - call, raise, out
  - chips to set
  - current bank
  - session in storage

- monitor
  - qr code to join
  - current question
  - current hints
  - solution
  - current 

- game master
  - need password to enter
  - create sessions
  - kill sessions
  - change bank
  - control question, steps, decline question

- real time implementaion with supabase
  - update all clients with the needed infos
