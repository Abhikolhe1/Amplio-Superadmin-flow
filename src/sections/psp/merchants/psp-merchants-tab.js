import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// components
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import PSPMerchantsTableRow from './psp-merchants-table-row';
import PSPMerchantsTableToolbar from './psp-merchants-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'merchantName', label: 'Merchant Name' },
  { id: 'cin', label: 'CIN' },
  { id: 'gstin', label: 'GSTIN' },
  { id: 'status', label: 'Status' },
];

const defaultFilters = {
  name: '',
};

// ----------------------------------------------------------------------

export default function PSPMerchantsTab({ merchants = [] }) {
  const table = useTable();
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: merchants,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [table]
  );

  const notFound = !dataFiltered.length;

  return (
    <Card>
      <PSPMerchantsTableToolbar filters={filters} onFilters={handleFilters} />

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              onSort={table.onSort}
            />

            <TableBody>
              {dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((row) => (
                  <PSPMerchantsTableRow key={row.id} row={row} />
                ))}

              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={dataFiltered.length}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) =>
        item.merchantName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        item.companyName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        item.cin.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        item.gstin.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}

PSPMerchantsTab.propTypes = {
  merchants: PropTypes.array,
};
