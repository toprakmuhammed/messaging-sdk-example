import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  IconButton,
} from "@radix-ui/themes";
import { GitHubLogoIcon, DiscordLogoIcon } from "@radix-ui/react-icons";
import { SessionKeyProvider } from "./providers/SessionKeyProvider";
import { MessagingClientProvider } from "./providers/MessagingClientProvider";

import { CreateChannel } from "./components/CreateChannel";
import { ChannelList } from "./components/ChannelList";
import { Channel } from "./components/Channel";
import { FeedbackCard } from "./components/FeedbackCard";
import { FeedbackBubble } from "./components/FeedbackBubble";
import { useState, useEffect } from "react";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { MessagingStatus } from "./components/MessagingStatus";
import { trackEvent, AnalyticsEvents } from "./utils/analytics";
import { useFeedback } from "./hooks/useFeedback";
import { FeedbackService } from "./services/feedbackService";
import LandingPage from "./pages/LandingPage";
import ExamplePage from "./pages/ExamplePage";

type Page = "LandingPage" | "ExamplePage";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("LandingPage");

  if (currentPage === "LandingPage") {
    return <LandingPage />;
  } else if (currentPage === "ExamplePage") {
    return <ExamplePage />;
  }
}

function App() {
  return (
    <SessionKeyProvider>
      <MessagingClientProvider>
        <AppContent />
      </MessagingClientProvider>
    </SessionKeyProvider>
  );
}

export default App;
