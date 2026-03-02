import axios from "axios";
import { CRYPTORANK_COINS_URL } from "core/constants";

export const getDataFromCryptorank = async (coin: string) => {
  return await axios.get(`${CRYPTORANK_COINS_URL}/${coin}`)
}