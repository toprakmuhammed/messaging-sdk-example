import { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, Spinner } from '@radix-ui/themes';
import { LazyDecryptAttachmentResult } from '@mysten/messaging';
import {
  formatFileSize,
  isImageMimeType,
  getFileIcon,
  uint8ArrayToBlobUrl,
  downloadFile,
} from '../utils/attachments';

interface AttachmentDisplayProps {
  attachment: LazyDecryptAttachmentResult;
}

export function AttachmentDisplay({ attachment }: AttachmentDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);

  const isImage = isImageMimeType(attachment.mimeType);
  const fileIcon = getFileIcon(attachment.mimeType, attachment.fileName);

  // Decrypt and load attachment data
  useEffect(() => {
    let isMounted = true;
    let blobUrl: string | null = null;

    const loadAttachment = async () => {
      try {
        setIsDecrypting(true);
        const data = await attachment.data;

        if (!isMounted) return;

        if (isImage) {
          // For images, create a blob URL for display
          blobUrl = uint8ArrayToBlobUrl(data, attachment.mimeType);
          setImageUrl(blobUrl);
        }
        setIsDecrypting(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load attachment');
        setIsDecrypting(false);
      }
    };

    loadAttachment();

    return () => {
      isMounted = false;
      // Clean up blob URL when component unmounts
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [attachment, isImage]);

  const handleDownload = async () => {
    try {
      const data = await attachment.data;
      downloadFile(data, attachment.fileName, attachment.mimeType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download attachment');
    }
  };

  if (error) {
    return (
      <Box
        p="2"
        style={{
          backgroundColor: 'var(--red-a2)',
          borderRadius: 'var(--radius-2)',
          border: '1px solid var(--red-a5)',
        }}
      >
        <Text size="1" color="red">
          Error loading attachment: {error}
        </Text>
      </Box>
    );
  }

  if (isImage) {
    // Image display
    return (
      <Box
        mt="2"
        style={{
          borderRadius: 'var(--radius-2)',
          overflow: 'hidden',
          maxWidth: '300px',
        }}
      >
        {isDecrypting ? (
          <Box
            p="4"
            style={{
              backgroundColor: 'var(--gray-a2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100px',
            }}
          >
            <Flex direction="column" gap="2" align="center">
              <Spinner size="2" />
              <Text size="1" color="gray">
                Decrypting image...
              </Text>
            </Flex>
          </Box>
        ) : imageUrl ? (
          <Box style={{ position: 'relative' }}>
            <img
              src={imageUrl}
              alt={attachment.fileName}
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                cursor: 'pointer',
              }}
              onClick={() => {
                // Open image in new tab/window for full view
                window.open(imageUrl!, '_blank');
              }}
              onError={() => {
                setError('Failed to load image');
              }}
            />
            <Box
              p="1"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              <Flex justify="between" align="center">
                <Text size="1" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                  {attachment.fileName}
                </Text>
                <Text size="1" color="gray" style={{ marginLeft: '8px' }}>
                  {formatFileSize(attachment.fileSize)}
                </Text>
              </Flex>
            </Box>
          </Box>
        ) : null}
      </Box>
    );
  }

  // Non-image file display
  return (
    <Box
      mt="2"
      p="2"
      style={{
        backgroundColor: 'var(--gray-a2)',
        borderRadius: 'var(--radius-2)',
        border: '1px solid var(--gray-a5)',
        maxWidth: '300px',
      }}
    >
      <Flex gap="2" align="center">
        <Text size="4">{fileIcon}</Text>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="2" weight="medium" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {attachment.fileName}
          </Text>
          <Text size="1" color="gray">
            {formatFileSize(attachment.fileSize)}
          </Text>
        </Box>
        {isDecrypting ? (
          <Spinner size="1" />
        ) : (
          <Button
            size="1"
            variant="soft"
            onClick={handleDownload}
            style={{ flexShrink: 0 }}
          >
            Download
          </Button>
        )}
      </Flex>
    </Box>
  );
}

