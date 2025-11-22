import { useState } from "react";
import {
  Button,
  Flex,
  Text,
  Card,
  Box,
  TextField,
  Badge,
} from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import axios from "axios";

// YARDIMCI DOSYALAR (Bunların projenizde olması lazım!)
import { encryptFile, decryptFile } from "../encryptionUtils";
import { uploadToWalrus, downloadFromWalrus } from "../services/walrusService";

export function JobSubmission() {
  const account = useCurrentAccount();

  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState("job_101"); // Test için varsayılan ID
  const [status, setStatus] = useState("");
  const [uploadedBlobId, setUploadedBlobId] = useState(""); // Yüklenen dosya ID'si

  // --- 1. FREELANCER: YÜKLEME İŞLEMİ ---
  const handleUpload = async () => {
    if (!file || !account) {
      alert("Lütfen cüzdan bağlayın ve dosya seçin.");
      return;
    }
    setStatus("⏳ Dosya şifreleniyor (Client-side)...");

    try {
      // A. Dosyayı tarayıcıda şifrele
      const { encryptedBlob, encryptionKey } = await encryptFile(file);

      // B. Walrus'a Yükle
      setStatus("🌊 Walrus ağına yükleniyor...");
      const blobId = await uploadToWalrus(encryptedBlob);
      setUploadedBlobId(blobId);

      // C. Anahtarı Seal (Backend) Kasasına Kilitle
      setStatus("🔒 Anahtar Seal kasasına gönderiliyor...");
      // Not: localhost adresi senin backend adresindir
      await axios.post("http://localhost:3001/seal/store", {
        jobId: jobId,
        encryptionKey: encryptionKey,
      });

      // D. (Burada normalde Move Call yapılır - Şimdilik geçiyoruz)

      setStatus(`✅ BAŞARILI! Dosya Walrus'ta güvende. ID: ${blobId}`);
      alert("Dosya yüklendi ve anahtarı Seal'a teslim edildi!");
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ Hata: ${error.message || "Bilinmeyen hata"}`);
    }
  };

  // --- 2. İŞVEREN: İNDİRME İŞLEMİ ---
  const handleDownload = async () => {
    if (!uploadedBlobId) {
      alert("Henüz indirilicek bir dosya yok.");
      return;
    }
    if (!account) {
      alert("Lütfen cüzdan bağlayın.");
      return;
    }

    setStatus("🔍 Seal'dan anahtar isteniyor...");

    try {
      // A. Anahtarı Seal Kasasından İste
      const keyRes = await axios.post("http://localhost:3001/seal/retrieve", {
        jobId: jobId,
        requestorAddress: account.address,
      });

      const secretKey = keyRes.data.key;

      // B. Dosyayı Walrus'tan İndir
      setStatus("⬇️ Walrus'tan şifreli veri çekiliyor...");
      const encryptedBlob = await downloadFromWalrus(uploadedBlobId);

      // C. Şifreyi Çöz
      setStatus("🔓 Şifre çözülüyor...");
      const originalBlob = await decryptFile(encryptedBlob, secretKey);

      // D. Dosyayı İndir
      const url = window.URL.createObjectURL(originalBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teslimat_${jobId}.zip`; // İndirilecek dosya adı
      a.click();

      setStatus("✅ Dosya başarıyla indirildi ve açıldı!");
    } catch (error: any) {
      console.error(error);
      setStatus("❌ Erişim Reddedildi! (Anahtar alınamadı)");
    }
  };

  return (
    <Card
      style={{
        maxWidth: 600,
        margin: "20px auto",
        padding: "24px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold" align="center" color="indigo">
          WeWork Güvenli Teslimat
        </Text>

        <Box>
          <Text as="div" size="2" mb="2" weight="bold">
            Proje ID (Job ID):
          </Text>
          <TextField.Root
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Örn: job_123"
          />
        </Box>

        <Box
          style={{
            border: "2px dashed #ccc",
            padding: 20,
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Box>

        <Button onClick={handleUpload} disabled={!file || !account} size="3">
          🔒 Şifrele & Walrus'a Yükle
        </Button>

        {uploadedBlobId && (
          <Flex
            direction="column"
            gap="2"
            style={{ background: "#eef", padding: 10, borderRadius: 6 }}
          >
            <Text size="2" weight="bold" color="indigo">
              Walrus Blob ID:
            </Text>
            <Text size="1" style={{ wordBreak: "break-all" }}>
              {uploadedBlobId}
            </Text>
            <Badge color="green">Şifreli & Güvenli</Badge>
          </Flex>
        )}

        <Button
          variant="soft"
          color="gray"
          onClick={handleDownload}
          disabled={!uploadedBlobId}
          size="3"
        >
          🔓 Anahtarı Al & Dosyayı İndir
        </Button>

        <Text
          color="gray"
          size="2"
          align="center"
          style={{ minHeight: "20px" }}
        >
          {status}
        </Text>
      </Flex>
    </Card>
  );
}
