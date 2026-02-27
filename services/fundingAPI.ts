/**
 * services/fundingAPI.ts
 */
import MOCK_FUNDING from '@/mock/funding.json';
import type { EligibilityInput, EligibilityResult, FundingScheme } from '@/types/funding.types';
import api from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

export const fundingAPI = {
  async getSchemes(): Promise<FundingScheme[]> {
    if (USE_MOCK) { await delay(600); return MOCK_FUNDING as FundingScheme[]; }
    const { data } = await api.get<FundingScheme[]>('/funding/schemes');
    return data;
  },

  async getSchemeById(id: string): Promise<FundingScheme> {
    if (USE_MOCK) {
      await delay(400);
      const found = (MOCK_FUNDING as FundingScheme[]).find((s) => s.id === id);
      if (!found) throw new Error('Scheme not found');
      return found;
    }
    const { data } = await api.get<FundingScheme>(`/funding/schemes/${id}`);
    return data;
  },

  async checkEligibility(input: EligibilityInput): Promise<EligibilityResult> {
    if (USE_MOCK) {
      await delay(1500);
      const schemes = MOCK_FUNDING as FundingScheme[];
      const sorted = [...schemes].sort((a, b) => b.eligibilityScore - a.eligibilityScore);
      return {
        overallScore: 74,
        eligibleCount: schemes.filter((s) => s.eligibilityScore >= 50).length,
        totalSchemes: schemes.length,
        topSchemes: sorted.slice(0, 3),
        improvements: [
          { action: 'Complete GST Registration', impact: 'Unlocks 8 more schemes', scoreBoost: 12, priority: 'high' },
          { action: 'Improve CIBIL score to 700+', impact: 'Bank loan eligibility improves', scoreBoost: 8, priority: 'high' },
          { action: 'File 3 years of ITR', impact: 'Required for NSIC & SIDBI', scoreBoost: 5, priority: 'medium' },
        ],
        creditProfile: {
          score: 668,
          label: 'Fair',
          color: '#F59E0B',
          factors: [
            { label: 'Payment History', status: 'good' },
            { label: 'Credit Utilization', status: 'neutral' },
            { label: 'Account Age', status: 'good' },
            { label: 'Credit Mix', status: 'poor' },
          ],
        },
      };
    }
    const { data } = await api.post<EligibilityResult>('/funding/eligibility', input);
    return data;
  },
};

/**
 * services/complianceAPI.ts
 */
import MOCK_COMPLIANCE from '@/mock/compliance.json';
import type { ComplianceOverview } from '@/types/funding.types';

export const complianceAPI = {
  async getOverview(): Promise<ComplianceOverview> {
    if (USE_MOCK) { await delay(600); return MOCK_COMPLIANCE as ComplianceOverview; }
    const { data } = await api.get<ComplianceOverview>('/compliance/overview');
    return data;
  },

  async markTaskComplete(taskId: string): Promise<void> {
    if (USE_MOCK) { await delay(500); return; }
    await api.post(`/compliance/tasks/${taskId}/complete`);
  },
};

/**
 * services/documentAPI.ts
 */
import MOCK_DOCS from '@/mock/documents.json';
import type { Document, DocumentFolder } from '@/types/funding.types';

export const documentAPI = {
  async getFolders(): Promise<DocumentFolder[]> {
    if (USE_MOCK) { await delay(500); return (MOCK_DOCS as any).folders; }
    const { data } = await api.get<DocumentFolder[]>('/documents/folders');
    return data;
  },

  async getDocumentsByFolder(folderId: string): Promise<Document[]> {
    if (USE_MOCK) {
      await delay(400);
      return (MOCK_DOCS as any).documents.filter((d: Document) => d.folderId === folderId);
    }
    const { data } = await api.get<Document[]>(`/documents/folders/${folderId}`);
    return data;
  },

  async uploadDocument(folderId: string, file: any): Promise<Document> {
    if (USE_MOCK) {
      await delay(1200);
      return {
        id: `doc_${Date.now()}`,
        folderId,
        title: file.name ?? 'New Document',
        fileName: file.name ?? 'document.pdf',
        fileType: 'pdf',
        fileSize: '350 KB',
        status: 'pending_review',
        uploadedAt: new Date().toISOString(),
        isRequired: false,
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);
    const { data } = await api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteDocument(docId: string): Promise<void> {
    if (USE_MOCK) { await delay(400); return; }
    await api.delete(`/documents/${docId}`);
  },
};