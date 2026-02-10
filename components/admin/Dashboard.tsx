"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const adminCardClass = "bg-white border-gray-200 text-gray-900 shadow-sm";
const adminMutedClass = "text-gray-500";

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your exams and activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className={`text-xs ${adminMutedClass}`}>No exams yet</p>
          </CardContent>
        </Card>
        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Active sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className={`text-xs ${adminMutedClass}`}>Running now</p>
          </CardContent>
        </Card>
        <Card className={adminCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className={`text-xs ${adminMutedClass}`}>All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content: Quick actions + Welcome */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={adminCardClass}>
          <CardHeader>
            <CardTitle className="text-gray-900">Quick actions</CardTitle>
            <CardDescription className={adminMutedClass}>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="bg-gray-900 text-white hover:bg-gray-800">
              <Link href="/admin">Create new exam</Link>
            </Button>
            <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Link href="/admin">View all exams</Link>
            </Button>
            <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Link href="/admin">Export results</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={adminCardClass}>
          <CardHeader>
            <CardTitle className="text-gray-900">Welcome</CardTitle>
            <CardDescription className={adminMutedClass}>You’re signed in to SPKS Exams Admin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${adminMutedClass}`}>
              Use the sidebar to switch between sections. Start by creating an exam or
              exploring the menu.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
