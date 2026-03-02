import { MessageMethod, NextActionMethod } from "../../core/types";

const getNextActionForMethod = (method) => {
  switch (method) {
    case MessageMethod.CONNECT:
      return NextActionMethod.CONFIRM_CONNECT;
    case MessageMethod.SIGN_AND_SUBMIT_TRANSACTION:
    case MessageMethod.SIGN_TRANSACTION:
      return NextActionMethod.SIGN_TRANSACTION;
    case MessageMethod.SIGN_MESSAGE:
      return NextActionMethod.SIGN_MESSAGE;
    default:
      return NextActionMethod.CLOSE_WINDOW;
  }
};

const requiresAccountMethod = (method) =>
  [
    MessageMethod.SIGN_AND_SUBMIT_TRANSACTION,
    MessageMethod.SIGN_TRANSACTION,
    MessageMethod.SIGN_MESSAGE,
  ].includes(method);

const getRequestKey = (request, sender) =>
  `${sender?.tab?.id ?? "no-tab"}:${request.id}`;

const isApprovalAccepted = (data) => {
  if (data === false) return false;
  if (data?.approved === false) return false;
  if (data?.success === false) return false;
  if (data?.rejected === true) return false;
  if (data?.error) return false;
  return true;
};

export {
  getNextActionForMethod,
  requiresAccountMethod,
  getRequestKey,
  isApprovalAccepted,
};
