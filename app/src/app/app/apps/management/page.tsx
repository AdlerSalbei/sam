import { requireAuthenticationPage } from "@/modules/auth/server";
import { prisma } from "@/db";
import { ExternalApps } from "@/modules/apps/components/externalApps";

const cellStyle = { padding: "8px 12px", borderRight: "1px solid #e5e7eb" };
const headerStyle = { ...cellStyle, borderBottom: "4px solid #ccc", textAlign: "left" as const };

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/apps/management");
  await authentication.authorizePage("apps", "manage");
  
  const rows = await prisma.ExternalApps.findMany();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <ExternalApps existingApps={rows} />  {/* ← pass rows down */}
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #e5e7eb" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            {["Name", "Beschreibung", "Team", "Icon/Image Source", "Tags", "URL"].map((h) => (
              <th key={h} style={headerStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={cellStyle}>{u.name}</td>
              <td style={cellStyle}>{u.description}</td>
              <td style={cellStyle}>{Array.isArray(u.team) ? u.team.join(", ") : u.team}</td>
              <td style={cellStyle}>{u.icon || u.imageSrc}</td>
              <td style={cellStyle}>{Array.isArray(u.tags) ? u.tags.join(", ") : u.tags}</td>
              <td style={cellStyle}>{u.url}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}