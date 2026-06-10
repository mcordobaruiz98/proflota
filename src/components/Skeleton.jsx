import { theme as t } from "../styles/theme";

function Skeleton({ width = "100%", height = "16px", borderRadius, style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: borderRadius || t.radius.sm,
      background: `linear-gradient(90deg, ${t.colors.bgSection} 25%, ${t.colors.bgPrimary} 50%, ${t.colors.bgSection} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  );
}

export function SkeletonCard({ filas = 3 }) {
  return (
    <div style={{
      background: t.colors.bgCard,
      borderRadius: t.radius.lg,
      padding: "16px",
      marginBottom: "10px",
      boxShadow: t.shadows?.card,
    }}>
      <Skeleton height="12px" width="40%" style={{marginBottom:"14px"}}/>
      {Array.from({length: filas}).map((_,i) => (
        <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i===filas-1?"none":"1px solid "+t.colors.borderLight}}>
          <Skeleton height="13px" width="45%"/>
          <Skeleton height="13px" width="25%"/>
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div style={{background: t.colors.bgCard, padding:"16px 20px", borderBottom:`1px solid ${t.colors.borderLight}`}}>
      <Skeleton height="24px" width="60%" style={{marginBottom:"10px"}}/>
      <div style={{display:"flex", gap:"8px"}}>
        <Skeleton height="22px" width="80px" borderRadius={t.radius.full}/>
        <Skeleton height="22px" width="90px" borderRadius={t.radius.full}/>
        <Skeleton height="22px" width="70px" borderRadius={t.radius.full}/>
      </div>
    </div>
  );
}

export function SkeletonKpi() {
  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
      {[0,1].map(i=>(
        <div key={i} style={{background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"14px", boxShadow:t.shadows?.card, border:`1.5px solid ${t.colors.border}`}}>
          <Skeleton height="10px" width="60%" style={{marginBottom:"8px"}}/>
          <Skeleton height="20px" width="80%"/>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;