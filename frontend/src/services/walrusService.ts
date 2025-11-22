// src/services/walrusService.ts

// Walrus Testnet Adresleri
const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

/**
 * 1. Walrus'a Dosya Yükle
 * @param encryptedBlob - Şifrelenmiş dosya verisi
 * @returns blobId - Dosyanın Walrus üzerindeki adresi
 */
export async function uploadToWalrus(encryptedBlob: Blob): Promise<string> {
  try {
    console.log("🌊 Walrus'a yükleniyor...");

    // HTTP PUT isteği ile dosyayı gönderiyoruz
    const response = await fetch(`${PUBLISHER_URL}/v1/store`, {
      method: "PUT",
      body: encryptedBlob,
    });

    if (!response.ok) {
      throw new Error(`Walrus Yükleme Hatası: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Walrus cevabından ID'yi alıyoruz
    // Cevap formatı genelde: { newlyCreated: { blobObject: { blobId: "..." } } }
    let blobId = "";
    
    if (data.newlyCreated && data.newlyCreated.blobObject) {
      blobId = data.newlyCreated.blobObject.blobId;
    } else if (data.blobId) {
       // Bazen direkt blobId dönebilir (versiyona göre)
       blobId = data.blobId;
    } else {
       throw new Error("Walrus cevabında Blob ID bulunamadı.");
    }

    console.log(`✅ Walrus Başarılı! Blob ID: ${blobId}`);
    return blobId;

  } catch (error) {
    console.error("❌ Walrus Hatası:", error);
    throw error;
  }
}

/**
 * 2. Walrus'tan Dosya İndir
 * @param blobId - Dosyanın adresi
 * @returns encryptedBlob - Şifreli dosya verisi
 */
export async function downloadFromWalrus(blobId: string): Promise<Blob> {
  try {
    console.log(`🌊 Walrus'tan indiriliyor: ${blobId}`);

    const response = await fetch(`${AGGREGATOR_URL}/v1/${blobId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Walrus İndirme Hatası: ${response.statusText}`);
    }

    // Gelen veriyi Blob olarak al
    const blob = await response.blob();
    return blob;

  } catch (error) {
    console.error("❌ Walrus İndirme Hatası:", error);
    throw error;
  }
}