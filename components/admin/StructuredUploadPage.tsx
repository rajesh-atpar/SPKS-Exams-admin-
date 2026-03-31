"use client";

import { useRef, useState } from "react";
import {
  IconCheck,
  IconDownload,
  IconFileText,
  IconFolder,
  IconPlus,
  IconSearch,
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

export type StructuredLeafNode = {
  id: string;
  kind: "leaf";
  title: string;
  description: string;
  documents: number;
  lastUpdated: string;
};

export type StructuredBranchNode = {
  id: string;
  kind: "branch";
  title: string;
  description: string;
  children: StructuredTreeNode[];
};

export type StructuredTreeNode = StructuredLeafNode | StructuredBranchNode;

export type StructuredDocumentRecord = {
  id: number;
  title: string;
  target: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  status: "Published" | "Draft";
};

type StructuredUploadPageProps = {
  entityName: string;
  pageTitle: string;
  pageDescription?: string;
  defaultUploadTarget: string;
  tree: StructuredTreeNode[];
  initialDocuments: StructuredDocumentRecord[];
  searchPlaceholder: string;
};

function countLeafNodes(nodes: StructuredTreeNode[]): number {
  return nodes.reduce((total, node) => {
    if (node.kind === "leaf") {
      return total + 1;
    }

    return total + countLeafNodes(node.children);
  }, 0);
}

function filterTree(nodes: StructuredTreeNode[], query: string): StructuredTreeNode[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return nodes;
  }

  return nodes.reduce<StructuredTreeNode[]>((result, node) => {
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

export function StructuredUploadPage({
  entityName,
  pageTitle,
  pageDescription,
  defaultUploadTarget,
  tree,
  initialDocuments,
  searchPlaceholder,
}: StructuredUploadPageProps) {
  const uploadCardRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTarget, setSelectedTarget] = useState(defaultUploadTarget);
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState(initialDocuments);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentType, setDocumentType] = useState("PDF");
  const [documentAccess, setDocumentAccess] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const fieldPrefix = entityName.toLowerCase().replace(/\s+/g, "-");

  const filteredTree = filterTree(tree, searchQuery);
  const totalLeafNodes = countLeafNodes(tree);
  const visibleLeafNodes = countLeafNodes(filteredTree);

  const filteredDocuments = documents.filter((document) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      `${document.title} ${document.target} ${document.type}`
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesQuery && document.target === selectedTarget;
  });

  function openUploadForTarget(target: string) {
    setSelectedTarget(target);
    uploadCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 250);

    toast.success(`Upload ready for ${target}`);
  }

  function handleUpload() {
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

    setDocuments((currentDocuments) => [
      {
        id: Date.now(),
        title: trimmedTitle,
        target: selectedTarget,
        type: documentType,
        uploadedBy: "Admin",
        uploadDate: new Date().toISOString().slice(0, 10),
        status: "Draft",
      },
      ...currentDocuments,
    ]);

    setDocumentTitle("");
    setDocumentAccess("");
    setDocumentDescription("");
    setSelectedFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success(`Uploaded ${trimmedTitle} to ${selectedTarget}`);
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            {pageDescription ? (
              <p className="max-w-3xl text-muted-foreground">{pageDescription}</p>
            ) : null}
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
              <CardTitle className="text-sm font-medium">Final Upload Points</CardTitle>
              <CardDescription>Every leaf topic with its own upload button.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeafNodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Visible End Topics</CardTitle>
              <CardDescription>Filtered by the search box below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visibleLeafNodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
              <CardDescription>Sample documents mapped to final topics.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Upload Target</CardTitle>
              <CardDescription>The leaf topic selected for the form.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-foreground">{selectedTarget}</p>
            </CardContent>
          </Card>
        </div>

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
              Filter notes, tests, branches, and video sections for {entityName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>{entityName} Topic Map</CardTitle>
            <CardDescription>
              Each last-level topic has an `Upload New Document` action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {filteredTree.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No topics matched your search. Try a branch name or final topic.
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
                <Label htmlFor={`${fieldPrefix}-document-title`}>Document Title</Label>
                <Input
                  ref={titleInputRef}
                  id={`${fieldPrefix}-document-title`}
                  value={documentTitle}
                  onChange={(event) => setDocumentTitle(event.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldPrefix}-document-type`}>Document Type</Label>
                <select
                  id={`${fieldPrefix}-document-type`}
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
                <Label htmlFor={`${fieldPrefix}-document-file`}>File / Link</Label>
                <Input
                  ref={fileInputRef}
                  id={`${fieldPrefix}-document-file`}
                  type="file"
                  onChange={(event) =>
                    setSelectedFileName(event.target.files?.[0]?.name ?? "")
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldPrefix}-document-access`}>Access Label</Label>
                <Input
                  id={`${fieldPrefix}-document-access`}
                  value={documentAccess}
                  onChange={(event) => setDocumentAccess(event.target.value)}
                  placeholder="Example: Public PDF or Private YouTube"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${fieldPrefix}-document-description`}>Description</Label>
              <textarea
                id={`${fieldPrefix}-document-description`}
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
                          document.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {document.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{document.target}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {document.uploadedBy} on {document.uploadDate}
                    </p>
                  </div>
                  <Button type="button" variant="outline">
                    <IconDownload className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
  node: StructuredTreeNode;
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

  if (fullPath.startsWith("Notes") || fullPath.startsWith("Day Wise")) {
    return <IconFileText className="h-4 w-4 text-sky-600" />;
  }

  return <IconCheck className="h-4 w-4 text-emerald-600" />;
}
