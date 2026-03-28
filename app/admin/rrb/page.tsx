import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function RRBPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RRB Exams</h1>
            <p className="text-muted-foreground">
              Railway Recruitment Board Examination Management
            </p>
          </div>
          <Button>Create RRB Exam</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <Badge variant="secondary">RRB</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                1 scheduled next week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Badge variant="secondary">Enrolled</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground">
                +18 new this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Badge variant="secondary">Performance</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last batch
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Badge variant="destructive">Action</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Results to be published
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exams */}
        <Card>
          <CardHeader>
            <CardTitle>RRB Exam Schedule</CardTitle>
            <CardDescription>
              Upcoming and recent RRB examinations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">RRB NTPC</p>
                    <p className="text-sm text-muted-foreground">98 students completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Completed</Badge>
                  <Button variant="outline" size="sm">View Results</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">RRB Group D</p>
                    <p className="text-sm text-muted-foreground">67 students in progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">In Progress</Badge>
                  <Button variant="outline" size="sm">Monitor</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">RRB ALP</p>
                    <p className="text-sm text-muted-foreground">34 students scheduled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Scheduled</Badge>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </div>
            <Separator />
            <Button variant="outline" className="w-full">View All RRB Exams</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
