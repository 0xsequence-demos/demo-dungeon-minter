import { ReactNode } from "react";

export default function Modal(props: {
  children: ReactNode;
  color?: string;
  glow?: boolean;
}) {
  const { children, color, glow } = props;
  const style = glow
    ? {
        backgroundSize: "150%",
        backgroundPosition: "center",
        backgroundImage: `radial-gradient(circle at 50% 50%, ${color || "#000000"}B3 0%, transparent 70%)`,
      }
    : {};
  return (
    <div className="modal-holder" style={style}>
      <div
        className="modal"
        style={{
          borderColor: `${color || "white"}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
