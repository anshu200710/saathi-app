export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: number;
  url: string;
  folderId?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}
