/**
 * hooks/useFunding.ts — Funding, Compliance & Documents hooks
 */

import { complianceAPI, documentAPI, fundingAPI } from '@/services/fundingAPI';
import type {
  ComplianceOverview,
  Document,
  DocumentFolder,
  EligibilityInput,
  EligibilityResult,
  FundingCategory,
  FundingScheme
} from '@/types/funding.types';
import { useCallback, useEffect, useState } from 'react';

// ── Funding ────────────────────────────────────────────────────
export function useFunding() {
  const [schemes, setSchemes] = useState<FundingScheme[]>([]);
  const [filtered, setFiltered] = useState<FundingScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FundingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fundingAPI.getSchemes();
      setSchemes(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFiltered(
      schemes.filter((s) => {
        const matchCat = activeCategory === 'all' || s.category === activeCategory;
        const matchQ = !q || s.title.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q));
        return matchCat && matchQ;
      })
    );
  }, [schemes, activeCategory, searchQuery]);

  return { schemes, filtered, isLoading, error, activeCategory, setActiveCategory, searchQuery, setSearchQuery, refresh: fetch };
}

// ── Eligibility Checker ────────────────────────────────────────
export function useEligibility() {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async (input: EligibilityInput) => {
    setIsChecking(true);
    setError(null);
    try {
      const data = await fundingAPI.checkEligibility(input);
      setResult(data);
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { result, isChecking, error, checkEligibility };
}

// ── Compliance ─────────────────────────────────────────────────
export function useCompliance() {
  const [overview, setOverview] = useState<ComplianceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await complianceAPI.getOverview();
      setOverview(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markComplete = useCallback(async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await complianceAPI.markTaskComplete(taskId);
      setOverview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          months: prev.months.map((m) => ({
            ...m,
            tasks: m.tasks.map((t) =>
              t.id === taskId ? { ...t, status: 'completed' as any, completedAt: new Date().toISOString() } : t
            ),
          })),
        };
      });
    } finally {
      setCompletingId(null);
    }
  }, []);

  return { overview, isLoading, error, refresh: fetch, markComplete, completingId };
}

// ── Documents ──────────────────────────────────────────────────
export function useDocuments() {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentAPI.getFolders();
      setFolders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const totalDocs = folders.reduce((sum, f) => sum + f.uploadedCount, 0);
  const totalRequired = folders.reduce((sum, f) => sum + f.requiredCount, 0);
  const completionPct = totalRequired > 0 ? Math.round((totalDocs / totalRequired) * 100) : 0;

  return { folders, isLoading, error, refresh: fetch, totalDocs, totalRequired, completionPct };
}

export function useFolderDocuments(folderId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await documentAPI.getDocumentsByFolder(folderId);
      setDocuments(data);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => { fetch(); }, [fetch]);

  const upload = useCallback(async (file: any) => {
    setIsUploading(true);
    try {
      const newDoc = await documentAPI.uploadDocument(folderId, file);
      setDocuments((prev) => [newDoc, ...prev]);
    } finally {
      setIsUploading(false);
    }
  }, [folderId]);

  const remove = useCallback(async (docId: string) => {
    await documentAPI.deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  return { documents, isLoading, isUploading, refresh: fetch, upload, remove };
}