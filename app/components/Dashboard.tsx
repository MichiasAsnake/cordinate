"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "../actions/dashboard";
import { SimpleChecklist } from "@/components/checklist/SimpleChecklist";
import { ImageRefreshButton } from "./ImageRefreshButton";

interface DashboardProps {
  initialStats: DashboardStats;
}

export function Dashboard({ initialStats }: DashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUrgencyColor = (
    count: number,
    type: "overdue" | "today" | "tomorrow" | "later"
  ) => {
    if (count === 0) return "text-muted-foreground";

    switch (type) {
      case "overdue":
        return "text-destructive";
      case "today":
        return "text-yellow-600 dark:text-yellow-400";
      case "tomorrow":
        return "text-orange-600 dark:text-orange-400";
      case "later":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-foreground";
    }
  };

  const getUrgencyIcon = (type: "overdue" | "today" | "tomorrow" | "later") => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="w-5 h-5" />;
      case "today":
        return <Calendar className="w-5 h-5" />;
      case "tomorrow":
        return <Clock className="w-5 h-5" />;
      case "later":
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-foreground mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-foreground">
              {stats.totalJobs}
            </div>
            <div className="text-sm text-muted-foreground">Total Jobs</div>
          </div>
        </div>
      </div>

      {/* Job Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue Jobs */}
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center gap-2 text-lg ${getUrgencyColor(
                stats.overdueJobs,
                "overdue"
              )}`}
            >
              {getUrgencyIcon("overdue")}
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold mb-1 ${getUrgencyColor(
                stats.overdueJobs,
                "overdue"
              )}`}
            >
              {stats.overdueJobs}
            </div>
            <p className="text-sm text-muted-foreground">
              Past due & incomplete
            </p>
          </CardContent>
        </Card>

        {/* Due Today */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center gap-2 text-lg ${getUrgencyColor(
                stats.jobsDueToday,
                "today"
              )}`}
            >
              {getUrgencyIcon("today")}
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold mb-1 ${getUrgencyColor(
                stats.jobsDueToday,
                "today"
              )}`}
            >
              {stats.jobsDueToday}
            </div>
            <p className="text-sm text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        {/* Due Tomorrow */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center gap-2 text-lg ${getUrgencyColor(
                stats.jobsDueTomorrow,
                "tomorrow"
              )}`}
            >
              {getUrgencyIcon("tomorrow")}
              Due Tomorrow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold mb-1 ${getUrgencyColor(
                stats.jobsDueTomorrow,
                "tomorrow"
              )}`}
            >
              {stats.jobsDueTomorrow}
            </div>
            <p className="text-sm text-muted-foreground">Plan ahead</p>
          </CardContent>
        </Card>

        {/* Due in 2 Days */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center gap-2 text-lg ${getUrgencyColor(
                stats.jobsDueInTwoDays,
                "later"
              )}`}
            >
              {getUrgencyIcon("later")}
              In 2 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold mb-1 ${getUrgencyColor(
                stats.jobsDueInTwoDays,
                "later"
              )}`}
            >
              {stats.jobsDueInTwoDays}
            </div>
            <p className="text-sm text-muted-foreground">Coming up soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Checklist Section */}
      <div className="flex justify-center">
        <SimpleChecklist />
      </div>

      {/* Administrative Tools */}
      <div className="flex justify-end">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Admin Tools
          </h3>
          <ImageRefreshButton />
        </div>
      </div>
    </div>
  );
}
