import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnlockPage from "./UnlockPage";
import { checkIsLocked } from "core/utils/lock";
import { getSelectedAccountFromStorage } from "core/utils/account";
import { SelectedCedraAccount } from "core/types";
import useWalletState from "core/hooks/useWalletState";

export default function WelcomePage() {
  const [cedraAccount, setCedraAccount] = useState<SelectedCedraAccount | null>(null);
  const [checked, setChecked] = useState(false);

  const navigate = useNavigate();
  const { cedraNetwork } = useWalletState();

  useEffect(() => {
    const getData = async () => {
      const account = await getSelectedAccountFromStorage();
      setCedraAccount(account);
      setChecked(true);
    };

    getData();
  }, []);

  useEffect(() => {
    if (!checked) return;

    const run = async () => {
      if (!cedraAccount) {
        navigate("/auth", { replace: true });
        return;
      }

      const isLocked = await checkIsLocked();
      if (!isLocked) {
        navigate("/wallet/portfolio", { replace: true });
        return;
      }

    };

    run();
  }, [checked, cedraAccount, navigate, cedraNetwork]);

  return <UnlockPage />;
}
