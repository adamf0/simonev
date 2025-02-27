import React, { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";

function Login() {
    const { props } = usePage();
    const { errors } = props;
    const [showHide, setShowHide] = useState(false);

    useEffect(()=>{
        if(props.flash?.pesan!==null || props.flash?.pesan!=="" || props.flash?.pesan!==undefined){
            toast.error(props.flash?.pesan, {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    },[]);

    return (
        <>
            <Head>
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]').getAttribute('content')} />
            </Head>
            <main className="main h-100 w-100 justify-content-center" style={{ background: 'linear-gradient(180deg, lightblue, aliceblue)' }}>
                <div className="container h-100">
                    <div className="row h-100">
                        <div className="col-sm-10 col-md-8 col-lg-5 mx-auto d-table h-100">
                            <div className="d-table-cell align-middle">
                                <div className="text-center mt-4">
                                    <h1 className="h2">SIMONEV</h1>
                                    <p className="lead">
                                        Login dulu sebelum akses aplikasi
                                    </p>
                                </div>
                                <form action={`/login`} method="post">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="m-sm-4">
                                                <div className="text-center mb-4">
                                                    <i className="ti ti-user-scan" style={{ fontSize: '7rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <div className="form-floating" style={{ flex: '1 0 100%', "white-space": "nowrap", "overflow": "hidden", "text-overflow": "ellipsis" }}>
                                                        <input type="text" name="username" className="form-control"/>
                                                        <label>NPM / NIDN / NIP</label>
                                                        {errors.username && (
                                                            <small className="text-danger">{errors.username}</small>
                                                        )}
                                                    </div>
                                                    <div className="form-group" style={{ flex: '1 0 100%', "white-space": "nowrap", "overflow": "hidden", "text-overflow": "ellipsis" }}>
                                                        <div className="form-floating">
                                                            <input type={!showHide ? "password" : 'text'} name="password" className="form-control"/>
                                                            <label htmlFor="password">Password</label>
                                                            {errors.password && (
                                                                <small className="text-danger">{errors.password}</small>
                                                            )}

                                                            <a href="#" className="p-0 text-decoration-none" onClick={() => setShowHide(!showHide)} style={{
                                                                position: 'absolute',
                                                                right: '10px',
                                                                fontSize: '12px',
                                                                top: '50%',
                                                                transform: 'translate(-10%, -45%)'
                                                            }}>{!showHide ? "Show" : 'Hide'}</a>
                                                        </div>
                                                    </div>
                                                    <div className="form-group" style={{ flex: '1 0 30px' }}>
                                                        <button className="btn btn-info w-100 h-100" type="submit">Masuk</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            </main>

            <ToastContainer />
        </>
    );
}

export default Login;
