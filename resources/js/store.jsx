import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk';
import bankSoalReducer from './Pages/BankSoal/redux/reducers/bankSoalReducer';
import templatePertanyaanReducer from './Pages/TemplatePertanyaan/redux/reducers/templatePertanyaanReducer';
import templateJawabanReducer from './Pages/TemplateJawaban/redux/reducers/templateJawabanReducer';
import kuesionerReducer from './Pages/Kuesioner/redux/reducers/kuesionerReducer';
import rekapReducer from './Pages/Laporan/redux/reducers/rekapReducer';
import penggunaReducer from './Pages/Pengguna/redux/reducers/penggunaReducer';
import laporanReducer from './Pages/Laporan/redux/reducers/laporanReducer';
import kategoriReducer from './Pages/Kategori/redux/reducers/kategoriReducer';
import subkategoriReducer from './Pages/SubKategori/redux/reducers/subkategoriReducer';

import chartFakultasReducer from './Pages/Laporan/redux/reducers/chartFakultasReducer';
import chartProdiReducer from './Pages/Laporan/redux/reducers/chartProdiReducer';
import chartUnitReducer from './Pages/Laporan/redux/reducers/chartUnitReducer';

const store = createStore(
    combineReducers({
        bankSoal: bankSoalReducer,
        templatePertanyaan: templatePertanyaanReducer,
        templateJawaban: templateJawabanReducer,
        kuesioner: kuesionerReducer,
        rekap: rekapReducer,
        laporan: laporanReducer,
        pengguna: penggunaReducer,
        kategori: kategoriReducer,
        subkategori: subkategoriReducer,

        chartFakultas:chartFakultasReducer,
        chartProdi:chartProdiReducer,
        chartUnit:chartUnitReducer,
    }), 
    applyMiddleware(thunk)
);

export default store;
