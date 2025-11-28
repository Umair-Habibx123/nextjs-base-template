"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, BarChart3, Globe, MapPin, Users, UserPlus, Clock, TrendingUp, Sparkles, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import Loading from "../../components/layout/Loading";

const AppInfoPage = () => {
  const [appInfo, setAppInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [range, setRange] = useState("7");
  const { t } = useTranslation();

  const fetchAppInfo = async (selectedRange = range) => {
    try {
      if (selectedRange === range) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const res = await fetch(`/api/super-admin/app-information?range=${selectedRange}`);
      const result = await res.json();
      if (result.success) {
        setAppInfo(result.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error fetching app info:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppInfo();
  }, []);

  if (loading || !appInfo) {
    return <Loading message="Fetching App Information..." />;
  }

  const {
    visitorsToday,
    uniqueVisitors,
    signups,
    avgSessionDuration,
    bounceRate,
    trend,
    systemStatus,
    topCountries,
    topCities,
    returningVisitors,
  } = appInfo;

  const colors = ["#2563eb", "#10b981", "#f97316", "#8b5cf6", "#14b8a6", "#ef4444"];

  const getStatusColor = (status) => {
    switch (status) {
      case "Online": return "success";
      case "Degraded": return "warning";
      case "Offline": return "error";
      default: return "base-content";
    }
  };

  const metrics = [
    {
      title: t("Visitors Today"),
      value: visitorsToday,
      desc: t("Total visits today"),
      icon: <Users className="w-6 h-6" />,
      color: "primary",
    },
    {
      title: t("Unique Visitors"),
      value: uniqueVisitors,
      desc: t("Distinct users today"),
      icon: <UserPlus className="w-6 h-6" />,
      color: "secondary",
    },
    {
      title: t("New Signups"),
      value: signups,
      desc: t("Registered users today"),
      icon: <TrendingUp className="w-6 h-6" />,
      color: "accent",
    },
    {
      title: t("Avg. Session"),
      value: avgSessionDuration,
      desc: t("Average duration"),
      icon: <Clock className="w-6 h-6" />,
      color: "info",
    },
  ];

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Activity className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("App Dashboard")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Monitor your app performance and usage analytics in real-time.")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-3">
            <select
              className="select select-bordered rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50"
              value={range}
              onChange={(e) => {
                setRange(e.target.value);
                fetchAppInfo(e.target.value);
              }}
            >
              <option value="7">{t("Last 7 Days")}</option>
              <option value="30">{t("Last 30 Days")}</option>
              <option value="90">{t("Last 90 Days")}</option>
              <option value="all">{t("All Time")}</option>
            </select>

            <button
              onClick={() => fetchAppInfo()}
              disabled={refreshing}
              className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t("Refreshing...")}
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  {t("Refresh")}
                </>
              )}
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-base-content/60">
              {t("Last updated")}: <span className="font-semibold text-primary">{lastUpdated}</span>
            </p>
          )}
        </div>
      </div>

      {/* 📊 Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-lg transition-all duration-300 p-6 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${metric.color}/10 text-${metric.color}`}>
                {metric.icon}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-base-content">{metric.value}</p>
              <p className="text-lg font-semibold text-base-content/80">{metric.title}</p>
              <p className="text-sm text-base-content/60">{metric.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visitors Trend Chart */}
        <div className="xl:col-span-2 bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Visitors Trend")}
              </h2>
              <p className="text-base-content/60 text-sm">
                {range === "all" ? t("All Time") : t(`Last ${range} Days`)}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--bc) / 0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--bc) / 0.6)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--b1))",
                  border: "1px solid hsl(var(--bc) / 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-info/10 text-info">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Performance")}
              </h2>
              <p className="text-base-content/60 text-sm">
                {t("Key performance indicators")}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Bounce Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-base-content/80">{t("Bounce Rate")}</span>
                <span className="text-lg font-bold text-error">{bounceRate}%</span>
              </div>
              <progress 
                className="progress progress-error w-full" 
                value={bounceRate} 
                max="100" 
              />
            </div>

            {/* Returning Visitors */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-base-content/80">{t("Returning Visitors")}</span>
                <span className="text-lg font-bold text-success">{returningVisitors || "62"}%</span>
              </div>
              <progress 
                className="progress progress-success w-full" 
                value={returningVisitors || 62} 
                max="100" 
              />
            </div>

            {/* System Status */}
            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/80">{t("System Status")}</span>
                <span className={`badge badge-lg badge-${getStatusColor(systemStatus)} text-${getStatusColor(systemStatus)}-content`}>
                  {t(systemStatus)}
                </span>
              </div>
              <p className="text-xs text-base-content/60 mt-2">
                {systemStatus === "Online" 
                  ? t("All systems operational")
                  : systemStatus === "Degraded"
                  ? t("Some services may be affected")
                  : t("System maintenance in progress")
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🌍 Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Top Countries")}
              </h2>
              <p className="text-base-content/60 text-sm">
                {t("Visitor distribution by country")}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topCountries.slice(0, 6)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
              <XAxis type="number" stroke="hsl(var(--bc) / 0.6)" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="country" 
                stroke="hsl(var(--bc) / 0.6)" 
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--b1))",
                  border: "1px solid hsl(var(--bc) / 0.2)",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="c" radius={[0, 4, 4, 0]}>
                {topCountries.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Top Cities")}
              </h2>
              <p className="text-base-content/60 text-sm">
                {t("Visitor distribution by city")}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {topCities.slice(0, 8).map((city, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl border border-base-300/20 hover:bg-base-200/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-base-content">{city.city}</p>
                    <p className="text-xs text-base-content/60">{city.country}</p>
                  </div>
                </div>
                <span className="font-bold text-lg text-primary">{city.c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppInfoPage;