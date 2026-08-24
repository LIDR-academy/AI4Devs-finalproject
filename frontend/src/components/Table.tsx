export type TableColumn<T> = {
   key: string;
   header: string;
   render: (row: T) => React.ReactNode;
};

type TableProps<T> = {
   columns: TableColumn<T>[];
   rows: T[];
   rowKey: (row: T) => string;
   emptyMessage?: string;
};

export function Table<T>({ columns, rows, rowKey, emptyMessage = "No data" }: TableProps<T>) {
   if (rows.length === 0) {
      return (
         <div className="table-wrapper">
            <p className="table-empty">{emptyMessage}</p>
         </div>
      );
   }

   return (
      <div className="table-wrapper">
         <table className="table">
            <thead>
               <tr>
                  {columns.map((column) => (
                     <th key={column.key}>{column.header}</th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {rows.map((row) => (
                  <tr key={rowKey(row)}>
                     {columns.map((column) => (
                        <td key={column.key}>{column.render(row)}</td>
                     ))}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
