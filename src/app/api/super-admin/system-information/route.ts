import si from "systeminformation";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  try {
    const [
      system,
      cpu,
      mem,
      osInfo,
      currentLoad,
      fsSize,
      networkInterfaces,
      battery,
      time,
      cpuSpeed,
      graphics,
      processes,
      services,
    ] = await Promise.all([
      si.system(),
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.currentLoad(),
      si.fsSize(),
      si.networkInterfaces(),
      si.battery(),
      si.time(),
      si.cpuCurrentSpeed(),
      si.graphics(),
      si.processes(),
      si.services("*"),
    ]);

    const activeIfaces = networkInterfaces
      .filter(
        (n) =>
          n.operstate === "up" &&
          n.ip4 &&
          n.ip4 !== "127.0.0.1" &&
          !n.iface.toLowerCase().includes("loopback") &&
          !n.iface.toLowerCase().includes("bluetooth")
      )
      .map((n) => ({
        iface: n.iface,
        ip4: n.ip4,
        mac: n.mac,
        speed: n.speed > 0 ? n.speed : null,
        type: n.type,
        operstate: n.operstate,
      }));

    const topProcesses =
      processes?.list
        ?.sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
        ?.slice(0, 8)
        ?.map((p) => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu?.toFixed?.(1) ?? "0.0",
          memMB: (p.memRss / 1024 / 1024).toFixed(1),
          user: p.user || "N/A",
        })) || [];

    const runningServices = (services || [])
      .filter((s) => s.running)
      .slice(0, 10)
      .map((s) => ({
        name: s.name,
        startmode: s.startmode,
      }));

    const data = {
      system,
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpuSpeed.avg || cpu.speed,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        processors: cpu.processors,
        currentLoad:
          typeof currentLoad.currentLoad === "number"
            ? currentLoad.currentLoad
            : null,
      },
      mem: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
      },
      osInfo: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        uptime: time.uptime,
      },
      fsSize,
      networkInterfaces: activeIfaces,
      battery: battery.hasBattery
        ? {
            percent: battery.percent,
            ischarging: battery.isCharging,
            acconnected: battery.acConnected,
          }
        : null,
      graphics: graphics?.controllers?.map((g) => ({
        vendor: g.vendor,
        model: g.model,
        vram: g.vram,
      })),
      topProcesses,
      runningServices,
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("System info error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
