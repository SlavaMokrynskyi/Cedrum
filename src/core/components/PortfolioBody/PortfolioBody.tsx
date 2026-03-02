import React, { useEffect, useState } from "react";
import TopBarPortfolio from "../TopBarPortfolio/TopBarPortfolio";
import AccountBalanceInfo from "../AccountBalanceInfo/AccountBalanceInfo";
import ActionButtons from "../ActionButtons/ActionButtons";
import TokenList from "../TokenList/TokenList";
import useWalletState from "core/hooks/useWalletState";
import { getDataFromCryptorank } from "core/utils/api";
import { getAccountBalance } from "core/utils/helper";
import {
  CEDRA_OCTAS_PER_COIN,
  CRYPTORANK_FALLBACK_COIN,
} from "core/constants";

export default function PortfolioBody() {
  const [cedraBalance, setCedraBalance] = useState<number>(0);
  const [cedraTokenPrice, setCedraTokenPrice] = useState<number>(0);
  const [cedraToken24HPrice, setCedraToken24HPrice] = useState<number | null>(null);

  const { cedraAccount, cedraNetwork } = useWalletState();

  const tokenPriceDifference =
    cedraTokenPrice && cedraToken24HPrice
      ? cedraTokenPrice - cedraToken24HPrice
      : 0;

  const tokenPriceDifferenceInPercent =
    cedraTokenPrice && cedraToken24HPrice
      ? (cedraTokenPrice * 100) / cedraToken24HPrice - 100
      : 0;

  const tokenPriceDifferenceInPercentFormated = Number(
    tokenPriceDifferenceInPercent.toFixed(2),
  );

  useEffect(() => {
    let isMounted = true;

    const loadPortfolioData = async () => {
      const [balanceResult, priceResult] = await Promise.allSettled([
        cedraAccount?.accountAddress
          ? getAccountBalance(cedraAccount.accountAddress, cedraNetwork)
          : Promise.resolve(0),
        getDataFromCryptorank(CRYPTORANK_FALLBACK_COIN),
      ]);

      if (!isMounted) return;

      if (balanceResult.status === "fulfilled") {
        const nextBalance =
          Number(balanceResult.value) / CEDRA_OCTAS_PER_COIN;
        setCedraBalance(Number.isFinite(nextBalance) ? nextBalance : 0);
      } else {
        console.error(balanceResult.reason);
        setCedraBalance(0);
      }

      if (priceResult.status === "fulfilled") {
        const priceData = priceResult.value.data?.data;
        setCedraTokenPrice(priceData?.price?.USD ?? 0);
        setCedraToken24HPrice(priceData?.histPrices?.["24H"]?.USD ?? null);
      } else {
        console.error(priceResult.reason);
        setCedraTokenPrice(0);
        setCedraToken24HPrice(null);
      }
    };

    loadPortfolioData();

    return () => {
      isMounted = false;
    };
  }, [cedraAccount, cedraNetwork]);

  return (
    <div>
      <TopBarPortfolio />
      <AccountBalanceInfo
        balance={cedraBalance * cedraTokenPrice}
        dailyChange={tokenPriceDifference}
        dailyPercentage={tokenPriceDifferenceInPercentFormated}
      />
      <ActionButtons />
      <TokenList balance={cedraBalance} cedraPrice={cedraTokenPrice} />
    </div>
  );
}
