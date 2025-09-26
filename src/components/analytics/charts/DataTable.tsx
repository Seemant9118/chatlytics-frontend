import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  data: any[] | { result?: any[] };
  title: string;
}

export const DataTable = ({ data, title }: DataTableProps) => {
  // Normalize incoming data
  const safeData = Array.isArray(data) ? data : (data ?? []);

  // Collect all unique keys from dataset (excluding _id)
  const allKeys = Array.from(
    new Set(
      safeData?.flatMap((item) =>
        Object.keys(item).filter((k) => k !== "_id")
      )
    )
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {allKeys.map((key) => (
                <TableHead key={key} className="capitalize">
                  {key}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {allKeys.map((key) => (
                  <TableCell key={key}>
                    {Array.isArray(row[key]) ? (
                      <div className="space-y-1">
                        {row[key].map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-sm border-b last:border-0"
                          >
                            {typeof p === "object"
                              ? p.name
                                ? `${p.name} (x${p.quantity ?? 1})`
                                : JSON.stringify(p)
                              : String(p)}
                          </div>
                        ))}
                      </div>
                    ) : typeof row[key] === "object" && row[key] !== null ? (
                      <pre className="text-xs">{JSON.stringify(row[key], null, 2)}</pre>
                    ) : (
                      row[key] ?? "N/A"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {safeData.length} records
      </div>
    </div>
  );
};
