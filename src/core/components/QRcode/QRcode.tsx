import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import styles from "./QRcode.module.css";
import CedrumLogoPng from "../../image/cedrum-logo.png";

type Props = { text: string; size?: number };

export default function StyledQr({ text, size = 260 }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: text,
        margin: 8,
        qrOptions: { errorCorrectionLevel: "M" },

        backgroundOptions: { color: "#FFFFFF" },
        dotsOptions: { type: "rounded", color: "#1C1D22" },
        cornersSquareOptions: { type: "square", color: "#1C1D22" },
        cornersDotOptions: { type: "rounded", color: "#1C1D22" },

        image: CedrumLogoPng,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 1,
          margin: 10,
        },
      });
    }

    qrRef.current.update({
      width: size,
      height: size,
      data: text,
      margin: 8,
      qrOptions: { errorCorrectionLevel: "M" },

      backgroundOptions: { color: "#FFFFFF" },
      dotsOptions: { type: "rounded", color: "#1C1D22" },
      cornersSquareOptions: { type: "square", color: "#1C1D22" },
      cornersDotOptions: { type: "rounded", color: "#1C1D22" },

      image: CedrumLogoPng,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.5,
        margin: 10,
      },
    });

    if (hostRef.current) {
      hostRef.current.innerHTML = "";
      qrRef.current.append(hostRef.current);
    }
  }, [text, size]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div ref={hostRef} className={styles.qrHost} />
    </div>
  );
}
