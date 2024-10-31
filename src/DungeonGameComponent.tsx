import { getDungeonGame } from "./dungeon/entry";

export default function DungeonGameComponent() {
  getDungeonGame();
  return <div id="test"></div>;
}
