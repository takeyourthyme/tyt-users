import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { loadSession } from "@/services/authService";
import { getPixQrCode, getPaymentStatus, cancelKitchenOrder } from "@/services/kitchenOrderService";
import { Copy, CheckCircle2, Clock, Loader2, QrCode, ExternalLink } from "lucide-react";

interface PixPaymentModalProps {
  open: boolean;
  paymentId: string;
  orderCode: string;
  totalValue: number;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  open,
  paymentId,
  orderCode,
  totalValue,
  onClose,
  onPaymentConfirmed,
}) => {
  const { toast } = useToast();
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [pixPayload, setPixPayload] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Fetch QR Code on mount
  useEffect(() => {
    if (!open || !paymentId) return;

    const fetchQrCode = async () => {
      const session = loadSession();
      if (!session?.token) return;

      try {
        setIsLoading(true);
        const response = await getPixQrCode({ token: session.token, paymentId });

        let qrData = (response as unknown as Record<string, unknown>);
        for (let i = 0; i < 3; i++) {
          if (qrData?.data && typeof qrData.data === "object" && !Array.isArray(qrData.data)) {
            qrData = qrData.data as Record<string, unknown>;
          }
        }

        const img = String(qrData?.encodedImage || qrData?.qrCode || qrData?.image || "");
        const payload = String(qrData?.payload || qrData?.pixCopiaECola || qrData?.copyAndPaste || "");
        const expiration = String(qrData?.expirationDate || qrData?.expiresAt || "");

        setQrCodeImage(img);
        setPixPayload(payload);
        setExpirationDate(expiration);
      } catch (err) {
        console.error("Erro ao buscar QR Code Pix:", err);
        toast({
          title: "Erro ao gerar QR Code",
          description: "Não foi possível gerar o QR Code Pix. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQrCode();
  }, [open, paymentId, toast]);

  // Countdown timer — 30 minutes limit (1800 seconds)
  useEffect(() => {
    if (!open || isLoading || paymentStatus !== "PENDING") return;

    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    const expTime = Date.now() + THIRTY_MINUTES_MS;

    const handleExpiration = async () => {
      if (isCancelledRef.current) return;
      isCancelledRef.current = true;

      const session = loadSession();
      if (session?.token && orderCode) {
        try {
          await cancelKitchenOrder({ token: session.token, code: orderCode });
          toast({
            title: "Tempo esgotado",
            description: "O tempo para pagamento via Pix expirou (30 min). O pedido e a cobrança foram cancelados.",
            variant: "destructive",
          });
        } catch (e) {
          console.error("Erro ao cancelar pedido por expiração de Pix:", e);
        }
      }
    };

    const updateTimer = () => {
      const diff = expTime - Date.now();

      if (diff <= 0) {
        setTimeLeft("Expirado");
        if (timerRef.current) clearInterval(timerRef.current);
        void handleExpiration();
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, isLoading, paymentStatus, orderCode, toast]);

  // Polling for payment status every 5 seconds
  const checkStatus = useCallback(async () => {
    const session = loadSession();
    if (!session?.token || !paymentId) return;

    try {
      const response = await getPaymentStatus({ token: session.token, paymentId });
      const rawData = (response as unknown as Record<string, unknown>)?.data ?? response;
      let status = "PENDING";

      if (typeof rawData === "string") {
        status = rawData;
      } else if (rawData && typeof rawData === "object") {
        const obj = rawData as Record<string, unknown>;
        if (typeof obj.status === "string") {
          status = obj.status;
        } else if (typeof obj.paymentStatus === "string") {
          status = obj.paymentStatus;
        } else if (obj.data && typeof obj.data === "object" && typeof (obj.data as Record<string, unknown>).status === "string") {
          status = String((obj.data as Record<string, unknown>).status);
        } else if (typeof obj.data === "string") {
          status = obj.data;
        }
      }

      setPaymentStatus(status);

      if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status)) {
        onPaymentConfirmed();
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [paymentId, onPaymentConfirmed]);

  useEffect(() => {
    if (!open || !paymentId || paymentStatus !== "PENDING") return;

    pollingRef.current = setInterval(() => {
      void checkStatus();
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [open, paymentId, paymentStatus, checkStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!pixPayload) return;
    try {
      await navigator.clipboard.writeText(pixPayload);
      setIsCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole no app do seu banco para pagar.",
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar. Selecione e copie manualmente.",
        variant: "destructive",
      });
    }
  };

  const isConfirmed = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(paymentStatus);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[92vw] sm:max-w-md w-full overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <QrCode className="w-5 h-5 text-[#004B2A] shrink-0" />
            <span>{isConfirmed ? "Pagamento Confirmado!" : "Pagamento via Pix"}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#004B2A]" />
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        ) : isConfirmed ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700">Pix recebido com sucesso!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Seu pedido <span className="font-medium">{orderCode}</span> foi confirmado.
            </p>
          </div>
        ) : (
          <div className="space-y-4 w-full min-w-0">
            {/* Value display */}
            <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-muted-foreground">Valor a pagar</p>
              <p className="text-2xl font-bold text-[#004B2A]">
                R$ {totalValue.toFixed(2)}
              </p>
            </div>

            {/* QR Code */}
            {qrCodeImage && (
              <div className="flex justify-center py-1">
                <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm">
                  <img
                    src={`data:image/png;base64,${qrCodeImage}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Copy & Paste code */}
            {pixPayload && (
              <div className="space-y-1.5 w-full min-w-0">
                <p className="text-xs font-medium text-muted-foreground text-center">
                  Ou copie o código Pix:
                </p>
                <div className="flex items-center gap-2 w-full min-w-0">
                  <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                    <p className="text-xs font-mono text-gray-600 truncate select-all">
                      {pixPayload}
                    </p>
                  </div>
                  <Button
                    variant={isCopied ? "default" : "outline"}
                    size="sm"
                    onClick={() => void handleCopy()}
                    className={`shrink-0 ${isCopied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  >
                    {isCopied ? (
                      <><CheckCircle2 className="w-4 h-4 mr-1" /> Copiado</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> Copiar</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Timer & Status */}
            <div className="flex items-center justify-between text-sm px-1">
              {timeLeft && timeLeft !== "Expirado" && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Expira em {timeLeft}</span>
                </div>
              )}
              {timeLeft === "Expirado" && (
                <span className="text-red-500 text-xs">QR Code expirado. Feche e tente novamente.</span>
              )}
              <div className="flex items-center gap-1.5 text-amber-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Aguardando pagamento...</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-blue-800">Como pagar:</p>
              <ol className="text-xs text-blue-700 space-y-0.5 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escaneie o QR Code ou cole o código copiado</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={onClose}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Já paguei / Ver pedidos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
