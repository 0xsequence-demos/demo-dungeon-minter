import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import PlayImage from "./assets/play.svg?react";
import { Box } from "@0xsequence/design-system";
import { getDungeonGame } from "./dungeon/entry";
import Modal from "./Modal";

const progressDescriptions = [
  "SCENARIO.GG AI GENERATION...",
  "SCENARIO.GG AI GENERATION...",
  "UPLOADING METADATA TO SEQUENCE...",
  "UPLOADING METADATA TO SEQUENCE...",
];

export default function LoadingTreasureModal(props: {
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
  abortGenerationController: AbortController | undefined;
}) {
  const { color, setColor, abortGenerationController } = props;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    console.log("tick", progressPercent);
    const newVal = (progressPercent - 100) * 0.7 + 100;
    const diff = Math.min(10, newVal - progressPercent);
    setTimeout(() => setProgressPercent(progressPercent + diff), 1000);
  }, [progressPercent]);

  return (
    <Modal glow={true} color={color}>
      <br />
      <p
        style={{
          textAlign: "center",
          fontSize: "40px",
          margin: "0px",
        }}
      >
        Treasure chest
      </p>
      <p
        style={{
          textAlign: "center",
          fontSize: "40px",
          marginTop: "-10px",
          marginBottom: "0px",
        }}
      >
        unlocked!
      </p>
      <br />
      <br />
      {/* <Box justifyContent={'center'} paddingRight={'16'} paddingLeft={'16'}> */}
      <ProgressBar completed={progressPercent} bgcolor={color} />

      {/* <ProgressBar value={progressValue*100} maxValue={100} color={color} /> */}
      {/* </Box> */}
      <Box>
        <p style={{ color: color }}>{progressDescriptions[0]}</p>
      </Box>
      <Box>
        <p style={{ color: color }}>Please wait...</p>
      </Box>
      <p
        className="content"
        style={{ position: "relative" }}
        onClick={() => {
          setColor("#000000");
          abortGenerationController?.abort();
          getDungeonGame().party?.stepBack();
        }}
      >
        <span className="cancel-generation">Cancel</span>
        <PlayImage className="play-image-cancel" />
      </p>
    </Modal>
  );
}
