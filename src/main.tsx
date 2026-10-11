import './configurar';
import Login from '@bysellens/frontend-core/auth/Login';
import PortalApp from '@bysellens/frontend-core/runtime/PortalApp';
import { montar } from '@bysellens/frontend-core/runtime/montar';
import InicioVentas from './InicioVentas';

montar(<PortalApp pantalla={InicioVentas} inicioSesion={Login} />);
