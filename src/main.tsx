import './configurar';
import Login from '@bysellens/frontend-core/auth/Login';
import PortalApp from '@bysellens/frontend-core/runtime/PortalApp';
import { montar } from '@bysellens/frontend-core/runtime/montar';
import Ventas from './pages/Ventas';

montar(<PortalApp pantalla={Ventas} inicioSesion={Login} />);
