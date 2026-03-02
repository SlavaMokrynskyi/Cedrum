import React, { ElementType, lazy, Suspense, useEffect } from "react";
import PageIsLoading from "core/components/PageIsLoading/PageIsLoading";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
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
const SecretRecoveryPhrasePage = lazy(() => import("pages/SecretRecoveryPhrasePage"));
const CreatePasswordPage = lazy(() => import("pages/CreatePasswordPage"));
const EnterPasswordPage = lazy(() => import("pages/EnterPasswordPage"));
const EnterRecoveryPhrasePage = lazy(() => import("pages/EnterRecoveryPhrasePage"));
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

type RouteConfig = {
  path: string;
  Component: ElementType;
};

const walletRoutes: RouteConfig[] = [
  { path: "portfolio", Component: PortfolioPage },
  { path: "nft", Component: NFTPage },
  { path: "nft-description", Component: NFTDescriptionPage },
  { path: "search", Component: SearchPage },
  { path: "send-select-token", Component: SendSelectTokenPage },
  { path: "send-token", Component: SendTokenPage },
  { path: "confirm-transaction", Component: ConfirmTransactionPage },
  { path: "success", Component: SuccessPage },
  { path: "menu", Component: MenuPage },
  { path: "settings", Component: SettingsPage },
  { path: "account", Component: MyAccountPage },
  { path: "logout", Component: LogOutPage },
  { path: "create-password", Component: CreatePasswordPage },
  { path: "settings/change-password", Component: ChangePasswordPage },
  { path: "wallet-page", Component: WalletPage },
  { path: "unlock", Component: UnlockPage },
  { path: "transactions", Component: TransactionsPage },
  { path: "transaction/:hash", Component: TransactionDescriptionPage },
  { path: "page-is-loading", Component: PageIsLoadingPage },
  { path: "select-token", Component: SelectTokenPage },
  { path: "language", Component: LanguagePage },
  { path: "receive", Component: Receive },
  { path: "send-nft", Component: SendNFTPage },
  { path: "will-be-soon", Component: WillBeSoonPage },
];

const standaloneRoutes: RouteConfig[] = [
  { path: "/auth", Component: RegistrationLoginPage },
  { path: "/popup/confirm-connect", Component: ConfirmConnectPage },
  { path: "/popup/sign-transaction", Component: SignTxnPopupPage },
  { path: "/popup/sign-message", Component: SignMessagePopupPage },
  { path: "/auth/enter-password", Component: EnterPasswordPage },
  { path: "/auth/recovery-phrase", Component: SecretRecoveryPhrasePage },
  { path: "/auth/enter-recovery-phrase", Component: EnterRecoveryPhrasePage },
];

const SidePanelNavigator: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const syncPendingRoute = async () => {
      const result = await chrome.storage.local.get([PENDING_PAGE]);
      const pending = result[PENDING_PAGE];

      if (!isMounted || typeof pending !== "string") {
        return;
      }

      await chrome.storage.local.remove([PENDING_PAGE]);
      navigate(pending, { replace: true });
    };

    syncPendingRoute().catch(console.error);

    return () => {
      isMounted = false;
    };
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
            {walletRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {standaloneRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}

          <Route path="*" element={<Navigate to="/wallet/portfolio" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
