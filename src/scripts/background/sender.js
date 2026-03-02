const getOriginFromUrl = (url) => {
  try {
    if (!url) return "";
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return "";
    }
    return parsedUrl.origin;
  } catch {
    return "";
  }
};

const getSenderUrl = (sender) =>
  sender?.tab?.url ||
  sender?.tab?.pendingUrl ||
  sender?.url ||
  sender?.documentUrl ||
  "";

const getSenderOrigin = (sender) => {
  const tabOrigin = getOriginFromUrl(sender?.tab?.url || sender?.tab?.pendingUrl);
  if (tabOrigin) return tabOrigin;

  if (
    typeof sender?.origin === "string" &&
    sender.origin.length > 0 &&
    sender.origin !== "null"
  ) {
    return sender.origin;
  }

  return getOriginFromUrl(sender?.url || sender?.documentUrl || "");
};

const getSenderFavicon = (sender) => sender?.tab?.favIconUrl || "";

export { getOriginFromUrl, getSenderUrl, getSenderOrigin, getSenderFavicon };
