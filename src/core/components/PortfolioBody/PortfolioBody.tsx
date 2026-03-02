import React, { useState,useMemo,useEffect } from "react";
import TopBarPortfolio from "../TopBarPortfolio/TopBarPortfolio";
import AccountBalanceInfo from "../AccountBalanceInfo/AccountBalanceInfo";
import ActionButtons from "../ActionButtons/ActionButtons";
import TokenList from "../TokenList/TokenList";
import useWalletState from "core/hooks/useWalletState";
import { getDataFromCryptorank } from "core/utils/api";
import { getAccountBalance } from "core/utils/helper";

export default function PortfolioBody() {
  const [cedraBalance, setCedraBalance] = useState<number>(
    0,
  );
  const [cedraTokenPrice, setCedraTokenPrice] = useState<number>(0);
  const [cedraToken24HPrice, setCedraToken24HPrice] = useState<number | null>(
    null,
  );

  const { cedraAccount, cedraNetwork } = useWalletState();

  const tokenPriceDifference = useMemo(() => {
    return cedraTokenPrice && cedraToken24HPrice
      ? cedraTokenPrice - cedraToken24HPrice
      : 0;
  }, [cedraTokenPrice, cedraToken24HPrice]);

  const tokenPriceDifferenceInPercent = useMemo(() => {
    return cedraTokenPrice && cedraToken24HPrice
      ? (cedraTokenPrice * 100) / cedraToken24HPrice - 100
      : 0;
  }, [cedraTokenPrice, cedraToken24HPrice]);

  const tokenPriceDifferenceInPercentFormated = Number(tokenPriceDifferenceInPercent.toFixed(2));

  const getTokenDataFromApi = async () => {
    try {
      const data = await getDataFromCryptorank("tether"); // todo: Заміни 'tether' на 'cedra', коли Cedra з'явиться в Cryptorank

      setCedraTokenPrice(data.data.data.price.USD);
      setCedraToken24HPrice(data.data.data.histPrices["24H"].USD);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const tokenBalance = async () => {
      try {
        if (cedraAccount?.accountAddress) {
          const balance = await getAccountBalance(
            cedraAccount.accountAddress,
            cedraNetwork,
          );
          const numBalance = Number(balance) / 100_000_000;
          setCedraBalance(numBalance);
        }
      } catch (error) {
        console.error(error);
        setCedraBalance(0);
      }
    };
    tokenBalance();
    getTokenDataFromApi();
  }, [cedraAccount, cedraNetwork]);


  return (
    <div>
      <TopBarPortfolio />
      <AccountBalanceInfo balance={cedraBalance * cedraTokenPrice} dailyChange={tokenPriceDifference} dailyPercentage={tokenPriceDifferenceInPercentFormated}/>
      <ActionButtons />
      <TokenList balance={cedraBalance} cedraPrice={cedraTokenPrice}/>
    </div>
  );
}
