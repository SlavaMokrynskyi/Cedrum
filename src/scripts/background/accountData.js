const toAccountData = (data) =>
  data?.address
    ? {
        address: data.address,
        publicKey: data.publicKey || null,
      }
    : null;

const createSelectedAccountDataResolver = ({
  getSelectedAccountPublicDataFromStorage,
  getAccountsStateFromStorage,
}) => {
  let cachedSelectedAccountData = null;

  return async () => {
    try {
      const selected = toAccountData(await getSelectedAccountPublicDataFromStorage());
      if (selected) {
        cachedSelectedAccountData = selected;
        return selected;
      }

      const accounts = await getAccountsStateFromStorage();
      if (accounts.length > 0 && accounts[0]?.address) {
        const firstAccount = {
          address: accounts[0].address,
          publicKey: accounts[0].publicKey || null,
        };
        cachedSelectedAccountData = firstAccount;
        return firstAccount;
      }

      return cachedSelectedAccountData;
    } catch {
      return cachedSelectedAccountData;
    }
  };
};

const getAccountAddressFromRuntimeAccount = (account) => {
  if (!account?.accountAddress) return null;
  return String(account.accountAddress);
};

export { createSelectedAccountDataResolver, getAccountAddressFromRuntimeAccount };
