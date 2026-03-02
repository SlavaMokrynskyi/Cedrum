import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ActionButtons.module.css";

const BuyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const ReceiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

const SwapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
    <polyline points="16 3 20 7 16 11"/>
    <path d="M4 11V9a4 4 0 0 1 4-4h12"/>
    <polyline points="8 21 4 17 8 13"/>
    <path d="M20 13v2a4 4 0 0 1-4 4H4"/>
  </svg>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick }) => (
  <button className={styles.button} onClick={onClick} type="button">
    <div className={styles.iconWrapper}>
      {icon}
    </div>
    <span className={styles.label}>{label}</span>
  </button>
);

export default function ActionButtons() {
  const navigate = useNavigate();

  const handleBuy = () => {
    navigate("/wallet/will-be-soon");
  };

  const handleReceive = () => {
    navigate("/wallet/receive");
  }

  const handleSend = () => {
    navigate("/wallet/send-token", {
      state: { symbol: "CED" }
    });
  };

  const handleSwap = () => {
    navigate("/wallet/will-be-soon");
  };

  const actions = [
    { icon: <BuyIcon />, label: "Buy", onClick: handleBuy },
    { icon: <ReceiveIcon />, label: "Receive", onClick: handleReceive },
    { icon: <SendIcon />, label: "Send", onClick: handleSend },
    { icon: <SwapIcon />, label: "Swap", onClick: handleSwap },
  ];

  return (
    <div className={styles.container}>
      {actions.map((action) => (
        <ActionButton
          key={action.label}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
}
