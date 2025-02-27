import { router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AutoShowModal = ({ show, setShow, mtahun }) => {
    // const [show, setShow] = useState(popup);
    const [tahun, setTahun] = useState(null);
    const sortedMtahun = mtahun.sort((a, b) => b.tahun_id - a.tahun_id);

    const handleClose = () => setShow(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const filter = mtahun.find(item => item.tahun_id === tahun);

        if (filter) {
            localStorage.setItem('tahun_id', filter.tahun_id);
            localStorage.setItem('nama_tahunid', filter.nama_tahun);

            // Use Inertia to handle the request and update data without full page reload
            router.visit('/changeTA', {
                method: 'post',
                data: {
                    tahun_id: filter.tahun_id,
                    redirect: window.location.pathname,
                },
                onSuccess: () => {
                    setShow(false);
                },
            });
        }
    }

    return (
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Pilih Tahun Akademik :</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <select className='form-select' required onChange={(e) => setTahun(e.target.value)}>
                        <option value="">Pilih Tahun</option>
                        {sortedMtahun.map(function (item, index) {
                            return <option key={index} value={item.tahun_id}>{item.nama_tahun}</option>
                        })}
                    </select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" type='submit'>
                        Submit
                    </Button>
                    {/* <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button> */}
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default AutoShowModal;
