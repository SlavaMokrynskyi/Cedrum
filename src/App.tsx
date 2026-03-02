import React, { lazy, Suspense, useEffect } from "react";
import PageIsLoading from "core/components/PageIsLoading/PageIsLoading";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  HashRouter,
} from "react-router-dom";
import WalletLayout from "core/layouts/WalletLayout/WalletLayout";
import { PENDING_PAGE } from "core/constants";

const PortfolioPage = lazy(() => import("pages/PortfolioPage"));
const NFTPage = lazy(() => import("pages/NFTPage"));
const SearchPage = lazy(() => import("pages/SearchPage"));
const SelectTokenPage = lazy(() => import("pages/SelectTokenPage"));
const SendSelectTokenPage = lazy(() => import("pages/SendSelectTokenPage"));
const SendTokenPage = lazy(() => import("pages/SendTokenPage"));
const ConfirmTransactionPage = lazy(() => import("pages/ConfirmTransactionPage"));
const SuccessPage = lazy(() => import("pages/SuccessPage"));
const SettingsPage = lazy(() => import("pages/SettingsPage"));
const MyAccountPage = lazy(() => import("pages/MyAccountPage"));
const LogOutPage = lazy(() => import("pages/LogOutPage"));
const RegistrationLoginPage = lazy(() => import("pages/RegistrationLoginPage"));
const SecretRecoveryPhrasePage = lazy(() => import("pages/SecretRecoveryPhrasePage"),);
const CreatePasswordPage = lazy(() => import("pages/CreatePasswordPage"));
const EnterPasswordPage = lazy(() => import("pages/EnterPasswordPage"));
const EnterRecoveryPhrasePage = lazy(() => import("pages/EnterRecoveryPhrasePage"),);
const WelcomePage = lazy(() => import("pages/WelcomePage"));
const WalletPage = lazy(() => import("pages/WalletPage"));
const ChangePasswordPage = lazy(() => import("pages/ChangePasswordPage"));
const UnlockPage = lazy(() => import("pages/UnlockPage"));
const NFTDescriptionPage = lazy(() => import("pages/NFTDescriptionPage"));
const MenuPage = lazy(() => import("pages/MenuPage"));
const TransactionsPage = lazy(() => import("pages/TransactionsPage"));
const TransactionDescriptionPage = lazy(() => import("pages/TransactionDescriptionPage"));
const PageIsLoadingPage = lazy(() => import("pages/PageIsLoadingPage"));
const LanguagePage = lazy(() => import("pages/LanguagePage"));
const Receive = lazy(() => import("core/components/Receive/Receive"));
const SendNFTPage = lazy(() => import("pages/SendNFTPage"));
const WillBeSoonPage = lazy(() => import("pages/WillBeSoonPage"));
const ConfirmConnectPage = lazy(() => import("pages/ConfirmConnectPage"));
const SignTxnPopupPage = lazy(() => import("pages/SignTxnPopupPage"));
const SignMessagePopupPage = lazy(() => import("pages/SignMessagePopupPage"));

interface AppProps {
  isSidePanel?: boolean;
}

const SidePanelNavigator: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    chrome.storage.local.get([PENDING_PAGE], (result) => {
      const pending = result[PENDING_PAGE];

      if (typeof pending === "string") {
        chrome.storage.local.remove([PENDING_PAGE], () => {
          navigate(pending, { replace: true });
        });
      }
    });
  }, [navigate]);

  return null;
};

const App = ({ isSidePanel = false }: AppProps) => {
  return (
    <HashRouter>
      {isSidePanel && <SidePanelNavigator />}

      <Suspense fallback={<PageIsLoading />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />

          <Route path="/wallet" element={<WalletLayout />}>
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="nft" element={<NFTPage />} />
            <Route path="nft-description" element={<NFTDescriptionPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="send-select-token" element={<SendSelectTokenPage />} />
            <Route path="send-token" element={<SendTokenPage />} />
            <Route path="confirm-transaction" element={<ConfirmTransactionPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="account" element={<MyAccountPage />} />
            <Route path="logout" element={<LogOutPage />} />
            <Route path="create-password" element={<CreatePasswordPage />} />
            <Route path="settings/change-password" element={<ChangePasswordPage />} />
            <Route path="wallet-page" element={<WalletPage />} />
            <Route path="unlock" element={<UnlockPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transaction/:hash" element={<TransactionDescriptionPage />} />
            <Route path="page-is-loading" element={<PageIsLoadingPage />} />
            <Route path="confirm-transaction" element={<ConfirmTransactionPage />} />
            <Route path="send-select-token" element={<SendSelectTokenPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="send-token" element={<SendTokenPage />} />
            <Route path="page-is-loading" element={<PageIsLoadingPage />} />
            <Route path="confirm-transaction" element={<ConfirmTransactionPage />} />
            <Route path="select-token" element={<SelectTokenPage />} />
            <Route path="send-select-token" element={<SendTokenPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="send-token" element={<SendTokenPage />} />
            <Route path="language" element={<LanguagePage />} />
            <Route path="receive" element={<Receive />} />
            <Route path="send-nft" element={<SendNFTPage />} />
            <Route path="will-be-soon" element={<WillBeSoonPage />} />
          </Route>

          <Route path="/auth" element={<RegistrationLoginPage />} />
          <Route path="/popup/confirm-connect" element={<ConfirmConnectPage />} />
          <Route path="/popup/sign-transaction" element={<SignTxnPopupPage />} />
          <Route path="/popup/sign-message" element={<SignMessagePopupPage />} />
          <Route
            path="/auth/enter-password"
            element={<EnterPasswordPage />}
          />
          <Route
            path="/auth/recovery-phrase"
            element={<SecretRecoveryPhrasePage />}
          />
          <Route
            path="/auth/enter-recovery-phrase"
            element={<EnterRecoveryPhrasePage />}
          />

          <Route
            path="*"
            element={<Navigate to="/wallet/portfolio" replace />}
          />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
