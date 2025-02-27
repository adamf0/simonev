import React, { useMemo } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';

const Table = ({ columns, data }) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageCount,
        state: { pageIndex, pageSize, globalFilter },
        setPageSize,
        gotoPage,
        setGlobalFilter,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 } // Initial page index
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const firstIndex = pageIndex * pageSize + 1;
    const lastIndex = pageIndex * pageSize + page.length;

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 0; i < pageCount; i++) {
            if (
                i === 0 ||
                i === pageCount - 1 ||
                (i >= pageIndex - 2 && i <= pageIndex + 2)
            ) {
                pageNumbers.push(
                    <li className={"page-item " + (i == pageIndex ? 'active' : '')} key={i} onClick={() => gotoPage(i)}>
                        <button className="page-link">{i + 1}</button>
                    </li>
                );
            } else if (
                i === pageIndex - 3 ||
                i === pageIndex + 3
            ) {
                pageNumbers.push(<span className="page-link" key={i}>...</span>);
            }
        }
        return pageNumbers;
    };

    return (
        <>
            <div className='row mb-2 d-flex align-items-center'>
                <div className='col'>
                    <div className="input-group border-0">
                        <span className="input-group-text bg-transparent px-2 py-2 border-0" id="basic-addon1">Show : </span>
                        <div className='col-md-2'>
                            <select className='form-select'
                                value={pageSize}
                                onChange={e => {
                                    setPageSize(Number(e.target.value));
                                }}
                            >
                                {[5, 10, 25, 50, 100].map(pageSizeOption => (
                                    <option key={pageSizeOption} value={pageSizeOption}>
                                        {pageSizeOption}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="input-group-text bg-transparent px-2 py-2 border-0" id="basic-addon1">Entities</span>
                    </div>
                </div>
                <div className='col'>
                    <div className="input-group border-0 justify-content-end">
                        <span className="input-group-text bg-transparent px-2 py-2 border-0" id="basic-addon1">Search : </span>
                        <div>
                            <input
                                className='form-control py-2'
                                value={globalFilter || ''}
                                onChange={e => setGlobalFilter(e.target.value)}
                                placeholder="Search..."
                            />
                        </div>
                    </div>
                </div>
            </div>
            <table {...getTableProps()} className='table border table-striped table-bordered mb-2'>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    <div className='d-flex justify-content-between'>
                                        {column.render('Header')}
                                        <span>
                                            {column.isSorted ? (column.isSortedDesc ? <i className="ti ti-sort-descending" style={{ color: '#999' }}></i> : <i className="ti ti-sort-ascending" style={{ color: '#999' }}></i>) : <i className="ti ti-arrows-sort" style={{ color: '#999' }}></i>}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {
                        page.length == 0 ? <tr><td colSpan={headerGroups[0].headers.length} className='text-center'>Data Kosong</td></tr> :
                            <>
                                {
                                    page.map((row, index) => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()}>
                                                {row.cells.map(cell => (
                                                    <td {...cell.getCellProps()} style={{ verticalAlign: 'middle' }} className={`${cell.column.textAlign ? `text-${cell.column.textAlign}` : ''}`}>
                                                        <>{cell.render('Cell')}</>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                            </>
                    }
                </tbody>
            </table>
            <div className='d-grid gap-3 d-flex justify-content-between align-items-center'>
                <span>
                    Showing {firstIndex} to {lastIndex} of {globalFilter ? rows.length : data.length} entries {!globalFilter ? '' : '(' + (data.length) + ' data)'}
                </span>
                <nav>
                    <ul className="pagination m-0">
                        <li className={"page-item " + (!canPreviousPage ? 'disabled' : '')}>
                            <button className="page-link" onClick={() => previousPage()}>Previous</button>
                        </li>
                        {renderPageNumbers()}
                        <li className="page-item" disabled={!canNextPage}>
                            <button className="page-link" onClick={() => nextPage()} >Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Table;
