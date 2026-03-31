"use client";

import { useRef, useState, useEffect } from "react";
import {
  IconCheck,
  IconDownload,
  IconEdit,
  IconFileText,
  IconFolder,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconVideo,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LeafNode = {
  id: string;
  kind: "leaf";
  title: string;
  description: string;
  documents: number;
  lastUpdated: string;
};

type BranchNode = {
  id: string;
  kind: "branch";
  title: string;
  description: string;
  children: TreeNode[];
};

type TreeNode = LeafNode | BranchNode;

type DocumentRecord = {
  id: number;
  title: string;
  type: string;
  category: string;
  size: string;
  file_path: string;
  uploaded_by: string;
  status: string;
  downloads: number;
  created_at: string;
  updated_at: string;
};

type ApiResponse = {
  success: boolean;
  data: DocumentRecord[];
  total: number;
};

type StatsData = {
  totalDocuments: number;
  published: number;
  totalDownloads: number;
  draftDocuments: number;
  categoryBreakdown?: Array<{
    category: string;
    count: number;
  }>;
};

const defaultUploadTarget = "Test / Group D / Full Test";

const rrbContentTree: TreeNode[] = [
  {
    id: "notes",
    kind: "branch",
    title: "Notes",
    description: "Subject-wise notes sections for the RRB workspace.",
    children: [
      {
        id: "notes-mathematics",
        kind: "leaf",
        title: "Mathematics",
        description: "Chapter notes, shortcuts, and revision sheets.",
        documents: 12,
        lastUpdated: "Updated 2 days ago",
      },
      {
        id: "notes-reasoning",
        kind: "leaf",
        title: "Reasoning",
        description: "Logical reasoning notes and solved examples.",
        documents: 9,
        lastUpdated: "Updated yesterday",
      },
      {
        id: "notes-general-awareness",
        kind: "leaf",
        title: "General Awareness",
        description: "Current affairs, static GK, and revision packs.",
        documents: 7,
        lastUpdated: "Updated 4 days ago",
      },
      {
        id: "notes-science",
        kind: "leaf",
        title: "Science",
        description: "Physics, chemistry, and biology topic notes.",
        documents: 11,
        lastUpdated: "Updated 5 days ago",
      },
      {
        id: "notes-basics-of-computer",
        kind: "leaf",
        title: "Basics of Computer",
        description: "Computer fundamentals, shortcuts, and quick facts.",
        documents: 5,
        lastUpdated: "Updated 1 week ago",
      },
      {
        id: "notes-environment-and-pollution",
        kind: "leaf",
        title: "Environment & Pollution",
        description: "Eco-system, pollution control, and important facts.",
        documents: 4,
        lastUpdated: "Updated 6 days ago",
      },
      {
        id: "notes-technical-subject",
        kind: "leaf",
        title: "Technical Subject",
        description: "Technical-topic notes for role-based preparation.",
        documents: 8,
        lastUpdated: "Updated 3 days ago",
      },
    ],
  },
  {
    id: "test",
    kind: "branch",
    title: "Test",
    description: "Structured practice areas based on your handwritten flow.",
    children: [
      {
        id: "test-group-d",
        kind: "branch",
        title: "Group D",
        description: "Group D test buckets with final upload points.",
        children: [
          {
            id: "test-group-d-topic-wise",
            kind: "leaf",
            title: "Topic Wise",
            description: "Upload chapter-based practice tests for Group D.",
            documents: 16,
            lastUpdated: "Updated this morning",
          },
          {
            id: "test-group-d-full-test",
            kind: "leaf",
            title: "Full Test",
            description: "Upload complete Group D mock tests and answer keys.",
            documents: 13,
            lastUpdated: "Updated today",
          },
        ],
      },
      {
        id: "test-others",
        kind: "branch",
        title: "Others",
        description: "Shared structure for NTPC, JE, and ALP exam paths.",
        children: [
          {
            id: "test-others-cbt-1",
            kind: "branch",
            title: "CBT 1",
            description: "First-stage practice branches.",
            children: [
              {
                id: "test-others-cbt-1-topic-wise",
                kind: "leaf",
                title: "Topic Wise",
                description: "Upload CBT 1 topic-wise sets for NTPC, JE, and ALP.",
                documents: 10,
                lastUpdated: "Updated yesterday",
              },
              {
                id: "test-others-cbt-1-full-test",
                kind: "leaf",
                title: "Full Test",
                description: "Upload CBT 1 full-length test papers.",
                documents: 6,
                lastUpdated: "Updated 3 days ago",
              },
            ],
          },
          {
            id: "test-others-cbt-2",
            kind: "branch",
            title: "CBT 2",
            description: "Second-stage practice branches.",
            children: [
              {
                id: "test-others-cbt-2-topic-wise",
                kind: "leaf",
                title: "Topic Wise",
                description: "Upload CBT 2 topic-wise sets for advanced practice.",
                documents: 8,
                lastUpdated: "Updated 2 days ago",
              },
              {
                id: "test-others-cbt-2-full-test",
                kind: "leaf",
                title: "Full Test",
                description: "Upload CBT 2 full test packs and model answers.",
                documents: 5,
                lastUpdated: "Updated 1 week ago",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "video-explain",
    kind: "branch",
    title: "Video Explain",
    description: "Private-connect YouTube section for explanation videos.",
    children: [
      {
        id: "video-private-connect-youtube",
        kind: "leaf",
        title: "Private Connect YouTube",
        description: "Upload supporting documents or save private lesson links.",
        documents: 3,
        lastUpdated: "Updated yesterday",
      },
    ],
  },
];

const recentDocuments: DocumentRecord[] = [
  {
    id: 1,
    title: "RRB Group D Full Test 01",
    target: "Test / Group D / Full Test",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-28",
    status: "Published",
  },
  {
    id: 2,
    title: "RRB Group D Algebra Topic Set",
    target: "Test / Group D / Topic Wise",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-27",
    status: "Published",
  },
  {
    id: 3,
    title: "CBT 1 General Science Practice Pack",
    target: "Test / Others / CBT 1 / Topic Wise",
    type: "ZIP",
    uploadedBy: "Content Team",
    uploadDate: "2026-03-26",
    status: "Draft",
  },
  {
    id: 4,
    title: "Mathematics Quick Revision Notes",
    target: "Notes / Mathematics",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-25",
    status: "Published",
  },
  {
    id: 5,
    title: "Reasoning Marathon Private Session",
    target: "Video Explain / Private Connect YouTube",
    type: "Link",
    uploadedBy: "Faculty Team",
    uploadDate: "2026-03-24",
    status: "Published",
  },
];

function countLeafNodes(nodes: TreeNode[]): number {
  return nodes.reduce((total, node) => {
    if (node.kind === "leaf") {
      return total + 1;
    }

    return total + countLeafNodes(node.children);
  }, 0);
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return nodes;
  }

  return nodes.reduce<TreeNode[]>((result, node) => {
    const matchesNode = `${node.title} ${node.description}`
      .toLowerCase()
      .includes(normalizedQuery);

    if (node.kind === "leaf") {
      if (matchesNode) {
        result.push(node);
      }

      return result;
    }

    const matchingChildren = filterTree(node.children, query);

    if (matchesNode || matchingChildren.length > 0) {
      result.push({
        ...node,
        children: matchesNode && matchingChildren.length === 0 ? node.children : matchingChildren,
      });
    }

    return result;
  }, []);
}

export default function RRBPage() {
  const uploadCardRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTarget, setSelectedTarget] = useState(defaultUploadTarget);
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalDocuments: 0,
    published: 0,
    totalDownloads: 0,
    draftDocuments: 0
  });
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentType, setDocumentType] = useState("PDF");
  const [documentAccess, setDocumentAccess] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    status: 'published'
  });

  // Fetch documents from backend
  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/rrb');
      const data: ApiResponse = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/rrb/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredTree = filterTree(rrbContentTree, searchQuery);
  const totalLeafNodes = countLeafNodes(rrbContentTree);
  const visibleLeafNodes = countLeafNodes(filteredTree);

  const filteredDocuments = documents.filter((document) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      `${document.title} ${document.category} ${document.type}`
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesQuery;
  });

  function openUploadForTarget(target: string) {
    setSelectedTarget(target);
    uploadCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 250);

    toast.success(`Upload ready for ${target}`);
  }

  const handleViewDocument = async (document: DocumentRecord) => {
    try {
      const response = await fetch(`http://localhost:4000/api/rrb/${document.id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedDocument(data.data);
        setShowDocumentModal(true);
      } else {
        toast.error('Failed to fetch document details');
      }
    } catch (error) {
      console.error('View document error:', error);
      toast.error('Failed to fetch document details');
    }
  };

  const handleEditDocument = (document: DocumentRecord) => {
    setSelectedDocument(document);
    setEditForm({
      title: document.title,
      category: document.category,
      status: document.status
    });
    setShowEditModal(true);
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`http://localhost:4000/api/rrb/${selectedDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Document updated successfully');
        setShowEditModal(false);
        fetchDocuments(); // Refresh documents list
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed');
    }
  };

  const handleDownload = async (document: DocumentRecord) => {
    try {
      // Download file directly from the download endpoint
      const response = await fetch(`http://localhost:4000/api/rrb/${document.id}/download`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      // Refresh documents to update download count
      fetchDocuments();
      toast.success('Download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const handleDelete = async (document: DocumentRecord) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/rrb/${document.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Document deleted successfully');
        fetchDocuments(); // Refresh documents list
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
    }
  };

  async function handleUpload() {
    const trimmedTitle = documentTitle.trim();
    const trimmedAccess = documentAccess.trim();

    if (!trimmedTitle) {
      toast.error("Enter the document title first.");
      titleInputRef.current?.focus();
      return;
    }

    if (!selectedFileName && !trimmedAccess) {
      toast.error("Choose a file or add an access label/link.");
      fileInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('category', selectedTarget);
      formData.append('description', documentDescription);
      
      if (selectedFileName && fileInputRef.current?.files?.[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }

      const response = await fetch('http://localhost:4000/api/rrb', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Uploaded ${trimmedTitle} successfully!`);
        fetchDocuments(); // Refresh the documents list
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsLoading(false);
    }

    // Reset form
    setDocumentTitle("");
    setDocumentAccess("");
    setDocumentDescription("");
    setSelectedFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">RRB Content Structure</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => openUploadForTarget(defaultUploadTarget)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Jump To Default Upload
            </Button>
            <Button type="button" variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Structure
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <CardDescription>All RRB documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CardDescription>Live documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <CardDescription>All time downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Draft Documents</CardTitle>
              <CardDescription>Documents needing review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftDocuments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Documents by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {stats.categoryBreakdown.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <IconCheck className="h-4 w-4" />
          <AlertTitle>Upload button added at the end of each topic path</AlertTitle>
          <AlertDescription>
            Click `Upload New Document` on any last node. The uploader below will
            automatically point to that exact destination.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Search The Topic Tree</CardTitle>
            <CardDescription>
              Filter notes, tests, CBT stages, and video sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for Group D, Full Test, Mathematics, CBT 1..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>RRB Topic Map</CardTitle>
            <CardDescription>
              Each last-level topic has an `Upload New Document` action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {filteredTree.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No topics matched your search. Try `Group D`, `CBT 2`, or `Notes`.
              </div>
            ) : (
              filteredTree.map((node) => (
                <TopicNode
                  key={node.id}
                  node={node}
                  path={[]}
                  selectedTarget={selectedTarget}
                  onSelect={openUploadForTarget}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card ref={uploadCardRef} className="border-primary/20">
          <CardHeader className="border-b bg-primary/5">
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>
              This uploader follows the last topic you selected above.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Selected Destination
              </p>
              <p className="mt-2 text-sm font-semibold">{selectedTarget}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="document-title">Document Title</Label>
                <Input
                  ref={titleInputRef}
                  id="document-title"
                  value={documentTitle}
                  onChange={(event) => setDocumentTitle(event.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option>PDF</option>
                  <option>Word Document</option>
                  <option>ZIP</option>
                  <option>Video Link</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="document-file">File / Link</Label>
                <Input
                  ref={fileInputRef}
                  id="document-file"
                  type="file"
                  onChange={(event) =>
                    setSelectedFileName(event.target.files?.[0]?.name ?? "")
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-access">Access Label</Label>
                <Input
                  id="document-access"
                  value={documentAccess}
                  onChange={(event) => setDocumentAccess(event.target.value)}
                  placeholder="Example: Public PDF or Private YouTube"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-description">Description</Label>
              <textarea
                id="document-description"
                value={documentDescription}
                onChange={(event) => setDocumentDescription(event.target.value)}
                className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`This file belongs to ${selectedTarget}`}
              />
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleUpload}>
                <IconUpload className="mr-2 h-4 w-4" />
                Upload To Selected Topic
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents In Selected Topic</CardTitle>
            <CardDescription>
              Sample items currently mapped to the chosen end topic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No sample documents are listed for this topic yet. Use the upload form above.
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <IconFileText className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{document.title}</p>
                      <Badge variant="outline">{document.type}</Badge>
                      <Badge
                        className={cn(
                          document.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {document.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{document.category}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {document.uploaded_by} on {new Date(document.created_at).toISOString().slice(0, 10)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Size: {document.size} | Downloads: {document.downloads}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => handleViewDocument(document)}>
                      <IconFileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleEditDocument(document)}>
                      <IconEdit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDownload(document)}>
                      <IconDownload className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDelete(document)}>
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Document Details Modal */}
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedDocument.title}</h2>
                  <Button variant="ghost" onClick={() => setShowDocumentModal(false)}>
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedDocument.type}</Badge>
                    <Badge className={
                      selectedDocument.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }>
                      {selectedDocument.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground">{selectedDocument.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-muted-foreground">{selectedDocument.size}</p>
                    </div>
                    <div>
                      <span className="font-medium">Uploaded By:</span>
                      <p className="text-muted-foreground">{selectedDocument.uploaded_by}</p>
                    </div>
                    <div>
                      <span className="font-medium">Downloads:</span>
                      <p className="text-muted-foreground">{selectedDocument.downloads}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedDocument.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedDocument.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => handleDownload(selectedDocument)}>
                      <IconDownload className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(selectedDocument)}>
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Document Modal */}
        {showEditModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Edit Document</h2>
                  <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      placeholder="Enter document title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <select
                      id="edit-category"
                      className="w-full p-2 border rounded-md"
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    >
                      <option value="">Select category</option>
                      <option value="Syllabus">Syllabus</option>
                      <option value="Previous Papers">Previous Papers</option>
                      <option value="Study Material">Study Material</option>
                      <option value="Test Category">Test Category</option>
                      <option value="Notes / Mathematics">Notes / Mathematics</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      className="w-full p-2 border rounded-md"
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateDocument}>
                      <IconEdit className="mr-2 h-4 w-4" />
                      Update
                    </Button>
                    <Button variant="outline" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicNode({
  node,
  path,
  selectedTarget,
  onSelect,
}: {
  node: TreeNode;
  path: string[];
  selectedTarget: string;
  onSelect: (target: string) => void;
}) {
  const currentPath = [...path, node.title];

  if (node.kind === "leaf") {
    const fullPath = currentPath.join(" / ");
    const isSelected = selectedTarget === fullPath;

    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed p-4 transition-colors",
          isSelected ? "border-primary bg-primary/5" : "bg-background"
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <LeafIcon fullPath={fullPath} />
              </div>
              <div>
                <p className="font-semibold">{node.title}</p>
                <p className="text-xs text-muted-foreground">{fullPath}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{node.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{node.documents} docs</Badge>
            <Badge variant="secondary">{node.lastUpdated}</Badge>
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onSelect(fullPath)}
            >
              <IconUpload className="mr-2 h-4 w-4" />
              Upload New Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card/60 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <IconFolder className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{node.title}</p>
              <p className="text-sm text-muted-foreground">{node.description}</p>
            </div>
          </div>
        </div>
        <Badge variant="outline">{countLeafNodes(node.children)} end topics</Badge>
      </div>

      <div className="mt-4 space-y-3 border-l border-dashed border-border/80 pl-4">
        {node.children.map((child) => (
          <TopicNode
            key={child.id}
            node={child}
            path={currentPath}
            selectedTarget={selectedTarget}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function LeafIcon({ fullPath }: { fullPath: string }) {
  if (fullPath.startsWith("Video Explain")) {
    return <IconVideo className="h-4 w-4 text-rose-600" />;
  }

  if (fullPath.startsWith("Notes")) {
    return <IconFileText className="h-4 w-4 text-sky-600" />;
  }

  return <IconCheck className="h-4 w-4 text-emerald-600" />;
}
