import Constants from "./Constants";
import Alert from "react-native";
import PlaySound from "../PlaySounds";
var messageProgression = 0;
var stuckInDialogue = false;
export default function (entities, { events, dispatch }) {
  const head = entities.head;
  const key = entities.key;
  const door = entities.door;
  const dialoguePrompt = entities.dialoguePrompt;
  const dialogue = entities.dialogue;
  head.nextMove -= 1;
  if (events.length) {
    events.forEach((e) => {
      switch (e) {
        case "move-up":
          if (stuckInDialogue) break;
          if (head.orientation == 3) {
            head.yPos = -1;
            head.xPos = 0;
            head.nextMove = 0;
          }
          else {
            head.orientation = 3;
          }
          return;
        case "move-right":
          if (stuckInDialogue) break;
          if (head.orientation == 4) {
            head.xPos = 1;
            head.yPos = 0;
            head.nextMove = 0;
          }
          else {
            head.orientation = 4;
          }
          return;
        case "move-down":
          if (stuckInDialogue) break;
          if (head.orientation == 1) {
            head.yPos = 1;
            head.xPos = 0;
            head.nextMove = 0;
          }
          else {
            head.orientation = 1;
          }
          return;
        case "move-left":
          if (stuckInDialogue) break;
          if (head.orientation == 2) {
            head.xPos = -1;
            head.yPos = 0;
            head.nextMove = 0;
          }
          else {
            head.orientation = 2;
          }
          return;
        case "a":
          if ((head.position[0] - 1 == key.position[0] || head.position[0] + 1 == key.position[0]) && head.position[1] == key.position[1]) {
            stuckInDialogue = true;
            messageProgression++
            if (messageProgression == 5) {
              PlaySound('loadedGame')
              key.keyTaken = 1
            }
            if (messageProgression == 6 && !head.keyGrabbed) {
              messageProgression = 5
              head.keyGrabbed = true;
              dialogue.display = 0
              stuckInDialogue = false;
            }
            else if (messageProgression == 6 && !door.locked) {
              messageProgression = 9
              dialogue.display = 1
              dialogue.dialogueNumber = messageProgression
            }
            else if (messageProgression == 9 && door.locked) {
              messageProgression = 5
              dialogue.display = 0
              stuckInDialogue = false;
            }
            else if (messageProgression == 12) {
              messageProgression = 8
              dialogue.display = 0
              stuckInDialogue = false;
            }
            else {
              dialogue.display = 1
              dialogue.dialogueNumber = messageProgression
            }
            if (head.position[0] < key.position[0]) {
              key.orientation = 0
            }
            else {
              key.orientation = 1
            }
          }
          if (head.position[0] == door.position[0] - 1 && head.position[1] == door.position[1] + 1 && head.orientation == 3 && head.keyGrabbed && door.locked == 1) {
            door.locked = 0;
            PlaySound('doorUnlocked');
          }
          else if (head.position[0] == door.position[0] - 1 && head.position[1] == door.position[1] + 1 && head.orientation == 3 && head.keyGrabbed && door.locked == 0) {
            door.opened = 1;
            PlaySound('openedDoor');
          }
          else if (head.position[0] == door.position[0] - 1 && head.position[1] == door.position[1] + 1 && head.orientation == 3 && !head.keyGrabbed) {
            PlaySound('lockedDoor');
          }
          return;
      }
    });
  }

  if (head.nextMove === 0) {
    if (
      head.position[0] + head.xPos < 0 ||
      head.position[0] + head.xPos >= Constants.GRID_SIZE ||
      head.position[1] + head.yPos < 0 ||
      head.position[1] + head.yPos >= Constants.GRID_SIZE ||
      (head.position[0] + head.xPos == door.position[0] &&
        head.position[1] + head.yPos == door.position[1]) ||
      (head.position[0] + head.xPos == door.position[0] - 1 &&
        head.position[1] + head.yPos == door.position[1] &&
        door.opened == 0) ||
      (head.position[0] + head.xPos == door.position[0] - 2 &&
        head.position[1] + head.yPos == door.position[1]) ||
      (head.position[0] + head.xPos == key.position[0] &&
        head.position[1] + head.yPos == key.position[1] &&
        !head.keyGrabbed) ||
      (head.position[0] + head.xPos == key.position[0] && head.position[1] + head.yPos == key.position[1])
    ) {
      //head.position[0] -= head.xPos;
      //head.position[1] -= head.yPos;
      head.xPos = 0;
      head.yPos = 0;
    }
    else {
      head.position[0] += head.xPos;
      head.position[1] += head.yPos;

      if (
        head.position[0] == door.position[0] - 1 && head.position[1] == door.position[1] && head.keyGrabbed
      ) {
        door.position = [
          -100, -100
        ];
        head.position = [
          -100, -100
        ];
        messageProgression = 0;
        dispatch("game-over");
      }
      else {
        if (!(head.position[0] == 0 && head.position[1] == 0) && !(head.position[0] == door.position[0] - 1 && head.position[1] == door.position[1])) {
          PlaySound('grassyStep');
        }
      }
    }
    dialoguePrompt.position[0] = -1;
    dialoguePrompt.position[1] = -1;
    if (head.position[1] == key.position[1]) {
      if (head.position[0] == key.position[0] - 1 || head.position[0] == key.position[0] + 1) {
        if (!head.keyGrabbed) {
          dialoguePrompt.position[0] = key.position[0];
          dialoguePrompt.position[1] = key.position[1] - 1;
        }
      }
    }
    if (Constants.GRID_SIZE / 2 < head.position[1]) {
      dialogue.location = 0
    }
    else {
      dialogue.location = 1
    }
  }
  return entities;
}
