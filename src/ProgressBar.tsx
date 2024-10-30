export default function ProgressBar(props: {
  completed: number;
  bgcolor: string;
}) {
  const { completed, bgcolor } = props;
  return (
    <div
      className="progress-container"
      style={{ backgroundColor: bgcolor + "80" }}
    >
      <div
        className="progress-bar"
        style={{ width: `${completed}%`, backgroundColor: bgcolor }}
      ></div>
    </div>
  );
}
