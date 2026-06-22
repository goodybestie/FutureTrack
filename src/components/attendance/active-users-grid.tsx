"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessions, useWifiStore } from "@/stores/wifi-store";
import { ConnectionBadge, AttendanceBadge } from "./connection-badge";
import { SignalIcon } from "./signal-icon";
import { LiveDuration } from "./live-duration";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw, MoreHorizontal, MapPin } from "lucide-react";
import type { UserSession } from "@/lib/wifi-engine/types";

interface UserCardProps {
  session: UserSession;
  onConnect: () => void;
  onDisconnect: () => void;
  onSignalDrop: () => void;
}

function UserCard({ session, onConnect, onDisconnect, onSignalDrop }: UserCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOnline = session.connectionState === "connected";
  const isTransitioning = session.connectionState === "connecting" ||
    session.connectionState === "reconnecting";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative bg-card border rounded-xl p-4 transition-all duration-300",
        isOnline && "border-emerald-200 dark:border-emerald-900/50 shadow-[0_0_0_1px_hsl(var(--border)),0_2px_8px_hsl(142_76%_36%/0.08)]",
        isTransitioning && "border-amber-200 dark:border-amber-900/50",
        !isOnline && !isTransitioning && "border-border opacity-75"
      )}
    >
      {/* Online pulse ring */}
      {isOnline && (
        <span className="absolute top-3 right-3 flex w-2.5 h-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500" />
        </span>
      )}

      {/* Avatar + name */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0",
          session.avatarColor
        )}>
          {getInitials(session.userName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{session.userName}</p>
          <p className="text-xs text-muted-foreground truncate">{session.department}</p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(s => !s)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-7 z-20 bg-card border border-border rounded-xl shadow-card-hover overflow-hidden w-44 py-1"
                >
                  {session.connectionState === "offline" ? (
                    <button onClick={() => { onConnect(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left">
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Connect
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { onSignalDrop(); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Simulate Signal Drop
                      </button>
                      <button onClick={() => { onDisconnect(); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left text-red-600 dark:text-red-400">
                        <WifiOff className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <ConnectionBadge state={session.connectionState} size="xs" />
        <AttendanceBadge status={session.attendanceStatus} size="xs" />
        {session.isLateArrival && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400">
            Late
          </span>
        )}
      </div>

      {/* Info rows */}
      <div className="space-y-1.5">
        {session.connectionState !== "offline" && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Signal</span>
            <SignalIcon dbm={session.signalStrength} showLabel size="sm" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</span>
          <LiveDuration session={session} className="text-xs" pulse />
        </div>

        {session.checkInTime && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-in</span>
            <span className="text-xs font-mono-custom text-foreground">
              {new Date(session.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}

        {session.connectionState === "connected" && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{session.location}</span>
          </div>
        )}
      </div>

      {/* Quick action button */}
      <div className="mt-3 pt-3 border-t border-border">
        {session.connectionState === "offline" ? (
          <Button variant="outline" size="xs" className="w-full" icon={<Wifi className="w-3 h-3" />} onClick={onConnect}>
            Connect
          </Button>
        ) : (
          <Button variant="ghost" size="xs" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            icon={<WifiOff className="w-3 h-3" />} onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface ActiveUsersGridProps {
  filter?: "all" | "online" | "offline";
}

export function ActiveUsersGrid({ filter = "all" }: ActiveUsersGridProps) {
  const sessions = useSessions();
  const { connectUser, disconnectUser, signalDrop } = useWifiStore();

  const displayed = sessions.filter(s => {
    if (filter === "online") return s.connectionState !== "offline";
    if (filter === "offline") return s.connectionState === "offline";
    return true;
  });

  return (
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <AnimatePresence mode="popLayout">
        {displayed.map(session => (
          <UserCard
            key={session.userId}
            session={session}
            onConnect={() => connectUser(session.userId)}
            onDisconnect={() => disconnectUser(session.userId)}
            onSignalDrop={() => signalDrop(session.userId)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
