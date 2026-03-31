import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconDownload,
  IconFilter,
  IconEye,
  IconFileText,
  IconUpload,
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconFolder,
  IconPdf,
  IconFile
} from "@tabler/icons-react"

export default function TNPSCPage() {
  const documents = [
    {
      id: 1,
      title: "TNPSC Group 4 Syllabus 2024",
      type: "PDF",
      size: "3.2 MB",
      uploadedBy: "Admin",
      uploadDate: "2024-03-15",
      status: "published",
      category: "Syllabus",
      downloads: 234
    },
    {
      id: 2,
      title: "TNPSC Group 2 Previous Papers",
      type: "Folder",
      size: "28 items",
      uploadedBy: "Admin",
      uploadDate: "2024-03-10",
      status: "published",
      category: "Previous Papers",
      downloads: 156
    },
    {
      id: 3,
      title: "TNPSC Mock Test Series",
      type: "PDF",
      size: "2.1 MB",
      uploadedBy: "Admin",
      uploadDate: "2024-03-08",
      status: "draft",
      category: "Mock Tests",
      downloads: 0
    },
    {
      id: 4,
      title: "TNPSC Study Materials",
      type: "Folder",
      size: "35 items",
      uploadedBy: "Admin",
      uploadDate: "2024-03-05",
      status: "published",
      category: "Study Materials",
      downloads: 378
    },
    {
      id: 5,
      title: "TNPSC Exam Schedule 2024",
      type: "PDF",
      size: "1.2 MB",
      uploadedBy: "Admin",
      uploadDate: "2024-03-01",
      status: "published",
      category: "Schedule",
      downloads: 689
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <IconPdf className="h-4 w-4" />
      case "Folder":
        return <IconFolder className="h-4 w-4" />
      default:
        return <IconFile className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TNPSC Administration</h1>
            <p className="text-muted-foreground">
              Manage TNPSC exam documents and materials
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <Badge variant="secondary">TNPSC</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">52</div>
              <p className="text-xs text-muted-foreground">
                +12 new this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Badge className="bg-green-100 text-green-800">Live</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-xs text-muted-foreground">
                +8 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Badge variant="secondary">All Time</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,457</div>
              <p className="text-xs text-muted-foreground">
                +31% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Documents</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>
              Add new TNPSC exam materials or documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input id="title" placeholder="Enter document title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select category</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="previous-papers">Previous Papers</option>
                  <option value="mock-tests">Mock Tests</option>
                  <option value="study-materials">Study Materials</option>
                  <option value="schedule">Exam Schedule</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    className="flex-1"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button variant="outline">
                    <IconUpload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Enter document description"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>
              Search and filter TNPSC documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Categories</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="previous-papers">Previous Papers</option>
                  <option value="mock-tests">Mock Tests</option>
                  <option value="study-materials">Study Materials</option>
                  <option value="schedule">Exam Schedule</option>
                </select>
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
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

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>TNPSC Documents</CardTitle>
            <CardDescription>
              Manage all TNPSC exam documents and materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Document</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Size</th>
                      <th className="text-left p-3 font-medium">Uploaded By</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Downloads</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.type)}
                            <span className="font-medium">{doc.title}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{doc.type}</Badge>
                        </td>
                        <td className="p-3 text-sm">{doc.category}</td>
                        <td className="p-3 text-sm">{doc.size}</td>
                        <td className="p-3 text-sm">{doc.uploadedBy}</td>
                        <td className="p-3 text-sm">{doc.uploadDate}</td>
                        <td className="p-3">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="p-3 text-sm">{doc.downloads}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconDownload className="h-4 w-4" />
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
                Showing 1-5 of 52 documents
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
