import {
  StructuredUploadPage,
  type StructuredDocumentRecord,
  type StructuredTreeNode,
} from "@/components/admin/StructuredUploadPage";

const defaultUploadTarget = "Test / SI / Full Test";

const tnusrbTree: StructuredTreeNode[] = [
  {
    id: "notes",
    kind: "branch",
    title: "Notes",
    description: "Notes structure based on your TNUSRB handwritten flow.",
    children: [
      {
        id: "notes-tamil",
        kind: "branch",
        title: "Tamil",
        description: "Tamil notes divided into the three parts from your sketch.",
        children: [
          {
            id: "notes-tamil-part-a",
            kind: "leaf",
            title: "பகுதி - அ",
            description: "Tamil notes and explanations for Part A.",
            documents: 8,
            lastUpdated: "Updated today",
          },
          {
            id: "notes-tamil-part-aa",
            kind: "leaf",
            title: "பகுதி - ஆ",
            description: "Tamil notes and explanations for Part Aa.",
            documents: 6,
            lastUpdated: "Updated yesterday",
          },
          {
            id: "notes-tamil-part-i",
            kind: "leaf",
            title: "பகுதி - இ",
            description: "Tamil grammar and model-note uploads for Part I.",
            documents: 5,
            lastUpdated: "Updated 2 days ago",
          },
        ],
      },
      {
        id: "notes-gk",
        kind: "branch",
        title: "GK",
        description: "General knowledge notes split into two final buckets.",
        children: [
          {
            id: "notes-gk-part-a",
            kind: "leaf",
            title: "Part - A",
            description: "GK notes for Part A.",
            documents: 10,
            lastUpdated: "Updated 3 days ago",
          },
          {
            id: "notes-gk-part-b",
            kind: "leaf",
            title: "Part - B",
            description: "GK notes for Part B.",
            documents: 7,
            lastUpdated: "Updated 4 days ago",
          },
        ],
      },
    ],
  },
  {
    id: "test",
    kind: "branch",
    title: "Test",
    description: "Test structure for SI and PC exactly like your image.",
    children: [
      {
        id: "test-si",
        kind: "branch",
        title: "SI",
        description: "Sub Inspector practice branches.",
        children: [
          {
            id: "test-si-topic-wise",
            kind: "leaf",
            title: "Topic Wise",
            description: "Upload SI topic-wise practice tests.",
            documents: 9,
            lastUpdated: "Updated this morning",
          },
          {
            id: "test-si-full-test",
            kind: "leaf",
            title: "Full Test",
            description: "Upload SI full-length mock tests.",
            documents: 11,
            lastUpdated: "Updated today",
          },
        ],
      },
      {
        id: "test-pc",
        kind: "branch",
        title: "PC",
        description: "Police Constable practice branches.",
        children: [
          {
            id: "test-pc-topic-wise",
            kind: "leaf",
            title: "Topic Wise",
            description: "Upload PC topic-wise practice tests.",
            documents: 8,
            lastUpdated: "Updated yesterday",
          },
          {
            id: "test-pc-full-test",
            kind: "leaf",
            title: "Full Test",
            description: "Upload PC full-length mock tests.",
            documents: 10,
            lastUpdated: "Updated 2 days ago",
          },
        ],
      },
    ],
  },
  {
    id: "video-explain",
    kind: "branch",
    title: "Video Explain",
    description: "Direct YouTube-connected explanation area from your sketch.",
    children: [
      {
        id: "video-explain-youtube",
        kind: "leaf",
        title: "Direct Connect With YouTube",
        description: "Upload support PDFs or save private YouTube explanation links.",
        documents: 4,
        lastUpdated: "Updated yesterday",
      },
    ],
  },
];

const tnusrbDocuments: StructuredDocumentRecord[] = [
  {
    id: 1,
    title: "SI Full Test 03",
    target: "Test / SI / Full Test",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-28",
    status: "Published",
  },
  {
    id: 2,
    title: "PC Topic Wise Set - Law And Order",
    target: "Test / PC / Topic Wise",
    type: "PDF",
    uploadedBy: "Admin",
    uploadDate: "2026-03-27",
    status: "Draft",
  },
  {
    id: 3,
    title: "Tamil Part A Notes Bundle",
    target: "Notes / Tamil / பகுதி - அ",
    type: "ZIP",
    uploadedBy: "Content Team",
    uploadDate: "2026-03-26",
    status: "Published",
  },
  {
    id: 4,
    title: "GK Part B Revision Notes",
    target: "Notes / GK / Part - B",
    type: "PDF",
    uploadedBy: "Faculty Team",
    uploadDate: "2026-03-25",
    status: "Published",
  },
  {
    id: 5,
    title: "TNUSRB Video Explain Session Link",
    target: "Video Explain / Direct Connect With YouTube",
    type: "Link",
    uploadedBy: "Admin",
    uploadDate: "2026-03-24",
    status: "Published",
  },
];

export default function TNUSRBPage() {
  return (
    <StructuredUploadPage
      entityName="TNUSRB"
      pageTitle="TNUSRB Content Structure"
      defaultUploadTarget={defaultUploadTarget}
      tree={tnusrbTree}
      initialDocuments={tnusrbDocuments}
      searchPlaceholder="Search for Tamil, GK, SI, PC, Full Test..."
    />
  );
}
