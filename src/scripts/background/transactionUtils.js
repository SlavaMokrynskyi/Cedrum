const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (!error) return "Unknown error";
  return String(error);
};

const normalizeFunctionArgument = (arg) => {
  if (typeof arg === "bigint") return arg.toString();
  if (arg instanceof Uint8Array) return Array.from(arg);
  return arg;
};

const normalizeTypeArgument = (arg) => String(arg);

const normalizeTransactionPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { error: "No transaction payload provided" };
  }

  const dataPayload =
    payload.data && typeof payload.data === "object" ? payload.data : payload;

  let functionName = dataPayload.function;
  let functionArguments = dataPayload.functionArguments;
  let typeArguments =
    dataPayload.typeArguments ||
    dataPayload.type_arguments ||
    payload.typeArguments ||
    payload.type_arguments;

  if (!Array.isArray(functionArguments) && Array.isArray(dataPayload.arguments)) {
    functionArguments = dataPayload.arguments;
  }

  if (!Array.isArray(typeArguments) && typeof payload.coinType === "string") {
    typeArguments = [payload.coinType];
  }

  if (!Array.isArray(typeArguments) && typeof typeArguments === "string") {
    typeArguments = [typeArguments];
  }

  if (!functionName && payload.type === "transfer") {
    const toAddress = payload.to || payload.toAddress || payload.recipient;
    const amount = payload.amount ?? payload.value;

    if (!toAddress || typeof amount === "undefined" || amount === null) {
      return { error: "Invalid transfer payload: expected to and amount" };
    }

    functionName = "0x1::cedra_account::transfer";
    functionArguments = [toAddress, amount];
  }

  if (!functionName) {
    return { error: "No transaction function provided" };
  }

  if (!Array.isArray(functionArguments)) {
    return { error: "Invalid transaction functionArguments" };
  }

  if (!Array.isArray(typeArguments)) {
    typeArguments = [];
  }

  return {
    data: {
      function: functionName,
      functionArguments: functionArguments.map(normalizeFunctionArgument),
      ...(typeArguments.length > 0
        ? { typeArguments: typeArguments.map(normalizeTypeArgument) }
        : {}),
    },
  };
};

const stringifyPreviewValue = (value) => {
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  if (value === null) return "null";
  if (typeof value === "undefined") return "undefined";
  if (value instanceof Uint8Array) {
    return `[${Array.from(value).join(", ")}]`;
  }
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return "[array]";
    }
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }
  return String(value);
};

const buildTxPreview = (payload) => ({
  function: payload?.data?.function || "",
  typeArguments: Array.isArray(payload?.data?.typeArguments)
    ? payload.data.typeArguments.map((arg) => stringifyPreviewValue(arg))
    : [],
  functionArguments: Array.isArray(payload?.data?.functionArguments)
    ? payload.data.functionArguments.map((arg) => stringifyPreviewValue(arg))
    : [],
});

const buildTransaction = async (client, senderAddress, payloadData) => {
  const data = {
    function: payloadData.function,
    functionArguments: payloadData.functionArguments,
    ...(Array.isArray(payloadData.typeArguments) &&
    payloadData.typeArguments.length > 0
      ? { typeArguments: payloadData.typeArguments }
      : {}),
  };

  return client.transaction.build.simple({
    sender: senderAddress,
    data,
  });
};

const simulateTransaction = async (client, account, transaction) => {
  try {
    const [simulatedTxn] = await client.transaction.simulate.simple({
      signerPublicKey: account.publicKey,
      transaction,
    });

    let estimatedFeeOctas = null;
    try {
      if (
        typeof simulatedTxn?.gas_used !== "undefined" &&
        typeof simulatedTxn?.gas_unit_price !== "undefined"
      ) {
        estimatedFeeOctas = (
          BigInt(simulatedTxn.gas_used) * BigInt(simulatedTxn.gas_unit_price)
        ).toString();
      }
    } catch {
      estimatedFeeOctas = null;
    }

    return {
      success: simulatedTxn?.success !== false,
      gasUsed: simulatedTxn?.gas_used ?? null,
      gasUnitPrice: simulatedTxn?.gas_unit_price ?? null,
      estimatedFeeOctas,
      vmStatus: simulatedTxn?.vm_status ?? null,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export {
  getErrorMessage,
  normalizeTransactionPayload,
  buildTxPreview,
  buildTransaction,
  simulateTransaction,
};
