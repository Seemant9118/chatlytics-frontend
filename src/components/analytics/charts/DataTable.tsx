import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmployeeData } from '@/types/analytics';

interface DataTableProps {
  data: EmployeeData[];
  title: string;
}

const getDepartmentColor = (department: string) => {
  switch (department.toLowerCase()) {
    case 'sales':
      return 'bg-blue-100 text-blue-800';
    case 'engineering':
      return 'bg-green-100 text-green-800';
    case 'marketing':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPerformanceColor = (performance: number) => {
  if (performance >= 90) return 'text-green-600 font-semibold';
  if (performance >= 80) return 'text-blue-600 font-medium';
  return 'text-gray-600';
};

export const DataTable = ({ data, title }: DataTableProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Performance</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Satisfaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((employee, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={getDepartmentColor(employee.department)}
                  >
                    {employee.department}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right ${getPerformanceColor(employee.performance)}`}>
                  {employee.performance}%
                </TableCell>
                <TableCell className="text-right">
                  {employee.sales ? `$${employee.sales.toLocaleString()}` : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {employee.satisfaction ? (
                    <div className="flex items-center justify-end gap-1">
                      <span>{employee.satisfaction}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  ) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {data.length} employees sorted by performance score
      </div>
    </div>
  );
};