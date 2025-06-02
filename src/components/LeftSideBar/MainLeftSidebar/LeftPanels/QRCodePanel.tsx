import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { TextInput } from "../../../ui/controlled-inputs/TextInput";
import { Button } from "../../../ui/Button";

export default function QRCodePanel() {
  const [link, setLink] = useState<string>("");
  const [showQr, setShowQr] = useState<boolean>(false);

  const handleGenerateQrCode = () => {
    if (link && link.trim() !== "") {
      setShowQr(true);
    } else {
      setShowQr(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-start">
      <TextInput
        label="URL"
        onChange={(val: string) => {
          setLink(val);
          setShowQr(false); // لإخفاء QR عند تغيير الرابط قبل الضغط على الزر
        }}
      />
      <Button onClick={handleGenerateQrCode}>Create QR Code</Button>

      {showQr && (
        <div className="mt-4">
          <QRCodeCanvas value={link} size={200} />
        </div>
      )}
    </div>
  );
}
