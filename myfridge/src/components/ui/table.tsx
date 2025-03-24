import { Table as TableComponent } from "@tanstack/react-table";

export function Table({ children }: { children: React.ReactNode }) {
    return <TableComponent className="w-full border">{children}</TableComponent>;
}
