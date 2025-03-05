import { usePage } from "@inertiajs/react";
import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';

function Sidemenu({ isOpen, level }) {
    const link = usePage().url;
    const [activeItem, setActiveItem] = useState(link);

    const handleItemClick = (path) => {
        setActiveItem(path);
    };
    return level=="admin" || level=="fakultas"? (
        <nav id="sidebar" className={"sidebar " + (isOpen ? 'toggled' : '')} style={{ overflow: 'hidden' }}>
            <SimpleBar style={{ height: '100vh' }}>
                <div className="sidebar-content" style={{ height: '100vh' }}>
                    {/* <div className="sidebar-user">
                        <img src="../assets/img/avatars/avatar.jpg" className="img-fluid rounded-circle mb-2" alt="Linda Miller" />
                        <div className="fw-bold">Administrator</div>
                        <small>Front-end Developer</small>
                    </div> */}
                    <ul className="sidebar-nav" style={{ paddingTop: '5rem' }}>
                        {/* <li className="sidebar-header">
                            Main
                        </li> */}
                        <li className={`sidebar-item ${activeItem === '/dashboard' ? 'active' : ''}`}>
                            <a className="sidebar-link" href="/dashboard" onClick={() => handleItemClick('/dashboard')}>
                                <i className="align-middle ti ti-home me-2"></i>
                                <span className="align-middle">Dashboards</span>
                            </a>
                        </li>
                        {
                            level=="admin"?
                            <>
                            <li className={`sidebar-item ${activeItem === '/pengguna' ? 'active' : ''}`}>
                                <a className="sidebar-link" href="/pengguna" onClick={() => handleItemClick('/pengguna')}>
                                    <i className="align-middle ti ti-user me-2"></i>
                                    <span className="align-middle">Pengguna</span>
                                </a>
                            </li>
                            <li className={`sidebar-item ${activeItem === '/kategori' || activeItem === '/subKategori' ? 'active' : ''}`}>
                                <a className="sidebar-link" href="/kategori" onClick={() => handleItemClick('/kategori')}>
                                    <i className="align-middle ti ti-abc me-2"></i>
                                    <span className="align-middle">Kategori Kuesioner</span>
                                </a>
                            </li>
                            <li className={`sidebar-item ${activeItem === '/bankSoal' ? 'active' : ''}`}>
                                <a className="sidebar-link" href="/bankSoal" onClick={() => handleItemClick('/bankSoal')}>
                                    <i className="align-middle ti ti-abc me-2"></i>
                                    <span className="align-middle">Template Kuesioner</span>
                                </a>
                            </li>
                            </> : 
                            <></>
                        }
                        <li className={`sidebar-item ${activeItem === '/laporan' ? 'active' : ''}`}>
                            
                        </li>
                        <li className={`sidebar-item ${activeItem.startsWith('/laporan') ? 'active' : ''}`}>
                            <a data-bs-target="#laporan" data-bs-toggle="collapse" className={`sidebar-link ${activeItem.startsWith('/laporan') ? '' : 'collapsed'}`}>
                                <i className="align-middle ti ti-checklist me-2"></i>
                                <span className="align-middle">Laporan</span>
                            </a>
                            <ul id="laporan" className={`sidebar-dropdown list-unstyled ${activeItem.startsWith('/laporan') ? '' : 'collapse'}`}
                                data-bs-parent="#sidebar">
                                <li className={`sidebar-item ${activeItem === '/laporan' ? 'active' : ''}`}>
                                    <a className={`sidebar-link ${activeItem === '/laporan' ? 'active' : ''}`} href="/laporan" onClick={() => handleItemClick('/laporan')}>
                                        <span className="align-middle">Laporan Keseluruhan</span>
                                    </a>
                                </li>
                                <li className={`sidebar-item ${activeItem === '/laporan/rekap' ? 'active' : ''}`}>
                                    <a className={`sidebar-link ${activeItem === '/laporan/rekap' ? 'active' : ''}`} href="/laporan/rekap" onClick={() => handleItemClick('/laporan/rekap')}>
                                        Laporan Rekap
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </SimpleBar>
        </nav>
    ):<></>;
}

export default Sidemenu;
