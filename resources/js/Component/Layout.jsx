import React, { useEffect, useState } from "react";
import Sidemenu from "./Sidemenu";
import Nav from "./Nav";
import Footer from "./Footer";
import SimpleBar from "simplebar-react";
import { router, usePage } from "@inertiajs/react";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import AutoShowModal from "./AutoShowModal";
// import ModalTA from "./ModalTA";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MySwal = withReactContent(Swal)

function Layout({ children, level=null, showNav=true }) {
    const mtahun = usePage().props.mtahun;
    const [show, setShow] = useState(false);

    const changeTa = (e) => {
        setShow(true);
    }

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        
    }, []);

    return (
        <>
            {showNav && <Nav isOpen={isOpen} setIsOpen={setIsOpen} onChangeTA={changeTa} level={level}/>}
            <div className="wrapper">
                <Sidemenu isOpen={isOpen} level={level}/>
                <div className="main">
                    <SimpleBar style={{ height: '100vh' }}>
                        <main className="content" style={{ marginTop: '5rem !important' }}>
                            <div className="container-fluid">
                                {children}
                            </div>
                        </main>
                        <Footer />
                    </SimpleBar>
                </div>
            </div>
        </>
    );
}

export default Layout;
