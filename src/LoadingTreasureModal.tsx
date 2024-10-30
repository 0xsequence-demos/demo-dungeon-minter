import { Dispatch, SetStateAction } from "react";
import ProgressBar from "./ProgressBar";
import PlayImage from "./assets/play.svg?react";
import { Box } from "@0xsequence/design-system";
import { getDungeonGame } from "./dungeon/entry";

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

  return (
    <div
      className="box-generation"
      style={{
        backgroundSize: "150%",
        backgroundPosition: "center",
        backgroundImage: `radial-gradient(circle at 50% 50%, ${color}B3 0%, transparent 70%)`,
      }}
    >
      <div
        style={{
          width: "340px",
          marginTop: "-155px",
          paddingTop: "20px",
          backgroundColor: "black",
          display: "flex" /* Use flexbox to align children side by side */,
          justifyContent: "center" /* Align items to the center */,
          alignItems: "center" /* Center items vertically */,
          flexDirection:
            "column" /* Align children vertically for better control */,
          padding: "10px",
          borderWidth: `3px`,
          borderStyle: `dashed`,
          borderColor: `${color}`,
        }}
      >
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
          discovered!
        </p>
        <br />
        <br />
        {/* <Box justifyContent={'center'} paddingRight={'16'} paddingLeft={'16'}> */}
        <ProgressBar completed={50} bgcolor={color} />

        {/* <ProgressBar value={progressValue*100} maxValue={100} color={color} /> */}
        {/* </Box> */}
        <Box>
          <p style={{ color: color }}>{progressDescriptions[0]}</p>
        </Box>
        <Box>
          <p style={{ color: color }}>X/2 steps</p>
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
      </div>
    </div>
  );
}
