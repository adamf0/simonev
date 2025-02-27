import React from 'react';

const PaginationTable = ({ total, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(total / itemsPerPage);

    // Function to go to the next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Function to go to the previous page
    const prevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    // Function to jump to a specific page
    const goToPage = (page) => {
        onPageChange(Number(page)); // Convert the page number to a number
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let index = 1; index <= totalPages; index++) {
            pageNumbers.push(index);
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="d-flex justify-content-start mt-3">
            <ul className="pagination justify-content-center gap-1">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <a
                        className="page-link"
                        href="#"
                        onClick={prevPage}
                        tabIndex={currentPage === 1 ? -1 : 0}
                        aria-disabled={currentPage === 1}
                    >
                        Previous
                    </a>
                </li>
                <li className={`page-item`}>
                    <select
                        onChange={(e) => goToPage(e.target.value)}
                        value={currentPage}
                        className='form-control'
                    >
                        {pageNumbers.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <a
                        className="page-link"
                        href="#"
                        onClick={nextPage}
                        tabIndex={currentPage === totalPages ? -1 : 0}
                        aria-disabled={currentPage === totalPages}
                    >
                        Next
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default PaginationTable;
