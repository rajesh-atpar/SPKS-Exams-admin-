import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconDownload,
  IconFilter,
  IconEye,
  IconUserPlus
} from "@tabler/icons-react"

export default function StudentsPage() {
  const students = [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 98765 43210",
      exam: "TNPSC Group 4",
      status: "active",
      enrolledDate: "2024-01-15",
      lastActive: "2024-03-20"
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 87654 32109",
      exam: "RRB NTPC",
      status: "completed",
      enrolledDate: "2024-01-10",
      lastActive: "2024-03-18"
    },
    {
      id: 3,
      name: "Mohan Singh",
      email: "mohan.singh@example.com",
      phone: "+91 76543 21098",
      exam: "TNUSRB",
      status: "inactive",
      enrolledDate: "2024-02-01",
      lastActive: "2024-02-15"
    },
    {
      id: 4,
      name: "Anita Devi",
      email: "anita.devi@example.com",
      phone: "+91 65432 10987",
      exam: "TNPSC Group 2",
      status: "active",
      enrolledDate: "2024-02-20",
      lastActive: "2024-03-19"
    },
    {
      id: 5,
      name: "Suresh Babu",
      email: "suresh.babu@example.com",
      phone: "+91 54321 09876",
      exam: "RRB Group D",
      status: "completed",
      enrolledDate: "2024-01-25",
      lastActive: "2024-03-17"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage student accounts and exam enrollments
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Badge variant="secondary">All</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">856</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">Done</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Badge variant="destructive">Action</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">36</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>
              Search and filter students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students List</CardTitle>
            <CardDescription>
              All registered students and their exam status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Phone</th>
                      <th className="text-left p-3 font-medium">Exam</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Enrolled</th>
                      <th className="text-left p-3 font-medium">Last Active</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{student.email}</td>
                        <td className="p-3 text-sm">{student.phone}</td>
                        <td className="p-3 text-sm">
                          <Badge variant="outline">{student.exam}</Badge>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(student.status)}
                        </td>
                        <td className="p-3 text-sm">{student.enrolledDate}</td>
                        <td className="p-3 text-sm">{student.lastActive}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing 1-5 of 1,234 students
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
