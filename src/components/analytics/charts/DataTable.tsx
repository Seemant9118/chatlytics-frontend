import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  data: any[]; // works with dynamic API response
  title: string;
}

export const DataTable = ({ data, title }: DataTableProps) => {

  // Collect all possible keys from the dataset (for dynamic headers)
  const allKeys = Array.from(
    new Set(
      data.flatMap((item) =>
        Object.keys(item).filter((k) => k !== "_id") // ignore internal IDs if needed
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
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {allKeys.map((key) => (
                  <TableCell key={key}>
                    {Array.isArray(row[key]) ? (
                      // Handle array fields like products
                      <div className="space-y-1">
                        {row[key].map((p: any, idx: number) => (
                          <div key={idx} className="text-sm border-b last:border-0">
                            {p.name ? `${p.name} (x${p.quantity})` : JSON.stringify(p)}
                          </div>
                        ))}
                      </div>
                    ) : typeof row[key] === "object" && row[key] !== null ? (
                      JSON.stringify(row[key]) // stringify nested objects
                    ) : (
                      row[key] ?? "N/A" // fallback if missing
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {data.length} records
      </div>
    </div>
  );
};
