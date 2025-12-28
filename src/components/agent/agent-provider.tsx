"use client";

import { AgentProvider as InngestAgentProvider } from "@inngest/use-agent";
import { useAuth } from "@clerk/nextjs";

interface AgentProviderProps {
  children: React.ReactNode;
}

/**
 * Agent Provider wrapper with authentication
 * Wraps children with Inngest AgentProvider for real-time agent interactions
 */
export function AgentProvider({ children }: AgentProviderProps) {
  const { userId } = useAuth();

  // If no user, render children without provider
  if (!userId) {
    return <>{children}</>;
  }

  return (
    <InngestAgentProvider userId={userId}>
      {children}
    </InngestAgentProvider>
  );
}

export default AgentProvider;
