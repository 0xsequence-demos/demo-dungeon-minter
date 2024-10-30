import { SetStateAction } from "react";
import { Dispatch } from "react";

export default function OpenWalletButton(props: {
  isMobile: boolean;
  setOpenWallet: Dispatch<SetStateAction<boolean>>;
}) {
  const { isMobile, setOpenWallet } = props;
  return (
    <div
      style={{
        zIndex: 10,
        color: "white",
        cursor: "pointer",
        position: "fixed",
        bottom: "25px",
        right: isMobile ? "30px" : "30px",
      }}
    >
      <button
        className="open-wallet-button"
        onClick={() => setOpenWallet(true)}
      >
        open wallet
      </button>
      {/* <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/> */}
    </div>
  );
}
