"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translationsReadyPromise } from "../../../../i18n";
import { Server, RefreshCw, Loader2, Cpu, MemoryStick, HardDrive, Monitor, Network, Battery, Gauge, Activity, Sparkles } from "lucide-react";
import Loading from "../../components/layout/Loading";

export default function SystemInfoPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { t, ready } = useTranslation();

  const fetchInfo = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const res = await fetch("/api/admin/system-information", { cache: "no-store" });
      const result = await res.json();
      if (result.success) {
        setInfo(result.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        console.error("Failed to fetch system info:", result.error);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    translationsReadyPromise.then(() => {
      setTimeout(() => setLoading(false), 100);
    });
    fetchInfo();
  }, []);

  if (!ready || loading || !info) {
    return <Loading message="Fetching System Information..." />;
  }

  const { cpu, mem, osInfo, fsSize, networkInterfaces, system, battery } = info;
  const totalRAM = (mem.total / 1024 / 1024 / 1024).toFixed(1);
  const usedRAM = (mem.used / 1024 / 1024 / 1024).toFixed(1);
  const ramUsage = ((mem.used / mem.total) * 100).toFixed(1);
  const uptimeHours = (osInfo.uptime / 3600).toFixed(1);

  const getUsageColor = (percentage) => {
    if (percentage < 50) return "success";
    if (percentage < 80) return "warning";
    return "error";
  };

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Activity className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("System Information")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Real-time overview of your server's status and resources.")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => fetchInfo(true)}
            disabled={refreshing}
            className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("Refreshing...")}
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                {t("Refresh")}
              </>
            )}
          </button>
          {lastUpdated && (
            <p className="text-sm text-base-content/60">
              {t("Last updated")}: <span className="font-semibold text-primary">{lastUpdated}</span>
            </p>
          )}
        </div>
      </div>

      {/* 📊 System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex justify-center mb-2">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{cpu?.currentLoad?.toFixed(1)}%</div>
          <div className="text-sm text-base-content/70">{t("CPU Load")}</div>
        </div>
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex justify-center mb-2">
            <MemoryStick className="w-8 h-8 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-secondary">{ramUsage}%</div>
          <div className="text-sm text-base-content/70">{t("Memory Usage")}</div>
        </div>
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex justify-center mb-2">
            <Gauge className="w-8 h-8 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">{uptimeHours}h</div>
          <div className="text-sm text-base-content/70">{t("Uptime")}</div>
        </div>
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex justify-center mb-2">
            <HardDrive className="w-8 h-8 text-info" />
          </div>
          <div className="text-2xl font-bold text-info">{fsSize?.length || 0}</div>
          <div className="text-sm text-base-content/70">{t("Disks")}</div>
        </div>
      </div>

      {/* 🧩 Detailed Information Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {/* CPU Information */}
        <InfoCard 
          title={t("Processor")} 
          icon={<Cpu className="w-5 h-5" />}
          status={cpu?.currentLoad < 80 ? "healthy" : "warning"}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-base-content/70">{t("Model")}</p>
              <p className="text-base-content font-medium truncate">{cpu?.brand}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">{t("Cores")}</p>
                <p className="text-base-content font-semibold">{cpu?.cores}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">{t("Speed")}</p>
                <p className="text-base-content font-semibold">{cpu?.speed} GHz</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-base-content/70">{t("Current Load")}</span>
                <span className="font-semibold">{cpu?.currentLoad?.toFixed(1)}%</span>
              </div>
              <progress 
                className={`progress progress-${getUsageColor(cpu?.currentLoad)} w-full`} 
                value={cpu?.currentLoad} 
                max="100" 
              />
            </div>
          </div>
        </InfoCard>

        {/* Memory Information */}
        <InfoCard 
          title={t("Memory")} 
          icon={<MemoryStick className="w-5 h-5" />}
          status={ramUsage < 80 ? "healthy" : "warning"}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">{t("Total")}</p>
                <p className="text-base-content font-semibold">{totalRAM} GB</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">{t("Used")}</p>
                <p className="text-base-content font-semibold">{usedRAM} GB</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-base-content/70">{t("Usage")}</span>
                <span className="font-semibold">{ramUsage}%</span>
              </div>
              <progress 
                className={`progress progress-${getUsageColor(ramUsage)} w-full`} 
                value={ramUsage} 
                max="100" 
              />
            </div>
          </div>
        </InfoCard>

        {/* Disk Information */}
        <InfoCard 
          title={t("Storage")} 
          icon={<HardDrive className="w-5 h-5" />}
          status="healthy"
        >
          <div className="space-y-4">
            {fsSize.map((disk, i) => {
              const usedPct = ((disk.used / disk.size) * 100).toFixed(1);
              return (
                <div key={i} className="pb-3 border-b border-base-300/30 last:border-none last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-base-content text-sm">{disk.mount}</p>
                    <span className="text-xs text-base-content/60">
                      {usedPct}%
                    </span>
                  </div>
                  <progress 
                    className={`progress progress-${getUsageColor(usedPct)} w-full`} 
                    value={usedPct} 
                    max="100" 
                  />
                  <p className="text-xs text-base-content/50 mt-1">
                    {(disk.used / 1024 / 1024 / 1024).toFixed(1)} GB / {(disk.size / 1024 / 1024 / 1024).toFixed(1)} GB
                  </p>
                </div>
              );
            })}
          </div>
        </InfoCard>

        {/* Operating System */}
        <InfoCard 
          title={t("Operating System")} 
          icon={<Monitor className="w-5 h-5" />}
          status="healthy"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-base-content/70">{t("Distribution")}</p>
              <p className="text-base-content font-medium">{osInfo.distro}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">{t("Platform")}</p>
                <p className="text-base-content font-semibold">{osInfo.platform}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">{t("Arch")}</p>
                <p className="text-base-content font-semibold">{osInfo.arch}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-base-content/70">{t("Hostname")}</p>
              <p className="text-base-content font-medium">{osInfo.hostname}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <p className="text-sm font-semibold text-primary">{t("Uptime")}: {uptimeHours}h</p>
            </div>
          </div>
        </InfoCard>

        {/* System Hardware */}
        <InfoCard 
          title={t("System Hardware")} 
          icon={<Server className="w-5 h-5" />}
          status="healthy"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-base-content/70">{t("Manufacturer")}</p>
              <p className="text-base-content font-medium">{system.manufacturer}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-base-content/70">{t("Model")}</p>
              <p className="text-base-content font-medium">{system.model}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-base-content/70">{t("Version")}</p>
              <p className="text-base-content font-medium">{system.version}</p>
            </div>
            {system.serial && (
              <div>
                <p className="text-sm font-semibold text-base-content/70">{t("Serial")}</p>
                <p className="text-base-content font-mono text-sm">{system.serial}</p>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Network Interfaces */}
        <InfoCard 
          title={t("Network")} 
          icon={<Network className="w-5 h-5" />}
          status="healthy"
        >
          <div className="space-y-4">
            {networkInterfaces.length ? (
              networkInterfaces.map((net, i) => (
                <div key={i} className="pb-3 border-b border-base-300/30 last:border-none last:pb-0">
                  <p className="font-semibold text-base-content text-sm mb-2">{net.iface}</p>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-base-content/70">IP:</span> {net.ip4}</p>
                    <p><span className="text-base-content/70">MAC:</span> {net.mac}</p>
                    {net.speed && (
                      <p><span className="text-base-content/70">Speed:</span> {net.speed} Mbps</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-base-content/60 text-center py-4">{t("No active network interfaces")}</p>
            )}
          </div>
        </InfoCard>

        {/* Battery */}
        {battery && (
          <InfoCard 
            title={t("Battery")} 
            icon={<Battery className="w-5 h-5" />}
            status={battery.percent > 20 ? "healthy" : "warning"}
          >
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{battery.percent}%</div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={battery.percent} 
                  max="100" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-base-200/50 rounded-lg">
                  <p className="text-base-content/70">{t("Charging")}</p>
                  <p className={`font-semibold ${battery.ischarging ? 'text-success' : 'text-base-content'}`}>
                    {battery.ischarging ? t('Yes') : t('No')}
                  </p>
                </div>
                <div className="text-center p-2 bg-base-200/50 rounded-lg">
                  <p className="text-base-content/70">{t("AC Connected")}</p>
                  <p className={`font-semibold ${battery.acconnected ? 'text-success' : 'text-base-content'}`}>
                    {battery.acconnected ? t('Yes') : t('No')}
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>
        )}

        {/* Graphics */}
        {info.graphics?.length > 0 && (
          <InfoCard 
            title={t("Graphics")} 
            icon={<Monitor className="w-5 h-5" />}
            status="healthy"
          >
            <div className="space-y-4">
              {info.graphics.map((gpu, i) => (
                <div key={i} className="pb-3 border-b border-base-300/30 last:border-none last:pb-0">
                  <p className="font-semibold text-base-content text-sm mb-1">{gpu.model}</p>
                  <p className="text-xs text-base-content/70">{gpu.vendor}</p>
                  {gpu.vram && (
                    <p className="text-xs text-base-content/60">VRAM: {gpu.vram} MB</p>
                  )}
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>

      {/* 📊 System Processes & Services */}
      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard 
          title={t("Top Processes")} 
          icon={<Activity className="w-5 h-5" />}
          status="healthy"
        >
          {info.topProcesses?.length ? (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="bg-base-200/50">
                  <tr className="text-sm text-base-content/70">
                    <th>{t("Process")}</th>
                    <th className="text-right">{t("CPU")}</th>
                    <th className="text-right">{t("Memory")}</th>
                  </tr>
                </thead>
                <tbody>
                  {info.topProcesses.slice(0, 8).map((p, i) => (
                    <tr key={i} className="hover:bg-base-200/50 transition-colors">
                      <td className="font-medium text-sm max-w-[120px] truncate">{p.name}</td>
                      <td className="text-right">
                        <span className="badge badge-sm badge-outline">{p.cpu}%</span>
                      </td>
                      <td className="text-right text-sm text-base-content/70">{p.memMB} MB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-base-content/60 text-center py-8">{t("No process data available")}</p>
          )}
        </InfoCard>

        <InfoCard 
          title={t("Running Services")} 
          icon={<Server className="w-5 h-5" />}
          status="healthy"
        >
          {info.runningServices?.length ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {info.runningServices.slice(0, 10).map((svc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-base-200/30 rounded-lg">
                  <span className="font-medium text-sm">{svc.name}</span>
                  <span className="badge badge-sm badge-outline">{svc.startmode}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60 text-center py-8">{t("No running services")}</p>
          )}
        </InfoCard>
      </div>
    </section>
  );
}

/* 🪟 Modern Card Component */
function InfoCard({ title, icon, children, status = "healthy" }) {
  const statusColors = {
    healthy: "border-success/20",
    warning: "border-warning/20",
    error: "border-error/20"
  };

  return (
    <div className={`
      bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 
      rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-lg transition-all duration-300 p-6
      hover:scale-[1.02] ${statusColors[status]}
    `}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-base-content">{title}</h2>
      </div>
      <div className="text-sm text-base-content/80">{children}</div>
    </div>
  );
}