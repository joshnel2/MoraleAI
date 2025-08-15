import React from 'react';

export default function RoleGate(props: { role: 'admin' | 'ceo' | 'employee'; current: 'admin' | 'ceo' | 'employee' | null; children: React.ReactNode }) {
	if (!props.current) return null;
	const roles = ['employee', 'ceo', 'admin'] as const;
	// Simple check: allow if current role is same or higher in this list
	return roles.indexOf(props.current as any) >= roles.indexOf(props.role) ? <>{props.children}</> : null;
}