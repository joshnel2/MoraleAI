/* Auto-generated shared types for AI-Profile-Business-Tool data schema.
   Keep in sync with schemas/data-schema.json. */

export interface Consent {
	granted: boolean;
	grantedAt?: string; // ISO 8601
	expiresAt?: string; // ISO 8601 (used for purge/expiration)
	scope?: string[];
}

export interface EmotionalState {
	happiness?: number; // 1-10
	stress?: number; // 1-10
	energy?: number; // 1-10
}

export interface Opinions {
	whatsRight?: string;
	whatsWrong?: string;
}

export interface EncryptedMessage {
	role: 'user' | 'assistant' | 'system';
	ciphertext: string;
	nonce: string;
	createdAt: string; // ISO 8601
}

export interface ChatSession {
	sessionId?: string; // UUID
	messagesEncrypted?: EncryptedMessage[];
	anonymizationPending?: boolean;
}

export interface KpiReference {
	kpiName: string;
	period?: string; // e.g., 2025-Q1, 2025-08
	value?: number | string | null;
	unit?: string | null;
}

export interface BusinessMetrics {
	kpiReferences?: KpiReference[];
	[key: string]: unknown;
}

export interface DataRecord {
	recordId: string; // UUID
	employeeAnonymizedId: string; // UUID
	timestamp: string; // ISO 8601
	consent: Consent;
	emotionalState?: EmotionalState;
	opinions?: Opinions;
	personalNotes?: string;
	chatSession?: ChatSession;
	businessMetrics?: BusinessMetrics;
}