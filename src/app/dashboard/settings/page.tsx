"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Building2, Bell, Shield, Palette, Clock, Database,
  Globe, Smartphone, ChevronRight, Check, Save
} from "lucide-react";

const settingsSections = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "attendance", label: "Attendance Rules", icon: Clock },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "devices", label: "Device Policies", icon: Smartphone },
  { id: "backup", label: "Backup & Export", icon: Database },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span className={cn(
        "absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-200",
        checked ? "left-[calc(100%-1.25rem)]" : "left-0.5"
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("organization");
  const [saved, setSaved] = useState(false);

  const [orgSettings, setOrgSettings] = useState({
    name: "FutureTrack Corp",
    email: "admin@futuretrack.io",
    timezone: "Africa/Lagos",
    language: "en" });

  const [notifSettings, setNotifSettings] = useState({
    lateArrival: true,
    absentAlert: true,
    unauthorizedDevice: true,
    weeklyReport: false,
    emailDigest: true,
    smsAlerts: false });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    ipWhitelist: false,
    auditLog: true,
    strongPasswords: true });

  const [attendanceSettings, setAttendanceSettings] = useState({
    workStart: "09:00",
    workEnd: "17:00",
    lateThreshold: "15",
    gracePeriod: "5",
    autoCheckout: true,
    allowRemote: true,
    geoFencing: false });

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "organization":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-display font-semibold mb-1">Organization Settings</h2>
              <p className="text-sm text-muted-foreground">{`Configure your organization's basic information.`}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Organization Name" value={orgSettings.name} onChange={e => setOrgSettings(p => ({ ...p, name: e.target.value }))} />
              <Input label="Admin Email" type="email" value={orgSettings.email} onChange={e => setOrgSettings(p => ({ ...p, email: e.target.value }))} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Timezone</label>
                <select className="h-9 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Language</label>
                <select className="h-9 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>English</option>
                  <option>French</option>
                  <option>Yoruba</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-display font-semibold mb-1">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">Choose what events trigger notifications.</p>
            </div>
            {[
              { key: "lateArrival", label: "Late Arrival Alerts", desc: "Notify when employees check in late" },
              { key: "absentAlert", label: "Absence Alerts", desc: "Alert when employees are absent without reason" },
              { key: "unauthorizedDevice", label: "Unauthorized Device Detected", desc: "Immediate alert for unknown devices" },
              { key: "weeklyReport", label: "Weekly Summary Report", desc: "Send attendance digest every Monday" },
              { key: "emailDigest", label: "Daily Email Digest", desc: "Receive daily attendance summary via email" },
              { key: "smsAlerts", label: "SMS Alerts", desc: "Critical alerts via SMS (charges may apply)" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifSettings[item.key as keyof typeof notifSettings]}
                  onChange={() => setNotifSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                />
              </div>
            ))}
          </div>
        );

      case "security":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-display font-semibold mb-1">Security Settings</h2>
              <p className="text-sm text-muted-foreground">{`Protect your organization's data and access.`}</p>
            </div>
            {[
              { key: "twoFactor", label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts" },
              { key: "ipWhitelist", label: "IP Whitelist", desc: "Restrict access to approved IP addresses only" },
              { key: "auditLog", label: "Audit Logging", desc: "Track all system actions and changes" },
              { key: "strongPasswords", label: "Strong Password Policy", desc: "Enforce minimum 12-char passwords with complexity" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={securitySettings[item.key as keyof typeof securitySettings] as boolean}
                  onChange={() => setSecuritySettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                />
              </div>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Session Timeout (minutes)" type="number" value={securitySettings.sessionTimeout}
                onChange={e => setSecuritySettings(p => ({ ...p, sessionTimeout: e.target.value }))} />
            </div>
          </div>
        );

      case "attendance":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-display font-semibold mb-1">Attendance Rules</h2>
              <p className="text-sm text-muted-foreground">Configure working hours and attendance policies.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Work Start Time" type="time" value={attendanceSettings.workStart}
                onChange={e => setAttendanceSettings(p => ({ ...p, workStart: e.target.value }))} />
              <Input label="Work End Time" type="time" value={attendanceSettings.workEnd}
                onChange={e => setAttendanceSettings(p => ({ ...p, workEnd: e.target.value }))} />
              <Input label="Late Threshold (minutes)" type="number" value={attendanceSettings.lateThreshold}
                onChange={e => setAttendanceSettings(p => ({ ...p, lateThreshold: e.target.value }))} />
              <Input label="Grace Period (minutes)" type="number" value={attendanceSettings.gracePeriod}
                onChange={e => setAttendanceSettings(p => ({ ...p, gracePeriod: e.target.value }))} />
            </div>
            {[
              { key: "autoCheckout", label: "Auto Check-out", desc: "Automatically check out employees at end of shift" },
              { key: "allowRemote", label: "Allow Remote Work", desc: "Enable tracking for remote employees" },
              { key: "geoFencing", label: "Geo-fencing", desc: "Require employees to be within office perimeter" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={attendanceSettings[item.key as keyof typeof attendanceSettings] as boolean}
                  onChange={() => setAttendanceSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
              {settingsSections.find(s => s.id === activeSection) && (
                (() => { const S = settingsSections.find(s => s.id === activeSection)!; return <S.icon className="w-5 h-5 text-muted-foreground" />; })()
              )}
            </div>
            <p className="text-sm font-semibold font-display">{settingsSections.find(s => s.id === activeSection)?.label}</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon — this section is under development.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Configure your workspace and preferences">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar nav */}
        <div className="lg:w-56 shrink-0">
          <Card padding="sm">
            <nav className="space-y-0.5">
              {settingsSections.map(section => {
                const Icon = section.icon;
                const active = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{section.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm" onClick={handleSave} icon={saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}>
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
