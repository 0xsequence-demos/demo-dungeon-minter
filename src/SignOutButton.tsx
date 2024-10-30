import sequence from "./SequenceEmbeddedWallet";

export default function SignOutButton(props: {
  signOutConfiguration: () => void;
}) {
  const { signOutConfiguration } = props;
  return (
    <div
      style={{
        color: "white",
        position: "fixed",
        cursor: "pointer",
        top: "15px",
        left: "30px",
      }}
      onClick={async () => {
        try {
          console.log("signing out");
          const sessions = await sequence.listSessions();

          for (let i = 0; i < sessions.length; i++) {
            await sequence.dropSession({ sessionId: sessions[i].id });
          }
        } catch (err) {
          console.error(err);
        }
        signOutConfiguration();
      }}
    >
      <button className="logout-button">sign out</button>
    </div>
  );
}
