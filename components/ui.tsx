import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

export const C = {
  bg:'#F2F6F8', bgCard:'#FFFFFF', teal:'#1A8C8C', tealLight:'#2AADAD', tealDark:'#116060',
  tealDim:'#1A8C8C14', tealBorder:'#1A8C8C40', slate:'#1E2D3A', slateLight:'#2E4255',
  gray100:'#E3ECF1', gray200:'#C8D8E4', gray400:'#8FAABB', gray600:'#4E6475', gray800:'#2B3D4D',
  border:'#D4E3EC', green:'#19A87A', greenDim:'#19A87A14', amber:'#C9870C', amberDim:'#C9870C14',
  red:'#C0392B', redDim:'#C0392B14', white:'#FFFFFF', purple:'#6B5EA8', purpleDim:'#6B5EA814',
};
export const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

export const matchColor = (p: number) => p >= 85 ? C.green : p >= 70 ? C.amber : C.red;
export const matchDim   = (p: number) => p >= 85 ? C.greenDim : p >= 70 ? C.amberDim : C.redDim;
export const matchLabel = (p: number) => p >= 85 ? 'Excellent' : p >= 70 ? 'Good' : 'Fair';

export function Badge({ children, color = C.teal, dim = C.tealDim, style = {} }: { children: ReactNode; color?: string; dim?: string; style?: CSSProperties }) {
  return <span style={{ fontSize: 11, fontWeight: 700, background: dim, color, padding: '2px 9px', borderRadius: 10, ...style }}>{children}</span>;
}

export function Pill({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 13px', borderRadius: 20, background: active ? C.tealDim : C.bg, border: `1.5px solid ${active ? C.teal : C.border}`, color: active ? C.teal : C.gray600, fontWeight: active ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: F, transition: 'all .15s' }}>
      {children}
    </button>
  );
}

export function FLabel({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: C.gray800, marginBottom: 5, fontFamily: F }}>{children}</div>;
}

export function FField({ label, value, onChange, placeholder, type = 'text', rows }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number }) {
  const s: CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 7, background: C.bg, border: `1.5px solid ${C.border}`, color: C.slate, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: F };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FLabel>{label}</FLabel>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...s, resize: 'vertical', lineHeight: 1.55 }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />
      }
    </div>
  );
}

export function PBtn({ onClick, children, full = false, style = {}, disabled = false, type = 'button' }: { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; children: ReactNode; full?: boolean; style?: CSSProperties; disabled?: boolean; type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ width: full ? '100%' : 'auto', padding: '11px 22px', borderRadius: 8, background: disabled ? C.gray400 : C.teal, color: C.white, border: 'none', fontWeight: 700, fontSize: 14, cursor: disabled ? 'default' : 'pointer', fontFamily: F, ...style }}>
      {children}
    </button>
  );
}

export function GBtn({ onClick, children, style = {} }: { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; children: ReactNode; style?: CSSProperties }) {
  return (
    <button onClick={onClick} style={{ padding: '11px 18px', borderRadius: 8, background: 'none', border: `1.5px solid ${C.border}`, color: C.gray600, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: F, ...style }}>
      {children}
    </button>
  );
}

export function Card({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '22px', ...style }}>{children}</div>;
}

export function SHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.slate, margin: '0 0 4px', letterSpacing: -0.5 }}>{title}</h2>
      {sub && <p style={{ color: C.gray600, fontSize: 14, margin: 0 }}>{sub}</p>}
    </div>
  );
}

export function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.slate }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, background: value ? C.teal : C.gray200, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.white, position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left .2s' }} />
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: F, color: C.teal, fontSize: 14 }}>
      Loading…
    </div>
  );
}
